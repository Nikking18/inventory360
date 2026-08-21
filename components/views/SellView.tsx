'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Sale, SaleItem, Customer, Location, ProductVariant } from '../../lib/types';
import { formatCurrency, formatDateTime, round2 } from '../../lib/utils';
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
  FileText,
  Smartphone,
} from 'lucide-react';
import { BarcodeModal } from '../BarcodeModal';
import { ReceiptPaperFormat } from '../PrintReceipt';

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
  onPrintReceipt: (sale: Sale, format?: ReceiptPaperFormat) => void;
  receiptFormat?: ReceiptPaperFormat;
  onUpdateReceiptFormat?: (fmt: ReceiptPaperFormat) => void;
  activeSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}

interface DisplayGridItem {
  id: string;
  type: 'product' | 'variant';
  product: Product;
  variant?: ProductVariant;
  title: string;
  subtitle?: string;
  sku: string;
  barcode?: string;
  retailPrice: number;
  costPrice: number;
  stockQuantity: number;
  reorderPoint: number;
  imageUrl?: string;
  variantsCount?: number;
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
  receiptFormat = '80mm',
  onUpdateReceiptFormat,
  activeSubTab = 'quick-sale',
  onSubTabChange,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [discountMode, setDiscountMode] = useState<'percent' | 'fixed'>('percent');
  const [discountInput, setDiscountInput] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer'>('Card');
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [completedSaleModal, setCompletedSaleModal] = useState<Sale | null>(null);

  // Variant Selection Modal State
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [variantQty, setVariantQty] = useState<number>(1);

  // Local Printer Settings State
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [autoPrintEnabled, setAutoPrintEnabled] = useState<boolean>(true);
  const [localFormat, setLocalFormat] = useState<ReceiptPaperFormat>(receiptFormat);

  useEffect(() => {
    setLocalFormat(receiptFormat);
  }, [receiptFormat]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAutoPrint = localStorage.getItem('inventory360_autoprint');
      if (savedAutoPrint !== null) {
        setAutoPrintEnabled(savedAutoPrint === 'true');
      }
    }
  }, []);

  const saveAutoPrint = (val: boolean) => {
    setAutoPrintEnabled(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory360_autoprint', String(val));
    }
  };

  const handleFormatSelect = (fmt: ReceiptPaperFormat) => {
    setLocalFormat(fmt);
    if (onUpdateReceiptFormat) {
      onUpdateReceiptFormat(fmt);
    }
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

  // Handle direct addition of a specific variant to cart
  const handleDirectAddVariantToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    const maxStock = variant.stockQuantity > 0 ? variant.stockQuantity : product.stockQuantity;
    if (maxStock <= 0) return;

    const uniqueItemKey = `${product.id}__var_${variant.id}`;
    const variantFullName = `${product.name} (${variant.name})`;
    const itemTaxRate = product.taxRate !== undefined ? product.taxRate : taxRate;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === uniqueItemKey);
      if (existing) {
        const newQty = Math.min(maxStock, existing.quantity + quantity);
        return prev.map((item) =>
          item.productId === uniqueItemKey
            ? { ...item, quantity: newQty, total: round2(newQty * item.unitPrice) }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: uniqueItemKey,
            variantId: variant.id,
            productName: variantFullName,
            sku: variant.sku || product.sku,
            unitPrice: variant.retailPrice || product.retailPrice,
            unitCost: variant.costPrice || product.costPrice,
            quantity: Math.min(maxStock, quantity),
            taxRate: itemTaxRate,
            total: round2((variant.retailPrice || product.retailPrice) * Math.min(maxStock, quantity)),
          },
        ];
      }
    });
  };

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

    const itemTaxRate = product.taxRate !== undefined ? product.taxRate : taxRate;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= maxStock) return prev;
        const newQty = Math.min(maxStock, existing.quantity + quantity);
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, total: round2(newQty * item.unitPrice) }
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
            taxRate: itemTaxRate,
            total: round2(product.retailPrice * Math.min(maxStock, quantity)),
          },
        ];
      }
    });
  };

  // Add chosen variant from modal to cart
  const handleAddVariantFromModal = () => {
    if (!variantModalProduct) return;
    const variant = variantModalProduct.variants?.find((v) => v.id === selectedVariantId);
    if (!variant) return;

    handleDirectAddVariantToCart(variantModalProduct, variant, variantQty);
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
              total: round2(newQty * item.unitPrice),
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
    setDiscountInput('');
  };

  // Calculations (Separating Individual Item Tax from Main Store HST/GST Tax with Precision Rounding)
  const subtotal = useMemo(() => {
    return round2(cart.reduce((acc, item) => acc + item.total, 0));
  }, [cart]);

  const effectiveDiscount = useMemo(() => {
    if (discountInput === '' || isNaN(Number(discountInput))) return 0;
    const val = Math.max(0, Number(discountInput));
    if (discountMode === 'percent') {
      return round2((subtotal * Math.min(100, val)) / 100);
    }
    return round2(Math.min(subtotal, val));
  }, [discountInput, discountMode, subtotal]);

  const discountRatio = subtotal > 0 ? (subtotal - effectiveDiscount) / subtotal : 1;

  // 1. Individual Item-Specific Taxes (Excise / Surcharge / Category Specific Tax on Product)
  const totalItemTax = useMemo(() => {
    const raw = cart.reduce((acc, item) => {
      const itemSpecificRate = item.taxRate !== undefined && !isNaN(item.taxRate) ? item.taxRate : 0;
      const discountedItemTotal = item.total * discountRatio;
      return acc + discountedItemTotal * (itemSpecificRate / 100);
    }, 0);
    return round2(raw);
  }, [cart, discountRatio]);

  // Breakdown of items with individual taxes
  const itemTaxBreakdown = useMemo(() => {
    const map = new Map<number, number>();
    cart.forEach((item) => {
      if (item.taxRate !== undefined && item.taxRate > 0) {
        const discountedItemTotal = item.total * discountRatio;
        const taxVal = discountedItemTotal * (item.taxRate / 100);
        map.set(item.taxRate, (map.get(item.taxRate) || 0) + taxVal);
      }
    });
    return Array.from(map.entries()).map(([rate, amount]) => ({ rate, amount: round2(amount) }));
  }, [cart, discountRatio]);

  // 2. Main Store HST / GST / Sales Tax (Base tax rate applied across taxable net subtotal)
  const mainHSTGSTTax = useMemo(() => {
    const taxableSubtotal = Math.max(0, subtotal - effectiveDiscount);
    const storeTaxRate = taxRate !== undefined && !isNaN(taxRate) ? taxRate : 0;
    return round2(taxableSubtotal * (storeTaxRate / 100));
  }, [subtotal, effectiveDiscount, taxRate]);

  // 3. Combined Total Taxes
  const calculatedTax = round2(totalItemTax + mainHSTGSTTax);

  const total = round2(Math.max(0, subtotal - effectiveDiscount) + calculatedTax);
  const totalCOGS = round2(cart.reduce((acc, item) => acc + item.quantity * item.unitCost, 0));
  const grossProfit = round2(Math.max(0, subtotal - effectiveDiscount) - totalCOGS);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const customerObj = customers.find((c) => c.id === selectedCustomer);

    const saleRecord: Omit<Sale, 'id' | 'saleNumber' | 'createdAt'> = {
      items: cart,
      subtotal,
      discount: effectiveDiscount,
      itemTax: totalItemTax,
      mainTax: mainHSTGSTTax,
      mainTaxRate: taxRate,
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

  const handleTestPrint = () => {
    const previewSale: Sale = {
      id: 'receipt_preview',
      saleNumber: `REC-${Date.now().toString().slice(-4)}`,
      items: [
        { productId: 'prod_mx3s', productName: 'Pro Wireless Mouse (Mac Edition)', sku: 'LOG-MX3S-MAC', unitPrice: 109.99, unitCost: 62.00, quantity: 1, total: 109.99 },
        { productId: 'prod_thm', productName: 'Thermal Receipt Paper Roll 80mm', sku: 'THM-80MM-05', unitPrice: 4.50, unitCost: 1.20, quantity: 3, total: 13.50 },
      ],
      subtotal: 123.49,
      tax: 10.50,
      discount: 5.00,
      total: 128.99,
      costOfGoodsSold: 65.60,
      grossProfit: 63.39,
      paymentMethod: 'Card',
      status: 'Completed',
      locationId: currentLocation?.id || 'loc_1',
      locationName: currentLocation?.name || 'Main Flagship',
      customerName: 'Commercial Buyer',
      channel: 'In-Store POS',
      createdAt: new Date().toISOString(),
    };
    onPrintReceipt(previewSale, localFormat);
  };

  // SMART SEARCH & GRID ITEM GENERATION (Handles Parent Products AND Variant SKUs)
  const displayItems = useMemo<DisplayGridItem[]>(() => {
    const searchLower = search.trim().toLowerCase();
    const items: DisplayGridItem[] = [];

    products.forEach((p) => {
      const matchesCategory = selectedCategory === 'all' || p.categoryName === selectedCategory;
      if (!matchesCategory) return;

      const hasVariants = p.variants && p.variants.length > 0;

      if (!searchLower) {
        // When no search query, display the standard product cards (with variant counts)
        items.push({
          id: p.id,
          type: 'product',
          product: p,
          title: p.name,
          sku: p.sku,
          barcode: p.barcode,
          retailPrice: p.retailPrice,
          costPrice: p.costPrice,
          stockQuantity: p.stockQuantity,
          reorderPoint: p.reorderPoint,
          imageUrl: p.imageUrl,
          variantsCount: hasVariants ? p.variants?.length : 0,
        });
      } else {
        // When searching, check if specific variants match SKU, Barcode, or Name
        let matchedSpecificVariant = false;

        if (hasVariants && p.variants) {
          p.variants.forEach((v) => {
            const variantSkuMatch = v.sku && v.sku.toLowerCase().includes(searchLower);
            const variantBarcodeMatch = v.barcode && v.barcode.toLowerCase().includes(searchLower);
            const variantNameMatch = v.name && v.name.toLowerCase().includes(searchLower);

            if (variantSkuMatch || variantBarcodeMatch || variantNameMatch) {
              matchedSpecificVariant = true;
              items.push({
                id: `${p.id}_var_${v.id}`,
                type: 'variant',
                product: p,
                variant: v,
                title: `${p.name}`,
                subtitle: v.name,
                sku: v.sku,
                barcode: v.barcode,
                retailPrice: v.retailPrice || p.retailPrice,
                costPrice: v.costPrice || p.costPrice,
                stockQuantity: v.stockQuantity,
                reorderPoint: p.reorderPoint,
                imageUrl: p.imageUrl,
              });
            }
          });
        }

        // Check if the parent product name, main SKU, or main barcode matches
        const parentNameMatch = (p.name || '').toLowerCase().includes(searchLower);
        const parentSkuMatch = (p.sku || '').toLowerCase().includes(searchLower);
        const parentBarcodeMatch = (p.barcode || '').toLowerCase().includes(searchLower);

        if (parentNameMatch || parentSkuMatch || parentBarcodeMatch) {
          // If we haven't already emitted specific variants or if the parent product was specifically searched
          if (!matchedSpecificVariant || parentNameMatch) {
            items.push({
              id: p.id,
              type: 'product',
              product: p,
              title: p.name,
              sku: p.sku,
              barcode: p.barcode,
              retailPrice: p.retailPrice,
              costPrice: p.costPrice,
              stockQuantity: p.stockQuantity,
              reorderPoint: p.reorderPoint,
              imageUrl: p.imageUrl,
              variantsCount: hasVariants ? p.variants?.length : 0,
            });
          }
        }
      }
    });

    return items;
  }, [products, search, selectedCategory]);

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

        {/* Local Printer Connection & Barcode Scanner */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPrinterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
            title="Configure Local POS Thermal & Bill Printer"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('printer', 'Printer')} ({localFormat.toUpperCase()})</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </button>

          <button
            onClick={() => setIsBarcodeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <Barcode className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('barcode_scan', 'Camera Scanner')}</span>
          </button>
        </div>
      </div>

      {/* QUICK SALE POS TERMINAL */}
      {activeSubTab === 'quick-sale' && (
        <div id="tour-pos-terminal" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Search, Category Tabs & Grid */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search Bar with Variant SKU detection */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('search_placeholder', 'Search products, single variant SKUs (e.g. LOG-MX3S-MAC, KEY-K2-RED)...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
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

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 text-xs uppercase font-bold tracking-wider transition-colors shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t('all_categories', 'All Categories')}
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
              {displayItems.length === 0 ? (
                <div className="col-span-3 p-10 text-center border border-dashed border-slate-300 space-y-2 bg-white">
                  <Search className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 uppercase">{t('no_matching_products', 'No Matching Products or Variant SKUs')}</p>
                  <p className="text-[11px] text-slate-500">{t('search_hint', 'Try searching with a different product name, base SKU, or specific variant code.')}</p>
                </div>
              ) : (
                displayItems.map((item) => {
                  const isOutOfStock = item.stockQuantity <= 0;
                  const isVariantCard = item.type === 'variant';

                  return (
                    <button
                      key={item.id}
                      disabled={isOutOfStock}
                      onClick={() => {
                        if (isVariantCard && item.variant) {
                          handleDirectAddVariantToCart(item.product, item.variant);
                        } else {
                          handleProductSelect(item.product);
                        }
                      }}
                      className={`p-3 bg-white border text-left flex flex-col justify-between space-y-2 transition-all group rounded-none shadow-xs relative ${
                        isOutOfStock
                          ? 'opacity-40 border-slate-200 cursor-not-allowed bg-slate-50'
                          : isVariantCard
                          ? 'border-emerald-300 hover:border-slate-900 bg-emerald-50/20 hover:shadow-sm'
                          : 'border-slate-200 hover:border-slate-900 hover:shadow-sm'
                      }`}
                    >
                      {/* Top Badges */}
                      {isVariantCard && (
                        <span className="absolute top-2 right-2 bg-emerald-800 text-white text-[8px] font-bold px-1.5 py-0.2 uppercase tracking-wider shadow-xs flex items-center gap-1 z-10">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{t('variant', 'Variant')}</span>
                        </span>
                      )}

                      {!isVariantCard && (item.variantsCount || 0) > 0 && (
                        <span className="absolute top-2 right-2 bg-slate-900 text-white text-[8.5px] font-bold px-1.5 py-0.5 uppercase tracking-wider shadow-xs flex items-center gap-1 z-10">
                          <Layers className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{item.variantsCount} {t('variants', 'Variants')}</span>
                        </span>
                      )}

                      <div className="space-y-1">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-20 object-cover border border-slate-200 mb-1"
                          />
                        )}
                        <p className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.2 border border-emerald-200 inline-block">
                            {item.subtitle}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500 font-mono">
                          SKU: {item.sku}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 w-full text-xs">
                        <span className="font-bold text-slate-900">
                          {formatCurrency(item.retailPrice, currencySymbol)}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                            item.stockQuantity <= item.reorderPoint
                              ? 'text-amber-800 border-amber-300 bg-amber-50'
                              : 'text-slate-600 border-slate-200 bg-slate-50'
                          }`}
                        >
                          {item.stockQuantity} Left
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active POS Cart & Checkout Terminal */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-slate-900" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t('active_cart', 'Active Cart')} ({cart.reduce((acc, i) => acc + i.quantity, 0)} {t('items', 'Items')})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[10px] uppercase font-bold text-rose-700 hover:underline"
                >
                  {t('clear_cart', 'Clear Cart')}
                </button>
              )}
            </div>

            {/* Customer Attachment Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" />
                <span>{t('customer', 'Attach Customer')}</span>
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              >
                <option value="">{t('walk_in_customer', 'Walk-in Customer (General Checkout)')}</option>
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
                    {t('cart_empty', 'Cart is currently empty. Click products, variants, or scan barcodes to begin checkout.')}
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const hasItemTax = item.taxRate !== undefined && !isNaN(item.taxRate);
                  const itemSpecificTaxRate = hasItemTax ? item.taxRate! : 0;
                  const itemDiscountedTotal = item.total * discountRatio;
                  const itemTaxAmount = round2(itemDiscountedTotal * (itemSpecificTaxRate / 100));

                  return (
                    <div
                      key={item.productId}
                      className="p-2.5 bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                          {hasItemTax && item.taxRate! > 0 ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 border uppercase bg-indigo-50 text-indigo-800 border-indigo-300">
                              {item.taxRate}% {t('item_tax', 'Item Tax')}
                            </span>
                          ) : hasItemTax && item.taxRate === 0 ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 border uppercase bg-emerald-50 text-emerald-800 border-emerald-300">
                              0% {t('exempt', 'Tax Exempt')}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {formatCurrency(item.unitPrice, currencySymbol)} × {item.quantity} • {item.sku}
                          {hasItemTax && item.taxRate! > 0 && (
                            <span className="ml-1 text-indigo-700 font-semibold font-mono">
                              ({t('item_tax', 'Item Tax')}: +{formatCurrency(itemTaxAmount, currencySymbol)})
                            </span>
                          )}
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
                  );
                })
              )}
            </div>

            {/* Calculations Summary */}
            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>{t('subtotal', 'Subtotal')}:</span>
                <span>{formatCurrency(subtotal, currencySymbol)}</span>
              </div>

              {/* Cashier Custom Discounts Control */}
              <div className="p-2 bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase text-[10px] text-slate-700">{t('custom_discount', 'Cashier Discount')}:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDiscountMode('percent')}
                      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                        discountMode === 'percent'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      % Percent
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMode('fixed')}
                      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                        discountMode === 'fixed'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {currencySymbol} Flat
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max={discountMode === 'percent' ? 100 : subtotal}
                      step={discountMode === 'percent' ? '1' : '0.5'}
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      placeholder={discountMode === 'percent' ? 'Enter % (e.g. 10)' : `Enter ${currencySymbol} (e.g. 5.00)`}
                      className="w-full text-right bg-white border border-slate-300 p-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  {effectiveDiscount > 0 && (
                    <span className="font-bold text-emerald-700 shrink-0 text-[11px]">
                      -{formatCurrency(effectiveDiscount, currencySymbol)}
                    </span>
                  )}
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {[5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setDiscountMode('percent');
                        setDiscountInput(pct);
                      }}
                      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border transition-colors ${
                        discountMode === 'percent' && (discountInput === pct || discountInput === String(pct))
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {pct}% Off
                    </button>
                  ))}
                  {discountInput !== '' && (
                    <button
                      type="button"
                      onClick={() => setDiscountInput('')}
                      className="px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-600 hover:underline"
                    >
                      {t('clear_cart', 'Clear')}
                    </button>
                  )}
                </div>
              </div>

              {/* Individual Item Tax (if any items have custom item tax) */}
              {totalItemTax > 0 && (
                <div className="space-y-1 bg-indigo-50/70 border border-indigo-200 p-1.5 rounded-xs">
                  <div className="flex justify-between text-indigo-900 font-semibold">
                    <span>{t('item_tax', 'Individual Item Taxes')}:</span>
                    <span>+{formatCurrency(totalItemTax, currencySymbol)}</span>
                  </div>
                  {itemTaxBreakdown.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 justify-end">
                      {itemTaxBreakdown.map((tItem) => (
                        <span
                          key={tItem.rate}
                          className="text-[9px] bg-white border border-indigo-300 px-1 py-0.2 text-indigo-800 font-mono"
                        >
                          {tItem.rate}% {t('item_tax', 'Tax')}: {formatCurrency(tItem.amount, currencySymbol)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Main Store HST / GST Tax */}
              <div className="flex justify-between text-slate-600">
                <span>{t('main_tax', 'Main Store Tax')} ({taxRate}%):</span>
                <span>+{formatCurrency(mainHSTGSTTax, currencySymbol)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>{t('total', 'Total Due')}:</span>
                <span>{formatCurrency(total, currencySymbol)}</span>
              </div>
            </div>

            {/* Payment Method Pills */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                {t('payment_method', 'Payment Method')}
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
                    {method === 'Card' ? t('card', 'Card') : method === 'Cash' ? t('cash', 'Cash') : t('bank_transfer', 'Bank Transfer')}
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
              <span>{t('complete_sale', 'Complete Sale & Print Bill')}</span>
            </button>
          </div>
        </div>
      )}

      {/* SALES HISTORY SUB-TAB */}
      {activeSubTab === 'sales-history' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              {t('sales_history_title', 'Completed POS Transactions')} ({sales.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">{t('th_tx_id', 'Sale #')}</th>
                  <th className="p-2.5">{t('th_timestamp', 'Date & Time')}</th>
                  <th className="p-2.5">{t('customer', 'Customer')}</th>
                  <th className="p-2.5">{t('th_location', 'Location')}</th>
                  <th className="p-2.5">{t('th_method', 'Payment')}</th>
                  <th className="p-2.5 text-right">{t('items', 'Items')}</th>
                  <th className="p-2.5 text-right">{t('total', 'Total')}</th>
                  <th className="p-2.5 text-center">{t('status', 'Status')}</th>
                  <th className="p-2.5 text-center">{t('receipt', 'Receipt')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                      {t('no_sales', 'No sales recorded in the system yet.')}
                    </td>
                  </tr>
                ) : (
                  sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900">{s.saleNumber}</td>
                      <td className="p-2.5 text-slate-600">{formatDateTime(s.createdAt)}</td>
                      <td className="p-2.5 text-slate-800 font-semibold">{s.customerName || t('walk_in_customer', 'Walk-in')}</td>
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
                          onClick={() => onPrintReceipt(s, localFormat)}
                          className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white text-[10px] font-bold uppercase transition-colors shadow-2xs flex items-center gap-1 mx-auto"
                        >
                          <Printer className="w-3 h-3" />
                          <span>{t('print_receipt', 'Print')} ({localFormat})</span>
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
              {t('returns_refunds_title', 'Returns & Refund Processing')}
            </h3>
            <p className="text-xs text-slate-600">
              {t('returns', 'Refunding a transaction automatically returns stock to the active location inventory ledger.')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">{t('th_tx_id', 'Sale #')}</th>
                  <th className="p-2.5">{t('date', 'Date')}</th>
                  <th className="p-2.5">{t('customer', 'Customer')}</th>
                  <th className="p-2.5 text-right">{t('total', 'Total')}</th>
                  <th className="p-2.5 text-center">{t('status', 'Status')}</th>
                  <th className="p-2.5 text-center">{t('actions', 'Refund Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{s.saleNumber}</td>
                    <td className="p-2.5 text-slate-600">{formatDateTime(s.createdAt)}</td>
                    <td className="p-2.5 text-slate-800">{s.customerName || t('walk_in_customer', 'Walk-in')}</td>
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
                          {t('process_refund', 'Process Refund')}
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
                    {t('select_variant', 'Select Product Variant')}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">{variantModalProduct.name}</h3>
                  <p className="text-[10px] text-slate-500">{t('base_sku', 'Base SKU')}: {variantModalProduct.sku}</p>
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
                {t('available_options_stock', 'Available Options & Stock Levels')}
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
                        {v.stockQuantity} {t('in_stock_label', 'in stock')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-700 uppercase">{t('order_quantity', 'Quantity')}:</span>
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
                {t('cancel', 'Cancel')}
              </button>
              <button
                onClick={handleAddVariantFromModal}
                className="flex-2 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black flex items-center justify-center gap-1.5 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>{t('add_to_cart', 'Add Variant to Cart')}</span>
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
                  <p className="text-[10px] text-slate-500">Receipt Paper Formats &amp; Thermal Output</p>
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
                    <p className="text-[10px] text-emerald-800">Direct Browser &amp; Local Hardware Spooler</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5">
                  ONLINE
                </span>
              </div>

              {/* 3 Supported Receipt Paper Formats */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  {t('select_receipt_format', 'Select Receipt Paper Format')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '80mm' as const, label: t('format_80mm_title', '80mm Thermal'), desc: t('format_80mm_short_desc', 'Standard POS'), icon: Printer },
                    { id: '58mm' as const, label: t('format_58mm_title', '58mm Compact'), desc: t('format_58mm_short_desc', 'Mobile Thermal'), icon: Smartphone },
                    { id: 'A4' as const, label: t('format_a4_title', 'A4 / Letter'), desc: t('format_a4_short_desc', 'Full Invoice'), icon: FileText },
                  ].map((fmt) => {
                    const Icon = fmt.icon;
                    const isSelected = localFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => handleFormatSelect(fmt.id)}
                        className={`p-3 text-center border transition-all flex flex-col items-center justify-between min-h-[90px] ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs ring-1 ring-slate-900'
                            : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <div>
                          <p className="font-bold text-[11px] uppercase leading-tight">{fmt.label}</p>
                          <p className="text-[8.5px] opacity-75 mt-0.5">{fmt.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="mt-1 flex items-center gap-0.5 text-[8px] font-bold text-emerald-400 uppercase">
                            <Check className="w-2.5 h-2.5" />
                            <span>{t('active_badge', 'Active')}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-Print Toggle */}
              <div className="p-3 border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-xs uppercase">{t('auto_print_receipts', 'Auto-Print Receipts')}</p>
                  <p className="text-[10px] text-slate-500">{t('auto_print_desc', 'Automatically trigger print dialog when sale completes')}</p>
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
                <span>{t('print_test_btn', 'Print Test')} ({localFormat})</span>
              </button>
              <button
                onClick={() => setIsPrinterModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black transition-colors"
              >
                {t('done', 'Done')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal with Direct Variant & Product Support */}
      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        products={products}
        onSelectProduct={(product, variant) => {
          if (variant) {
            handleDirectAddVariantToCart(product, variant);
          } else {
            handleProductSelect(product);
          }
          setIsBarcodeOpen(false);
        }}
      />

      {/* Completed Sale & Multi-Format Printer Dispatch Modal */}
      {completedSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-mono">
          <div className="bg-white border border-slate-300 shadow-2xl p-6 max-w-lg w-full space-y-5">
            {/* Success Header */}
            <div className="text-center space-y-2 border-b border-slate-200 pb-4">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-300">
                  {t('sale_recorded_successfully', 'Sale Recorded Successfully')}
                </span>
                <h3 className="font-bold text-base text-slate-900 uppercase mt-1">
                  {t('receipt_hash', 'Receipt #')}#{completedSaleModal.saleNumber}
                </h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(completedSaleModal.total, currencySymbol)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('paid_via', 'Paid via')} {completedSaleModal.paymentMethod} • {completedSaleModal.items.length} {t('line_items', 'line item(s)')}
                </p>
              </div>
            </div>

            {/* Select Print Style for Connected Printer */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Printer className="w-3.5 h-3.5 text-slate-900" />
                  <span>{t('select_printer_format', 'Select Printer Format to Print:')}</span>
                </label>
                <span className="text-[10px] text-slate-500">{t('one_click_dispatch', '1-Click Dispatch')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. 80mm Standard Thermal */}
                <div
                  onClick={() => handleFormatSelect('80mm')}
                  className={`p-3 border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    localFormat === '80mm'
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Printer className="w-4 h-4 text-emerald-600" />
                      {localFormat === '80mm' && (
                        <span className="text-[8px] font-bold uppercase bg-slate-900 text-white px-1.5 py-0.2">
                          {t('active_badge', 'Active')}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-xs text-slate-900 uppercase mt-1.5">{t('format_80mm_title', '80mm Thermal')}</p>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                      {t('format_80mm_desc', 'Standard POS roll for Epson, Star, Munbyn')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFormatSelect('80mm');
                      onPrintReceipt(completedSaleModal, '80mm');
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    {t('print_80mm_btn', 'Print 80mm')}
                  </button>
                </div>

                {/* 2. 58mm Mobile Thermal */}
                <div
                  onClick={() => handleFormatSelect('58mm')}
                  className={`p-3 border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    localFormat === '58mm'
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      {localFormat === '58mm' && (
                        <span className="text-[8px] font-bold uppercase bg-slate-900 text-white px-1.5 py-0.2">
                          {t('active_badge', 'Active')}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-xs text-slate-900 uppercase mt-1.5">{t('format_58mm_title', '58mm Compact')}</p>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                      {t('format_58mm_desc', 'Narrow slip for Mobile Bluetooth & Handheld')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFormatSelect('58mm');
                      onPrintReceipt(completedSaleModal, '58mm');
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    {t('print_58mm_btn', 'Print 58mm')}
                  </button>
                </div>

                {/* 3. A4 Full Tax Invoice */}
                <div
                  onClick={() => handleFormatSelect('A4')}
                  className={`p-3 border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    localFormat === 'A4'
                      ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <FileText className="w-4 h-4 text-amber-600" />
                      {localFormat === 'A4' && (
                        <span className="text-[8px] font-bold uppercase bg-slate-900 text-white px-1.5 py-0.2">
                          {t('active_badge', 'Active')}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-xs text-slate-900 uppercase mt-1.5">{t('format_a4_title', 'A4 / Letter')}</p>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                      {t('format_a4_desc', 'Full page tax invoice bill for Laser/Inkjet')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFormatSelect('A4');
                      onPrintReceipt(completedSaleModal, 'A4');
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    {t('print_a4_btn', 'Print A4 Bill')}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setCompletedSaleModal(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-800 font-bold text-xs uppercase hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                {t('start_new_sale', 'Start New Sale')}
              </button>
              <button
                onClick={() => {
                  onPrintReceipt(completedSaleModal, localFormat);
                  setCompletedSaleModal(null);
                }}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('print_btn', 'Print')} ({localFormat}) &amp; {t('done', 'Done')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
