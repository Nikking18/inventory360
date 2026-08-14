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

  const csvContent = [header, ...csvLines].join('\n');
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
  tableHTML += `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
  tableHTML += `<table border="1"><thead><tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;">`;

  keys.forEach((k) => {
    tableHTML += `<th style="padding: 8px;">${escapeHtml(k)}</th>`;
  });
  tableHTML += `</tr></thead><tbody>`;

  rows.forEach((row) => {
    tableHTML += `<tr>`;
    keys.forEach((k) => {
      let val = row[k];
      if (typeof val === 'object') val = JSON.stringify(val);
      tableHTML += `<td style="padding: 6px;">${escapeHtml(val)}</td>`;
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
          body { font-family: monospace, sans-serif; padding: 24px; color: #0f172a; background: #ffffff; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .timestamp { font-size: 10px; color: #94a3b8; text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 11px; }
          th { background: #0f172a; color: #ffffff; font-weight: bold; text-align: left; padding: 8px 10px; text-transform: uppercase; }
          td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; size: landscape; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${escapedTitle}</h1>
            <div class="subtitle">Official Inventory System Document Record</div>
          </div>
          <div class="timestamp">Generated: ${escapeHtml(new Date().toLocaleString())}<br/>Total Records: ${rows.length}</div>
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
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
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
