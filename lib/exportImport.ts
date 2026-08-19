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

  // Clean Print-Friendly Header
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title.toUpperCase(), 36, 36);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Official Inventory Record | Generated: ${new Date().toLocaleString()} | Total Records: ${rows.length}`, 36, 48);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(36, 54, 806, 54);

  const tableData = rows.map((r) =>
    keys.map((k) => {
      let val = r[k];
      if (typeof val === 'object') val = JSON.stringify(val);
      return String(val ?? '');
    })
  );

  autoTable(doc, {
    startY: 64,
    head: [keys.map((k) => k.toUpperCase())],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      lineWidth: 0.5,
      lineColor: [180, 180, 180],
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [20, 20, 20],
      lineWidth: 0.5,
      lineColor: [225, 225, 225],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 36, right: 36 },
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
  const pageWidth = 595.28;
  const leftMargin = 36;
  const rightMargin = 559;
  const printableWidth = rightMargin - leftMargin;

  // Safe ASCII representation for currency in jsPDF default fonts
  const curr = currencySymbol && currencySymbol.trim() ? currencySymbol : '$';

  // 1. Clean Print-Friendly Top Header (No dark background fills)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(businessName.toUpperCase(), leftMargin, 42);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('OFFICIAL PURCHASE ORDER & REQUISITION SLIP', leftMargin, 55);

  // Document Badge (Right aligned)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PURCHASE ORDER', rightMargin, 42, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`P.O. #: ${po.poNumber}`, rightMargin, 55, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Date Issued: ${new Date(po.createdAt).toLocaleDateString()} | Status: ${po.status.toUpperCase()}`, rightMargin, 67, { align: 'right' });

  // Top Rule
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.25);
  doc.line(leftMargin, 74, rightMargin, 74);

  // 2. Info Cards Section (Vendor & Ship-To side-by-side)
  const cardY = 84;
  const cardWidth = (printableWidth - 14) / 2;
  const cardHeight = 64;

  // Card 1: Vendor / Supplier
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(leftMargin, cardY, cardWidth, cardHeight, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 90, 90);
  doc.text('VENDOR / SUPPLIER DETAILS', leftMargin + 10, cardY + 14);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(po.supplierName, leftMargin + 10, cardY + 30, { maxWidth: cardWidth - 20 });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text('Approved Commercial Vendor Partner', leftMargin + 10, cardY + 44);
  doc.text('Payment Terms: Net 30 Days', leftMargin + 10, cardY + 54);

  // Card 2: Ship-To Destination
  const rightCardX = leftMargin + cardWidth + 14;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(rightCardX, cardY, cardWidth, cardHeight, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(90, 90, 90);
  doc.text('SHIP TO / RECEIVING DESTINATION', rightCardX + 10, cardY + 14);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(po.locationName || 'Downtown Flagship / Main Hub', rightCardX + 10, cardY + 30, { maxWidth: cardWidth - 20 });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text(`Expected Date: ${po.expectedDate ? new Date(po.expectedDate).toLocaleDateString() : 'ASAP / Immediate'}`, rightCardX + 10, cardY + 44);
  doc.text('Attn: Warehouse Inbound & Receiving Dock', rightCardX + 10, cardY + 54);

  // 3. Line Items Table (High-contrast, light header, print-ready)
  const tableData = po.items.map((item, idx) => [
    idx + 1,
    `${item.productName}\nSKU: ${item.sku}`,
    `${curr}${item.unitCost.toFixed(2)}`,
    item.orderedQuantity,
    `${curr}${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 158,
    head: [['#', 'ITEM DESCRIPTION & SKU', 'UNIT PRICE', 'ORDER QTY', 'LINE TOTAL']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [243, 244, 246], // Light gray header, crystal clear on paper
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 8,
      lineWidth: 0.5,
      lineColor: [180, 180, 180],
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' },
      1: { cellWidth: 255 },
      2: { cellWidth: 75, halign: 'right' },
      3: { cellWidth: 68, halign: 'right' },
      4: { cellWidth: 100, halign: 'right' },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [20, 20, 20],
      lineWidth: 0.5,
      lineColor: [225, 225, 225],
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    margin: { left: leftMargin, right: pageWidth - rightMargin },
  });

  // 4. Financial Summary & Notes
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  const notesWidth = 300;
  const totalsWidth = printableWidth - notesWidth - 14;
  const totalsX = leftMargin + notesWidth + 14;

  // Notes Box (Left)
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(leftMargin, finalY, notesWidth, 68, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text('TERMS & DELIVERY INSTRUCTIONS:', leftMargin + 10, finalY + 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const notesContent = po.notes || 'Please include Packing Slip with this PO # on all packages. Items must be inspected upon dock delivery before invoice sign-off.';
  doc.text(notesContent, leftMargin + 10, finalY + 28, { maxWidth: notesWidth - 20 });

  // Totals Box (Right)
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(totalsX, finalY, totalsWidth, 68, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text('Subtotal:', totalsX + 10, finalY + 16);
  doc.text(`${curr}${po.subtotal.toFixed(2)}`, rightMargin - 10, finalY + 16, { align: 'right' });

  doc.text('Estimated Tax (8.5%):', totalsX + 10, finalY + 30);
  doc.text(`${curr}${(po.tax || 0).toFixed(2)}`, rightMargin - 10, finalY + 30, { align: 'right' });

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.75);
  doc.line(totalsX + 10, finalY + 38, rightMargin - 10, finalY + 38);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TOTAL AMOUNT:', totalsX + 10, finalY + 54);
  doc.text(`${curr}${po.total.toFixed(2)}`, rightMargin - 10, finalY + 54, { align: 'right' });

  // 5. Signatures & Approvals (Positioned near bottom)
  const sigY = Math.max(finalY + 105, 735);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.75);
  doc.line(leftMargin, sigY, leftMargin + 210, sigY);
  doc.line(rightMargin - 210, sigY, rightMargin, sigY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('AUTHORIZED PURCHASING OFFICER', leftMargin, sigY + 12);
  doc.text('RECEIVING & INSPECTION ACCEPTANCE', rightMargin - 210, sigY + 12);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Authorized Signature & Date', leftMargin, sigY + 22);
  doc.text('Receiver Signature, Date & Stamp', rightMargin - 210, sigY + 22);

  // 6. Running Footer
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, 795, rightMargin, 795);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Inventory360 Enterprise ERP - Official Procurement Document', leftMargin, 807);
  doc.text(`Page 1 of 1 | Printed: ${new Date().toLocaleString()}`, rightMargin, 807, { align: 'right' });

  // Directly save / download PDF
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
