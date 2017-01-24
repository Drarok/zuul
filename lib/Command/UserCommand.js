const fs = require('fs');

const BaseCommand = require('./BaseCommand');
const User = require('../User');

class UserCommand extends BaseCommand {
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
    let users = this.app.get('users').getAll();

    if (users.length === 0) {
      console.log('There are no users'.red);
      return;
    }

    if (users.length === 1) {
      console.log(`There is 1 user`.green);
    } else {
      console.log(`There are ${users.length} users`.green);
    }

    for (let user of users) {
      console.log('  ' + user.name);
    }
  }

  add(args) {
    let [name, keyPath] = args._;

    if (!name || !keyPath) {
      throw new Error('Missing required parameter');
    }

    let users = this.app.get('users');

    if (users.find(name)) {
      throw new Error(`User ${name} already exists`);
    }

    let user = new User(name);
    user.key = fs.readFileSync(keyPath, 'utf8');
    users.save(user);
    console.log(`Created user ${name}`.green);
  }

  rm(args) {
    let [name] = args._;

    if (!name) {
      throw new Error('Missing required parameter');
    }

    let users = this.app.get('users');
    let user = users.find(name);

    if (!user) {
      throw new Error(`User ${name} does not exist`);
    }

    users.delete(user);
    console.log(`Deleted user ${name}`.green);
  }

  usage() {
    console.log('zuul user');
    console.log('zuul user list');
    console.log('zuul user add <username> <public key path>');
  }
}

module.exports = UserCommand;
