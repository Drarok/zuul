const fs = require('fs');
const readline = require('readline');

const ssh2 = require('ssh2');

const BaseCommand = require('./BaseCommand');
const MuteStream = require('../Stream/MuteStream');

class EnrollCommand extends BaseCommand {
  execute(args) {
    let [name, hostname] = args._;

    if (!name || !hostname) {
      return this.usage();
    }

    if (args.import) {
      // TODO: import existing keys.
      throw new Error('Not implemented');
    }

    let stdout = new MuteStream(process.stdout);

    const rl = readline.createInterface({
      input: process.stdin,
      output: stdout,
      terminal: true
    });

    rl.question(`${hostname}\'s password: `, password => {
      this.connect(hostname, password, args.verbose);
      rl.close();
    });

    setTimeout(() => {
      stdout.mute();
    }, 0);
  }

  usage() {
    console.log('zuul enroll <name> <hostname> [--import]');
  }

  connect(hostname, password, verbose) {
    let masterKey = fs.readFileSync(this.app.get('config').getPublicKeyPath(), 'utf8').trim();

    let conn;
    let sftp;
    let keysPath;
    this.getConnection(hostname, password)
      .then(c => {
        console.log('Got connection');
        conn = c;

        return new Promise((resolve, reject) => {
          conn.sftp((err, sftp) => {
            if (err) {
              return reject(err);
            }

            resolve(sftp);
          });
        });
      })
      .then(s => {
        console.log('Got sftp');
        sftp = s;

        return new Promise((resolve, reject) => {
          sftp.realpath('.ssh/authorized_keys', (err, absPath) => {
            // Ignore code 2 (file not found)
            if (err && err.code != 2) {
              console.error(`Got realpath error: ${err}`);
              return reject(err);
            }

            resolve({
              path: absPath || '.ssh/authorized_keys',
              exists: !!absPath
            });
          });
        });
      })
      .then(pathinfo => {
        console.log(`Got pathinfo ${JSON.stringify(pathinfo)}`);
        keysPath = pathinfo.path;

        if (!pathinfo.exists) {
          // TODO: Create directory if it doesn't exist!
          return Promise.resolve('');
        }

        return new Promise((resolve, reject) => {
          let keys = '';

          let stream = sftp.createReadStream(keysPath);
          stream.on('data', buffer => keys += buffer.toString());
          stream.on('end', () => resolve(keys));
          stream.on('error', err => reject(err));
        });
      })
      .then(keys => {
        if (keys.indexOf(masterKey) !== -1) {
          throw new Error(`${hostname} is already enrolled`);
        }

        // Prepend the master key.
        keys = masterKey + '\n' + keys.trim() + '\n';

        // TODO: This should reject on error
        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
          let stream = sftp.createWriteStream(keysPath, {
            encoding: 'utf8',
            mode: 0o600
          });
          stream.write(keys, 'utf8', () => {
            console.log(`${hostname}: added master key`.yellow);
            stream.close();
            conn.end();

            // TODO: Add this server to zuul.
          });
        });
      })
      .catch(err => {
        if (conn) {
          conn.end();
        }
        console.error((verbose ? err.stack : err.message).red);
      });
  }

  getConnection(hostname, password) {
    return new Promise((resolve, reject) => {
      let conn = new ssh2.Client();

      conn.on('ready', () => {
        console.log(`${hostname}: ready`.yellow);
        resolve(conn);
      });

      conn.on('error', err => {
        console.error(`${hostname}: error - ${err}`);
        reject(err);
      });

      let parts = hostname.split('@');
      console.log(`Connecting to ${parts} - ${password}`);
      let options = {
        username: parts[0],
        host: parts[1],
        // agent: "/private/tmp/com.apple.launchd.xrqdbfkuMp/Listeners",
        password: password
      };
      conn.connect(options);
    });
  }
}

module.exports = EnrollCommand;
