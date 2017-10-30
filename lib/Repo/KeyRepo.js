const fs = require('fs');
const path = require('path');

const BaseRepo = require('./BaseRepo');

const Key = require('../Key');

class KeyRepo extends BaseRepo {
  save(key) {
    if (!(key instanceof Key)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, key.name + '.pub');
    fs.writeFileSync(pathname, key.key, 'utf8');
  }

  delete(key) {
    if (!(key instanceof Key)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, key.name + '.pub');
    fs.unlinkSync(pathname);
  }

  hydrate(filename) {
    let key = new Key(filename.substr(0, filename.length - 4));
    key.key = (fs.readFileSync(path.join(this.path, filename), 'utf8') || '').trim();
    return key;
  }

  find(id, required) {
    return super.find(id, 'pub', required);
  }
}

module.exports = KeyRepo;
