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
    this.useAgent = config.useAgent;
    this.publicKeyPath = config.publicKeyPath;
    this.privateKeyPath = config.privateKeyPath;
    this.passPhrase = config.passPhrase;
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

  getUseAgent() {
    return this.useAgent;
  }

  getPublicKeyPath() {
    return this.publicKeyPath;
  }

  getPrivateKeyPath() {
    return this.privateKeyPath;
  }

  getPassPhrase() {
    return this.passPhrase;
  }
}

module.exports = Config;
