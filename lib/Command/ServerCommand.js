const BaseCommand = require('./BaseCommand');

const Server = require('../Server');

class ServerCommand extends BaseCommand {
  execute(args) {
    if (args._.length === 0 || args._[0] === 'list') {
      return this.list(args);
    } else {
      let command = args._.shift();
      if (this[command]) {
        return this[command](args);
      }
    }

    this.usage();
  }

  list(args) {
    let servers = this.app.get('servers').getAll();

    if (servers.length === 0) {
      console.error('There are no servers'.red);
      return;
    }

    for (let server of servers) {
      if (!args.verbose) {
        let groupNoun = server.groups.length === 1 ? 'group' : 'groups';
        let keyNoun = server.keys.length === 1 ? 'key' : 'keys';
        console.log(`${server.identifier}: ${server.groups.length} ${groupNoun}, ${server.keys.length} ${keyNoun}`);
        continue;
      }

      console.log(`${server.identifier}:`.white);

      if (server.groups.length === 0) {
        console.log('  0 groups'.yellow);
      } else {
        let noun = server.groups.length === 1 ? 'group' : 'groups';
        console.log(`  ${server.groups.length} ${noun}:`.yellow);
        for (let groupName of server.groups) {
          console.log(`    ${groupName}`.green);
        }
      }

      if (server.keys.length === 0) {
        console.log('  0 keys'.yellow);
      } else {
        let noun = server.keys.length === 1 ? 'key' : 'keys';
        console.log(`  ${server.keys.length} ${noun}:`.yellow);
        for (let keyName of server.keys) {
          console.log(`    ${keyName}`.green);
        }
      }
    }
  }

  add(args) {
    const servers = this.app.get('servers');

    for (let identifier of args._) {
      let exists = servers.find(identifier);
      if (exists !== false) {
        console.error(`Server ${identifier} already exists`.red);
        continue;
      }

      try {
        let server = new Server(identifier);
        servers.save(server);
        console.log(`Added server ${identifier}`.green);
      } catch (e) {
        console.error(e.message.red);
      }
    }
  }

  rm(args) {
    const servers = this.app.get('servers');

    for (let identifier of args._) {
      let server = servers.find(identifier);
      if (server === false) {
        console.error(`Server ${identifier} does not exist`.red);
        continue;
      }

      servers.delete(server);
      console.log(`Removed server ${identifier}`.green);
    }
  }

  usage() {
    console.log('zuul server [list]');
    console.log('zuul server add <user@hostname>');
    console.log('zuul server rm <user@hostname>');
  }
}

module.exports = ServerCommand;
