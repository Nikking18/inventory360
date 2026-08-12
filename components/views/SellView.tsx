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
            if (newQty > maxStock) return { ...item, quantity: maxStock, total: maxStock * item.unitPrice };
            return { ...item, quantity: newQty, total: newQty * item.unitPrice };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const subtotal = cart.reduce((acc, i) => acc + i.total, 0);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const calculatedTax = (afterDiscount * taxRate) / 100;
  const grandTotal = afterDiscount + calculatedTax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const custObj = customers.find((c) => c.id === selectedCustomer);

    const cogs = cart.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);

    const salePayload = {
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: calculatedTax,
      total: grandTotal,
      costOfGoodsSold: cogs,
      grossProfit: grandTotal - cogs,
      paymentMethod,
      status: 'Completed' as const,
      customerId: selectedCustomer || undefined,
      customerName: custObj ? custObj.name : t('walk_in_customer', 'Walk-in Customer'),
      locationId: currentLocation.id,
      locationName: currentLocation.name,
    };

    const newSale = await onCompleteSale(salePayload);
    setCart([]);
    setDiscountAmount(0);
    setCompletedSaleModal(newSale);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-neutral-200">
      {/* View Header with Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => onSubTabChange && onSubTabChange('quick-sale')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'quick-sale'
                ? 'text-white font-mono font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('quick-sale', 'Quick Sale POS')}
            {activeSubTab === 'quick-sale' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>

          <button
            onClick={() => onSubTabChange && onSubTabChange('sales-history')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'sales-history'
                ? 'text-white font-mono font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('sales-history', 'Sales History')}
            {activeSubTab === 'sales-history' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>

          <button
            onClick={() => onSubTabChange && onSubTabChange('returns')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'returns'
                ? 'text-white font-mono font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('returns', 'Returns & Refunds')}
            {activeSubTab === 'returns' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
        </div>

        <button
          onClick={() => setIsBarcodeOpen(true)}
          className="px-3.5 py-1.5 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-2 hover:bg-neutral-200 transition-colors"
        >
          <Barcode className="w-4 h-4" />
          <span>{t('barcode', 'Barcode Scanner')}</span>
        </button>
      </div>

      {activeSubTab === 'quick-sale' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
          {/* LEFT: Product Catalog Selection Grid */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search input */}
            <div className="relative">
              <input
                type="text"
                placeholder={t('search_placeholder', 'Search product, SKU or barcode...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-neutral-900 border border-neutral-800 rounded-none pl-9 pr-4 py-2.5 text-neutral-200 focus:outline-none focus:border-white font-mono"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 sm:col-span-3 bg-neutral-900 border border-neutral-800 p-8 text-center space-y-3">
                  <ShoppingBag className="w-8 h-8 mx-auto text-neutral-600" />
                  <p className="font-bold text-white text-xs uppercase tracking-wider">{t('cart_empty', 'No Catalog Products Available')}</p>
                  <p className="text-[11px] text-neutral-400">{t('add_product', 'Add products in the Catalog tab to start POS selling.')}</p>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.stockQuantity <= 0;
                  return (
                    <button
                      key={p.id}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(p)}
                      className={`bg-neutral-900 border border-neutral-800 rounded-none p-3 text-left transition-all relative flex flex-col justify-between h-36 ${
                        isOutOfStock
                          ? 'opacity-40 cursor-not-allowed bg-neutral-950'
                          : 'hover:border-white hover:bg-neutral-800/80'
                      }`}
                    >
                      <div>
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-8 h-8 rounded-none object-cover mb-2 border border-neutral-800"
                          />
                        )}
                        <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">SKU: {p.sku}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800">
                        <span className="text-xs font-bold text-white">
                          {formatCurrency(p.retailPrice, currencySymbol)}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                            isOutOfStock ? 'border-rose-900 text-rose-400 bg-rose-950/60' : 'border-neutral-700 text-neutral-300 bg-neutral-950'
                          }`}
                        >
                          {isOutOfStock ? t('out_of_stock', 'NO STOCK') : `${p.stockQuantity} STK`}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Current Cart Panel */}
          <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-none p-5 flex flex-col justify-between min-h-[580px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-white" />
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-white">
                    {t('cart', 'Current Sale Cart')}
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-1 border border-neutral-800 uppercase">
                  {currentLocation.name}
                </span>
              </div>

              {/* Customer Selector */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-neutral-500" />
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-none px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-white"
                >
                  <option value="">{t('walk_in_customer', 'Walk-in Customer')}</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 space-y-1">
                    <ShoppingBag className="w-8 h-8 mx-auto text-neutral-600" />
                    <p className="text-xs font-mono font-bold uppercase tracking-wider">{t('cart_empty', 'Cart Empty')}</p>
                    <p className="text-[10px] text-neutral-600">{t('cart_empty', 'Select items from catalog to add')}</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.productId}
                      className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-none flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-white truncate">{item.productName}</p>
                        <p className="text-[10px] text-neutral-500">
                          {formatCurrency(item.unitPrice, currencySymbol)} x {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-neutral-800 bg-neutral-900">
                          <button
                            onClick={() => updateCartQty(item.productId, -1)}
                            className="p-1 hover:bg-neutral-800 text-neutral-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.productId, 1)}
                            className="p-1 hover:bg-neutral-800 text-neutral-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-white min-w-[50px] text-right">
                          {formatCurrency(item.total, currencySymbol)}
                        </span>

                        <button
                          onClick={() => updateCartQty(item.productId, -item.quantity)}
                          className="text-neutral-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Checkout Section */}
            <div className="pt-4 border-t border-neutral-800 space-y-3 font-mono">
              <div className="space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>{t('subtotal', 'Subtotal')}</span>
                  <span className="text-white">{formatCurrency(subtotal, currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('discount', 'Discount')} ($)</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-20 text-right bg-neutral-950 border border-neutral-800 px-2 py-0.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="flex justify-between">
                  <span>{t('tax', 'Tax')} ({taxRate}%)</span>
                  <span className="text-white">{formatCurrency(calculatedTax, currencySymbol)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-800 text-base font-bold text-white">
                  <span className="uppercase tracking-wider">{t('total', 'Total')}</span>
                  <span>{formatCurrency(grandTotal, currencySymbol)}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['Card', 'Cash', 'Bank Transfer'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 text-[11px] font-bold border rounded-none uppercase transition-all ${
                      paymentMethod === method
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                    }`}
                  >
                    {method === 'Card' ? t('card', 'Card') : method === 'Cash' ? t('cash', 'Cash') : t('bank_transfer', 'Transfer')}
                  </button>
                ))}
              </div>

              {/* Checkout CTA */}
              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className={`w-full py-3 font-mono font-bold uppercase tracking-wider text-xs rounded-none transition-all ${
                  cart.length > 0
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-neutral-950 text-neutral-600 border border-neutral-800 cursor-not-allowed'
                }`}
              >
                {t('pay_now', 'Complete Transaction')} ({formatCurrency(grandTotal, currencySymbol)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SALES HISTORY TAB */}
      {activeSubTab === 'sales-history' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-5 font-mono text-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
            {t('sales-history', 'Recent Sales Register')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-widest">
                <tr>
                  <th className="py-2.5 px-3">Sale #</th>
                  <th className="py-2.5 px-3">{t('date', 'Date')}</th>
                  <th className="py-2.5 px-3">{t('customer', 'Customer')}</th>
                  <th className="py-2.5 px-3">{t('source_location', 'Outlet')}</th>
                  <th className="py-2.5 px-3">{t('payment_method', 'Payment')}</th>
                  <th className="py-2.5 px-3 text-right">{t('total', 'Total')}</th>
                  <th className="py-2.5 px-3 text-center">{t('actions', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-neutral-950/60">
                    <td className="py-3 px-3 font-bold text-white">{sale.saleNumber}</td>
                    <td className="py-3 px-3 text-neutral-400">{formatDateTime(sale.createdAt)}</td>
                    <td className="py-3 px-3 text-neutral-300">{sale.customerName}</td>
                    <td className="py-3 px-3 text-neutral-400">{sale.locationName}</td>
                    <td className="py-3 px-3 text-neutral-400">{sale.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      {formatCurrency(sale.total, currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onPrintReceipt(sale)}
                        className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-white text-[10px] uppercase font-bold"
                      >
                        {t('print_receipt', 'Receipt')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RETURNS & REFUNDS TAB */}
      {activeSubTab === 'returns' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-5 font-mono text-xs space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
            {t('returns', 'Returns & Refund Management')}
          </h3>
          <p className="text-neutral-400 text-xs">
            Select a transaction below to process partial or full stock refund adjustments.
          </p>
          <div className="space-y-3 pt-2">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 bg-neutral-950 border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-white">{sale.saleNumber}</p>
                  <p className="text-[10px] text-neutral-500">
                    {sale.customerName} • {formatDateTime(sale.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-white">
                    {formatCurrency(sale.total, currencySymbol)}
                  </span>
                  {sale.status === 'Refunded' ? (
                    <span className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 text-neutral-500 text-[10px] uppercase font-bold cursor-not-allowed">
                      Refunded
                    </span>
                  ) : (
                    <button
                      onClick={() => onRefundSale(sale.id)}
                      className="px-3 py-1.5 bg-neutral-900 border border-rose-900/60 text-rose-400 hover:bg-rose-950 text-[10px] uppercase font-bold"
                    >
                      {t('returns', 'Process Refund')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        products={products}
        onSelectProduct={(product) => {
          addToCart(product);
          setIsBarcodeOpen(false);
        }}
      />

      {/* Sale Completion Confirmation Modal */}
      {completedSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-md w-full text-center space-y-4 text-neutral-200">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              {t('sale_complete', 'Transaction Successful')}
            </h3>
            <p className="text-xs text-neutral-400">
              Sale #{completedSaleModal.saleNumber} completed for {formatCurrency(completedSaleModal.total, currencySymbol)}.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onPrintReceipt(completedSaleModal);
                  setCompletedSaleModal(null);
                }}
                className="flex-1 py-2 bg-neutral-950 border border-neutral-800 text-white font-bold text-xs uppercase hover:bg-neutral-800"
              >
                {t('print_receipt', 'Print Receipt')}
              </button>
              <button
                onClick={() => setCompletedSaleModal(null)}
                className="flex-1 py-2 bg-white text-black font-bold text-xs uppercase hover:bg-neutral-200"
              >
                {t('cancel', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
