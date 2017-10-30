class App {
  constructor(name) {
    this.name = name;
    this.services = {};
    this.instances = {};
  }

  register(name, service) {
    if (this.services[name]) {
      throw new Error(`Service ${name} already exists`);
    }

    this.services[name] = service;
  }

  get(name) {
    if (!this.services[name]) {
      throw new Error(`Service ${name} does not exist`);
    }

    if (!this.instances[name]) {
      this.instances[name] = this.services[name](this);
    }

    return this.instances[name];
  }
}

module.exports = App;
