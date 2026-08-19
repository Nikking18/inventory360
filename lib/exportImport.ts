import {
  getAllFromStore,
  putManyToStore,
  clearAllStores,
} from './db';

function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeCSVValue(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  // CSV Formula Injection Prevention: If cell starts with =, +, -, @, \t, \r, prefix with a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export async function exportWorkspaceJSON(): Promise<string> {
  const products = await getAllFromStore('products');
  const categories = await getAllFromStore('categories');
  const suppliers = await getAllFromStore('suppliers');
  const customers = await getAllFromStore('customers');
  const locations = await getAllFromStore('locations');
  const sales = await getAllFromStore('sales');
  const purchaseOrders = await getAllFromStore('purchaseOrders');
  const stockMovements = await getAllFromStore('stockMovements');
  const expenses = await getAllFromStore('expenses');
  const settings = await getAllFromStore('settings');

  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      products,
      categories,
      suppliers,
      customers,
      locations,
      sales,
      purchaseOrders,
      stockMovements,
      expenses,
      settings,
    },
  };

  return JSON.stringify(payload, null, 2);
}

export async function importWorkspaceJSON(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
      console.error('Invalid backup JSON: Missing root data object.');
      return false;
    }

    const { data } = parsed;

    // Validate that data object contains expected store structures
    const validStoreKeys = ['products', 'categories', 'suppliers', 'customers', 'locations', 'sales', 'purchaseOrders', 'stockMovements', 'expenses', 'settings'];
    const hasValidKey = validStoreKeys.some((key) => key in data && Array.isArray(data[key]));
    if (!hasValidKey) {
      console.error('Invalid backup JSON: No recognized entity arrays found in data payload.');
      return false;
    }

    await clearAllStores();

    if (Array.isArray(data.products) && data.products.length) await putManyToStore('products', data.products);
    if (Array.isArray(data.categories) && data.categories.length) await putManyToStore('categories', data.categories);
    if (Array.isArray(data.suppliers) && data.suppliers.length) await putManyToStore('suppliers', data.suppliers);
    if (Array.isArray(data.customers) && data.customers.length) await putManyToStore('customers', data.customers);
    if (Array.isArray(data.locations) && data.locations.length) await putManyToStore('locations', data.locations);
    if (Array.isArray(data.sales) && data.sales.length) await putManyToStore('sales', data.sales);
    if (Array.isArray(data.purchaseOrders) && data.purchaseOrders.length) await putManyToStore('purchaseOrders', data.purchaseOrders);
    if (Array.isArray(data.stockMovements) && data.stockMovements.length) await putManyToStore('stockMovements', data.stockMovements);
    if (Array.isArray(data.expenses) && data.expenses.length) await putManyToStore('expenses', data.expenses);
    if (Array.isArray(data.settings) && data.settings.length) {
      const formattedSettings = data.settings.map((s: any) => ({ id: 'settings', ...s }));
      await putManyToStore('settings', formattedSettings);
    }

    return true;
  } catch (err) {
    console.error('Failed to import workspace JSON:', err);
    return false;
  }
}

export function exportToCSV<T extends Record<string, any>>(filename: string, rows: T[]): void {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const header = keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(',');
  const csvLines = rows.map((row) =>
    keys.map((k) => sanitizeCSVValue(row[k])).join(',')
  );

  // Add UTF-8 BOM (\uFEFF) so Excel opens CSV files with special currency symbols properly
  const csvContent = '\uFEFF' + [header, ...csvLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToExcel<T extends Record<string, any>>(filename: string, rows: T[]): void {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);

  let tableHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  tableHTML += `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Inventory Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
  tableHTML += `<table border="1" style="font-family: Arial, sans-serif; font-size: 11px; border-collapse: collapse;"><thead><tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;">`;

  keys.forEach((k) => {
    tableHTML += `<th style="padding: 10px 12px; border: 1px solid #334155; text-align: left;">${escapeHtml(k)}</th>`;
  });
  tableHTML += `</tr></thead><tbody>`;

  rows.forEach((row, idx) => {
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    tableHTML += `<tr style="background-color: ${bg};">`;
    keys.forEach((k) => {
      let val = row[k];
      if (typeof val === 'object') val = JSON.stringify(val);
      tableHTML += `<td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${escapeHtml(val)}</td>`;
    });
    tableHTML += `</tr>`;
  });

  tableHTML += `</tbody></table></body></html>`;

  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF<T extends Record<string, any>>(filename: string, title: string, rows: T[]): void {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const escapedTitle = escapeHtml(title);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${escapedTitle}</title>
        <style>
          @page { size: landscape; margin: 12mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; background: #ffffff; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
          .brand { font-size: 11px; font-weight: bold; color: #059669; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin: 4px 0 0 0; color: #0f172a; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
          .timestamp { font-size: 10px; color: #475569; text-align: right; line-height: 1.4; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; font-weight: bold; text-align: left; padding: 8px 10px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
          td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Inventory 360 Enterprise Management</div>
            <h1 class="title">${escapedTitle}</h1>
            <div class="subtitle">Official Real-Time Operational Inventory Audit Record</div>
          </div>
          <div class="timestamp">
            <strong>Generated:</strong> ${escapeHtml(new Date().toLocaleString())}<br/>
            <strong>Total Records:</strong> ${rows.length}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              ${keys.map((k) => `<th>${escapeHtml(k)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                ${keys
                  .map((k) => {
                    let val = row[k];
                    if (typeof val === 'object') val = JSON.stringify(val);
                    return `<td>${escapeHtml(val)}</td>`;
                  })
                  .join('')}
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="footer">
          <span>Confidential Internal Document</span>
          <span>Page 1 of 1</span>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printPOSlipDocument(
  po: {
    poNumber: string;
    supplierName: string;
    locationName?: string;
    status: string;
    createdAt: string;
    expectedDate?: string;
    subtotal: number;
    tax?: number;
    total: number;
    notes?: string;
    items: Array<{
      productName: string;
      sku: string;
      unitCost: number;
      orderedQuantity: number;
      total: number;
    }>;
  },
  currencySymbol: string,
  businessName: string = 'Inventory 360 Enterprise'
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Purchase Order Slip - ${escapeHtml(po.poNumber)}</title>
        <style>
          @page { size: portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif; padding: 24px; color: #0f172a; background: #ffffff; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; border-bottom: 3px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; }
          .company-name { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
          .doc-type { font-size: 13px; font-weight: bold; color: #059669; text-transform: uppercase; margin-top: 2px; }
          .po-meta { text-align: right; }
          .po-number { font-size: 18px; font-weight: 900; color: #0f172a; font-family: monospace; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; }
          .card-title { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; }
          .card-text { font-size: 12px; font-weight: bold; color: #0f172a; }
          .card-sub { font-size: 11px; color: #475569; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; font-weight: bold; text-align: left; padding: 9px 12px; text-transform: uppercase; font-size: 10px; }
          td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .text-right { text-align: right; }
          .totals-section { display: flex; justify-content: flex-end; margin-top: 16px; }
          .totals-box { width: 260px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; }
          .totals-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #475569; }
          .totals-grand { display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 6px; color: #0f172a; }
          .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
          .sig-box { border-top: 1px solid #0f172a; padding-top: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #475569; }
          .status-badge { display: inline-block; padding: 3px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-name">${escapeHtml(businessName)}</div>
            <div class="doc-type">Official Purchase Order & Goods Requisition Slip</div>
          </div>
          <div class="po-meta">
            <div class="po-number">${escapeHtml(po.poNumber)}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Issued: ${escapeHtml(new Date(po.createdAt).toLocaleDateString())}</div>
            <div class="status-badge">${escapeHtml(po.status)}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Vendor / Supplier Information</div>
            <div class="card-text">${escapeHtml(po.supplierName)}</div>
            <div class="card-sub">Approved Procurement Partner</div>
          </div>
          <div class="card">
            <div class="card-title">Receiving Destination Node</div>
            <div class="card-text">${escapeHtml(po.locationName || 'Downtown Flagship')}</div>
            <div class="card-sub">Expected Delivery Date: <strong>${escapeHtml(po.expectedDate || 'ASAP')}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Product Description & SKU</th>
              <th class="text-right">Unit Cost</th>
              <th class="text-right">Ordered Qty</th>
              <th class="text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${po.items
              .map(
                (item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <strong>${escapeHtml(item.productName)}</strong><br/>
                  <span style="font-family: monospace; font-size: 10px; color: #64748b;">SKU: ${escapeHtml(item.sku)}</span>
                </td>
                <td class="text-right" style="font-family: monospace;">${escapeHtml(currencySymbol)}${item.unitCost.toFixed(2)}</td>
                <td class="text-right" style="font-weight: bold; font-family: monospace;">${item.orderedQuantity}</td>
                <td class="text-right" style="font-weight: bold; font-family: monospace;">${escapeHtml(currencySymbol)}${item.total.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        ${po.notes ? `<div style="margin-top: 14px; font-size: 11px; color: #475569; background: #f8fafc; padding: 8px 12px; border: 1px solid #e2e8f0;"><strong>Notes / Delivery Instructions:</strong> ${escapeHtml(po.notes)}</div>` : ''}

        <div class="totals-section">
          <div class="totals-box">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${escapeHtml(currencySymbol)}${po.subtotal.toFixed(2)}</span>
            </div>
            <div class="totals-row">
              <span>Estimated Tax (8.5%):</span>
              <span>${escapeHtml(currencySymbol)}${(po.tax || 0).toFixed(2)}</span>
            </div>
            <div class="totals-grand">
              <span>Total Payable:</span>
              <span>${escapeHtml(currencySymbol)}${po.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="signature-section">
          <div class="sig-box">Authorized Purchasing Officer Signature & Date</div>
          <div class="sig-box">Receiving Warehouse Inspection & Stamp</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Helper to parse a single CSV row following RFC 4180
  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    return fields;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]).map((cell) => cell.replace(/^"|"$/g, '').trim());
    if (values.length === headers.length) {
      const obj: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j];
      }
      results.push(obj);
    }
  }

  return results;
}
