const fs = require('fs');
const path = require('path');

const BaseRepo = require('./BaseRepo');

const Server = require('../Server');

class ServerRepo extends BaseRepo {
  save(server) {
    if (!(server instanceof Server)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, server.identifier + '.json');
    let data = {
      groups: (server.groups || []).slice().sort(),
      keys: (server.keys || []).slice().sort()
    };
    fs.writeFileSync(pathname, JSON.stringify(data, null, '  '), 'utf8');
  }

  delete(server) {
    if (!(server instanceof Server)) {
      throw new Error('Invalid argument');
    }

    let pathname = path.join(this.path, server.identifier + '.json');
    fs.unlinkSync(pathname);
  }

  hydrate(filename) {
    let server = new Server(filename.substr(0, filename.length - 5));

    let json = JSON.parse(fs.readFileSync(path.join(this.path, filename), 'utf8'));
    server.groups = json.groups || [];
    server.keys = json.keys || [];

    return server;
  }

  find(id, required) {
    return super.find(id, 'json', required);
  }
}

module.exports = ServerRepo;
