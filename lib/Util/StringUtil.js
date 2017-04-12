/**
 * Convert 'kebab-case-string' to 'kebabCaseString'
 */
function kebabToCamel(s) {
  return s.replace(/^-+|-+$/g, '')
    .split('')
    .map((c, idx, arr) => {
      if (c === '-') {
        arr[idx + 1] = arr[idx + 1].toUpperCase();
      }

      return c;
    })
    .join('')
    .replace(/-/g, '');
}

module.exports = {
  kebabToCamel
};
