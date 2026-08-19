'use client';

import React from 'react';
import { Sale, PurchaseOrder, BusinessSettings } from '../lib/types';
import { formatCurrency, formatDateTime } from '../lib/utils';

export type ReceiptPaperFormat = '80mm' | '58mm' | 'A4';

interface PrintReceiptProps {
  sale?: Sale | null;
  purchaseOrder?: PurchaseOrder | null;
  settings: BusinessSettings;
  receiptFormat?: ReceiptPaperFormat;
}

export const PrintReceipt: React.FC<PrintReceiptProps> = ({
  sale,
  purchaseOrder,
  settings,
  receiptFormat = '80mm',
}) => {
  if (!sale && !purchaseOrder) return null;

  return (
    <div className="hidden print-only print-container font-mono text-black">
      {/* ============================================================ */}
      {/* 1. SALES POS RECEIPT / BILL TEMPLATES                        */}
      {/* ============================================================ */}
      {sale && (
        <>
          {/* ------------------------------------------------------------ */}
          {/* FORMAT A: 58mm COMPACT (MOBILE THERMAL)                      */}
          {/* ------------------------------------------------------------ */}
          {receiptFormat === '58mm' && (
            <div className="max-w-[210px] mx-auto p-2 border-b border-dashed border-black text-[9px] leading-tight space-y-2">
              <div className="text-center border-b border-dashed border-black pb-1.5 space-y-0.5">
                {settings.logoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={settings.logoUrl} alt="Logo" className="max-h-8 max-w-[120px] mx-auto object-contain mb-1" />
                )}
                <h1 className="font-extrabold text-[12px] tracking-tight uppercase">
                  {settings.businessName || 'INVENTORY 360'}
                </h1>
                {settings.taxNumber && <p className="text-[8px] font-bold">GSTIN/TAX: {settings.taxNumber}</p>}
                {settings.address && <p className="text-[8px] truncate">{settings.address}</p>}
                {settings.phone && <p className="text-[8px]">Tel: {settings.phone}</p>}
                <div className="pt-0.5 border-t border-dotted border-gray-400 mt-0.5">
                  <p className="font-bold text-[9px]">REC: #{sale.saleNumber}</p>
                  <p className="text-[8px]">{formatDateTime(sale.createdAt)}</p>
                  {sale.customerName && <p className="text-[8px] font-bold">Cust: {sale.customerName}</p>}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold border-b border-black pb-0.5 text-[8px]">
                  <span>ITEM</span>
                  <span className="text-right">QTYxPRICE</span>
                  <span className="text-right">TOTAL</span>
                </div>
                {sale.items.map((item, idx) => (
                  <div key={idx} className="border-b border-dotted border-gray-300 pb-0.5">
                    <p className="font-bold truncate text-[8.5px]">{item.productName}</p>
                    <div className="flex justify-between text-[8px] text-gray-700">
                      <span>{item.sku}</span>
                      <span>{item.quantity}x{formatCurrency(item.unitPrice, settings.currencySymbol)}</span>
                      <span className="font-bold text-black">{formatCurrency(item.total, settings.currencySymbol)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="border-t border-dashed border-black pt-1 space-y-0.5 text-[8.5px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-{formatCurrency(sale.discount, settings.currencySymbol)}</span>
                  </div>
                )}
                {sale.itemTax !== undefined && sale.itemTax > 0 && (
                  <div className="flex justify-between">
                    <span>Item Tax:</span>
                    <span>+{formatCurrency(sale.itemTax, settings.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>HST/GST ({sale.mainTaxRate !== undefined ? sale.mainTaxRate : settings.taxRate}%):</span>
                  <span>+{formatCurrency(sale.mainTax !== undefined ? sale.mainTax : sale.tax, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-[11px] border-t border-b border-black py-0.5 my-0.5">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(sale.total, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-[8px]">
                  <span>Paid: {sale.paymentMethod}</span>
                  <span className="font-bold">{sale.status}</span>
                </div>
              </div>

              <div className="text-center pt-1 border-t border-dotted border-black text-[7.5px] uppercase">
                <p className="font-bold">*{sale.saleNumber}*</p>
                <p>Thank You!</p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* FORMAT B: 80mm THERMAL (STANDARD POS)                        */}
          {/* ------------------------------------------------------------ */}
          {receiptFormat === '80mm' && (
            <div className="max-w-[320px] mx-auto p-3.5 border border-dashed border-black text-xs space-y-2.5">
              {/* Header */}
              <div className="text-center border-b border-black pb-2 space-y-1">
                {settings.logoUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={settings.logoUrl} alt="Logo" className="max-h-12 max-w-[180px] mx-auto object-contain mb-1.5" />
                )}
                <h1 className="font-extrabold text-base tracking-tight uppercase">
                  {settings.businessName || 'INVENTORY 360'}
                </h1>
                {settings.taxNumber && (
                  <p className="text-[10px] font-bold text-gray-800">GSTIN / TAX ID: {settings.taxNumber}</p>
                )}
                {settings.address && <p className="text-[11px]">{settings.address}</p>}
                <p className="text-[10px]">
                  {settings.phone && `Tel: ${settings.phone}`} {settings.email && `| ${settings.email}`}
                </p>
                <div className="pt-1 border-t border-dotted border-gray-400 mt-1">
                  <p className="font-bold text-[11px] uppercase tracking-wider">
                    TAX INVOICE / POS RECEIPT
                  </p>
                  <p className="font-bold text-[11px]">RECEIPT #: {sale.saleNumber}</p>
                  <p className="text-[10px] text-gray-700">Date: {formatDateTime(sale.createdAt)}</p>
                  {sale.locationName && (
                    <p className="text-[10px] text-gray-700">Outlet: {sale.locationName}</p>
                  )}
                  {sale.customerName && (
                    <p className="text-[10px] font-bold text-gray-900">
                      Customer: {sale.customerName}
                    </p>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-1">
                <div className="flex justify-between font-bold border-b border-black pb-1 text-[11px]">
                  <span className="w-1/2">DESCRIPTION</span>
                  <span className="w-1/4 text-right">QTY x PRICE</span>
                  <span className="w-1/4 text-right">TOTAL</span>
                </div>
                {sale.items.map((item, idx) => (
                  <div key={idx} className="py-1 border-b border-dotted border-gray-300 text-[11px]">
                    <div className="flex justify-between items-start">
                      <div className="w-1/2 pr-1">
                        <p className="font-bold leading-tight">{item.productName}</p>
                        <p className="text-[9px] text-gray-600">
                          SKU: {item.sku} {item.taxRate !== undefined && `(${item.taxRate}% Tax)`}
                        </p>
                      </div>
                      <div className="w-1/4 text-right text-[10px]">
                        {item.quantity} × {formatCurrency(item.unitPrice, settings.currencySymbol)}
                      </div>
                      <div className="w-1/4 text-right font-bold">
                        {formatCurrency(item.total, settings.currencySymbol)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="border-t border-black pt-2 space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span className="font-semibold">{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-black">
                    <span>DISCOUNT:</span>
                    <span>-{formatCurrency(sale.discount, settings.currencySymbol)}</span>
                  </div>
                )}
                {sale.itemTax !== undefined && sale.itemTax > 0 && (
                  <div className="flex justify-between text-indigo-950 font-semibold">
                    <span>ITEM SPECIFIC TAX:</span>
                    <span>+{formatCurrency(sale.itemTax, settings.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>MAIN HST / GST ({sale.mainTaxRate !== undefined ? sale.mainTaxRate : settings.taxRate}%):</span>
                  <span>+{formatCurrency(sale.mainTax !== undefined ? sale.mainTax : sale.tax, settings.currencySymbol)}</span>
                </div>
                {sale.itemTax !== undefined && sale.itemTax > 0 && (
                  <div className="flex justify-between text-[10px] text-gray-700 border-t border-dotted border-gray-300 pt-0.5">
                    <span>TOTAL TAXES:</span>
                    <span>{formatCurrency(sale.tax, settings.currencySymbol)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm border-t border-b border-black py-1 my-1">
                  <span>TOTAL PAID:</span>
                  <span>{formatCurrency(sale.total, settings.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-[10px] pt-0.5">
                  <span>PAYMENT METHOD:</span>
                  <span className="font-bold uppercase">{sale.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>STATUS:</span>
                  <span className="font-bold uppercase">{sale.status}</span>
                </div>
              </div>

              {/* Barcode & Footer Note */}
              <div className="text-center pt-2.5 border-t border-dotted border-black space-y-1">
                <div className="text-center font-mono text-[10px] tracking-[0.25em] bg-gray-100 py-1 font-bold">
                  *{sale.saleNumber}*
                </div>
                <p className="text-[9px] uppercase">
                  Thank you for shopping with us!
                </p>
                <p className="text-[8px] text-gray-600">
                  Goods once sold can be returned within 14 days with original receipt.
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* FORMAT C: A4 / LETTER (FULL COMMERCIAL TAX INVOICE)           */}
          {/* ------------------------------------------------------------ */}
          {receiptFormat === 'A4' && (
            <div className="max-w-[760px] mx-auto p-8 border-2 border-black text-xs space-y-6">
              {/* Top Business Header */}
              <div className="flex justify-between items-start border-b-2 border-black pb-5">
                <div className="flex items-center gap-4">
                  {settings.logoUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={settings.logoUrl} alt="Logo" className="max-h-16 max-w-[140px] object-contain border border-gray-200 p-1" />
                  )}
                  <div>
                    <h1 className="font-extrabold text-2xl uppercase tracking-tight">
                      {settings.businessName || 'INVENTORY 360'}
                    </h1>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{settings.address}</p>
                    <p className="text-xs text-gray-700">Phone: {settings.phone} | Email: {settings.email}</p>
                    {settings.taxNumber && <p className="text-xs font-bold text-gray-800">GSTIN / TAX ID: {settings.taxNumber}</p>}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="inline-block bg-black text-white px-3 py-1 font-bold text-base uppercase tracking-wider">
                    TAX INVOICE
                  </div>
                  <p className="font-bold text-sm mt-1">INVOICE #: {sale.saleNumber}</p>
                  <p className="text-xs text-gray-700">Invoice Date: {formatDateTime(sale.createdAt)}</p>
                  <p className="text-xs text-gray-700">Store Outlet: {sale.locationName || 'Main Store'}</p>
                </div>
              </div>

              {/* Bill To / Ship To Grid */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 border border-gray-300">
                <div>
                  <p className="font-bold uppercase text-[10px] text-gray-500 tracking-wider">BILLED TO (CUSTOMER)</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">{sale.customerName || 'Walk-in Retail Customer'}</p>
                  {sale.customerId && <p className="text-xs text-gray-600">Customer ID: {sale.customerId}</p>}
                  <p className="text-xs text-gray-600">Payment Channel: In-Store POS</p>
                </div>
                <div className="text-right">
                  <p className="font-bold uppercase text-[10px] text-gray-500 tracking-wider">PAYMENT DETAILS</p>
                  <p className="font-bold text-sm text-slate-900 mt-0.5">Method: {sale.paymentMethod}</p>
                  <p className="text-xs text-emerald-800 font-bold uppercase">Status: {sale.status}</p>
                  <p className="text-xs text-gray-600">Currency: {settings.currencyCode || 'USD'}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse border border-black">
                <thead>
                  <tr className="bg-black text-white font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-2 border border-black w-10 text-center">#</th>
                    <th className="p-2 border border-black">Item Description &amp; Variant</th>
                    <th className="p-2 border border-black w-28">SKU Code</th>
                    <th className="p-2 border border-black w-20 text-right">Unit Price</th>
                    <th className="p-2 border border-black w-14 text-right">Qty</th>
                    <th className="p-2 border border-black w-24 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {sale.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2.5 border border-gray-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2.5 border border-gray-300">
                        <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                      </td>
                      <td className="p-2.5 border border-gray-300 font-mono text-[11px]">{item.sku}</td>
                      <td className="p-2.5 border border-gray-300 text-right font-mono">
                        {formatCurrency(item.unitPrice, settings.currencySymbol)}
                      </td>
                      <td className="p-2.5 border border-gray-300 text-right font-bold">{item.quantity}</td>
                      <td className="p-2.5 border border-gray-300 text-right font-bold font-mono">
                        {formatCurrency(item.total, settings.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Summary & Signature Block */}
              <div className="grid grid-cols-12 gap-6 pt-2">
                <div className="col-span-7 space-y-4">
                  <div className="p-3 border border-gray-300 bg-gray-50 text-[11px] space-y-1">
                    <p className="font-bold uppercase text-[10px] text-gray-700">Terms &amp; Conditions:</p>
                    <p className="text-gray-600">1. All claims and returned items must be accompanied by this original invoice within 14 days.</p>
                    <p className="text-gray-600">2. Warranty covers manufacturing defects as per standard brand policy.</p>
                  </div>
                  <div className="pt-8 flex justify-between items-end">
                    <div className="border-t border-black w-48 text-center pt-1 text-[10px] uppercase font-bold">
                      Customer Signature
                    </div>
                    <div className="border-t border-black w-48 text-center pt-1 text-[10px] uppercase font-bold">
                      Authorized Signatory
                    </div>
                  </div>
                </div>

                <div className="col-span-5 space-y-1.5 text-right font-mono text-xs border border-black p-3.5 bg-gray-50">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="flex justify-between text-rose-700 font-semibold">
                      <span>Discount:</span>
                      <span>-{formatCurrency(sale.discount, settings.currencySymbol)}</span>
                    </div>
                  )}
                  {sale.itemTax !== undefined && sale.itemTax > 0 && (
                    <div className="flex justify-between text-indigo-950 font-semibold">
                      <span>Individual Item Taxes:</span>
                      <span>+{formatCurrency(sale.itemTax, settings.currencySymbol)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Main HST / GST ({sale.mainTaxRate !== undefined ? sale.mainTaxRate : settings.taxRate}%):</span>
                    <span>+{formatCurrency(sale.mainTax !== undefined ? sale.mainTax : sale.tax, settings.currencySymbol)}</span>
                  </div>
                  {sale.itemTax !== undefined && sale.itemTax > 0 && (
                    <div className="flex justify-between text-[11px] text-gray-600 border-t border-dotted border-gray-300 pt-0.5">
                      <span>Combined Taxes:</span>
                      <span>{formatCurrency(sale.tax, settings.currencySymbol)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-base border-t-2 border-black pt-2 text-black">
                    <span>NET TOTAL:</span>
                    <span>{formatCurrency(sale.total, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-800 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-bold">{formatCurrency(sale.total, settings.currencySymbol)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* 2. PURCHASE ORDER TEMPLATE                                   */}
      {/* ============================================================ */}
      {purchaseOrder && (
        <div className="max-w-2xl mx-auto p-6 border border-black text-xs space-y-4">
          <div className="flex justify-between border-b border-black pb-4">
            <div>
              <h1 className="font-extrabold text-lg uppercase">{settings.businessName}</h1>
              <p>{settings.address}</p>
              <p>{settings.email} | {settings.phone}</p>
            </div>
            <div className="text-right">
              <h2 className="font-extrabold text-xl">PURCHASE ORDER</h2>
              <p className="font-bold text-sm">{purchaseOrder.poNumber}</p>
              <p>Date: {formatDateTime(purchaseOrder.createdAt)}</p>
              <p>Status: {purchaseOrder.status.toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-black pb-3">
            <div>
              <p className="font-bold uppercase text-[10px] text-gray-500">SUPPLIER</p>
              <p className="font-bold text-sm">{purchaseOrder.supplierName}</p>
            </div>
            <div>
              <p className="font-bold uppercase text-[10px] text-gray-500">SHIP TO LOCATION</p>
              <p className="font-bold text-sm">{purchaseOrder.locationName}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black font-bold uppercase text-[10px]">
                <th className="py-2">SKU</th>
                <th className="py-2">Item Description</th>
                <th className="py-2 text-right">Cost</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrder.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2 font-mono">{item.sku}</td>
                  <td className="py-2 font-semibold">{item.productName}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitCost, settings.currencySymbol)}</td>
                  <td className="py-2 text-right">{item.orderedQuantity}</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(item.total, settings.currencySymbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right space-y-1 font-mono pt-2 border-t border-black">
            <p>Subtotal: {formatCurrency(purchaseOrder.subtotal, settings.currencySymbol)}</p>
            <p>Tax: {formatCurrency(purchaseOrder.tax, settings.currencySymbol)}</p>
            <p className="font-extrabold text-sm">TOTAL: {formatCurrency(purchaseOrder.total, settings.currencySymbol)}</p>
          </div>
        </div>
      )}
    </div>
  );
};
