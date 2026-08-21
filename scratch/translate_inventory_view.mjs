import fs from 'fs';

const filePath = 'components/views/InventoryView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Subtabs labels
content = content.replace(
  `{tabId === 'stock-levels'\n                    ? 'Stock Levels'\n                    : tabId === 'low-stock'\n                    ? \`Low Stock (\${lowStockItems.length})\`\n                    : tabId === 'lots-expiry'\n                    ? 'Lots & Expiry'\n                    : tabId === 'multi-location'\n                    ? 'Multi-Outlet'\n                    : tabId === 'movements'\n                    ? 'Movements'\n                    : 'Purchase Orders'}`,
  `{tabId === 'stock-levels'\n                    ? t('stock_levels', 'Stock Levels')\n                    : tabId === 'low-stock'\n                    ? \`\${t('low_stock', 'Low Stock')} (\${lowStockItems.length})\`\n                    : tabId === 'lots-expiry'\n                    ? t('lots_expiry', 'Lots & Expiry')\n                    : tabId === 'multi-location'\n                    ? t('multi_location', 'Multi-Outlet')\n                    : tabId === 'movements'\n                    ? t('movements', 'Movements')\n                    : t('purchases', 'Purchase Orders')}`
);

// 2. Transfer top button
content = content.replace(
  `<span>Transfer</span>`,
  `<span>{t('transfer', 'Transfer')}</span>`
);

// 3. Stock Levels KPI Cards
content = content.replace(
  `<p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active SKUs / Products</p>`,
  `<p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('active_skus_products', 'Active SKUs / Products')}</p>`
);
content = content.replace(
  `<p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Units on Hand</p>`,
  `<p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('total_units_on_hand', 'Total Units on Hand')}</p>`
);
content = content.replace(
  `<p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cost Inventory Value</p>`,
  `<p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('cost_inventory_value', 'Cost Inventory Value')}</p>`
);
content = content.replace(
  `<p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Retail Valuation</p>`,
  `<p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t('retail_valuation', 'Retail Valuation')}</p>`
);

// 4. Stock Levels Table Headers
content = content.replace(
  `<th className="p-2.5">Product &amp; SKU</th>\n                  <th className="p-2.5">Category</th>\n                  <th className="p-2.5">Supplier</th>\n                  <th className="p-2.5 text-right">In Stock</th>\n                  <th className="p-2.5 text-right">Min Par</th>\n                  <th className="p-2.5 text-right">Unit Cost</th>\n                  <th className="p-2.5 text-right">Cost Value</th>\n                  <th className="p-2.5 text-center">Status</th>\n                  <th className="p-2.5 text-center">Action</th>`,
  `<th className="p-2.5">{t('th_product_sku', 'Product & SKU')}</th>\n                  <th className="p-2.5">{t('th_category', 'Category')}</th>\n                  <th className="p-2.5">{t('th_supplier', 'Supplier')}</th>\n                  <th className="p-2.5 text-right">{t('th_stock_on_hand', 'In Stock')}</th>\n                  <th className="p-2.5 text-right">{t('th_min_par', 'Min Par')}</th>\n                  <th className="p-2.5 text-right">{t('th_cost_price', 'Unit Cost')}</th>\n                  <th className="p-2.5 text-right">{t('th_total_cost_val', 'Cost Value')}</th>\n                  <th className="p-2.5 text-center">{t('th_status', 'Status')}</th>\n                  <th className="p-2.5 text-center">{t('th_action', 'Action')}</th>`
);

// 5. Lots & Expiry Table Headers
content = content.replace(
  `<th className="p-2.5">Product &amp; SKU</th>\n                    <th className="p-2.5">Lot #</th>\n                    <th className="p-2.5">Batch #</th>\n                    <th className="p-2.5">Serial #</th>\n                    <th className="p-2.5">Expiration Date</th>\n                    <th className="p-2.5 text-right">Units on Hand</th>\n                    <th className="p-2.5 text-right">Batch Value</th>\n                    <th className="p-2.5 text-center">FIFO Status</th>\n                    <th className="p-2.5 text-center">Quarantine / Release</th>`,
  `<th className="p-2.5">{t('th_product_sku', 'Product & SKU')}</th>\n                    <th className="p-2.5">{t('th_lot_num', 'Lot #')}</th>\n                    <th className="p-2.5">{t('th_batch_num', 'Batch #')}</th>\n                    <th className="p-2.5">{t('th_serial_num', 'Serial #')}</th>\n                    <th className="p-2.5">{t('th_expiration_date', 'Expiration Date')}</th>\n                    <th className="p-2.5 text-right">{t('th_units_on_hand', 'Units on Hand')}</th>\n                    <th className="p-2.5 text-right">{t('th_batch_value', 'Batch Value')}</th>\n                    <th className="p-2.5 text-center">{t('th_fifo_status', 'FIFO Status')}</th>\n                    <th className="p-2.5 text-center">{t('th_quarantine_release', 'Quarantine / Release')}</th>`
);

// 6. Movements Table Headers
content = content.replace(
  `<th className="p-2.5">Date &amp; Time</th>\n                  <th className="p-2.5">Product &amp; SKU</th>\n                  <th className="p-2.5">Type</th>\n                  <th className="p-2.5">Outlet</th>\n                  <th className="p-2.5 text-right">Qty Change</th>\n                  <th className="p-2.5 text-right">Resulting Stock</th>\n                  <th className="p-2.5">Audit Note / Ref #</th>`,
  `<th className="p-2.5">{t('th_timestamp', 'Date & Time')}</th>\n                  <th className="p-2.5">{t('th_product_sku', 'Product & SKU')}</th>\n                  <th className="p-2.5">{t('th_type', 'Type')}</th>\n                  <th className="p-2.5">{t('th_outlet', 'Outlet')}</th>\n                  <th className="p-2.5 text-right">{t('th_qty_change', 'Qty Change')}</th>\n                  <th className="p-2.5 text-right">{t('th_resulting_stock', 'Resulting Stock')}</th>\n                  <th className="p-2.5">{t('th_audit_ref', 'Audit Note / Ref #')}</th>`
);

// 7. Modals: Stock Adjustment, Transfer, PO
content = content.replace(
  `title="STOCK LEVEL AUDIT ADJUSTMENT"`,
  `title={t('modal_adjust_stock', 'STOCK LEVEL AUDIT ADJUSTMENT')}`
);
content = content.replace(
  `title="INTER-OUTLET STOCK TRANSFER ORDER"`,
  `title={t('modal_transfer_order', 'INTER-OUTLET STOCK TRANSFER ORDER')}`
);
content = content.replace(
  `title="CREATE PROCUREMENT PURCHASE ORDER"`,
  `title={t('modal_create_po', 'CREATE PROCUREMENT PURCHASE ORDER')}`
);
content = content.replace(
  `title={\`RECEIVE INBOUND GOODS: \${selectedPOForReceive?.poNumber}\`}`,
  `title={\`\${t('modal_receive_goods', 'RECEIVE INBOUND GOODS')}: \${selectedPOForReceive?.poNumber}\`}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully translated InventoryView.tsx!');
