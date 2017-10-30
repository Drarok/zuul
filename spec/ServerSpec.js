describe('Server', () => {
  let Server = require('../lib/Server');

  let Group = require('../lib/Group');
  let Key = require('../lib/Key');

  const IDENTIFIER = 'www-data@web-vps';
  var server;

  beforeEach(() => {
    server = new Server(IDENTIFIER);
  });

  it('should accept a valid identifier', () => {
    let s = new Server(IDENTIFIER);
    expect(s.identifier).toEqual(IDENTIFIER);
  });

  it('should reject an invalid identifier', () => {
    let err = () => {
      new Server('not-valid');
    };

    expect(err).toThrowError('Invalid identifier not-valid must use username@hostname format');
  });

  describe('groups', () => {
    let group = new Group('developers');

    it('should be able to be added', () => {
      expect(server.groups.length).toBe(0);
      server.addGroup(group);
      expect(server.groups.length).toBe(1);
    });

    it('should not allow duplicates', () => {
      let err = () => {
        server.addGroup(group);
        server.addGroup(group);
      };

      expect(err).toThrowError('Group developers already exists on server www-data@web-vps');
    });

    it('should be removeable', () => {
      server.addGroup(group);
      expect(server.groups.length).toBe(1);

      server.removeGroup(group);
      expect(server.groups.length).toBe(0);
    });

    it('should not allow nonexistent removals', () => {
      let err = () => {
        server.removeGroup(group);
      };

      expect(err).toThrowError('Group developers does not exist on server www-data@web-vps');
    });
  });

  describe('keys', () => {
    let key = new Key('alice');

    it('should be able to be added', () => {
      expect(server.keys.length).toBe(0);
      server.addKey(key);
      expect(server.keys.length).toBe(1);
    });

    it('should not allow duplicates', () => {
      let err = () => {
        server.addKey(key);
        server.addKey(key);
      };

      expect(err).toThrowError('Key alice already exists on server www-data@web-vps');
    });

    it('should be removeable', () => {
      server.addKey(key);
      expect(server.keys.length).toBe(1);

      server.removeKey(key);
      expect(server.keys.length).toBe(0);
    });

    it('should not allow nonexistent removals', () => {
      let err = () => {
        server.removeKey(key);
      };

      expect(err).toThrowError('Key alice does not exist on server www-data@web-vps');
    });
  });
});
