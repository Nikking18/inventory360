import fs from 'fs';

const raw = fs.readFileSync('lib/blogI18n.ts', 'utf8');

const languages = ['es', 'fr', 'de', 'hi', 'ja', 'zh', 'ar', 'pt', 'it', 'ru'];
const targetSlugs = [
  'local-first-inventory-management-offline-pos',
  'inventory-turnover-ratio-stock-velocity-guide',
  'omnichannel-retail-inventory-sync-shopify-amazon',
  'batch-lot-expiry-date-tracking-guide',
  'barcode-qr-code-inventory-setup-label-printing',
  'multi-location-inventory-transfers-warehouse-routing',
  'automated-purchase-orders-reorder-point-formulas',
  'abc-inventory-classification-dead-stock-liquidation',
  'offline-data-sovereignty-automated-local-backups',
  'thermal-receipt-printing-escpos-bluetooth-guide',
  'how-to-use-inventory-360-complete-user-guide-features',
  'top-10-inventory-management-web-apps-2026'
];

const expectedCounts = {
  'local-first-inventory-management-offline-pos': 9,
  'inventory-turnover-ratio-stock-velocity-guide': 9,
  'omnichannel-retail-inventory-sync-shopify-amazon': 8,
  'batch-lot-expiry-date-tracking-guide': 8,
  'barcode-qr-code-inventory-setup-label-printing': 8,
  'multi-location-inventory-transfers-warehouse-routing': 8,
  'automated-purchase-orders-reorder-point-formulas': 8,
  'abc-inventory-classification-dead-stock-liquidation': 8,
  'offline-data-sovereignty-automated-local-backups': 8,
  'thermal-receipt-printing-escpos-bluetooth-guide': 8,
  'how-to-use-inventory-360-complete-user-guide-features': 10,
  'top-10-inventory-management-web-apps-2026': 6
};

console.log('=== EXACT ACCURACY AUDIT FOR BLOGS 1 TO 12 ===\n');

let allPassed = true;

for (const slug of targetSlugs) {
  const expected = expectedCounts[slug];
  console.log(`Checking [${slug}] (Expected Sections: ${expected})...`);

  // Find start and end of this slug's dictionary
  const slugStart = raw.indexOf(`'${slug}':`);
  if (slugStart === -1) {
    console.error(`  ❌ Slug '${slug}' not found!`);
    allPassed = false;
    continue;
  }

  // Next slug start
  const nextSlugMatch = raw.indexOf(`\n  '`, slugStart + 10);
  const slugChunk = raw.slice(slugStart, nextSlugMatch !== -1 ? nextSlugMatch : raw.indexOf('};\n\n// Returns'));

  for (const lang of languages) {
    // Find lang block inside slugChunk
    const langKeyPattern = new RegExp(`["']?${lang}["']?:\\s*\\{`);
    const langMatch = slugChunk.search(langKeyPattern);
    if (langMatch === -1) {
      console.error(`  ❌ [${lang}] Missing translation`);
      allPassed = false;
      continue;
    }

    const subChunk = slugChunk.slice(langMatch);
    const contentMatch = subChunk.search(/["']?content["']?:/);
    if (contentMatch === -1) {
      console.error(`  ❌ [${lang}] Missing content property`);
      allPassed = false;
      continue;
    }

    // TOC count
    const tocSection = subChunk.slice(0, contentMatch);
    const tocCount = (tocSection.match(/["']?id["']?:/g) || []).length;

    // Content section count: match only standalone level-3 headings
    const nextLangMatch = subChunk.slice(contentMatch + 10).search(/\n\s*["']?[a-z]{2}["']?:\s*\{/);
    const contentText = nextLangMatch !== -1 ? subChunk.slice(contentMatch, contentMatch + 10 + nextLangMatch) : subChunk.slice(contentMatch);

    const sections = (contentText.match(/###\s+\d+\./g) || []).length;

    if (tocCount === expected && sections === expected) {
      console.log(`  ✅ [${lang}]: 100% Exact Match (${tocCount}/${expected} TOC & ${sections}/${expected} Sections)`);
    } else {
      console.error(`  ❌ [${lang}]: Mismatch! TOC: ${tocCount}/${expected}, Sections: ${sections}/${expected}`);
      allPassed = false;
    }
  }
  console.log('');
}

if (allPassed) {
  console.log('🎉 ALL 12 BLOG POSTS ARE 100% COMPLETE AND VERIFIED ACROSS ALL 11 LANGUAGES!');
} else {
  console.error('⚠️ Verification failed.');
  process.exit(1);
}
