const fs = require('fs');

const ssh2 = require('ssh2');

const BaseCommand = require('./BaseCommand');

const Group = require('../Group');
const User = require('../User');
const Server = require('../Server');

class SyncCommand extends BaseCommand {
  execute(args) {
    let config = this.app.get('config');

    let servers = this.app.get('servers');
    let groups = this.app.get('groups');
    let users = this.app.get('users');

    let masterKey = fs.readFileSync(config.getPublicKeyPath(), 'utf8');
    let privateKey = fs.readFileSync(config.getPrivateKeyPath(), 'utf8');
    let passphrase = config.getPassPhrase();

    for (let server of servers.getAll()) {
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

      console.log(server.name, unique.length + ' key(s)');

      let parts = server.hostname.split('@');
      if (parts.length === 1) {
        parts.unshift('root');
      }

      let options = {
        username: parts[0],
        host: parts[1],
        privateKey: privateKey,
        passphrase: passphrase
      };
      this.createClient(server, options);
    }
  }

  createClient(server, options) {
    let conn = new ssh2.Client();

    conn.on('ready', () => {
      console.log(`${server.name}: ssh connected`.yellow);
      conn.sftp((err, sftp) => {
        if (err) {
          throw err;
        }

        console.log(`${server.name}: sftp connected`.yellow);
        sftp.realpath('.ssh/authorized_keys', (err, absPath) => {
          if (err) {
            throw err;
          }

          console.log(`${server.name} reading ${absPath}`.yellow);
          let stream = sftp.createReadStream(absPath);
          stream.on('data', buffer => {
            // Do something here.
          });

          stream.on('end', () => {
            stream.close();
            conn.end();
          });
        });
      });
    });

    conn.connect(options);

    return conn;
  }

  usage() {
    console.log('zuul sync [--verbose]');
  }
}

module.exports = SyncCommand;
