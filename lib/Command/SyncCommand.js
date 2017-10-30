const fs = require('fs');

const ssh2 = require('ssh2');

const BaseCommand = require('./BaseCommand');

const MAX_RETRY = 5;

class SyncCommand extends BaseCommand {
  execute(args) {
    let config = this.app.get('config');

    let servers = this.app.get('servers');
    let groups = this.app.get('groups');
    let keys = this.app.get('keys');

    let masterKey = fs.readFileSync(config.getPublicKeyPath(), 'utf8').trim();
    let useAgent = config.getUseAgent();
    let privateKey = config.getPrivateKeyPath() ? fs.readFileSync(config.getPrivateKeyPath(), 'utf8') : undefined;
    let passphrase = config.getPassPhrase() || undefined;

    let allServers = servers.getAll();
    if (allServers.length === 0) {
      throw new Error('There are no servers');
    }

    let promises = [];

    for (let server of allServers) {
      // Always include the master key first.
      let serverKeys = [
        masterKey
      ];

      // Include keys from 'default' group.
      let group = groups.find('default');
      if (group) {
        for (const keyName of group.keys) {
          let key = keys.find(keyName, true);
          serverKeys.push(key.key);
        }
      }

      // Include keys from groups.
      for (const groupName of server.groups) {
        let group = groups.find(groupName, true);
        for (const keyName of group.keys) {
          let key = keys.find(keyName, true);
          serverKeys.push(key.key);
        }
      }

      // Include any keys explicitly added to this server.
      for (const keyName of server.keys) {
        let key = keys.find(keyName, true);
        serverKeys.push(key.key);
      }

      // Only send unique keys (keys may be in a group and explicitly added).
      let unique = [];
      for (const key of serverKeys) {
        if (unique.indexOf(key) === -1) {
          unique.push(key);
        }
      }

      let parts = server.identifier.split('@');

      let options = {
        username: parts[0],
        host: parts[1],
        agent: useAgent ? process.env.SSH_AUTH_SOCK : undefined,
        privateKey: privateKey,
        passphrase: passphrase
      };

      promises.push(this.syncKeys(server, options, unique, args.verbose));
    }

    Promise.all(promises)
      .then((res) => {
        if (res.every((ok) => ok)) {
          console.log('Key sync complete'.green);
        } else {
          console.error('Failed to sync keys to one or more servers'.red);
          process.exit(1);
        }
      })
      .catch((err) => {
        console.error('Error during sync:', err.message.red);
        process.exit(1);
      });
  }

  syncKeys(server, options, keys, verbose, retry) {
    let log = (msg, force) => {
      if (verbose || force) {
        console.log(`${server.identifier}:`.white, msg);
      }
    };

    retry = retry || 1;

    let keyNoun = keys.length === 1 ? 'key' : 'keys';
    log(`syncing ${keys.length} ${keyNoun}`.white, true);

    return new Promise((resolve) => {
      let conn = new ssh2.Client();

      conn.on('ready', () => {
        log(`ssh connected`.yellow);
        conn.sftp((err, sftp) => {
          if (err) {
            throw err;
          }

          log(`sftp connected`.yellow);
          sftp.realpath('.ssh/authorized_keys', (err, absPath) => {
            if (err) {
              throw err;
            }

            let stream = sftp.createReadStream(absPath);
            stream.on('data', buffer => {
              // TODO: Parse existing keys, warn if we would overwrite?
              log(`read stream data: ${buffer.toString()}`.yellow);
            });

            stream.on('end', () => {
              log(`read stream end`.yellow);
              stream.close();

              stream = sftp.createWriteStream(absPath, {
                encoding: 'utf8',
                mode: 0o600
              });
              stream.write(keys.join('\n'), () => {
                log(`write stream data`.yellow);
                stream.close();
                conn.end();
                resolve(true);
              });
            });
          });
        });
      });

      conn.on('error', () => {
        if (retry < MAX_RETRY) {
          log(`Failed to sync keys to ${server.identifier}, retrying`.yellow, true);
          return resolve(this.syncKeys(server, options, keys, verbose, retry + 1));
        }

        console.error(`Failed to sync keys to ${server.identifier} after ${retry} tries`.red);
        resolve(false);
      });

      conn.connect(options);
    });
  }

  usage() {
    console.log('zuul sync [--verbose]');
  }
}

module.exports = SyncCommand;
