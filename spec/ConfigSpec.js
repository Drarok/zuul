describe('Config', () => {
  let Config = require('../lib/Config');

  var config;

  beforeEach(() => {
    config = new Config(__dirname, 'zuul.json');
  });

  it('should have valid getters', () => {
    expect(config.getGroupsPath()).toMatch(/spec\/fixtures\/groups$/);
    expect(config.getUsersPath()).toMatch(/spec\/fixtures\/users$/);
    expect(config.getServersPath()).toMatch(/spec\/fixtures\/servers$/);
  });
});
