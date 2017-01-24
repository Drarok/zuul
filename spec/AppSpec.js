describe('App', () => {
  let App = require('../lib/App');

  var app;

  beforeEach(() => {
    app = new App('zuul-test');
  });

  it('should know its name', () => {
    expect(app.name).toEqual('zuul-test');
  });

  it('should not allow duplicate services', () => {
    let throwError = () => {
      app.register('name1', () => {});
      app.register('name1', () => {});
    };

    expect(throwError).toThrowError('name1 already exists');
  });

  it('should return the same value for repeat calls', () => {
    app.register('obj', function (app) {
      return {};
    });

    expect(app.get('obj')).not.toBe({});
    expect(app.get('obj')).toBe(app.get('obj'));
  });
});
