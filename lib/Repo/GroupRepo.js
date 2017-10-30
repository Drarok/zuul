const fs = require('fs');
const path = require('path');

const BaseRepo = require('./BaseRepo');

const Group = require('../Group');

class GroupRepo extends BaseRepo {
  save(group) {
    if (!(group instanceof Group)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, group.name + '.json');
    fs.writeFileSync(pathname, JSON.stringify(group.keys.slice().sort(), null, '  '), 'utf8');
  }

  delete(group) {
    if (!(group instanceof Group)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, group.name + '.json');
    fs.unlinkSync(pathname);
  }

  hydrate(filename) {
    let name = filename.substr(0, filename.length - 5);

    let json = fs.readFileSync(path.join(this.path, filename), 'utf8');
    let keys = JSON.parse(json);

    return new Group(name, keys || []);
  }

  find(id, required) {
    return super.find(id, 'json', required);
  }
}

module.exports = GroupRepo;
