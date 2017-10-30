describe('Group', () => {
  let Group = require('../lib/Group');
  let Key = require('../lib/Key');

  const NAME = 'GROUP NAME';
  var group;

  beforeEach(() => {
    group = new Group(NAME);
  });

  it('should know its name', () => {
    expect(group.name).toEqual(NAME);
  });

  describe('keys', () => {
    var key = new Key('alice');

    it('should be able to be added', () => {
      group.addKey(key);
      expect(group.keys.length).toBe(1);
    });

    it('should not allow duplicates', () => {
      let err = () => {
        group.addKey(key);
        group.addKey(key);
      };

      expect(err).toThrowError('Key alice already exists in group GROUP NAME');
    });

    it('should be removeable', () => {
      group.addKey(key);
      expect(group.keys.length).toBe(1);

      group.removeKey(key);
      expect(group.keys.length).toBe(0);
    });
  });
});
