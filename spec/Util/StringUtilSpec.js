describe('String', () => {
  let StringUtil = require('../../lib/Util/StringUtil');

  it('should convert kebab to camel', () => {
    let actual = StringUtil.kebabToCamel('kebab-case-string');
    expect(actual).toEqual('kebabCaseString');
  });

  it('should omit trailing kebab hyphens', () => {
    let actual = StringUtil.kebabToCamel('-kebab-case-string-');
    expect(actual).toEqual('kebabCaseString');
  });
});
