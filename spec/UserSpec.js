describe('User', () => {
  let User = require('../lib/User');

  const NAME = 'User name here';

  var user;

  beforeEach(() => {
    user = new User(NAME);
  });

  it('should know its name', () => {
    expect(user.name).toEqual(NAME);
  });
});
