import fs from 'fs';

const code = fs.readFileSync('lib/exportImport.ts', 'utf8');

const languages = ['en', 'es', 'fr', 'de', 'hi', 'ja', 'zh', 'ar', 'pt', 'it', 'ru'];
for (const lang of languages) {
  const hasLang = code.includes(`${lang}: {`);
  console.log(`Language [${lang}]: ${hasLang ? 'PRESENT' : 'MISSING'}`);
}
