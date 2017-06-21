const fs = require('fs');

const ssh2 = require('ssh2');

const BaseCommand = require('./BaseCommand');

class SyncCommand extends BaseCommand {
  execute(args) {
    let config = this.app.get('config');

    let servers = this.app.get('servers');
    let groups = this.app.get('groups');
    let users = this.app.get('users');

    let masterKey = fs.readFileSync(config.getPublicKeyPath(), 'utf8').trim();
    let useAgent = config.getUseAgent();
    let privateKey = config.getPrivateKeyPath() ? fs.readFileSync(config.getPrivateKeyPath(), 'utf8') : undefined;
    let passphrase = config.getPassPhrase() || undefined;

    let allServers = servers.getAll();
    if (allServers.length === 0) {
      console.log('There are no servers'.red);
      return;
    }

    for (let server of allServers) {
      // Always include the master key first.
      let keys = [
        masterKey
      ];

      // Include keys for all users in groups.
      for (const groupName of server.groups) {
        let group = groups.find(groupName, true);
        for (const username of group.users) {
          let user = users.find(username, true);
          keys.push(user.key);
        }
      }

      // Include keys for any users explicitly added to this server.
      for (const username of server.users) {
        let user = users.find(username, true);
        keys.push(user.key);
      }

      // Only send unique keys (users may be in a group and explicitly added).
      let unique = [];
      for (const key of keys) {
        if (unique.indexOf(key) === -1) {
          unique.push(key);
        }
      }

      let parts = server.hostname.split('@');
      if (parts.length === 1) {
        parts.unshift('root');
      }

      let options = {
        username: parts[0],
        host: parts[1],
        agent: useAgent ? process.env.SSH_AUTH_SOCK : undefined,
        privateKey: privateKey,
        passphrase: passphrase
      };

      this.syncKeys(server, options, unique, args.verbose);
    }
  }

  syncKeys(server, options, keys, verbose, retry) {
    let log = (msg, force) => {
      if (verbose || force) {
        console.log(`${server.name}:`.yellow, msg);
      }
    };

    retry = retry || 0;

    let keyNoun = keys.length === 1 ? 'key' : 'keys';
    log(`${keys.length} ${keyNoun}`.white, true);

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
            });
          });
        });
      });
    });

    conn.on('error', () => {
      if (retry < 10) {
        log(`Failed to sync keys to ${server.name}, retrying`.yellow);
        this.syncKeys(server, options, keys, verbose, retry + 1);
        return;
      }

      throw new Error(`Failed to sync keys to ${server.name} after ${retry} tries`);
    });

    conn.connect(options);

    return conn;
  }

  usage() {
    console.log('zuul sync [--verbose]');
  }
}

module.exports = SyncCommand;
