const fs = require('fs');
const path = require('path');

describe('ServerRepo', () => {
  const FIXTURES_PATH = path.normalize(__dirname + '/../fixtures/servers');

  let ServerRepo = require('../../lib/Repo/ServerRepo');
  let Server = require('../../lib/Server');

  var repo;

  beforeEach(() => {
    repo = new ServerRepo(FIXTURES_PATH);
  });

  it('should load all objects', () => {
    let all = repo.getAll();
    expect(all.length).toBe(1);
    expect(all[0] instanceof Server).toBe(true);
    expect(all[0].identifier).toEqual('root@localhost');
  });

  it('should save objects', () => {
    // Make sure the file does not exist before we start.
    let pathname = path.join(FIXTURES_PATH, 'www-data@web-vps.json');
    try {
      fs.unlinkSync(pathname);
    } catch (e) {
      // Deliberately empty
    }

    let server = new Server('www-data@web-vps');
    server.groups = ['admins'];
    server.keys = ['alice'];
    repo.save(server);

    let json = JSON.parse(fs.readFileSync(pathname, 'utf8'));
    expect(json).toEqual({
      groups: server.groups,
      keys: server.keys
    });
    fs.unlinkSync(pathname);
  });

  it('should delete objects', done => {
    let pathname = path.join(FIXTURES_PATH, 'www-data@web-vps.json');

    // Create a fake file.
    fs.writeFileSync(pathname, '{}', 'utf8');

    // Use the repo to delete it.
    let server = new Server('www-data@web-vps');
    repo.delete(server);

    // Assert that the file does not exist.
    fs.access(pathname, err => {
      expect((err || {}).code).toEqual('ENOENT');
      done();
    });
  });

  it('should return false for non-existent items', () => {
    expect(repo.find('user@no-such-host')).toBe(false);
  });

  it('should hydrate existing items', () => {
    let server = repo.find('root@localhost');
    expect(server.identifier).toEqual('root@localhost');
    expect(server.groups).toEqual(['admins']);
    expect(server.keys).toEqual(['alice']);
  });
});
