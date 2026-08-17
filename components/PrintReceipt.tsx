'use client';

import React from 'react';
import { Sale, PurchaseOrder, BusinessSettings } from '../lib/types';
import { formatCurrency, formatDateTime } from '../lib/utils';

interface PrintReceiptProps {
  sale?: Sale | null;
  purchaseOrder?: PurchaseOrder | null;
  settings: BusinessSettings;
}

export const PrintReceipt: React.FC<PrintReceiptProps> = ({
  sale,
  purchaseOrder,
  settings,
}) => {
  if (!sale && !purchaseOrder) return null;

  return (
    <div className="hidden print-only print-container font-mono text-black">
      {/* 1. SALES POS THERMAL RECEIPT & TAX INVOICE */}
      {sale && (
        <div className="max-w-[340px] mx-auto p-4 border border-dashed border-black text-xs space-y-3">
          {/* Header */}
          <div className="text-center border-b border-black pb-3 space-y-1">
            <h1 className="font-extrabold text-base tracking-tight uppercase">
              {settings.businessName || 'INVENTORY 360'}
            </h1>
            {settings.address && <p className="text-[11px]">{settings.address}</p>}
            <p className="text-[10px]">
              {settings.phone && `Tel: ${settings.phone}`} {settings.email && `| ${settings.email}`}
            </p>
            <div className="pt-1 border-t border-dotted border-gray-400 mt-1">
              <p className="font-bold text-xs uppercase">
                OFFICIAL TAX INVOICE / RECEIPT
              </p>
              <p className="font-bold text-[11px]">REC #: {sale.saleNumber}</p>
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

          {/* Line Items */}
          <div className="space-y-1.5 pt-1">
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
                    <p className="text-[9px] text-gray-600">SKU: {item.sku}</p>
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

          {/* Financial Summary */}
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
            <div className="flex justify-between">
              <span>TAX ({settings.taxRate}%):</span>
              <span>{formatCurrency(sale.tax, settings.currencySymbol)}</span>
            </div>
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
          <div className="text-center pt-3 border-t border-dotted border-black space-y-1">
            <div className="text-center font-mono text-[10px] tracking-[0.25em] bg-gray-100 py-1 font-bold">
              *{sale.saleNumber}*
            </div>
            <p className="text-[9px] uppercase">
              Thank you for your business!
            </p>
            <p className="text-[8px] text-gray-600">
              Goods once sold can be returned within 14 days with original receipt.
            </p>
          </div>
        </div>
      )}

      {/* 2. PURCHASE ORDER */}
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
