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
      this._showServer(server, args.verbose);
    }
  }

  show(args) {
    if (args._.length === 0) {
      return this.usage();
    }

    const serverRepo = this.app.get('servers');

    for (const identifier of args._) {
      const server = serverRepo.find(identifier, true);
      this._showServer(server, args.verbose);
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
    console.log('zuul server show <user@hostname> [...]');
    console.log('zuul server add <user@hostname>');
    console.log('zuul server rm <user@hostname>');
  }

  _showServer(server, verbose) {
    if (!verbose) {
      let groupNoun = server.groups.length === 1 ? 'group' : 'groups';
      let keyNoun = server.keys.length === 1 ? 'key' : 'keys';
      console.log(`${server.identifier}: ${server.groups.length} ${groupNoun}, ${server.keys.length} ${keyNoun}`);
      return;
    }

    console.log(`${server.identifier}:`.white);

    if (server.groups.length === 0) {
      console.log('  0 groups'.yellow);
    } else {
      let noun = server.groups.length === 1 ? 'group' : 'groups';
      process.stdout.write(`  ${server.groups.length} ${noun}: `.yellow);
      console.log(server.groups.map((name) => name.green).join(', '));
    }

    if (server.keys.length === 0) {
      console.log('  0 keys'.yellow);
    } else {
      let noun = server.keys.length === 1 ? 'key' : 'keys';
      process.stdout.write(`  ${server.keys.length} ${noun}: `.yellow);
      console.log(server.keys.map((name) => name.green).join(', '));
    }
  }
}

module.exports = ServerCommand;
