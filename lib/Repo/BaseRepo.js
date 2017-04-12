const fs = require('fs');

class BaseRepo {
  constructor(path) {
    this.path = path;
  }

  get name() {
    return (this.constructor.name || 'Unknown').replace(/Repo$/, '');
  }

  // eslint-disable-next-line no-unused-vars
  save(obj) {
    throw new Error('Missing \'save\' method on ' + this.constructor.name);
  }

  // eslint-disable-next-line no-unused-vars
  delete(obj) {
    throw new Error('Missing \'delete\' method on ' + this.constructor.name);
  }

  // eslint-disable-next-line no-unused-vars
  hydrate(filename) {
    throw new Error('Missing \'hydrate\' method on ' + this.constructor.name);
  }

  find(id, ext, required) {
    if (!id) {
      throw new Error('Missing required argument');
    }

    let object = false;

    try {
      object = this.hydrate(`${id}.${ext}`);
    } catch (e) {
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }

    if (required === true && !object) {
      throw new Error(`${this.name} ${id} does not exist`);
    } else if (required === false && object) {
      throw new Error(`${this.name} ${id} already exists`);
    }

    return object;
  }

  getAll() {
    return fs.readdirSync(this.path)
      .sort()
      .map(filename => this.hydrate(filename));
  }
}

module.exports = BaseRepo;
