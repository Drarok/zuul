const fs = require('fs');
const path = require('path');

class User {
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

module.exports = User;
