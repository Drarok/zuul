describe('Group', () => {
  let Group = require('../lib/Group');
  let User = require('../lib/Key');

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
      group.addKey(user);
      expect(group.users.length).toBe(1);
    });

    it('should not allow duplicates', () => {
      let err = () => {
        group.addKey(user);
        group.addKey(user);
      };

      expect(err).toThrowError('User alice already exists in group GROUP NAME');
    });

    it('should be removeable', () => {
      group.addKey(user);
      expect(group.users.length).toBe(1);

      group.removeKey(user);
      expect(group.users.length).toBe(0);
    });
  });
});
