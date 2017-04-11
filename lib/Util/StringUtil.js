/**
 * Convert 'kebab-case-string' to 'kebabCaseString'
 */
function kebabToCamel(s) {
  return s.split('')
    .map((c, idx, arr) => {
      if (c === '-') {
        arr[idx + 1] = arr[idx + 1].toUpperCase();
      }

      return c;
    })
    .join('')
    .replace(/-/g, '');
}

/**
 * Convert 'kebabCaseString' to 'kebab-case-string'
 */
function camelToKebab(s) {
  let a = s.split('');

  for (let i = a.length - 1; i > 0; --i) {
    if (a[i].match(/[A-Z]/)) {
      a.splice(i, 0, '-');
    }
  }

  return a.join('').toLowerCase();
}

module.exports = {
  camelToKebab,
  kebabToCamel
};
