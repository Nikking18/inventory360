import fs from 'fs';

const blogDataContent = fs.readFileSync('lib/blogData.ts', 'utf8');
const blogI18nContent = fs.readFileSync('lib/blogI18n.ts', 'utf8');

const slug = 'barcode-qr-code-inventory-setup-label-printing';
const languages = ['es', 'fr', 'de', 'hi', 'ja', 'zh', 'ar', 'pt', 'it', 'ru'];

console.log(`=== AUDITING BLOG 5: [${slug}] ===\n`);

// Check master post
const masterMatch = blogDataContent.indexOf(`slug: '${slug}'`);
if (masterMatch === -1) {
  console.error(`❌ Could not find master post for ${slug} in blogData.ts`);
  process.exit(1);
}

// Check translations in blogI18n
const startMarker = `'${slug}':`;
const startIndex = blogI18nContent.indexOf(startMarker);
if (startIndex === -1) {
  console.error(`❌ Could not find translation object for ${slug} in blogI18n.ts`);
  process.exit(1);
}

let allValid = true;

for (const lang of languages) {
  // Check lang key
  const langKey = `"${lang}":` ;
  const langKeyAlt = `${lang}:`;
  const langIndex = blogI18nContent.indexOf(langKey, startIndex);
  const langIndexAlt = blogI18nContent.indexOf(langKeyAlt, startIndex);

  if (langIndex === -1 && langIndexAlt === -1) {
    console.error(`❌ Missing translation for language: ${lang}`);
    allValid = false;
    continue;
  }

  // Count TOC and sections for that lang
  // Let's parse the object cleanly
}

console.log('Validating structure by running a test script with dynamic import...');
