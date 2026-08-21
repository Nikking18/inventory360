import fs from 'fs';

const filePath = 'components/views/CatalogView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Dynamic top button action label
content = content.replace(
  `const getTopActionLabel = () => {\n    if (activeSubTab === 'categories') return 'Add Category';\n    if (activeSubTab === 'suppliers') return 'Add Supplier';\n    return 'Add Product';\n  };`,
  `const getTopActionLabel = () => {\n    if (activeSubTab === 'categories') return t('add_category', 'Add Category');\n    if (activeSubTab === 'suppliers') return t('add_supplier', 'Add Supplier');\n    return t('add_product', 'Add Product');\n  };`
);

// 2. Subtabs navigation bar
content = content.replace(
  `{tabId === 'products' ? 'Products & Variants' : tabId === 'categories' ? 'Categories' : 'Suppliers'}`,
  `{tabId === 'products' ? t('products', 'Products & Variants') : tabId === 'categories' ? t('categories', 'Categories') : t('suppliers', 'Suppliers')}`
);

// 3. Products Table Headers
content = content.replace(
  `<th className="p-2.5">Product &amp; SKU</th>\n                  <th className="p-2.5">Category</th>\n                  <th className="p-2.5">Supplier</th>\n                  <th className="p-2.5 text-right">Cost</th>\n                  <th className="p-2.5 text-right">Retail</th>\n                  <th className="p-2.5 text-right">Stock</th>\n                  <th className="p-2.5 text-center">Status</th>\n                  <th className="p-2.5 text-center">Actions</th>`,
  `<th className="p-2.5">{t('th_product_sku', 'Product & SKU')}</th>\n                  <th className="p-2.5">{t('th_category', 'Category')}</th>\n                  <th className="p-2.5">{t('th_supplier', 'Supplier')}</th>\n                  <th className="p-2.5 text-right">{t('th_cost_price', 'Cost')}</th>\n                  <th className="p-2.5 text-right">{t('th_retail_price', 'Retail')}</th>\n                  <th className="p-2.5 text-right">{t('th_stock', 'Stock')}</th>\n                  <th className="p-2.5 text-center">{t('th_status', 'Status')}</th>\n                  <th className="p-2.5 text-center">{t('th_actions', 'Actions')}</th>`
);

// 4. Categories Table / Cards
content = content.replace(
  `Product Categories ({categories.length})`,
  `{t('categories', 'Product Categories')} ({categories.length})`
);

// 5. Suppliers Table / Cards
content = content.replace(
  `Approved Vendors &amp; Suppliers ({suppliers.length})`,
  `{t('suppliers', 'Approved Vendors & Suppliers')} ({suppliers.length})`
);

// 6. Product Form Modal Tabs
content = content.replace(
  `{tab === 'basic' ? 'Basic Info' : tab === 'variants' ? 'Variants' : tab === 'custom-fields' ? 'Custom Fields' : 'Lots & Expiry'}`,
  `{tab === 'basic' ? t('tab_basic_details', 'Basic Info') : tab === 'variants' ? t('tab_variants_skus', 'Variants') : tab === 'custom-fields' ? t('tab_custom_attributes', 'Custom Fields') : t('tab_lots_expiry', 'Lots & Expiry')}`
);

// 7. Product Modal Form Labels
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Product Name *</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_product_name', 'Product Name')} *</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">SKU (Stock Keeping Unit) *</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_sku', 'SKU (Stock Keeping Unit)')} *</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Barcode / UPC</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_barcode', 'Barcode / UPC')}</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Category *</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_category', 'Category')} *</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Supplier *</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_supplier', 'Supplier')} *</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Cost Price ($) *</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_cost_price', 'Cost Price')} *</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Retail Price ($) *</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_retail_price', 'Retail Price')} *</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Current Stock *</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_stock_qty', 'Current Stock')} *</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Reorder Point *</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('label_reorder_point', 'Reorder Point')} *</label>`
);
content = content.replace(
  `Individual Item Tax / GST Rate (%)`,
  `{t('label_tax_rate_override', 'Individual Item Tax / GST Rate (%)')}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully translated CatalogView.tsx!');
