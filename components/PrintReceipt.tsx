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
    <div className="hidden print-only print-container font-sans text-black">
      {/* Sales Receipt */}
      {sale && (
        <div className="max-w-md mx-auto p-4 border border-black rounded text-xs space-y-3">
          <div className="text-center border-b border-black pb-3">
            <h2 className="font-extrabold text-base tracking-tight uppercase">
              {settings.businessName}
            </h2>
            <p>{settings.address}</p>
            <p>Tel: {settings.phone} | {settings.email}</p>
            <p className="font-mono mt-1 font-bold">RECEIPT #: {sale.saleNumber}</p>
            <p className="text-[10px] text-gray-600">{formatDateTime(sale.createdAt)}</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-bold border-b border-gray-300 pb-1">
              <span>ITEM</span>
              <span>QTY × PRICE</span>
              <span>TOTAL</span>
            </div>
            {sale.items.map((item, idx) => (
              <div key={idx} className="flex justify-between py-1 border-b border-gray-100">
                <div className="max-w-[180px]">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-[10px] font-mono text-gray-500">{item.sku}</p>
                </div>
                <span>{item.quantity} × {formatCurrency(item.unitPrice, settings.currencySymbol)}</span>
                <span className="font-semibold">{formatCurrency(item.total, settings.currencySymbol)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-black pt-2 space-y-1 font-mono text-right">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>{formatCurrency(sale.subtotal, settings.currencySymbol)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>DISCOUNT:</span>
                <span>-{formatCurrency(sale.discount, settings.currencySymbol)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>TAX ({settings.taxRate}%):</span>
              <span>{formatCurrency(sale.tax, settings.currencySymbol)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm border-t border-black pt-1">
              <span>TOTAL PAID:</span>
              <span>{formatCurrency(sale.total, settings.currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-gray-600">
              <span>Payment Method:</span>
              <span>{sale.paymentMethod}</span>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-gray-300 text-[10px] text-gray-500 uppercase">
            Thank you for shopping at {settings.businessName}!
          </div>
        </div>
      )}

      {/* Purchase Order */}
      {purchaseOrder && (
        <div className="max-w-2xl mx-auto p-6 border border-black rounded text-xs space-y-4">
          <div className="flex justify-between border-b border-black pb-4">
            <div>
              <h1 className="font-extrabold text-lg uppercase">{settings.businessName}</h1>
              <p>{settings.address}</p>
              <p>{settings.email} | {settings.phone}</p>
            </div>
            <div className="text-right">
              <h2 className="font-extrabold text-xl">PURCHASE ORDER</h2>
              <p className="font-mono font-bold">{purchaseOrder.poNumber}</p>
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
