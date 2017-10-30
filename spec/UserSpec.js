describe('User', () => {
  let User = require('../lib/Key');

  const NAME = 'User name here';

  var user;

  beforeEach(() => {
    user = new User(NAME);
  });

  it('should know its name', () => {
    expect(user.name).toEqual(NAME);
  });
});
