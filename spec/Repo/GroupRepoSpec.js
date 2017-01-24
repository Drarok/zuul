const fs = require('fs');
const path = require('path');

describe('GroupRepo', () => {
  const FIXTURES_PATH = path.normalize(__dirname + '/../fixtures/groups');

  let GroupRepo = require('../../lib/Repo/GroupRepo');
  let Group = require('../../lib/Group');

  var repo;

  beforeEach(() => {
    repo = new GroupRepo(FIXTURES_PATH);
  });

  it('should load all objects', () => {
    let all = repo.getAll();
    expect(all.length).toBe(2);
    expect(all[0] instanceof Group).toBe(true);
    expect(all[0].name).toEqual('admins');
  });

  it('should save objects', () => {
    // Make sure the file does not exist before we start.
    let pathname = path.join(FIXTURES_PATH, 'testers.json');
    try {
      fs.unlinkSync(pathname);
    } catch (e) {
    }

    let group = new Group('testers', ['alice']);
    repo.save(group);

    let json = JSON.parse(fs.readFileSync(pathname, 'utf8'));
    expect(json).toEqual(group.users);
    fs.unlinkSync(pathname);
  });

it('should delete objects', done => {
    let pathname = path.join(FIXTURES_PATH, 'developers.json');

    // Create a fake file.
    fs.writeFileSync(pathname, '[]', 'utf8');

    // Use the repo to delete it.
    let group = new Group('developers');
    repo.delete(group);

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
    let group = repo.find('admins');
    expect(group.users.length).toBe(2);
  });
});
