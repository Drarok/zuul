const User = require('./User');

class Group {
  constructor(name, users) {
    this.name = name;
    this.users = users || [];
  }

  addUser(user) {
    if (!(user instanceof User)) {
      throw new Error('Invalid argument');
    }

    let name = user.name.toLowerCase();

    if (this.users.indexOf(name) !== -1) {
      throw new Error(`User ${name} already exists in group ${this.name}`);
    }

    this.users.push(name);
  }

  removeUser(user) {
    if (!(user instanceof User)) {
      throw new Error('Invalid argument');
    }

    let name = user.name.toLowerCase();

    if (this.users.indexOf(name) === -1) {
      throw new Error(`User ${name} does not exist in group ${this.name}`);
    }

    this.users = this.users.filter(u => u != name);
  }
}

module.exports = Group;
