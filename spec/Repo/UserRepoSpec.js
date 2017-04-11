const fs = require('fs');
const path = require('path');

describe('UserRepo', () => {
  const FIXTURES_PATH = path.normalize(__dirname + '/../fixtures/users');

  let UserRepo = require('../../lib/Repo/UserRepo');
  let User = require('../../lib/User');

  var repo;

  beforeEach(() => {
    repo = new UserRepo(FIXTURES_PATH);
  });

  it('should load all objects', () => {
    let all = repo.getAll();
    expect(all.length).toBe(1);
    expect(all[0] instanceof User).toBe(true);
    expect(all[0].name).toEqual('alice');
  });

  it('should save objects', () => {
    // Make sure the file does not exist before we start.
    let pathname = path.join(FIXTURES_PATH, 'bob.pub');
    try {
      fs.unlinkSync(pathname);
    } catch (e) {
      // Deliberately empty block
    }

    let user = new User('bob');
    user.key = 'ssh-rsa 0123456789abcdef bob@bobs-pc';
    repo.save(user);

    let key = fs.readFileSync(pathname, 'utf8');
    expect(key).toEqual(user.key);
    fs.unlinkSync(pathname);
  });

  it('should delete objects', done => {
    let pathname = path.join(FIXTURES_PATH, 'eve.pub');

    // Create a fake file.
    fs.writeFileSync(pathname, 'ssh-rsa 0123456789abcdef eve@garden-of-eden', 'utf8');

    // Use the repo to delete it.
    let user = new User('eve');
    repo.delete(user);

    // Assert that the file does not exist.
    fs.access(pathname, err => {
      expect(err.code).toEqual('ENOENT');
      done();
    });
  });

  it('should return false for non-existent items', () => {
    expect(repo.find('no-such-item')).toBe(false);
  });

  it('should hydrate existing items', () => {
    let user = repo.find('alice');
    expect(user.key).toEqual('ssh-rsa abcdef1234567890 fake-user@fake-host');
  });
});
