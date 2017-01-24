class BaseCommand {
  constructor(app) {
    this.app = app;
  }

  execute(args) {
    throw new Error('Missing execute method in ' + this.constructor.name);
  }

  usage() {
    throw new Error('Missing usage method in ' + this.constructor.name);
  }
}

module.exports = BaseCommand;
