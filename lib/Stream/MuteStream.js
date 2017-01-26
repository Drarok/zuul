const Writable = require('stream').Writable;

class MuteStream extends Writable {
  constructor(parent, options) {
    super(options);
    this.parent = parent;
    this.muted = false;
  }

  mute() {
    this.muted = true;
  }

  unmute() {
    this.muted = false;
  }

  _write(chunk, encoding, callback) {
    if (!this.muted) {
      return this.parent.write(chunk, encoding, callback);
    }

    let c = chunk.toString();
    if (c === '\r' || c === '\n' || c === '\r\n') {
      return this.parent.write(chunk, encoding, callback);
    }

    this.parent.write('*', callback);
  }
}

module.exports = MuteStream;
