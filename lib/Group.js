const Key = require('./Key');

class Group {
  constructor(name, keys) {
    this.name = name;
    this.keys = keys || [];
  }

  addKey(key) {
    if (!(key instanceof Key)) {
      throw new Error('Invalid argument');
    }

    let name = key.name.toLowerCase();

    if (this.keys.indexOf(name) !== -1) {
      throw new Error(`Key ${name} already exists in group ${this.name}`);
    }

    this.keys.push(name);
  }

  removeKey(key) {
    if (!(key instanceof Key)) {
      throw new Error('Invalid argument');
    }

    let name = key.name.toLowerCase();

    if (this.keys.indexOf(name) === -1) {
      throw new Error(`Key ${name} does not exist in group ${this.name}`);
    }

    this.keys = this.keys.filter(k => k !== name);
  }
}

module.exports = Group;
