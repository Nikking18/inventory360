'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Category, Supplier, Location, ProductVariant } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { LabelPrintModal } from '../LabelPrintModal';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  Tag,
  Truck,
  Printer,
  ChevronDown,
  ChevronRight,
  Layers,
  Calendar,
  ShieldCheck,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  locations: Location[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  currencySymbol: string;
  activeSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  suppliers,
  locations,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  currencySymbol,
  activeSubTab = 'products',
  onSubTabChange,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Print Label Modal State
  const [labelModalProduct, setLabelModalProduct] = useState<Product | null>(null);
  const [labelModalVariant, setLabelModalVariant] = useState<ProductVariant | null>(null);

  // Expanded Variant Rows
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});

  // Active Tab in Product Form Modal
  const [modalFormTab, setModalFormTab] = useState<'basic' | 'variants' | 'custom-fields' | 'lots'>('basic');

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [reorderPoint, setReorderPoint] = useState<number>(10);
  const [supplierId, setSupplierId] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Variants & Custom Fields State in Form
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  // Lot & Expiry Form State
  const [lotNumber, setLotNumber] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setFormError(null);
    setModalFormTab('basic');
    setName('');
    setSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
    setBarcode(`${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setCostPrice(20);
    setRetailPrice(39.99);
    setStockQuantity(25);
    setReorderPoint(10);
    setSupplierId(suppliers[0]?.id || '');
    setImageUrl('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80');
    setVariants([]);
    setCustomFields({ Material: 'Standard Grade', Warranty: '1 Year Limited' });
    setLotNumber(`LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setBatchNumber(`B-${Math.floor(10 + Math.random() * 90)}`);
    setSerialNumber('');
    setExpirationDate(new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormError(null);
    setModalFormTab('basic');
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode);
    setDescription(p.description);
    setCategoryId(p.categoryId);
    setCostPrice(p.costPrice);
    setRetailPrice(p.retailPrice);
    setStockQuantity(p.stockQuantity);
    setReorderPoint(p.reorderPoint);
    setSupplierId(p.supplierId);
    setImageUrl(p.imageUrl || '');
    setVariants(p.variants || []);
    setCustomFields(p.customFields || {});
    setLotNumber(p.lotNumber || '');
    setBatchNumber(p.batchNumber || '');
    setSerialNumber(p.serialNumber || '');
    setExpirationDate(p.expirationDate ? p.expirationDate.split('T')[0] : '');
    setIsModalOpen(true);
  };

  // Add Variant Handler
  const handleAddVariant = () => {
    const newVar: ProductVariant = {
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: 'Size L / Black',
      sku: `${sku || 'SKU'}-VAR-${variants.length + 1}`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      costPrice: costPrice,
      retailPrice: retailPrice,
      stockQuantity: 10,
      attributes: { Size: 'L', Color: 'Black' },
    };
    setVariants([...variants, newVar]);
  };

  const handleUpdateVariant = (index: number, updated: Partial<ProductVariant>) => {
    const next = [...variants];
    next[index] = { ...next[index], ...updated };
    setVariants(next);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Custom Fields Handler
  const handleAddCustomField = () => {
    if (!newFieldKey.trim()) return;
    setCustomFields({ ...customFields, [newFieldKey.trim()]: newFieldValue.trim() });
    setNewFieldKey('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (key: string) => {
    const next = { ...customFields };
    delete next[key];
    setCustomFields(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate SKU uniqueness
    const isSkuDuplicate = products.some(
      (p) => p.id !== editingProduct?.id && p.sku.trim().toLowerCase() === sku.trim().toLowerCase()
    );
    if (isSkuDuplicate) {
      setFormError(`Product SKU "${sku}" already exists. Please specify a unique SKU.`);
      return;
    }

    // Validate Barcode uniqueness
    const isBarcodeDuplicate =
      barcode.trim() !== '' &&
      products.some(
        (p) => p.id !== editingProduct?.id && p.barcode?.trim().toLowerCase() === barcode.trim().toLowerCase()
      );
    if (isBarcodeDuplicate) {
      setFormError(`Product Barcode "${barcode}" already exists. Please specify a unique barcode.`);
      return;
    }

    const catObj = categories.find((c) => c.id === categoryId);
    const supObj = suppliers.find((s) => s.id === supplierId);

    const cleanCost = Math.max(0, Number(costPrice) || 0);
    const cleanRetail = Math.max(0, Number(retailPrice) || 0);
    const cleanStock = Math.max(0, Math.floor(Number(stockQuantity) || 0));
    const cleanReorder = Math.max(0, Math.floor(Number(reorderPoint) || 0));

    const payload = {
      name: name.trim(),
      sku: sku.trim(),
      barcode: barcode.trim(),
      description: description.trim(),
      categoryId,
      categoryName: catObj?.name || 'General',
      costPrice: cleanCost,
      retailPrice: cleanRetail,
      stockQuantity: cleanStock,
      reorderPoint: cleanReorder,
      supplierId,
      supplierName: supObj?.name || 'Primary Supplier',
      imageUrl,
      locationQuantities: editingProduct?.locationQuantities || {
        [locations[0]?.id || 'loc_downtown']: cleanStock,
      },
      locationReorderPoints: editingProduct?.locationReorderPoints || {},
      variants: variants.length > 0 ? variants : undefined,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      lotNumber: lotNumber.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      expirationDate: expirationDate ? new Date(expirationDate).toISOString() : undefined,
      lastSoldAt: editingProduct?.lastSoldAt,
      status:
        cleanStock === 0
          ? ('Out of Stock' as const)
          : cleanStock <= cleanReorder
          ? ('Low Stock' as const)
          : ('Healthy' as const),
    };

    if (editingProduct) {
      await onUpdateProduct({ ...editingProduct, ...payload });
    } else {
      await onAddProduct(payload);
    }
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
      (p.lotNumber && p.lotNumber.toLowerCase().includes(search.toLowerCase())) ||
      (p.variants && p.variants.some((v) => v.sku.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-neutral-200 font-mono">
      {/* View Header with Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => onSubTabChange && onSubTabChange('products')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'products' ? 'text-white font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('products', 'Master Product Catalog')} ({products.length})
            {activeSubTab === 'products' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('categories')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'categories' ? 'text-white font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('categories', 'Categories')} ({categories.length})
            {activeSubTab === 'categories' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('suppliers')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'suppliers' ? 'text-white font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('suppliers', 'Suppliers')} ({suppliers.length})
            {activeSubTab === 'suppliers' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
        </div>

        {activeSubTab === 'products' && (
          <button
            onClick={openNewProduct}
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-none flex items-center gap-2 uppercase tracking-wider transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('new_product', '+ Add Master Product')}</span>
          </button>
        )}
      </div>

      {activeSubTab === 'products' && (
        <div id="tour-catalog-table" className="bg-neutral-900 border border-neutral-800 rounded-none p-5 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search name, SKU, barcode, lot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-none pl-9 pr-3 py-2 focus:outline-none focus:border-white font-mono"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{t('category', 'Category')}:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-neutral-950 border border-neutral-800 text-white rounded-none px-3 py-2 font-mono"
              >
                <option value="all">{t('all_categories', 'All Categories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Master Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 font-bold uppercase text-[10px] tracking-widest">
                  <th className="py-2.5 px-3">Product / Variants</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Lot &amp; Expiry</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-right">Retail</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                  <th className="py-2.5 px-3 text-right">Stock</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-500">
                      <Package className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                      <p className="font-bold text-neutral-400 uppercase text-xs tracking-wider">
                        {search.trim() ? `No catalog products match "${search}"` : 'No Catalog Products Registered'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const marginPercent =
                      p.retailPrice > 0
                        ? (((p.retailPrice - p.costPrice) / p.retailPrice) * 100).toFixed(1)
                        : '0.0';
                    const hasVariants = p.variants && p.variants.length > 0;
                    const isExpanded = Boolean(expandedProductIds[p.id]);

                    return (
                      <React.Fragment key={p.id}>
                        <tr className="hover:bg-neutral-950/60 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              {hasVariants && (
                                <button
                                  onClick={() => toggleExpand(p.id)}
                                  className="p-1 text-neutral-400 hover:text-white"
                                  title="Expand Variants"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-white" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}

                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-8 h-8 rounded-none object-cover border border-neutral-800 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-none bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-500 shrink-0">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}

                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-white">{p.name}</p>
                                  {hasVariants && (
                                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 border border-emerald-800 uppercase">
                                      {p.variants?.length} Variants
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-neutral-500 font-mono">
                                  SKU: {p.sku} | BAR: {p.barcode}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-neutral-300">{p.categoryName}</td>

                          <td className="py-3 px-3 text-[11px] text-neutral-400">
                            {p.lotNumber ? (
                              <div>
                                <span className="text-white font-mono">{p.lotNumber}</span>
                                {p.expirationDate && (
                                  <p className="text-[9px] text-neutral-500">
                                    Exp: {p.expirationDate.split('T')[0]}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-neutral-600">—</span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right text-neutral-400 font-mono">
                            {formatCurrency(p.costPrice, currencySymbol)}
                          </td>

                          <td className="py-3 px-3 text-right font-bold text-white font-mono">
                            {formatCurrency(p.retailPrice, currencySymbol)}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-emerald-400">
                            {marginPercent}%
                          </td>

                          <td className="py-3 px-3 text-right font-bold font-mono text-white">
                            {p.stockQuantity}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${
                                p.status === 'Healthy'
                                  ? 'border-emerald-800 text-emerald-400 bg-emerald-950/60'
                                  : p.status === 'Low Stock'
                                  ? 'border-amber-900/60 text-amber-400 bg-amber-950/60'
                                  : p.status === 'Out of Stock'
                                  ? 'border-rose-900/60 text-rose-400 bg-rose-950/60'
                                  : 'border-neutral-700 text-neutral-400 bg-neutral-900'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setLabelModalProduct(p);
                                  setLabelModalVariant(null);
                                }}
                                title="Print Barcode &amp; QR Labels"
                                className="p-1 text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-white transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => openEditProduct(p)}
                                title="Edit Product &amp; Variants"
                                className="p-1 text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-white transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => onDeleteProduct(p.id)}
                                title="Delete Product"
                                className="p-1 text-neutral-400 hover:text-rose-400 bg-neutral-950 border border-neutral-800 hover:border-rose-800 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Nested Variant Rows */}
                        {hasVariants &&
                          isExpanded &&
                          p.variants?.map((v) => (
                            <tr
                              key={v.id}
                              className="bg-neutral-950/90 border-t border-neutral-800/40 text-neutral-300"
                            >
                              <td className="py-2.5 px-3 pl-12">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <div>
                                    <p className="font-bold text-white text-xs">{v.name}</p>
                                    <p className="text-[10px] text-neutral-500 font-mono">
                                      SKU: {v.sku} | BAR: {v.barcode}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-neutral-500">Variant Option</td>
                              <td className="py-2.5 px-3 text-[10px] text-neutral-500">
                                {Object.entries(v.attributes || {})
                                  .map(([k, val]) => `${k}: ${val}`)
                                  .join(' • ')}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-neutral-400">
                                {formatCurrency(v.costPrice, currencySymbol)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                {formatCurrency(v.retailPrice, currencySymbol)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                                {(((v.retailPrice - v.costPrice) / v.retailPrice) * 100).toFixed(1)}%
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                {v.stockQuantity}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className="text-[9px] font-bold text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.2 uppercase">
                                  Active Variant
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setLabelModalProduct(p);
                                    setLabelModalVariant(v);
                                  }}
                                  title="Print Variant Label"
                                  className="p-1 text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 text-[10px] inline-flex items-center gap-1"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Print</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Product Create / Edit with Variants & Custom Fields */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'EDIT MASTER PRODUCT RECORD' : 'CREATE MASTER PRODUCT RECORD'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-neutral-200">
          {formError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold uppercase">
              {formError}
            </div>
          )}

          {/* Form Tabs */}
          <div className="flex border-b border-neutral-800 gap-2 pb-1">
            <button
              type="button"
              onClick={() => setModalFormTab('basic')}
              className={`px-3 py-1.5 uppercase font-bold text-xs ${
                modalFormTab === 'basic' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              1. Basic Information
            </button>
            <button
              type="button"
              onClick={() => setModalFormTab('variants')}
              className={`px-3 py-1.5 uppercase font-bold text-xs flex items-center gap-1.5 ${
                modalFormTab === 'variants' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Product Variants ({variants.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setModalFormTab('custom-fields')}
              className={`px-3 py-1.5 uppercase font-bold text-xs ${
                modalFormTab === 'custom-fields' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              3. Custom Attributes ({Object.keys(customFields).length})
            </button>
            <button
              type="button"
              onClick={() => setModalFormTab('lots')}
              className={`px-3 py-1.5 uppercase font-bold text-xs ${
                modalFormTab === 'lots' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              4. Lot &amp; Expiration
            </button>
          </div>

          {/* TAB 1: BASIC INFO */}
          {modalFormTab === 'basic' && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ergonomic Mechanical Keyboard"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Master SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Barcode / EAN-13 *
                  </label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Retail Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Total Stock Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Reorder Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  Primary Supplier
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Lead: {s.leadTimeDays}d)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT VARIANTS */}
          {modalFormTab === 'variants' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Product Variant Options</h4>
                  <p className="text-[10px] text-neutral-400">
                    Group sizes, colors, and materials under this parent item with custom SKUs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 bg-white text-black font-bold uppercase text-[10px] hover:bg-neutral-200 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Variant</span>
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="p-8 text-center bg-neutral-950 border border-neutral-800 text-neutral-500 space-y-2">
                  <Layers className="w-6 h-6 mx-auto text-neutral-600" />
                  <p>No variants configured. Product will be treated as a single standard item.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {variants.map((v, i) => (
                    <div key={v.id} className="p-3 bg-neutral-950 border border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase">
                          Variant #{i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(i)}
                          className="text-neutral-500 hover:text-rose-400 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] text-neutral-400 uppercase">Option Name</label>
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => handleUpdateVariant(i, { name: e.target.value })}
                            placeholder="e.g. XL / Emerald Green"
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-1.5 text-xs focus:border-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-neutral-400 uppercase">Variant SKU</label>
                          <input
                            type="text"
                            value={v.sku}
                            onChange={(e) => handleUpdateVariant(i, { sku: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-1.5 text-xs focus:border-white outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-neutral-400 uppercase">Barcode</label>
                          <input
                            type="text"
                            value={v.barcode}
                            onChange={(e) => handleUpdateVariant(i, { barcode: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-1.5 text-xs focus:border-white outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[9px] text-neutral-400 uppercase">Cost Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={v.costPrice}
                            onChange={(e) => handleUpdateVariant(i, { costPrice: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-1.5 text-xs focus:border-white outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-neutral-400 uppercase">Retail Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={v.retailPrice}
                            onChange={(e) => handleUpdateVariant(i, { retailPrice: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-1.5 text-xs focus:border-white outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-neutral-400 uppercase">Variant Stock</label>
                          <input
                            type="number"
                            value={v.stockQuantity}
                            onChange={(e) => handleUpdateVariant(i, { stockQuantity: parseInt(e.target.value) || 0 })}
                            className="w-full bg-neutral-900 border border-neutral-700 text-white p-1.5 text-xs focus:border-white outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM FIELDS */}
          {modalFormTab === 'custom-fields' && (
            <div className="space-y-4 pt-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Dynamic Product Attributes</h4>
                <p className="text-[10px] text-neutral-400">
                  Add custom specifications such as Material, Warranty, Weight, Voltage, or Origin.
                </p>
              </div>

              {/* Add New Field Box */}
              <div className="flex gap-2 p-3 bg-neutral-950 border border-neutral-800">
                <input
                  type="text"
                  placeholder="Attribute Name (e.g. Material)"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-700 text-white p-1.5 text-xs focus:border-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 100% Organic Cotton)"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-700 text-white p-1.5 text-xs focus:border-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-4 py-1.5 bg-white text-black font-bold uppercase text-[10px] hover:bg-neutral-200"
                >
                  Add Field
                </button>
              </div>

              {/* Custom Fields List */}
              <div className="space-y-2">
                {Object.entries(customFields).map(([k, val]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{k}:</span>{' '}
                      <span className="text-neutral-300">{val}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(k)}
                      className="text-neutral-500 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LOT & EXPIRY */}
          {modalFormTab === 'lots' && (
            <div className="space-y-4 pt-2">
              <div>
                <h4 className="text-xs font-bold text-white uppercase">Lot, Batch &amp; Expiration Controls</h4>
                <p className="text-[10px] text-neutral-400">
                  Track batch numbers, serial IDs, and expiry dates for FIFO inventory rotation and recalls.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Lot / Batch Number
                  </label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="e.g. LOT-2026-08A"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Manufacturing Batch Code
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. BATCH-772"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Serial Number / Tracking ID
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-8942109"
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                    Expiration / Best Before Date
                  </label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-neutral-900 text-neutral-300 uppercase font-bold text-xs hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-white text-black uppercase font-bold text-xs hover:bg-neutral-200"
            >
              {editingProduct ? 'Update Product Record' : 'Save New Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Barcode & QR Code Label Sheet Printing Modal */}
      {labelModalProduct && (
        <LabelPrintModal
          isOpen={Boolean(labelModalProduct)}
          onClose={() => {
            setLabelModalProduct(null);
            setLabelModalVariant(null);
          }}
          product={labelModalProduct}
          selectedVariant={labelModalVariant}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
};
