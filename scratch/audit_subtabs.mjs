import fs from 'fs';

const code = fs.readFileSync('lib/i18n.ts', 'utf8');

// List of all 11 supported languages
const languages = ['en', 'es', 'fr', 'de', 'hi', 'ja', 'zh', 'ar', 'pt', 'it', 'ru'];

// Subtabs requested by user:
const requestedSubtabs = [
  'sales-history', 'returns',
  'all-orders', 'pending-dispatch', 'shipped-orders',
  'retail-dashboard', 'sales-report', 'inventory-report', 'purchase-report', 'turnover-velocity', 'profit-report', 'tax-report',
  'products', 'categories', 'suppliers',
  'stock-levels', 'low-stock', 'lots-expiry', 'multi-location', 'movements', 'purchases',
  'profile', 'locations', 'data'
];

console.log('--- AUDITING REQUESTED SUBTABS IN I18N ---');
for (const sub of requestedSubtabs) {
  const hasEn = code.includes(`${sub}:`) || code.includes(`'${sub}':`) || code.includes(`"${sub}":`);
  console.log(`Subtab [${sub}]: ${hasEn ? 'FOUND' : 'MISSING IN DICTIONARY'}`);
}
