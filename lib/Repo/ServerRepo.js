const fs = require('fs');
const path = require('path');

const BaseRepo = require('./BaseRepo');

const Server = require('../Server');

class ServerRepo extends BaseRepo {
  find(id) {
    return super.find(id + '.json');
  }

  save(server) {
    if (!(server instanceof Server)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, server.name + '.json');
    let data = {
      hostname: server.hostname,
      groups: server.groups.slice().sort(),
      users: server.users.slice().sort()
    };
    fs.writeFileSync(pathname, JSON.stringify(data, null, '  '), 'utf8');
  }

  delete(server) {
    if (!(server instanceof Server)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, server.name + '.json');
    fs.unlinkSync(pathname);
  }

  hydrate(filename) {
    let server = new Server(filename.substr(0, filename.length - 5));

    let json = JSON.parse(fs.readFileSync(path.join(this.path, filename), 'utf8'));
    server.hostname = json.hostname || '';
    server.groups = json.groups || [];
    server.users = json.users || [];

    return server;
  }
}

module.exports = ServerRepo;
