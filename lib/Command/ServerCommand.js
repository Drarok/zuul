const fs = require('fs');

const BaseCommand = require('./BaseCommand');

const Group = require('../Group');
const User = require('../User');
const Server = require('../Server');

class ServerCommand extends BaseCommand {
  execute(args) {
    if (args._.length === 0 || args._[0] === 'list') {
      return this.list(args);
    } else {
      let command = args._.shift().replace(/-/g, '_');
      if (this[command]) {
        return this[command](args);
      }
    }

    this.usage();
  }

  list(args) {
    let servers = this.app.get('servers').getAll();

    if (servers.length === 0) {
      console.log('There are no servers'.red);
      return;
    }

    if (servers.length === 1) {
      console.log(`There is 1 server`.green);
    } else {
      console.log(`There are ${servers.length} servers`.green);
    }

    for (let server of servers) {
      let name = server.name;
      if (server.hostname && server.hostname != name) {
        name += ` (${server.hostname})`;
      }

      if (!args.verbose) {
        let groupNoun = server.groups.length === 1 ? 'group' : 'groups';
        let userNoun = server.users.length === 1 ? 'user' : 'users';
        console.log(`  ${name}: ${server.groups.length} ${groupNoun}, ${server.users.length} ${userNoun}`);
        continue;
      }

      console.log('  ' + name + ':');

      if (server.groups.length) {
        console.log('    groups:');
        for (let g of server.groups) {
          console.log('      ' + g);
        }
      }

      if (server.users.length) {
        console.log('    users:');
        for (let u of server.users) {
          console.log('      ' + u);
        }
      }
    }
  }

  add(args) {
    let [name, hostname] = args._;

    let servers = this.app.get('servers');
    servers.find(name, false);

    servers.save(new Server(name, hostname));

    console.log(`Created server ${name}`.green);
  }

  rm(args) {
    let [name] = args._;

    let servers = this.app.get('servers');
    let server = servers.find(name, true);
    servers.delete(server);

    console.log(`Deleted server ${name}`.green);
  }

  add_group(args) {
    let [serverName, groupName] = args._;

    let servers = this.app.get('servers');
    let server = servers.find(serverName, true);

    let groups = this.app.get('groups');
    let group = groups.find(groupName, true);

    server.addGroup(group);
    servers.save(server);

    console.log(`Added group ${groupName} to server ${serverName}`.green);
  }

  rm_group(args) {
    let [serverName, groupName] = args._;

    let servers = this.app.get('servers');
    let server = servers.find(serverName, true);

    let groups = this.app.get('groups');
    let group = groups.find(groupName, true);

    server.removeGroup(group);
    servers.save(server);

    console.log(`Removed group ${groupName} from server ${serverName}`.green);
  }

  add_user(args) {
    let [serverName, userName] = args._;

    let servers = this.app.get('servers');
    let server = servers.find(serverName, true);

    let users = this.app.get('users');
    let user = users.find(userName, true);

    server.addUser(user);
    servers.save(server);

    console.log(`Added user ${userName} to server ${serverName}`.green);
  }

  rm_user(args) {
    let [serverName, userName] = args._;

    let servers = this.app.get('servers');
    let server = servers.find(serverName, true);

    let users = this.app.get('users');
    let user = users.find(userName, true);

    server.removeUser(user);
    servers.save(server);

    console.log(`Removed user ${userName} from server ${serverName}`.green);
  }

  usage() {
    console.log('zuul server [--verbose]');
    console.log('zuul server list [--verbose]');
    console.log('zuul server add <server> [hostname]');
    console.log('zuul server rm <server>');
    console.log('zuul server add-group <server> <group>');
    console.log('zuul server rm-group <server> <group>');
    console.log('zuul server add-user <server> <user>');
    console.log('zuul server rm-user <server> <user>');
  }
}

module.exports = ServerCommand;
