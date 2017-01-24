const fs = require('fs');
const path = require('path');

class Config {
  constructor(rootPath, filename) {
    var configPath = rootPath;

    var config;
    while (!config) {
      try {
        let pathname = path.join(configPath, filename);
        config = fs.readFileSync(pathname, 'utf8');
      } catch (e) {
        configPath = path.normalize(path.join(configPath, '..'));

        if (configPath === '/') {
          throw new Error('Failed to find ' + filename);
        }
      }
    }

    config = JSON.parse(config);
    this.dataPath = config.dataPath;
  }

  getUsersPath() {
    return path.join(this.dataPath, 'users');
  }

  getGroupsPath() {
    return path.join(this.dataPath, 'groups');
  }

  getServersPath() {
    return path.join(this.dataPath, 'servers');
  }
}

module.exports = Config;
