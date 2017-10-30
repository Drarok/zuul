describe('Server', () => {
  let Server = require('../lib/Server');

  let Group = require('../lib/Group');
  let User = require('../lib/Key');

  const NAME = 'web-vps';
  var server;

  beforeEach(() => {
    server = new Server(NAME, 'root@' + NAME);
  });

  it('should know its name', () => {
    expect(server.name).toEqual(NAME);
  });

  it('should accept a custom hostname', () => {
    let s = new Server('name', 'root@hostname');
    expect(s.name).toEqual('name');
    expect(s.hostname).toEqual('root@hostname');
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

      expect(err).toThrowError('Group developers already exists on server web-vps');
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

      expect(err).toThrowError('Group developers does not exist on server web-vps');
    });
  });

  describe('users', () => {
    let user = new User('alice');

    it('should be able to be added', () => {
      expect(server.users.length).toBe(0);
      server.addKey(user);
      expect(server.users.length).toBe(1);
    });

    it('should not allow duplicates', () => {
      let err = () => {
        server.addKey(user);
        server.addKey(user);
      };

      expect(err).toThrowError('User alice already exists on server web-vps');
    });

    it('should be removeable', () => {
      server.addKey(user);
      expect(server.users.length).toBe(1);

      server.removeKey(user);
      expect(server.users.length).toBe(0);
    });

    it('should not allow nonexistent removals', () => {
      let err = () => {
        server.removeKey(user);
      };

      expect(err).toThrowError('User alice does not exist on server web-vps');
    });
  });
});
