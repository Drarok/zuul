const BaseCommand = require('./BaseCommand');

const TYPE = {
  GROUP: 'group',
  KEY: 'key',
};

class RevokeCommand extends BaseCommand {
  execute(args) {
    let type = args._[0];
    let name = args._[1];
    let identifiers = args._.slice(2);

    if (!type || !name || identifiers.length === 0) {
      return this.usage();
    }

    const serversRepo = this.app.get('servers');
    const servers = identifiers
      .map((identifier) => serversRepo.find(identifier, true));

    if (type === TYPE.GROUP) {
      this.revokeGroup(name, servers);
    } else if (type === TYPE.KEY) {
      this.revokeKey(name, servers);
    } else {
      throw new Error(`Grant type ${type} is not valid`);
    }
  }

  revokeGroup(name, servers) {
    const serverRepo = this.app.get('servers');
    const group = this.app.get('groups').find(name, true);

    for (const server of servers) {
      try {
        server.removeGroup(group);
        serverRepo.save(server);
        console.log(`Revoked group ${name} access to ${server.identifier}`.green);
      } catch (e) {
        console.error(e.message.red);
      }
    }
  }

  revokeKey(name, servers) {
    const serverRepo = this.app.get('servers');
    const key = this.app.get('keys').find(name, true);

    for (const server of servers) {
      try {
        server.removeKey(key);
        serverRepo.save(server);
        console.log(`Revoked key ${name} access to ${server.identifier}`.green);
      } catch (e) {
        console.error(e.message.red);
      }
    }
  }

  usage() {
    console.log('zuul revoke key <key name> <user@hostname> [...]');
    console.log('zuul revoke group <group name> <user@hostname> [...]');
  }
}

module.exports = RevokeCommand;
