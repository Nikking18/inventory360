import fs from 'fs';

// Read TRANSLATIONS from lib/i18n.ts
const code = fs.readFileSync('lib/i18n.ts', 'utf8');

const languages = ['en', 'es', 'fr', 'de', 'hi', 'ja', 'zh', 'ar', 'pt', 'it', 'ru'];
const requestedSubtabs = [
  'sales-history', 'returns',
  'all-orders', 'pending-dispatch', 'shipped-orders',
  'retail-dashboard', 'sales-report', 'inventory-report', 'purchase-report', 'turnover-velocity', 'profit-report', 'tax-report',
  'products', 'categories', 'suppliers',
  'stock-levels', 'low-stock', 'lots-expiry', 'multi-location', 'movements', 'purchases',
  'profile', 'locations', 'data'
];

for (const lang of languages) {
  const langMatch = code.match(new RegExp(`${lang}:\\s*\\{([\\s\\S]*?)\\n  \\},`));
  if (!langMatch) {
    console.log(`Language [${lang}]: BLOCK NOT FOUND`);
    continue;
  }
  const block = langMatch[1];
  const missing = [];
  for (const sub of requestedSubtabs) {
    if (!block.includes(`'${sub}':`) && !block.includes(`"${sub}":`) && !block.includes(`${sub}:`)) {
      missing.push(sub);
    }
  }
  console.log(`Language [${lang}]: ${missing.length === 0 ? 'ALL SUBTABS PRESENT' : `MISSING (${missing.length}): ` + missing.join(', ')}`);
}
