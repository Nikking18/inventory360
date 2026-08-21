import fs from 'fs';

const filePath = 'components/views/ReportingView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Report tabs array labels
content = content.replace(
  `<span>{tab.label}</span>`,
  `<span>{t(tab.id, tab.label)}</span>`
);

// 2. Export button & dropdown
content = content.replace(
  `<span>Export Report</span>`,
  `<span>{t('export_report', 'Export Report')}</span>`
);

// 3. Filter bar: Date Range buttons
content = content.replace(
  `{r === 'today' ? 'Today' : r === 'week' ? '7 Days' : r === 'month' ? '30 Days' : r === 'year' ? '1 Year' : 'All Time'}`,
  `{r === 'today' ? t('today', 'Today') : r === 'week' ? t('last_7_days', '7 Days') : r === 'month' ? t('last_30_days', '30 Days') : r === 'year' ? t('last_365_days', '1 Year') : t('all_time', 'All Time')}`
);
content = content.replace(
  `<option value="all">All Store Locations</option>`,
  `<option value="all">{t('all_locations', 'All Store Locations')}</option>`
);
content = content.replace(
  `<option value="all">All Categories</option>`,
  `<option value="all">{t('all_categories', 'All Categories')}</option>`
);

// 4. Retail Dashboard
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Gross Revenue</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('total_net_revenue', 'Gross Revenue')}</span>`
);
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Gross Profit</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('th_gross_profit', 'Gross Profit')}</span>`
);
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Average Order Value</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('average_order_value', 'Average Order Value')}</span>`
);
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Stock Cost Valuation</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('cost_inventory_label', 'Stock Cost Valuation')}</span>`
);

// 5. Sales Report
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Gross Sales</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('th_revenue', 'Gross Sales')}</span>`
);
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Total Units Sold</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('th_units_sold', 'Total Units Sold')}</span>`
);
content = content.replace(
  `<th className="p-2.5">Product &amp; SKU</th>\n                  <th className="p-2.5">Category</th>\n                  <th className="p-2.5 text-right">Units Sold</th>\n                  <th className="p-2.5 text-right">Unit Price</th>\n                  <th className="p-2.5 text-right">Gross Revenue</th>\n                  <th className="p-2.5 text-right">Total COGS</th>\n                  <th className="p-2.5 text-right">Gross Profit</th>\n                  <th className="p-2.5 text-right">Margin %</th>`,
  `<th className="p-2.5">{t('th_product_sku', 'Product & SKU')}</th>\n                  <th className="p-2.5">{t('th_category', 'Category')}</th>\n                  <th className="p-2.5 text-right">{t('th_units_sold', 'Units Sold')}</th>\n                  <th className="p-2.5 text-right">{t('th_retail_price', 'Unit Price')}</th>\n                  <th className="p-2.5 text-right">{t('th_revenue', 'Gross Revenue')}</th>\n                  <th className="p-2.5 text-right">{t('th_cogs', 'Total COGS')}</th>\n                  <th className="p-2.5 text-right">{t('th_gross_profit', 'Gross Profit')}</th>\n                  <th className="p-2.5 text-right">{t('th_margin_pct', 'Margin %')}</th>`
);

// 6. Inventory Report
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Total Cost Value</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('th_total_cost_val', 'Total Cost Value')}</span>`
);
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Retail Valuation</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('th_total_retail_val', 'Retail Valuation')}</span>`
);
content = content.replace(
  `<th className="p-2.5">Product &amp; SKU</th>\n                  <th className="p-2.5">Category</th>\n                  <th className="p-2.5 text-right">In Stock</th>\n                  <th className="p-2.5 text-right">Unit Cost</th>\n                  <th className="p-2.5 text-right">Unit Retail</th>\n                  <th className="p-2.5 text-right">Total Cost Value</th>\n                  <th className="p-2.5 text-right">Total Retail Value</th>\n                  <th className="p-2.5 text-center">Status</th>`,
  `<th className="p-2.5">{t('th_product_sku', 'Product & SKU')}</th>\n                  <th className="p-2.5">{t('th_category', 'Category')}</th>\n                  <th className="p-2.5 text-right">{t('th_stock_on_hand', 'In Stock')}</th>\n                  <th className="p-2.5 text-right">{t('th_cost_price', 'Unit Cost')}</th>\n                  <th className="p-2.5 text-right">{t('th_retail_price', 'Unit Retail')}</th>\n                  <th className="p-2.5 text-right">{t('th_total_cost_val', 'Total Cost Value')}</th>\n                  <th className="p-2.5 text-right">{t('th_total_retail_val', 'Total Retail Value')}</th>\n                  <th className="p-2.5 text-center">{t('th_status', 'Status')}</th>`
);

// 7. Purchase Report
content = content.replace(
  `<th className="p-2.5">PO Number</th>\n                  <th className="p-2.5">Supplier</th>\n                  <th className="p-2.5">Location</th>\n                  <th className="p-2.5">Expected Date</th>\n                  <th className="p-2.5 text-right">Items / Quantity</th>\n                  <th className="p-2.5 text-right">Total Amount</th>\n                  <th className="p-2.5 text-center">Status</th>`,
  `<th className="p-2.5">{t('th_po_num', 'PO Number')}</th>\n                  <th className="p-2.5">{t('th_supplier', 'Supplier')}</th>\n                  <th className="p-2.5">{t('th_location', 'Location')}</th>\n                  <th className="p-2.5">{t('th_expected_date', 'Expected Date')}</th>\n                  <th className="p-2.5 text-right">{t('th_items', 'Items / Quantity')}</th>\n                  <th className="p-2.5 text-right">{t('th_total', 'Total Amount')}</th>\n                  <th className="p-2.5 text-center">{t('th_status', 'Status')}</th>`
);

// 8. Turnover & Velocity Report
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Turnover Velocity</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('stock_turnover_rate', 'Turnover Velocity')}</span>`
);
content = content.replace(
  `<th className="p-2.5">Product &amp; SKU</th>\n                  <th className="p-2.5 text-right">In Stock</th>\n                  <th className="p-2.5 text-right">Units Sold (30d)</th>\n                  <th className="p-2.5 text-right">Velocity (Units/Day)</th>\n                  <th className="p-2.5 text-right">Days Supply Left</th>\n                  <th className="p-2.5 text-center">Velocity Classification</th>`,
  `<th className="p-2.5">{t('th_product_sku', 'Product & SKU')}</th>\n                  <th className="p-2.5 text-right">{t('th_stock_on_hand', 'In Stock')}</th>\n                  <th className="p-2.5 text-right">{t('th_units_sold', 'Units Sold')}</th>\n                  <th className="p-2.5 text-right">{t('th_velocity_day', 'Velocity (Units/Day)')}</th>\n                  <th className="p-2.5 text-right">{t('days_remaining', 'Days Supply Left')}</th>\n                  <th className="p-2.5 text-center">{t('compliance_status', 'Velocity Classification')}</th>`
);

// 9. Profitability Report
content = content.replace(
  `<th className="p-2.5">Product &amp; SKU</th>\n                  <th className="p-2.5 text-right">Units Sold</th>\n                  <th className="p-2.5 text-right">Total Revenue</th>\n                  <th className="p-2.5 text-right">Total COGS</th>\n                  <th className="p-2.5 text-right">Gross Profit ($)</th>\n                  <th className="p-2.5 text-right">Margin (%)</th>\n                  <th className="p-2.5 text-right">Markup (%)</th>`,
  `<th className="p-2.5">{t('th_product_sku', 'Product & SKU')}</th>\n                  <th className="p-2.5 text-right">{t('th_units_sold', 'Units Sold')}</th>\n                  <th className="p-2.5 text-right">{t('th_revenue', 'Total Revenue')}</th>\n                  <th className="p-2.5 text-right">{t('th_cogs', 'Total COGS')}</th>\n                  <th className="p-2.5 text-right">{t('th_gross_profit', 'Gross Profit')}</th>\n                  <th className="p-2.5 text-right">{t('th_margin_pct', 'Margin (%)')}</th>\n                  <th className="p-2.5 text-right">Markup (%)</th>`
);

// 10. Tax Report
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Total Tax Collected</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('th_tax_collected', 'Total Tax Collected')}</span>`
);
content = content.replace(
  `<span className="text-[10px] text-slate-500 uppercase font-bold">Taxable Sales</span>`,
  `<span className="text-[10px] text-slate-500 uppercase font-bold">{t('th_taxable_amount', 'Taxable Sales')}</span>`
);
content = content.replace(
  `<th className="p-2.5">Invoice #</th>\n                  <th className="p-2.5">Date &amp; Time</th>\n                  <th className="p-2.5">Customer</th>\n                  <th className="p-2.5">Location</th>\n                  <th className="p-2.5 text-right">Taxable Subtotal</th>\n                  <th className="p-2.5 text-right">Tax Collected</th>\n                  <th className="p-2.5 text-right">Total Invoice</th>`,
  `<th className="p-2.5">{t('th_tx_id', 'Invoice #')}</th>\n                  <th className="p-2.5">{t('th_timestamp', 'Date & Time')}</th>\n                  <th className="p-2.5">{t('customer', 'Customer')}</th>\n                  <th className="p-2.5">{t('th_location', 'Location')}</th>\n                  <th className="p-2.5 text-right">{t('th_taxable_amount', 'Taxable Subtotal')}</th>\n                  <th className="p-2.5 text-right">{t('th_tax_collected', 'Tax Collected')}</th>\n                  <th className="p-2.5 text-right">{t('th_total', 'Total Invoice')}</th>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully translated ReportingView.tsx!');
