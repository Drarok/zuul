const fs = require('fs');

const BaseCommand = require('./BaseCommand');
const Group = require('../Group');

class GroupCommand extends BaseCommand {
  execute(args) {
    if (args._.length === 0 || args._[0] === 'list') {
      return this.list();
    } else {
      let command = args._.shift().replace(/-/g, '_');
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

    if (groups.length === 1) {
      console.log(`There is 1 group`.green);
    } else {
      console.log(`There are ${groups.length} groups`.green);
    }

    for (let group of groups) {
      console.log('  ' + group.name);
      for (let user of group.users) {
        console.log('    ' + user);
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

    if (groups.find(name)) {
      throw new Error(`Group ${name} already exists`);
    }

    groups.save(new Group(name));
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

  add_user(args) {
    let [groupName, userName] = args._;

    if (!groupName || !userName) {
      throw new Error('Missing required argument');
    }

    let group = this.app.get('groups').find(groupName);
    if (group === false) {
      throw new Error('No such group: ' + groupName);
    }

    let user = this.app.get('users').find(userName);
    if (user === false) {
      throw new Error('No such user: ' + userName);
    }

    group.addUser(user);
    this.app.get('groups').save(group);

    console.log(`Successfully added ${userName} to ${groupName}`.green);
  }

  rm_user(args) {
    let [groupName, userName] = args._;

    if (!groupName || !userName) {
      throw new Error('Missing required argument');
    }

    let group = this.app.get('groups').find(groupName);
    if (group === false) {
      throw new Error('No such group: ' + groupName);
    }

    let user = this.app.get('users').find(userName);
    if (user === false) {
      throw new Error('No such user: ' + userName);
    }

    group.removeUser(user);
    this.app.get('groups').save(group);

    console.log(`Successfully removed ${userName} from ${groupName}`.green);
  }

  usage() {
    console.log('zuul group add <group>');
    console.log('zuul group rm <group>');
    console.log('zuul group add-user <group> <username>');
    console.log('zuul group rm-user <group> <username>');
  }
}

module.exports = GroupCommand;
