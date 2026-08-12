import {
  getAllFromStore,
  putManyToStore,
  clearAllStores,
  putToStore,
} from './db';
import { Product, Supplier, Customer, Sale, PurchaseOrder, BusinessSettings } from './types';

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
  const header = keys.join(',');
  const csvLines = rows.map((row) =>
    keys
      .map((k) => {
        let val = row[k];
        if (typeof val === 'object') val = JSON.stringify(val);
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
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
}

export function exportToExcel<T extends Record<string, any>>(filename: string, rows: T[]): void {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);

  let tableHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  tableHTML += `<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>`;
  tableHTML += `<table border="1"><thead><tr style="background-color: #0f172a; color: #ffffff; font-weight: bold;">`;

  keys.forEach((k) => {
    tableHTML += `<th style="padding: 8px;">${k}</th>`;
  });
  tableHTML += `</tr></thead><tbody>`;

  rows.forEach((row) => {
    tableHTML += `<tr>`;
    keys.forEach((k) => {
      let val = row[k];
      if (typeof val === 'object') val = JSON.stringify(val);
      tableHTML += `<td style="padding: 6px;">${val ?? ''}</td>`;
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
}

export function exportToPDF<T extends Record<string, any>>(filename: string, title: string, rows: T[]): void {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
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
            <h1 class="title">${title}</h1>
            <div class="subtitle">Official Inventory System Document Record</div>
          </div>
          <div class="timestamp">Generated: ${new Date().toLocaleString()}<br/>Total Records: ${rows.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              ${keys.map((k) => `<th>${k}</th>`).join('')}
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
                    return `<td>${val ?? ''}</td>`;
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

  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentline = lines[i].split(',').map((cell) => cell.replace(/^"|"$/g, '').trim());
    if (currentline.length === headers.length) {
      const obj: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      results.push(obj);
    }
  }

  return results;
}
