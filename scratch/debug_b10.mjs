import fs from 'fs';

const raw = fs.readFileSync('lib/blogI18n.ts', 'utf8');

const slugStart = raw.indexOf(`'thermal-receipt-printing-escpos-bluetooth-guide':`);
const nextSlugMatch = raw.indexOf(`\n  '`, slugStart + 10);
const chunk = raw.slice(slugStart, nextSlugMatch);

const esMatch = chunk.indexOf('"es": {');
const frMatch = chunk.indexOf('"fr": {');
const esContent = chunk.slice(esMatch, frMatch);

console.log('ES matches:', [...esContent.matchAll(/###\s+\d+\./g)].map(m => m[0]));
