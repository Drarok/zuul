const fs = require('fs');
const path = require('path');

const BaseRepo = require('./BaseRepo');

const User = require('../User');

class UserRepo extends BaseRepo {
  save(user) {
    if (!(user instanceof User)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, user.name + '.pub');
    fs.writeFileSync(pathname, user.key, 'utf8');
  }

  delete(user) {
    if (!(user instanceof User)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, user.name + '.pub');
    fs.unlinkSync(pathname);
  }

  hydrate(filename) {
    let user = new User(filename.substr(0, filename.length - 4));
    user.key = (fs.readFileSync(path.join(this.path, filename), 'utf8') || '').trim();
    return user;
  }

  find(id, required) {
    return super.find(id, 'pub', required);
  }
}

module.exports = UserRepo;
