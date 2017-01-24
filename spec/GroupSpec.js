describe('Group', () => {
  let Group = require('../lib/Group');
  let User = require('../lib/User');

  const NAME = 'GROUP NAME';
  var group;

  beforeEach(() => {
    group = new Group(NAME);
  });

  it('should know its name', () => {
    expect(group.name).toEqual(NAME);
  });

  describe('users', () => {
    var user = new User('alice');

    it('should be able to be added', () => {
      group.addUser(user);
      expect(group.users.length).toBe(1);
    });

    it('should not allow duplicates', () => {
      let err = () => {
        group.addUser(user);
        group.addUser(user);
      };

      expect(err).toThrowError('User alice already exists in group GROUP NAME');
    });

    it('should be removeable', () => {
      group.addUser(user);
      expect(group.users.length).toBe(1);

      group.removeUser(user);
      expect(group.users.length).toBe(0);
    });
  });
});
