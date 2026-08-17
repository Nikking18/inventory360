'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Sale, SaleItem, Customer, Location } from '../../lib/types';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  ShoppingBag,
  User,
} from 'lucide-react';
import { BarcodeModal } from '../BarcodeModal';

interface SellViewProps {
  products: Product[];
  customers: Customer[];
  locations: Location[];
  selectedLocation: string;
  sales: Sale[];
  onCompleteSale: (sale: Omit<Sale, 'id' | 'saleNumber' | 'createdAt'>) => Promise<Sale>;
  onRefundSale: (saleId: string) => Promise<void>;
  currencySymbol: string;
  taxRate: number;
  onPrintReceipt: (sale: Sale) => void;
  activeSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}

export const SellView: React.FC<SellViewProps> = ({
  products,
  customers,
  locations,
  selectedLocation,
  sales,
  onCompleteSale,
  onRefundSale,
  currencySymbol,
  taxRate,
  onPrintReceipt,
  activeSubTab = 'quick-sale',
  onSubTabChange,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer'>('Card');
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [completedSaleModal, setCompletedSaleModal] = useState<Sale | null>(null);

  const currentLocation = locations.find((l) => l.id === selectedLocation) || locations[0];

  const addToCart = (product: Product) => {
    const prod = products.find((p) => p.id === product.id);
    const maxStock = prod ? prod.stockQuantity : product.stockQuantity;
    if (maxStock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= maxStock) return prev;
        const newQty = existing.quantity + 1;
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            unitPrice: product.retailPrice,
            unitCost: product.costPrice,
            quantity: 1,
            total: product.retailPrice,
          },
        ];
      }
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    const maxStock = prod ? prod.stockQuantity : 999999;

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > maxStock) return item;
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const calculatedTax = (subtotal - discountAmount) * (taxRate / 100);
  const total = Math.max(0, subtotal - discountAmount + calculatedTax);
  const totalCOGS = cart.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);
  const grossProfit = total - totalCOGS;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const customerObj = customers.find((c) => c.id === selectedCustomer);

    const saleRecord: Omit<Sale, 'id' | 'saleNumber' | 'createdAt'> = {
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: calculatedTax,
      total,
      paymentMethod,
      customerId: selectedCustomer || undefined,
      customerName: customerObj?.name || undefined,
      locationId: currentLocation?.id || 'loc_default',
      locationName: currentLocation?.name || 'Primary Store',
      status: 'Completed',
      costOfGoodsSold: totalCOGS,
      grossProfit: grossProfit,
    };

    const newSale = await onCompleteSale(saleRecord);
    setCompletedSaleModal(newSale);
    clearCart();
  };

  const filteredProducts = products.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div id="tour-pos-terminal" className="space-y-6 text-slate-900 font-mono">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wider font-heading">
            {t('sell', 'Point of Sale (POS Terminal)')}
          </h1>
          <p className="text-xs text-slate-600">
            Fast checkout lane, SKU barcode indexing, split payments, and receipt generation.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2">
          {(['quick-sale', 'sales-history', 'returns'] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => onSubTabChange && onSubTabChange(tabId)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeSubTab === tabId
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tabId === 'quick-sale' ? 'POS Terminal' : tabId === 'sales-history' ? 'Sales Log' : 'Returns & Refunds'}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'quick-sale' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Selection Grid */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search & Barcode Scan Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('search_placeholder', 'Search products by name, SKU, or barcode...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 pl-9 pr-3 py-2.5 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>

              <button
                onClick={() => setIsBarcodeOpen(true)}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Open Live Barcode Scanner"
              >
                <Barcode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stockQuantity <= 0;
                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`p-3 bg-white border text-left flex flex-col justify-between space-y-2 transition-all group rounded-none shadow-xs ${
                      isOutOfStock
                        ? 'opacity-40 border-slate-200 cursor-not-allowed bg-slate-50'
                        : 'border-slate-200 hover:border-slate-900 hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-1">
                      {p.imageUrl && (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-20 object-cover border border-slate-200 mb-1"
                        />
                      )}
                      <p className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        SKU: {p.sku}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 w-full text-xs">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(p.retailPrice, currencySymbol)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                          p.stockQuantity <= p.reorderPoint
                            ? 'text-amber-800 border-amber-300 bg-amber-50'
                            : 'text-slate-600 border-slate-200 bg-slate-50'
                        }`}
                      >
                        {p.stockQuantity} Left
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active POS Cart & Checkout Terminal */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-900" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Active Cart ({cart.reduce((acc, i) => acc + i.quantity, 0)} Items)
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[10px] uppercase font-bold text-rose-700 hover:underline"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Customer Attachment Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" />
                <span>Attach Customer</span>
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              >
                <option value="">Walk-in Customer (General Checkout)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email || c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Line Items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 space-y-2">
                  <ShoppingBag className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 font-mono">
                    Cart is currently empty. Click products or scan barcodes to begin checkout.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                      <p className="text-[10px] text-slate-500">
                        {formatCurrency(item.unitPrice, currencySymbol)} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-300 bg-white">
                        <button
                          onClick={() => updateCartQty(item.productId, -1)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.productId, 1)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 min-w-[50px] text-right">
                        {formatCurrency(item.total, currencySymbol)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 text-slate-400 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, currencySymbol)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Discount ($):</span>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="0.00"
                  className="w-20 text-right bg-white border border-slate-300 p-1 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Tax ({taxRate}%):</span>
                <span>{formatCurrency(calculatedTax, currencySymbol)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Due:</span>
                <span>{formatCurrency(total, currencySymbol)}</span>
              </div>
            </div>

            {/* Payment Method Pills */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Card', 'Cash', 'Bank Transfer'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-[11px] font-mono uppercase tracking-wider font-bold transition-all ${
                      paymentMethod === method
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Complete Sale Action */}
            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className={`w-full py-3 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                cart.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Sale &amp; Print Receipt</span>
            </button>
          </div>
        </div>
      )}

      {/* SALES HISTORY SUB-TAB */}
      {activeSubTab === 'sales-history' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Completed POS Transactions ({sales.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">Sale #</th>
                  <th className="p-2.5">Date &amp; Time</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5">Payment</th>
                  <th className="p-2.5 text-right">Items</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                      No sales recorded in the system yet.
                    </td>
                  </tr>
                ) : (
                  sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900">{s.saleNumber}</td>
                      <td className="p-2.5 text-slate-600">{formatDateTime(s.createdAt)}</td>
                      <td className="p-2.5 text-slate-800 font-semibold">{s.customerName || 'Walk-in'}</td>
                      <td className="p-2.5 text-slate-600">{s.locationName}</td>
                      <td className="p-2.5 text-slate-600">{s.paymentMethod}</td>
                      <td className="p-2.5 text-right text-slate-800">{s.items.reduce((a, b) => a + b.quantity, 0)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(s.total, currencySymbol)}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                            s.status === 'Completed'
                              ? 'text-emerald-800 border-emerald-300 bg-emerald-50'
                              : 'text-rose-800 border-rose-300 bg-rose-50'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => onPrintReceipt(s)}
                          className="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 text-[10px] font-bold uppercase"
                        >
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RETURNS & REFUNDS SUB-TAB */}
      {activeSubTab === 'returns' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Returns &amp; Refund Processing
            </h3>
            <p className="text-xs text-slate-600">
              Refunding a transaction automatically returns stock to the active location inventory ledger.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">Sale #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Refund Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{s.saleNumber}</td>
                    <td className="p-2.5 text-slate-600">{formatDateTime(s.createdAt)}</td>
                    <td className="p-2.5 text-slate-800">{s.customerName || 'Walk-in'}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(s.total, currencySymbol)}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                          s.status === 'Refunded'
                            ? 'text-rose-800 border-rose-300 bg-rose-50'
                            : 'text-emerald-800 border-emerald-300 bg-emerald-50'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      {s.status !== 'Refunded' && (
                        <button
                          onClick={() => onRefundSale(s.id)}
                          className="px-2.5 py-1 bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100 text-[10px] font-bold uppercase"
                        >
                          Process Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          addToCart(p);
          setIsBarcodeOpen(false);
        }}
      />

      {/* Completed Sale Notification Modal */}
      {completedSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn font-mono">
          <div className="bg-white border border-slate-200 shadow-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 uppercase">Sale Completed!</h3>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                Order #{completedSaleModal.saleNumber} recorded successfully.
              </p>
              <p className="text-xl font-bold text-slate-900 mt-2 font-mono">
                {formatCurrency(completedSaleModal.total, currencySymbol)}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onPrintReceipt(completedSaleModal);
                  setCompletedSaleModal(null);
                }}
                className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setCompletedSaleModal(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-800 font-bold text-xs uppercase hover:bg-slate-200 border border-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
