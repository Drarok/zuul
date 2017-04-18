const fs = require('fs');
const readline = require('readline');

const ssh2 = require('ssh2');

const BaseCommand = require('./BaseCommand');
const MuteStream = require('../Stream/MuteStream');

const ERR_CODE_ENOENT = 2;

class EnrollCommand extends BaseCommand {
  execute(args) {
    // TODO: Validate the data store is ready, and that zuul.json exists.

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
    console.log('zuul enroll <name> <user@hostname> [--import]');
  }

  connect(hostname, password, verbose) {
    const KEYS_PATH = '.ssh/authorized_keys';

    let masterKey = fs.readFileSync(this.app.get('config').getPublicKeyPath(), 'utf8').trim();

    let conn;
    let sftp;

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

        return this.ensureDirectoryExists(sftp, '.ssh');
      })
      .then(() => {
        let attrs = {
          mode: '0600'
        };

        return this.ensureFileExists(sftp, KEYS_PATH, attrs);
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          let keys = '';

          let stream = sftp.createReadStream(KEYS_PATH);
          stream.on('data', buffer => keys += buffer.toString());
          stream.on('end', () => resolve(keys));
          stream.on('error', reject);
        });
      })
      .then(keys => {
        console.log('Got existing keys?!');

        if (keys.indexOf(masterKey) !== -1) {
          throw new Error(`${hostname} is already enrolled`);
        }

        // Prepend the master key.
        keys = masterKey + '\n' + keys.trim() + '\n';

        // TODO: This should reject on error
        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
          let stream = sftp.createWriteStream(KEYS_PATH, {
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

  ensureDirectoryExists(sftp, name) {
    console.log(`ensureDirectoryExists(${name})`);

    return new Promise((resolve, reject) => {
      sftp.stat(name, (err, stats) => {
        if (err) {
          if (err.code !== ERR_CODE_ENOENT) {
            return reject(err);
          }

          return this.createDirectory(sftp, name).then(resolve);
        }

        resolve();
      })
    });
  }

  createDirectory(sftp, name) {
    console.log(`createDirectory(${name})`);

    return new Promise((resolve, reject) => {
      let attrs = {
        mode: '0700'
      };

      sftp.mkdir(name, attrs, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  ensureFileExists(sftp, path, attrs) {
    console.log(`ensureFileExists(${path})`);

    return new Promise((resolve, reject) => {
      sftp.realpath(path, (err, absPath) => {
        if (err) {
          if (err.code !== ERR_CODE_ENOENT) {
            return reject(err);
          } else {
            return this.createFile(sftp, path, attrs).then(resolve);
          }
        }

        resolve();
      });
    });
  }

  createFile(sftp, path, attrs) {
    console.log(`createFile(${path})`);

    return new Promise((resolve, reject) => {
      sftp.open(path, 'a', attrs, (err, handle) => {
        if (err) {
          return reject(err);
        }

        sftp.close(handle, (err) => {
          if (err) {
            return reject(err);
          }

          resolve();
        });
      });
    });
  }
}

module.exports = EnrollCommand;
