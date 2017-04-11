describe('String', () => {
  let StringUtil = require('../../lib/Util/StringUtil');

  beforeEach(() => {
    // Nothing yet
  });

  it('should convert kebab to camel', () => {
    let actual = StringUtil.kebabToCamel('kebab-case-string');
    expect(actual).toEqual('kebabCaseString');
  });

  it('should convert camel to kebab', () => {
    let actual = StringUtil.camelToKebab('camelCaseString');
    expect(actual).toEqual('camel-case-string');
  });
});
