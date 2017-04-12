const BaseCommand = require('./BaseCommand');
const Group = require('../Group');
const StringUtil = require('../Util/StringUtil');

class GroupCommand extends BaseCommand {
  execute(args) {
    if (args._.length === 0 || args._[0] === 'list') {
      return this.list();
    } else {
      let command = StringUtil.kebabToCamel(args._.shift());
      if (this[command]) {
        return this[command](args);
      }
    }

    this.usage();
  }

  list() {
    let groups = this.app.get('groups').getAll();

    if (groups.length === 0) {
      console.log('There are no groups'.red);
      return;
    }

    for (let group of groups) {
      console.log((group.name + ':').white);
      for (let user of group.users) {
        console.log('  ' + user.green);
      }
      console.log('');
    }
  }

  add(args) {
    let [name] = args._;

    if (!name) {
      throw new Error('Missing required argument');
    }

    let groups = this.app.get('groups');
    groups.find(name, false);

    let group = new Group(name);

    if (args.user) {
      // TODO: Validate that these users exist.
      if (Array.isArray(args.user)) {
        group.users = args.user;
      } else {
        group.users = [args.user];
      }
    }

    groups.save(group);
    console.log(`Created group ${name}`.green);
  }

  rm(args) {
    let [name] = args._;

    if (!name) {
      throw new Error('Missing required argument');
    }

    let groups = this.app.get('groups');
    let group = groups.find(name);
    if (group === false) {
      throw new Error(`Group ${name} does not exist`);
    }

    groups.delete(group);
  }

  addUser(args) {
    let groupName = args._[0];
    let userNames = args._.slice(1);

    if (!groupName || userNames.length === 0) {
      throw new Error('Missing required argument');
    }

    let group = this.app.get('groups').find(groupName);
    if (group === false) {
      throw new Error('No such group: ' + groupName);
    }

    for (const userName of userNames) {
      let user = this.app.get('users').find(userName);
      if (user === false) {
        throw new Error('No such user: ' + userName);
      }

      group.addUser(user);
      console.log(`Added ${userName} to ${groupName}`.green);
    }

    this.app.get('groups').save(group);
  }

  rmUser(args) {
    let groupName = args._[0];
    let userNames = args._.slice(1);

    if (!groupName || userNames.length === 0) {
      throw new Error('Missing required argument');
    }

    let group = this.app.get('groups').find(groupName);
    if (group === false) {
      throw new Error('No such group: ' + groupName);
    }

    for (const userName of userNames) {
      let user = this.app.get('users').find(userName);
      if (user === false) {
        throw new Error('No such user: ' + userName);
      }

      group.removeUser(user);
      console.log(`Removed ${userName} from ${groupName}`.green);
    }

    this.app.get('groups').save(group);
  }

  usage() {
    console.log('zuul group add <group> [--user=<user>] [...]');
    console.log('zuul group rm <group>');
    console.log('zuul group add-user <group> <username> [...]');
    console.log('zuul group rm-user <group> <username> [...]');
  }
}

module.exports = GroupCommand;
