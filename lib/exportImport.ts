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

export async function downloadWorkspaceJSON(filename = 'inventory360_emergency_backup.json'): Promise<void> {
  const json = await exportWorkspaceJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function importWorkspaceJSON(jsonString: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
      console.error('Invalid backup JSON: Missing root data object.');
      return false;
    }

    const { data } = parsed;

    // Validate that data object contains recognized store structures
    const validStoreKeys = ['products', 'categories', 'suppliers', 'customers', 'locations', 'sales', 'purchaseOrders', 'stockMovements', 'expenses', 'settings'];
    const hasValidKey = validStoreKeys.some((key) => key in data && Array.isArray(data[key]));
    if (!hasValidKey) {
      console.error('Invalid backup JSON: No recognized entity arrays found in data payload.');
      return false;
    }

    await clearAllStores();

    // 1. Sanitize Products
    if (Array.isArray(data.products) && data.products.length) {
      const sanitizedProducts = data.products
        .filter((p: any) => p && typeof p === 'object' && p.id && (p.name || p.title))
        .map((p: any) => ({
          id: String(p.id),
          name: String(p.name || p.title).trim(),
          sku: String(p.sku || `SKU-${Date.now()}`).trim(),
          barcode: p.barcode ? String(p.barcode).trim() : '',
          description: p.description ? String(p.description) : undefined,
          costPrice: Math.max(0, Number(p.costPrice) || 0),
          retailPrice: Math.max(0, Number(p.retailPrice) || 0),
          stockQuantity: Number.isFinite(Number(p.stockQuantity)) ? Number(p.stockQuantity) : 0,
          reorderPoint: Number(p.reorderPoint) >= 0 ? Number(p.reorderPoint) : 10,
          taxRate: p.taxRate !== undefined && !isNaN(Number(p.taxRate)) ? Number(p.taxRate) : undefined,
          categoryId: p.categoryId ? String(p.categoryId) : undefined,
          supplierId: p.supplierId ? String(p.supplierId) : undefined,
          imageUrl: p.imageUrl ? String(p.imageUrl) : undefined,
          variants: Array.isArray(p.variants) ? p.variants : [],
          customFields: p.customFields && typeof p.customFields === 'object' ? p.customFields : {},
          lots: Array.isArray(p.lots) ? p.lots : [],
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));
      if (sanitizedProducts.length) await putManyToStore('products', sanitizedProducts);
    }

    // 2. Sanitize Categories
    if (Array.isArray(data.categories) && data.categories.length) {
      const sanitizedCategories = data.categories
        .filter((c: any) => c && typeof c === 'object' && c.id && c.name)
        .map((c: any) => ({
          id: String(c.id),
          name: String(c.name).trim(),
          description: c.description ? String(c.description).trim() : undefined,
        }));
      if (sanitizedCategories.length) await putManyToStore('categories', sanitizedCategories);
    }

    // 3. Sanitize Suppliers
    if (Array.isArray(data.suppliers) && data.suppliers.length) {
      const sanitizedSuppliers = data.suppliers
        .filter((s: any) => s && typeof s === 'object' && s.id && s.name)
        .map((s: any) => ({
          id: String(s.id),
          name: String(s.name).trim(),
          contactPerson: s.contactPerson ? String(s.contactPerson).trim() : 'Primary Representative',
          email: s.email ? String(s.email).trim() : '',
          phone: s.phone ? String(s.phone).trim() : '',
          address: s.address ? String(s.address).trim() : '',
          leadTimeDays: Number(s.leadTimeDays) >= 0 ? Number(s.leadTimeDays) : 5,
        }));
      if (sanitizedSuppliers.length) await putManyToStore('suppliers', sanitizedSuppliers);
    }

    // 4. Sanitize Customers
    if (Array.isArray(data.customers) && data.customers.length) {
      const sanitizedCustomers = data.customers
        .filter((c: any) => c && typeof c === 'object' && c.id && c.name)
        .map((c: any) => ({
          id: String(c.id),
          name: String(c.name).trim(),
          email: c.email ? String(c.email).trim() : '',
          phone: c.phone ? String(c.phone).trim() : '',
          totalSpent: Math.max(0, Number(c.totalSpent) || 0),
          orderCount: Math.max(0, Number(c.orderCount) || 0),
          balance: Number(c.balance) || 0,
          creditLimit: Number(c.creditLimit) || 0,
          createdAt: c.createdAt || new Date().toISOString(),
        }));
      if (sanitizedCustomers.length) await putManyToStore('customers', sanitizedCustomers);
    }

    // 5. Sanitize Locations
    if (Array.isArray(data.locations) && data.locations.length) {
      const sanitizedLocations = data.locations
        .filter((l: any) => l && typeof l === 'object' && l.id && l.name)
        .map((l: any) => ({
          id: String(l.id),
          name: String(l.name).trim(),
          code: String(l.code || l.id).trim().toUpperCase(),
          type: (['Store', 'Warehouse', 'Fulfillment Center'].includes(l.type) ? l.type : 'Store') as any,
          isDefault: Boolean(l.isDefault),
        }));
      if (sanitizedLocations.length) await putManyToStore('locations', sanitizedLocations);
    }

    // 6. Sanitize Sales
    if (Array.isArray(data.sales) && data.sales.length) {
      const sanitizedSales = data.sales
        .filter((s: any) => s && typeof s === 'object' && s.id && Array.isArray(s.items))
        .map((s: any) => ({
          id: String(s.id),
          saleNumber: String(s.saleNumber || `SAL-${Date.now()}`),
          items: s.items,
          subtotal: Math.max(0, Number(s.subtotal) || 0),
          tax: Math.max(0, Number(s.tax) || 0),
          discount: Math.max(0, Number(s.discount) || 0),
          itemTax: Math.max(0, Number(s.itemTax) || 0),
          total: Math.max(0, Number(s.total) || 0),
          costOfGoodsSold: Math.max(0, Number(s.costOfGoodsSold) || 0),
          grossProfit: Number(s.grossProfit) || 0,
          paymentMethod: String(s.paymentMethod || 'Cash'),
          status: (['Completed', 'Refunded', 'Pending'].includes(s.status) ? s.status : 'Completed') as any,
          locationId: String(s.locationId || 'loc_1'),
          locationName: String(s.locationName || 'Main Store'),
          customerName: s.customerName ? String(s.customerName) : undefined,
          channel: String(s.channel || 'In-Store POS'),
          createdAt: s.createdAt || new Date().toISOString(),
        }));
      if (sanitizedSales.length) await putManyToStore('sales', sanitizedSales);
    }

    // 7. Sanitize Purchase Orders
    if (Array.isArray(data.purchaseOrders) && data.purchaseOrders.length) {
      const sanitizedPOs = data.purchaseOrders
        .filter((po: any) => po && typeof po === 'object' && po.id && Array.isArray(po.items))
        .map((po: any) => ({
          id: String(po.id),
          poNumber: String(po.poNumber || `PO-${Date.now()}`),
          supplierId: String(po.supplierId || ''),
          supplierName: String(po.supplierName || 'Primary Supplier'),
          locationId: String(po.locationId || 'loc_1'),
          items: po.items,
          totalCost: Math.max(0, Number(po.totalCost) || 0),
          status: (['Draft', 'Ordered', 'Received', 'Cancelled'].includes(po.status) ? po.status : 'Draft') as any,
          createdAt: po.createdAt || new Date().toISOString(),
        }));
      if (sanitizedPOs.length) await putManyToStore('purchaseOrders', sanitizedPOs);
    }

    // 8. Sanitize Stock Movements
    if (Array.isArray(data.stockMovements) && data.stockMovements.length) {
      const sanitizedMovements = data.stockMovements
        .filter((m: any) => m && typeof m === 'object' && m.id && m.productId)
        .map((m: any) => ({
          id: String(m.id),
          productId: String(m.productId),
          productName: String(m.productName || 'Product'),
          locationId: String(m.locationId || 'loc_1'),
          quantityDelta: Number(m.quantityDelta) || 0,
          movementType: String(m.movementType || 'Manual Adjustment') as any,
          timestamp: m.timestamp || new Date().toISOString(),
        }));
      if (sanitizedMovements.length) await putManyToStore('stockMovements', sanitizedMovements);
    }

    // 9. Sanitize Expenses
    if (Array.isArray(data.expenses) && data.expenses.length) {
      const sanitizedExpenses = data.expenses
        .filter((e: any) => e && typeof e === 'object' && e.id && e.amount)
        .map((e: any) => ({
          id: String(e.id),
          description: String(e.description || 'General Expense'),
          amount: Math.max(0, Number(e.amount) || 0),
          category: String(e.category || 'Operations'),
          date: e.date || new Date().toISOString(),
        }));
      if (sanitizedExpenses.length) await putManyToStore('expenses', sanitizedExpenses);
    }

    // 10. Sanitize Settings
    if (Array.isArray(data.settings) && data.settings.length) {
      const first = data.settings[0] || {};
      const formattedSettings = [
        {
          id: 'settings',
          businessName: String(first.businessName || 'Inventory 360'),
          currencySymbol: String(first.currencySymbol || '$'),
          taxRate: Math.max(0, Number(first.taxRate) || 0),
          language: String(first.language || 'en'),
          autoSave: first.autoSave && typeof first.autoSave === 'object' ? first.autoSave : undefined,
        },
      ];
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

export function exportToPDF<T extends Record<string, any>>(
  filename: string,
  title: string,
  rows: T[],
  businessName: string = 'Inventory 360 Enterprise',
  logoUrl?: string,
  taxNumber?: string
): void {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const leftMargin = 36;
  const rightMargin = 806;

  let headerTextX = leftMargin;
  if (logoUrl && (logoUrl.startsWith('data:image') || logoUrl.startsWith('http') || logoUrl.startsWith('blob:'))) {
    try {
      doc.addImage(logoUrl, 'PNG', leftMargin, 20, 32, 32);
      headerTextX = leftMargin + 40;
    } catch {}
  }

  // Clean Print-Friendly Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(businessName.toUpperCase(), headerTextX, 32);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(title.toUpperCase(), headerTextX, 46);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  const taxInfo = taxNumber ? ` | GSTIN/TAX ID: ${taxNumber}` : '';
  doc.text(`Official Inventory Record | Generated: ${new Date().toLocaleString()} | Total Records: ${rows.length}${taxInfo}`, headerTextX, 58);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(leftMargin, 66, rightMargin, 66);

  const tableData = rows.map((r) =>
    keys.map((k) => {
      let val = r[k];
      if (typeof val === 'object') val = JSON.stringify(val);
      return String(val ?? '');
    })
  );

  autoTable(doc, {
    startY: 74,
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
    margin: { left: leftMargin, right: 36 },
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
      taxRate?: number;
      total: number;
    }>;
  },
  currencySymbol: string,
  businessName: string = 'Inventory 360 Enterprise',
  logoUrl?: string,
  taxNumber?: string
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = 595.28;
  const leftMargin = 36;
  const rightMargin = 559;
  const printableWidth = rightMargin - leftMargin;

  // Safe ASCII representation for currency in jsPDF default fonts
  const curr = currencySymbol && currencySymbol.trim() ? currencySymbol : '$';

  let brandX = leftMargin;
  if (logoUrl && (logoUrl.startsWith('data:image') || logoUrl.startsWith('http') || logoUrl.startsWith('blob:'))) {
    try {
      doc.addImage(logoUrl, 'PNG', leftMargin, 26, 38, 38);
      brandX = leftMargin + 46;
    } catch {}
  }

  // 1. Clean Print-Friendly Top Header (No dark background fills)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(businessName.toUpperCase(), brandX, 38);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('OFFICIAL PURCHASE ORDER & REQUISITION SLIP', brandX, 50);

  if (taxNumber) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`GSTIN / TAX ID: ${taxNumber}`, brandX, 62);
  }

  // Document Badge (Right aligned)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PURCHASE ORDER', rightMargin, 38, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`P.O. #: ${po.poNumber}`, rightMargin, 51, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Issued: ${new Date(po.createdAt).toLocaleDateString()} | Status: ${po.status.toUpperCase()}`, rightMargin, 63, { align: 'right' });

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

  // 3. Line Items Table (Includes Item-Level Tax % column)
  const tableData = po.items.map((item, idx) => [
    idx + 1,
    `${item.productName}\nSKU: ${item.sku}`,
    `${curr}${item.unitCost.toFixed(2)}`,
    item.taxRate !== undefined ? `${item.taxRate}%` : 'Standard',
    item.orderedQuantity,
    `${curr}${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: 158,
    head: [['#', 'ITEM DESCRIPTION & SKU', 'UNIT PRICE', 'TAX RATE', 'ORDER QTY', 'LINE TOTAL']],
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
      1: { cellWidth: 215 },
      2: { cellWidth: 70, halign: 'right' },
      3: { cellWidth: 58, halign: 'center' },
      4: { cellWidth: 65, halign: 'right' },
      5: { cellWidth: 90, halign: 'right' },
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

  doc.text('Taxes / GST Total:', totalsX + 10, finalY + 30);
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

export function downloadPickListPDF(
  pickItems: Array<{ sku: string; name: string; quantity: number }>,
  pendingOrdersCount: number,
  businessName: string = 'Inventory 360 Enterprise',
  logoUrl?: string,
  taxNumber?: string
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = 595.28;
  const leftMargin = 36;
  const rightMargin = 559;
  const printableWidth = rightMargin - leftMargin;

  let brandX = leftMargin;
  if (logoUrl && (logoUrl.startsWith('data:image') || logoUrl.startsWith('http') || logoUrl.startsWith('blob:'))) {
    try {
      doc.addImage(logoUrl, 'PNG', leftMargin, 26, 38, 38);
      brandX = leftMargin + 46;
    } catch {}
  }

  // 1. Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(businessName.toUpperCase(), brandX, 38);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('WAREHOUSE FULFILLMENT & BATCH PICK LIST', brandX, 50);

  if (taxNumber) {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(`GSTIN / TAX ID: ${taxNumber}`, brandX, 62);
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('BATCH PICK LIST', rightMargin, 38, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, rightMargin, 51, { align: 'right' });
  doc.text(`Orders Queued: ${pendingOrdersCount} Pending Shipments`, rightMargin, 63, { align: 'right' });

  // Top Rule
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.25);
  doc.line(leftMargin, 74, rightMargin, 74);

  // 2. Summary Card
  const totalUnits = pickItems.reduce((a, b) => a + b.quantity, 0);
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.75);
  doc.rect(leftMargin, 84, printableWidth, 42, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('DISPATCH PICKING INSTRUCTIONS:', leftMargin + 10, 100);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(
    `Retrieve total ${totalUnits} units across ${pickItems.length} SKUs for staging & packaging. Verify barcode labels before transferring to packing station.`,
    leftMargin + 10,
    114,
    { maxWidth: printableWidth - 20 }
  );

  // 3. Line Items Table with Checkboxes
  const tableData = pickItems.map((item, idx) => [
    '[  ]',
    idx + 1,
    item.sku,
    item.name,
    item.quantity,
    '________',
  ]);

  autoTable(doc, {
    startY: 136,
    head: [['CHECK', '#', 'SKU / ITEM CODE', 'PRODUCT NAME & DESCRIPTION', 'PICK QTY', 'PICKER SIGN']],
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
    columnStyles: {
      0: { cellWidth: 45, halign: 'center' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 110 },
      3: { cellWidth: 210 },
      4: { cellWidth: 65, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 68, halign: 'center' },
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

  // 4. Signatures
  const finalY = (doc as any).lastAutoTable.finalY + 25;
  const sigY = Math.max(finalY, 730);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.75);
  doc.line(leftMargin, sigY, leftMargin + 210, sigY);
  doc.line(rightMargin - 210, sigY, rightMargin, sigY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('WAREHOUSE PICKER SIGN-OFF', leftMargin, sigY + 12);
  doc.text('DISPATCH SUPERVISOR AUDIT', rightMargin - 210, sigY + 12);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Picker Name & Timestamp', leftMargin, sigY + 22);
  doc.text('Supervisor Verification & Stamp', rightMargin - 210, sigY + 22);

  // 5. Running Footer
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, 795, rightMargin, 795);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text('Inventory360 Enterprise ERP - Warehouse Dispatch Control Slip', leftMargin, 807);
  doc.text(`Page 1 of 1 | Printed: ${new Date().toLocaleString()}`, rightMargin, 807, { align: 'right' });

  // Download PDF
  doc.save(`Warehouse_Batch_Pick_List_${new Date().toISOString().split('T')[0]}.pdf`);
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
