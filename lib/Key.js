class Key {
  constructor(name) {
    this.name = name;
    this.key = null;
  }

  toJSON() {
    return {
      name: this.name,
      key: this.key
    };
  }
}

module.exports = Key;
