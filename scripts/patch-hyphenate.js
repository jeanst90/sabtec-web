const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', '@react-pdf', 'hyphenate', 'lib', 'index.js');

const content = `import hyphenateLib from 'hyphen';
import patterns from 'hyphen/patterns/en-us.js';

export const hyphenateWord = (word, lang = 'en-us') => {
  const h = hyphenateLib(patterns);
  return h(word).split('\\u00AD');
};

export const hyphenate = (word, lang) => hyphenateWord(word, lang).join('\\u00AD');
export const syllables = (word, lang = 'en-us') => {
  const h = hyphenateLib(patterns);
  const res = h(word);
  return res.split('\\u00AD').filter(Boolean);
};

export default { hyphenate, hyphenateWord, syllables };
`;

if (fs.existsSync(path.dirname(target))) {
  fs.writeFileSync(target, content);
  console.log('Patched @react-pdf/hyphenate');
} else {
  console.log('node_modules not found, skipping patch');
}
EOF