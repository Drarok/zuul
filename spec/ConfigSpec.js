describe('Config', () => {
  let Config = require('../lib/Config');

  var config;

  beforeEach(() => {
    config = new Config(__dirname, 'zuul.json');
  });

  it('should have valid getters', () => {
    expect(config.getGroupsPath()).toMatch(/spec\/fixtures\/groups$/);
    expect(config.getKeysPath()).toMatch(/spec\/fixtures\/keys/);
    expect(config.getServersPath()).toMatch(/spec\/fixtures\/servers$/);
    expect(config.getPublicKeyPath()).toMatch(/\/id_rsa.pub$/);
    expect(config.getPrivateKeyPath()).toMatch(/\/id_rsa$/);
    expect(config.getPassPhrase()).toEqual('nice-secure-pass-phrase');
  });
});
