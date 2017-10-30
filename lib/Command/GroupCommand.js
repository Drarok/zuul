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
      for (let keyName of group.keys) {
        console.log('  ' + keyName.green);
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

    if (args.key) {
      // TODO: Validate that these keys exist.
      if (Array.isArray(args.key)) {
        group.keys = args.key;
      } else {
        group.keys = [args.key];
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

  addKey(args) {
    let groupName = args._[0];
    let keyNames = args._.slice(1);

    if (!groupName || keyNames.length === 0) {
      throw new Error('Missing required argument');
    }

    let group = this.app.get('groups').find(groupName);
    if (group === false) {
      throw new Error(`Group ${groupName} does not exist`);
    }

    for (const keyName of keyNames) {
      let key = this.app.get('keys').find(keyName);
      if (key === false) {
        console.log(`Key ${keyName} does not exist`.red);
        continue;
      }

      try {
        group.addKey(key);
        console.log(`Added ${keyName} to ${groupName}`.green);
      } catch (e) {
        console.log(e.message.red);
      }
    }

    this.app.get('groups').save(group);
  }

  rmKey(args) {
    let groupName = args._[0];
    let keyNames = args._.slice(1);

    if (!groupName || keyNames.length === 0) {
      throw new Error('Missing required argument');
    }

    let group = this.app.get('groups').find(groupName);
    if (group === false) {
      throw new Error(`Group ${groupName} does not exist`);
    }

    for (const keyName of keyNames) {
      let key = this.app.get('keys').find(keyName);
      if (key === false) {
        throw new Error(`Key ${keyName} does not exist`);
      }

      group.removeKey(key);
      console.log(`Removed ${keyName} from ${groupName}`.green);
    }

    this.app.get('groups').save(group);
  }

  usage() {
    console.log('zuul group [list]');
    console.log('zuul group add <group> [--key=<key name>] [...]');
    console.log('zuul group rm <group>');
    console.log('zuul group add-key <group> <key name> [...]');
    console.log('zuul group rm-key <group> <key name> [...]');
  }
}

module.exports = GroupCommand;
