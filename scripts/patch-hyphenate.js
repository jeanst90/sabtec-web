const fs = require('fs');
const path = require('path');

const hyphenateTarget = path.join(__dirname, '..', 'node_modules', '@react-pdf', 'hyphenate', 'lib', 'index.js');
const hyphenateContent = `import hyphenateLib from 'hyphen';

function createHyphenator(patterns) {
  const h = hyphenateLib(patterns);
  const hyphenateWord = (word, lang) => h(word).split('\\u00AD');
  const hyphenate = (word, lang) => h(word);
  const syllables = (word, lang) => h(word).split('\\u00AD').filter(Boolean);
  return { hyphenate, hyphenateWord, syllables };
}

export { createHyphenator };
export default createHyphenator;
`;

const hyphenateDir = path.dirname(hyphenateTarget);
if (fs.existsSync(hyphenateDir)) {
  fs.writeFileSync(hyphenateTarget, hyphenateContent);
  console.log('Patched @react-pdf/hyphenate');
}

const fontSrc = path.join(__dirname, 'pdfkit-standard-fonts');
const fontDst = path.join(__dirname, '..', 'node_modules', 'pdfkit', 'js', 'standard-fonts');
if (fs.existsSync(fontSrc) && fs.existsSync(fontDst)) {
  const copyDir = (s, d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    for (const f of fs.readdirSync(s)) {
      const sp = path.join(s, f);
      const dp = path.join(d, f);
      if (fs.statSync(sp).isDirectory()) copyDir(sp, dp);
      else if (!fs.existsSync(dp)) fs.copyFileSync(sp, dp);
    }
  };
  copyDir(fontSrc, fontDst);
  console.log('Restored pdfkit standard-fonts .cjs files');
}