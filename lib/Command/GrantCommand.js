const BaseCommand = require('./BaseCommand');
const Group = require('../Group');
const Key = require('../Key');

const TYPE = {
  GROUP: 'group',
  KEY: 'key',
};

class GrantCommand extends BaseCommand {
  execute(args) {
    let type = args._[0];
    let grantName = args._[1];
    let identifiers = args._.slice(2);

    if (!type || !grantName || identifiers.length === 0) {
      return this.usage();
    }

    const serversRepo = this.app.get('servers');
    const servers = identifiers
      .map((identifier) => serversRepo.find(identifier, true));

    if (type === TYPE.GROUP) {
      this.grantGroup(grantName, servers);
    } else if (type === TYPE.KEY) {
      this.grantKey(grantName, servers);
    } else {
      throw new Error(`Grant type ${type} is not valid`);
    }
  }

  grantGroup(name, servers) {
    const serverRepo = this.app.get('servers');
    const group = this.app.get('groups').find(name, true);

    for (const server of servers) {
      try {
        server.addGroup(group);
        serverRepo.save(server);
        console.log(`Granted group ${name} access to ${server.identifier}`.green);
      } catch (e) {
        console.error(e.message.red);
      }
    }
  }

  grantKey(name, servers) {
    const serverRepo = this.app.get('servers');
    const key = this.app.get('keys').find(name, true);

    for (const server of servers) {
      try {
        server.addKey(key);
        serverRepo.save(server);
        console.log(`Granted key ${name} access to ${server.identifier}`.green);
      } catch (e) {
        console.error(e.message.red);
      }
    }
  }

  usage() {
    console.log('zuul grant key <key name> <user@hostname> [...]');
    console.log('zuul grant group <group name> <user@hostname> [...]');
  }
}

module.exports = GrantCommand;
