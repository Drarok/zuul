const fs = require('fs');

const BaseCommand = require('./BaseCommand');
const Key = require('../Key');

class KeyCommand extends BaseCommand {
  execute(args) {
    if (args._.length === 0 || args._[0] === 'list') {
      return this.list();
    } else {
      let command = args._.shift();
      if (this[command]) {
        return this[command](args);
      }
    }

    this.usage();
  }

  list() {
    let keys = this.app.get('keys').getAll();

    if (keys.length === 0) {
      console.log('There are no keys'.red);
      return;
    }

    if (keys.length === 1) {
      console.log(`There is 1 key`.green);
    } else {
      console.log(`There are ${keys.length} keys`.green);
    }

    for (let key of keys) {
      console.log('  ' + key.name);
    }
  }

  add(args) {
    let [name, keyPath] = args._;
    let publicKey = args.key;

    if (!name || (!keyPath && !publicKey)) {
      throw new Error('Missing required parameter');
    }

    let keys = this.app.get('keys');

    if (keys.find(name)) {
      throw new Error(`Key ${name} already exists`);
    }

    let key = new Key(name);
    key.key = publicKey || fs.readFileSync(keyPath, 'utf8');
    keys.save(key);
    console.log(`Created key ${name}`.green);
  }

  rm(args) {
    let [name] = args._;

    if (!name) {
      throw new Error('Missing required parameter');
    }

    let keys = this.app.get('keys');
    let key = keys.find(name);

    if (!key) {
      throw new Error(`User ${name} does not exist`);
    }

    keys.delete(key);
    console.log(`Deleted key ${name}`.green);
  }

  usage() {
    console.log('zuul key [list]');
    console.log('zuul key add <name> <public key path>');
    console.log('zuul key add <name> --key=\'ssh-rsa … user@example.org\'');
    console.log('zuul key rm <name>');
  }
}

module.exports = KeyCommand;
