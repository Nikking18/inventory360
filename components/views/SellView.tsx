'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Sale, SaleItem, Customer, Location, ProductVariant } from '../../lib/types';
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
  Printer,
  Layers,
  Settings2,
  Sparkles,
  X,
  CreditCard,
  Banknote,
  Building2,
  Tag,
  Check,
  Package,
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer'>('Card');
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [completedSaleModal, setCompletedSaleModal] = useState<Sale | null>(null);

  // Variant Selection State
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [variantQty, setVariantQty] = useState<number>(1);

  // Local Printer Settings State
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState<boolean>(true);
  const [receiptFormat, setReceiptFormat] = useState<'80mm' | '58mm' | 'A4'>('80mm');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAutoPrint = localStorage.getItem('inventory360_autoprint');
      if (savedAutoPrint !== null) {
        setAutoPrintEnabled(savedAutoPrint === 'true');
      }
      const savedFormat = localStorage.getItem('inventory360_receipt_format');
      if (savedFormat) {
        setReceiptFormat(savedFormat as any);
      }
    }
  }, []);

  const saveAutoPrint = (val: boolean) => {
    setAutoPrintEnabled(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory360_autoprint', String(val));
    }
  };

  const saveReceiptFormat = (fmt: '80mm' | '58mm' | 'A4') => {
    setReceiptFormat(fmt);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory360_receipt_format', fmt);
    }
  };

  const currentLocation = locations.find((l) => l.id === selectedLocation) || locations[0];

  // Distinct product categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoryName) set.add(p.categoryName);
    });
    return Array.from(set);
  }, [products]);

  // Primary Add to Cart handler with Variant Interception
  const handleProductSelect = (product: Product) => {
    // If the product has multiple variants, open the Variant Selector Modal!
    if (product.variants && product.variants.length > 0) {
      setVariantModalProduct(product);
      setSelectedVariantId(product.variants[0].id);
      setVariantQty(1);
    } else {
      addStandardProductToCart(product);
    }
  };

  // Add standard non-variant product to cart
  const addStandardProductToCart = (product: Product, quantity = 1) => {
    const prod = products.find((p) => p.id === product.id);
    const maxStock = prod ? prod.stockQuantity : product.stockQuantity;
    if (maxStock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= maxStock) return prev;
        const newQty = Math.min(maxStock, existing.quantity + quantity);
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
            quantity: Math.min(maxStock, quantity),
            total: product.retailPrice * Math.min(maxStock, quantity),
          },
        ];
      }
    });
  };

  // Add chosen variant to cart
  const handleAddVariantToCart = () => {
    if (!variantModalProduct) return;
    const variant = variantModalProduct.variants?.find((v) => v.id === selectedVariantId);
    if (!variant) return;

    const maxStock = variant.stockQuantity > 0 ? variant.stockQuantity : variantModalProduct.stockQuantity;
    if (maxStock <= 0) return;

    const uniqueItemKey = `${variantModalProduct.id}__var_${variant.id}`;
    const variantFullName = `${variantModalProduct.name} (${variant.name})`;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === uniqueItemKey);
      if (existing) {
        const newQty = Math.min(maxStock, existing.quantity + variantQty);
        return prev.map((item) =>
          item.productId === uniqueItemKey
            ? { ...item, quantity: newQty, total: newQty * item.unitPrice }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: uniqueItemKey,
            productName: variantFullName,
            sku: variant.sku || variantModalProduct.sku,
            unitPrice: variant.retailPrice || variantModalProduct.retailPrice,
            unitCost: variant.costPrice || variantModalProduct.costPrice,
            quantity: Math.min(maxStock, variantQty),
            total: (variant.retailPrice || variantModalProduct.retailPrice) * Math.min(maxStock, variantQty),
          },
        ];
      }
    });

    setVariantModalProduct(null);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
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

    // Auto-trigger printing to local thermal/connected printer if enabled
    if (autoPrintEnabled) {
      setTimeout(() => {
        onPrintReceipt(newSale);
      }, 200);
    }
  };

  const handleTestPrint = () => {
    const dummySale: Sale = {
      id: 'test_print',
      saleNumber: `TEST-${Date.now().toString().slice(-4)}`,
      items: [
        { productId: 'test_1', productName: 'Sample Retail Item (80mm Test)', sku: 'TEST-SKU-01', unitPrice: 29.99, unitCost: 15.00, quantity: 2, total: 59.98 },
      ],
      subtotal: 59.98,
      tax: 5.10,
      discount: 0,
      total: 65.08,
      costOfGoodsSold: 30.00,
      grossProfit: 35.08,
      paymentMethod: 'Card',
      status: 'Completed',
      locationId: currentLocation?.id || 'loc_1',
      locationName: currentLocation?.name || 'Main Flagship',
      channel: 'In-Store POS',
      createdAt: new Date().toISOString(),
    };
    onPrintReceipt(dummySale);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.variants || []).some(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.sku.toLowerCase().includes(search.toLowerCase()) ||
          v.barcode.toLowerCase().includes(search.toLowerCase())
      );

    const matchesCategory = selectedCategory === 'all' || p.categoryName === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-mono text-slate-900">
      {/* 1. POS SUB-NAVIGATION & PRINTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'quick-sale', label: t('quick-sale', 'Quick Sale POS'), icon: ShoppingBag },
            { id: 'sales-history', label: t('sales-history', 'Sales History'), icon: Layers },
            { id: 'returns', label: t('returns', 'Returns & Refunds'), icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onSubTabChange && onSubTabChange(tab.id)}
                className={`px-3 py-1.5 text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Local Printer Connection & Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPrinterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
            title="Configure Local POS Thermal & Bill Printer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Local Printer</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </button>

          <button
            onClick={() => setIsBarcodeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider border border-slate-300 transition-colors"
          >
            <Barcode className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden md:inline">Barcode Scan</span>
          </button>
        </div>
      </div>

      {/* QUICK SALE POS TERMINAL */}
      {activeSubTab === 'quick-sale' && (
        <div id="tour-pos-terminal" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Search, Category Tabs & Grid */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('search_placeholder', 'Search products or variants by name, SKU, or barcode...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-xs uppercase font-bold tracking-wider transition-colors shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs uppercase font-bold tracking-wider transition-colors shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Catalog Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stockQuantity <= 0;
                const hasVariants = p.variants && p.variants.length > 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => handleProductSelect(p)}
                    className={`p-3 bg-white border text-left flex flex-col justify-between space-y-2 transition-all group rounded-none shadow-xs relative ${
                      isOutOfStock
                        ? 'opacity-40 border-slate-200 cursor-not-allowed bg-slate-50'
                        : 'border-slate-200 hover:border-slate-900 hover:shadow-sm'
                    }`}
                  >
                    {/* Variant Count Badge */}
                    {hasVariants && (
                      <span className="absolute top-2 right-2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider shadow-xs flex items-center gap-1 z-10">
                        <Layers className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{p.variants?.length} Variants</span>
                      </span>
                    )}

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
                        {formatCurrency(item.unitPrice, currencySymbol)} × {item.quantity} • {item.sku}
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
                <span>Discount ({currencySymbol}):</span>
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
              <span>Complete Sale &amp; Print Bill</span>
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
                  <th className="p-2.5 text-center">Receipt</th>
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
                          className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white text-[10px] font-bold uppercase transition-colors shadow-2xs flex items-center gap-1 mx-auto"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print</span>
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

      {/* 2. PRODUCT VARIANT SELECTION MODAL */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-mono">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                {variantModalProduct.imageUrl && (
                  <img
                    src={variantModalProduct.imageUrl}
                    alt={variantModalProduct.name}
                    className="w-12 h-12 object-cover border border-slate-200"
                  />
                )}
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 border border-emerald-300 uppercase">
                    Select Product Variant
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">{variantModalProduct.name}</h3>
                  <p className="text-[10px] text-slate-500">Base SKU: {variantModalProduct.sku}</p>
                </div>
              </div>
              <button
                onClick={() => setVariantModalProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Variant Options Cards */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Available Options &amp; Stock Levels
              </label>

              {variantModalProduct.variants?.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const isOutOfStock = v.stockQuantity <= 0;

                return (
                  <div
                    key={v.id}
                    onClick={() => !isOutOfStock && setSelectedVariantId(v.id)}
                    className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-xs ring-1 ring-slate-900'
                        : isOutOfStock
                        ? 'border-slate-200 opacity-40 cursor-not-allowed bg-slate-100'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-slate-900 bg-slate-900' : 'border-slate-400'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <p className="font-bold text-xs text-slate-900">{v.name}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 pl-5.5">
                        <span>SKU: {v.sku}</span>
                        {Object.entries(v.attributes || {}).map(([attrK, attrV]) => (
                          <span
                            key={attrK}
                            className="bg-slate-100 px-1.5 py-0.2 border border-slate-200 text-slate-700"
                          >
                            {attrK}: {attrV}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-xs text-slate-900">
                        {formatCurrency(v.retailPrice || variantModalProduct.retailPrice, currencySymbol)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {v.stockQuantity} in stock
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-700 uppercase">Quantity:</span>
              <div className="flex items-center border border-slate-300 bg-white">
                <button
                  onClick={() => setVariantQty((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 font-bold text-slate-900">{variantQty}</span>
                <button
                  onClick={() => setVariantQty((q) => q + 1)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setVariantModalProduct(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs uppercase hover:bg-slate-200 border border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVariantToCart}
                className="flex-2 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Add Variant to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. LOCAL PRINTER SETUP & BILL MANAGER MODAL */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-mono">
          <div className="bg-white border border-slate-300 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-slate-900" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase">
                    Local Printer &amp; Bill Dispatch
                  </h3>
                  <p className="text-[10px] text-slate-500">Thermal POS / USB / Network Printer Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setIsPrinterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Connection Status Card */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <div>
                    <p className="font-bold text-emerald-950 uppercase text-[11px]">Printer Interface Ready</p>
                    <p className="text-[10px] text-emerald-800">Connected to System Spooler / ESC-POS Output</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5">
                  ONLINE
                </span>
              </div>

              {/* Receipt Paper Format */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Receipt Paper Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '80mm', label: '80mm Thermal', desc: 'Standard POS' },
                    { id: '58mm', label: '58mm Compact', desc: 'Mobile Thermal' },
                    { id: 'A4', label: 'A4 / Letter', desc: 'Full Invoice' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => saveReceiptFormat(fmt.id as any)}
                      className={`p-2.5 text-center border transition-all ${
                        receiptFormat === fmt.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <p className="font-bold text-xs uppercase">{fmt.label}</p>
                      <p className="text-[9px] opacity-75">{fmt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Print Toggle */}
              <div className="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs uppercase">Auto-Print Receipts</p>
                  <p className="text-[10px] text-slate-500">Automatically trigger print dialog when sale completes</p>
                </div>
                <button
                  onClick={() => saveAutoPrint(!autoPrintEnabled)}
                  className={`w-11 h-6 flex items-center px-0.5 transition-colors ${
                    autoPrintEnabled ? 'bg-slate-900' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white shadow-md transform transition-transform ${
                      autoPrintEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Test Print & Close Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={handleTestPrint}
                className="flex-1 py-2.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-800 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                <span>Print Test Bill</span>
              </button>
              <button
                onClick={() => setIsPrinterModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        products={products}
        onSelectProduct={(p) => {
          handleProductSelect(p);
          setIsBarcodeOpen(false);
        }}
      />

      {/* Completed Sale Notification Modal */}
      {completedSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-mono">
          <div className="bg-white border border-slate-300 shadow-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                Transaction Completed
              </span>
              <h3 className="font-bold text-base text-slate-900 uppercase mt-1">Payment Successful</h3>
              <p className="text-xs text-slate-600 font-mono">
                Receipt #{completedSaleModal.saleNumber}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {formatCurrency(completedSaleModal.total, currencySymbol)}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Paid via {completedSaleModal.paymentMethod} • {completedSaleModal.items.length} item(s)
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onPrintReceipt(completedSaleModal);
                  setCompletedSaleModal(null);
                }}
                className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Print Bill</span>
              </button>
              <button
                onClick={() => setCompletedSaleModal(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs uppercase hover:bg-slate-200 border border-slate-300"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
