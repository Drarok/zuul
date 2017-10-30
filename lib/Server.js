const Key = require('./Key');
const Group = require('./Group');

class Server {
  constructor(identifier) {
    if (!identifier.match(/^[\w._-]+@[\w._-]+$/)) {
      throw new Error(`Invalid identifier ${identifier} must use username@hostname format`);
    }

    this.identifier = identifier;
    this.groups = [];
    this.keys = [];
  }

  addGroup(group) {
    if (!(group instanceof Group)) {
      throw new Error('Invalid argument');
    }

    let name = group.name.toLowerCase();

    if (this.groups.indexOf(name) !== -1) {
      throw new Error(`Group ${name} already exists on server ${this.identifier}`);
    }

    this.groups.push(name);
  }

  removeGroup(group) {
    if (!(group instanceof Group)) {
      throw new Error('Invalid argument');
    }

    let name = group.name.toLowerCase();

    if (this.groups.indexOf(name) === -1) {
      throw new Error(`Group ${name} does not exist on server ${this.identifier}`);
    }

    this.groups = this.groups.filter(g => g !== name);
  }

  addKey(key) {
    if (!(key instanceof Key)) {
      throw new Error('Invalid argument');
    }

    let name = key.name.toLowerCase();

    if (this.keys.indexOf(name) !== -1) {
      throw new Error(`Key ${name} already exists on server ${this.identifier}`);
    }

    this.keys.push(name);
  }

  removeKey(key) {
    if (!(key instanceof Key)) {
      throw new Error('Invalid argument');
    }

    let name = key.name.toLowerCase();

    if (this.keys.indexOf(name) === -1) {
      throw new Error(`Key ${name} does not exist on server ${this.identifier}`);
    }

    this.keys = this.keys.filter(k => k !== name);
  }
}

module.exports = Server;
