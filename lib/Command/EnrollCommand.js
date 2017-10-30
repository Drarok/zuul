const fs = require('fs');
const readline = require('readline');

const ssh2 = require('ssh2');

const BaseCommand = require('./BaseCommand');
const MuteStream = require('../Stream/MuteStream');
const Server = require('../Server');

const ERR_CODE_ENOENT = 2;
const KEYS_PATH = '.ssh/authorized_keys';

class EnrollCommand extends BaseCommand {
  execute(args) {
    let [identifier] = args._;

    if (!identifier) {
      return this.usage();
    }

    const serverRepo = this.app.get('servers');
    let server = serverRepo.find(identifier);
    if (server) {
      console.error(`Warning: server ${identifier} already exists`.yellow);
    } else {
      server = new Server(identifier);
    }

    // Once enrolled, we save the server.
    let saveServer = () => {
      serverRepo.save(server);
    };

    // TODO: Remove this! It's not documented, so people shouldn't be using it.
    if (args.password) {
      return this.connect(identifier, args.password, args.verbose)
        .then(saveServer);
    }

    let stdout = new MuteStream(process.stdout);

    const rl = readline.createInterface({
      input: process.stdin,
      output: stdout,
      terminal: true
    });

    rl.question(`${identifier}\'s password: `, password => {
      this.connect(identifier, password, args.verbose)
        .then(saveServer);
      rl.close();
    });

    setTimeout(() => {
      stdout.mute();
    }, 0);
  }

  usage() {
    console.log('zuul enroll <user@hostname>');
  }

  connect(identifier, password, verbose) {
    let masterKey = fs.readFileSync(this.app.get('config').getPublicKeyPath(), 'utf8').trim();

    let conn;
    let sftp;

    return this.getConnection(identifier, password)
      .then(c => {
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
        sftp = s;

        return this.readExistingKeys(sftp);
      })
      .then(keys => {
        if (keys.indexOf(masterKey) !== -1) {
          return false;
        }

        // Prepend the master key.
        keys.unshift(masterKey);

        return this.writeKeys(sftp, keys);
      })
      .then((success) => {
        conn.end();

        if (success === false) {
          console.error(`${identifier} is already enrolled`.yellow);
        } else {
          console.log(`Successfully enrolled ${identifier}`.green);
        }
      })
      .catch(err => {
        if (conn) {
          conn.end();
        }

        console.error((verbose ? err.stack : err.message).red);
      });
  }

  getConnection(identifier, password) {
    return new Promise((resolve, reject) => {
      let conn = new ssh2.Client();

      conn.on('ready', () => {
        resolve(conn);
      });

      conn.on('error', reject);

      let parts = identifier.split('@');

      let options = {
        username: parts[0],
        host: parts[1],
        password: password
      };
      conn.connect(options);
    });
  }

  readExistingKeys(sftp) {
    return this.ensureDirectoryExists(sftp, '.ssh', { mode: 0o700 })
      .then(() => {
        return this.ensureFileExists(sftp, KEYS_PATH, { mode: 0o600 });
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          let keys = '';

          let stream = sftp.createReadStream(KEYS_PATH);
          stream.on('error', reject);
          stream.on('data', buffer => keys += buffer.toString());
          stream.on('end', () => {
            let cleaned = keys.split('\n')
              .map(key => (key || '').trim())
              .filter(key => key.length > 0);
            resolve(cleaned);
          });
        });
      });
  }

  writeKeys(sftp, keys) {
    return new Promise((resolve, reject) => {
      let stream = sftp.createWriteStream(KEYS_PATH, {
        encoding: 'utf8',
        mode: 0o600
      });

      stream.on('error', reject);

      stream.write(keys.join('\n'), 'utf8', () => {
        stream.close();
        resolve();
      });
    });
  }

  ensureDirectoryExists(sftp, path, attrs) {
    return new Promise((resolve, reject) => {
      sftp.stat(path, (err) => {
        if (err) {
          if (err.code !== ERR_CODE_ENOENT) {
            return reject(err);
          }

          return this.createDirectory(sftp, path, attrs).then(resolve);
        }

        resolve();
      });
    });
  }

  createDirectory(sftp, path, attrs) {
    return new Promise((resolve, reject) => {
      sftp.mkdir(path, attrs, err => {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    });
  }

  ensureFileExists(sftp, path, attrs) {
    return new Promise((resolve, reject) => {
      sftp.stat(path, (err) => {
        if (err) {
          if (err.code !== ERR_CODE_ENOENT) {
            reject(err);
          } else {
            this.createFile(sftp, path, attrs).then(resolve);
          }

          return;
        }

        resolve();
      });
    });
  }

  createFile(sftp, path, attrs) {
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
