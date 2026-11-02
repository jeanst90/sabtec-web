const fs = require('fs');
const path = require('path');

// 1. Patch @react-pdf/hyphenate
const hyphenateTarget = path.join(__dirname, '..', 'node_modules', '@react-pdf', 'hyphenate', 'lib', 'index.js');
const hyphenateContent = `import hyphenateLib from 'hyphen';
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

const hyphenateDir = path.dirname(hyphenateTarget);
if (fs.existsSync(hyphenateDir)) {
  fs.writeFileSync(hyphenateTarget, hyphenateContent);
  console.log('Patched @react-pdf/hyphenate');
}

// 2. Restore pdfkit standard-fonts .cjs files (Hostinger may strip them)
const fontSrc = path.join(__dirname, 'pdfkit-standard-fonts');
const fontDst = path.join(__dirname, '..', 'node_modules', 'pdfkit', 'js', 'standard-fonts');
if (fs.existsSync(fontSrc) && fs.existsSync(fontDst)) {
  const files = fs.readdirSync(fontSrc);
  for (const f of files) {
    const srcPath = path.join(fontSrc, f);
    const dstPath = path.join(fontDst, f);
    if (fs.statSync(srcPath).isDirectory()) {
      const chunkDst = path.join(fontDst, f);
      if (!fs.existsSync(chunkDst)) fs.mkdirSync(chunkDst, { recursive: true });
      for (const cf of fs.readdirSync(srcPath)) {
        fs.copyFileSync(path.join(srcPath, cf), path.join(chunkDst, cf));
      }
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
  console.log('Restored pdfkit standard-fonts .cjs files');
}