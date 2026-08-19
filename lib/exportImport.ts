import {
  getAllFromStore,
  putManyToStore,
  clearAllStores,
} from './db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  // Header Title
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), 40, 40);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Official Inventory Record | Generated: ${new Date().toLocaleString()} | Total Records: ${rows.length}`, 40, 55);

  const tableData = rows.map((r) =>
    keys.map((k) => {
      let val = r[k];
      if (typeof val === 'object') val = JSON.stringify(val);
      return String(val ?? '');
    })
  );

  autoTable(doc, {
    startY: 70,
    head: [keys.map((k) => k.toUpperCase())],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40 },
  });

  doc.save(`${filename}.pdf`);
}

export function downloadPOSlipPDF(
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
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

  // Top Dark Accent Header Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 595.28, 70, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(businessName.toUpperCase(), 40, 35);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text('OFFICIAL PURCHASE ORDER & REQUISITION SLIP', 40, 52);

  // PO Meta Right Aligned
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(po.poNumber, 555, 35, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Issued: ${new Date(po.createdAt).toLocaleDateString()}`, 555, 52, { align: 'right' });

  // Info Cards Section
  const cardY = 90;
  // Card 1: Vendor
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(40, cardY, 245, 60, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VENDOR / SUPPLIER INFORMATION', 50, cardY + 16);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(po.supplierName, 50, cardY + 34);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Approved Procurement Partner', 50, cardY + 48);

  // Card 2: Destination
  doc.setFillColor(248, 250, 252);
  doc.rect(310, cardY, 245, 60, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIVING DESTINATION NODE', 320, cardY + 16);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(po.locationName || 'Downtown Flagship', 320, cardY + 34);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Expected Date: ${po.expectedDate || 'ASAP'} | Status: ${po.status}`, 320, cardY + 48);

  // Items Table
  const tableData = po.items.map((item, idx) => [
    idx + 1,
    `${item.productName}\nSKU: ${item.sku}`,
    `${currencySymbol}${item.unitCost.toFixed(2)}`,
    item.orderedQuantity,
    `${currencySymbol}${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 165,
    head: [['#', 'PRODUCT DESCRIPTION & SKU', 'UNIT COST', 'ORDERED QTY', 'LINE TOTAL']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 260 },
      2: { cellWidth: 70, halign: 'right' },
      3: { cellWidth: 70, halign: 'right' },
      4: { cellWidth: 90, halign: 'right' },
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40 },
  });

  // Totals Summary Box
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  if (po.notes) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(40, finalY, 300, 50, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Notes / Delivery Instructions:', 48, finalY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(po.notes, 48, finalY + 30, { maxWidth: 285 });
  }

  // Financial summary box
  const totalsX = 360;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(totalsX, finalY, 195, 65, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', totalsX + 12, finalY + 18);
  doc.text(`${currencySymbol}${po.subtotal.toFixed(2)}`, totalsX + 183, finalY + 18, { align: 'right' });

  doc.text('Est. Tax (8.5%):', totalsX + 12, finalY + 34);
  doc.text(`${currencySymbol}${(po.tax || 0).toFixed(2)}`, totalsX + 183, finalY + 34, { align: 'right' });

  doc.setDrawColor(15, 23, 42);
  doc.line(totalsX + 12, finalY + 42, totalsX + 183, finalY + 42);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Payable:', totalsX + 12, finalY + 56);
  doc.text(`${currencySymbol}${po.total.toFixed(2)}`, totalsX + 183, finalY + 56, { align: 'right' });

  // Signatures
  const sigY = Math.max(finalY + 95, 720);
  doc.setDrawColor(15, 23, 42);
  doc.line(40, sigY, 240, sigY);
  doc.line(355, sigY, 555, sigY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('AUTHORIZED PURCHASING OFFICER SIGNATURE', 40, sigY + 14);
  doc.text('RECEIVING WAREHOUSE INSPECTION & STAMP', 355, sigY + 14);

  // Directly prompt download
  doc.save(`PO_Slip_${po.poNumber}.pdf`);
}

// Keep printPOSlipDocument as an alias if needed
export const printPOSlipDocument = downloadPOSlipPDF;

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Helper to parse a single CSV row following RFC 4180
  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());
    return fields;
  };

  const headers = parseRow(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    if (row.length === headers.length) {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx];
      });
      rows.push(obj);
    }
  }

  return rows;
}
