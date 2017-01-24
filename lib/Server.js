const fs = require('fs');
const path = require('path');

const Group = require('./Group');
const User = require('./User');

class Server {
  constructor(name, hostname) {
    this.name = name;
    this.hostname = hostname;
    this.groups = [];
    this.users = [];
  }

  addGroup(group) {
    if (!(group instanceof Group)) {
      throw new Error('Invalid argument');
    }

    let name = group.name.toLowerCase();

    if (this.groups.indexOf(name) !== -1) {
      throw new Error(`Group ${name} already exists on server ${this.name}`);
    }

    this.groups.push(name);
  }

  removeGroup(group) {
    if (!(group instanceof Group)) {
      throw new Error('Invalid argument');
    }

    let name = group.name.toLowerCase();

    if (this.groups.indexOf(name) === -1) {
      throw new Error(`Group ${name} does not exist on server ${this.name}`);
    }

    this.groups = this.groups.filter(g => g != name);
  }

  addUser(user) {
    if (!(user instanceof User)) {
      throw new Error('Invalid argument');
    }

    let name = user.name.toLowerCase();

    if (this.users.indexOf(name) !== -1) {
      throw new Error(`User ${name} already exists on server ${this.name}`);
    }

    this.users.push(name);
  }

  removeUser(user) {
    if (!(user instanceof User)) {
      throw new Error('Invalid argument');
    }

    let name = user.name.toLowerCase();

    if (this.users.indexOf(name) === -1) {
      throw new Error(`User ${name} does not exist on server ${this.name}`);
    }

    this.users = this.users.filter(u => u != name);
  }
}

module.exports = Server;
