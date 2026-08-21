import fs from 'fs';

const data = fs.readFileSync('lib/blogData.ts', 'utf8');
const slugs = [...data.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);

console.log('--- ALL SLUGS IN BLOG DATA ---');
slugs.forEach((s, idx) => console.log(`${idx + 1}. ${s}`));

const i18n = fs.readFileSync('lib/blogI18n.ts', 'utf8');
const i18nKeys = [...i18n.matchAll(/'([a-z0-9-]+)':\s*\{/g)].map(m => m[1]);
console.log('\n--- KEYS IN BLOG I18N ---');
i18nKeys.forEach(k => console.log(`- ${k}`));
