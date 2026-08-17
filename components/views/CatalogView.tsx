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
  Printer,
  ChevronRight,
  ChevronDown,
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
    setName('');
    setSku('');
    setBarcode('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setCostPrice(0);
    setRetailPrice(0);
    setStockQuantity(0);
    setReorderPoint(10);
    setSupplierId(suppliers[0]?.id || '');
    setImageUrl('');
    setVariants([]);
    setCustomFields({});
    setLotNumber('');
    setBatchNumber('');
    setSerialNumber('');
    setExpirationDate('');
    setModalFormTab('basic');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode || '');
    setDescription(p.description || '');
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
    setExpirationDate(p.expirationDate || '');
    setModalFormTab('basic');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}`,
      name: 'Size / Color Variant',
      sku: `${sku || 'SKU'}-VAR${variants.length + 1}`,
      barcode: `${barcode ? barcode + '-' + (variants.length + 1) : ''}`,
      costPrice: Number(costPrice) || 0,
      retailPrice: Number(retailPrice) || 0,
      stockQuantity: 0,
      attributes: { Option: 'Default' },
    };
    setVariants([...variants, newVariant]);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const handleUpdateVariant = (idx: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setVariants(updated);
  };

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

    // Collision checks for SKU
    const existingSku = products.find(
      (p) => p.sku.toLowerCase() === sku.trim().toLowerCase() && p.id !== editingProduct?.id
    );
    if (existingSku) {
      setFormError(`A product with SKU "${sku}" already exists.`);
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    const sup = suppliers.find((s) => s.id === supplierId);

    const productPayload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim() || '',
      description: description.trim() || '',
      categoryId,
      categoryName: cat?.name || 'Uncategorized',
      supplierId,
      supplierName: sup?.name || 'Primary Supplier',
      costPrice: Number(costPrice),
      retailPrice: Number(retailPrice),
      stockQuantity: Number(stockQuantity),
      reorderPoint: Number(reorderPoint),
      locationQuantities: editingProduct?.locationQuantities || { [locations[0]?.id || 'loc_downtown']: Number(stockQuantity) },
      imageUrl: imageUrl.trim() || undefined,
      variants: variants.length > 0 ? variants : undefined,
      customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      lotNumber: lotNumber.trim() || undefined,
      batchNumber: batchNumber.trim() || undefined,
      serialNumber: serialNumber.trim() || undefined,
      expirationDate: expirationDate || undefined,
      status: 'Healthy' as const,
    };

    if (editingProduct) {
      await onUpdateProduct({
        ...editingProduct,
        ...productPayload,
      });
    } else {
      await onAddProduct(productPayload);
    }

    setIsModalOpen(false);
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="tour-catalog-table" className="space-y-6 text-slate-900 font-mono">
      {/* Top Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wider font-heading">
            {t('catalog', 'Master Product Catalog')}
          </h1>
          <p className="text-xs text-slate-600">
            Enterprise multi-variant registry, supplier associations, custom attributes, and barcode labels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['products', 'categories', 'suppliers'] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => onSubTabChange && onSubTabChange(tabId)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeSubTab === tabId
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tabId === 'products' ? 'Products & Variants' : tabId === 'categories' ? 'Categories' : 'Suppliers'}
            </button>
          ))}

          <button
            onClick={openNewProduct}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t('add_product', 'New Product')}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'products' && (
        <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                placeholder={t('search_catalog', 'Search by name, SKU, or barcode...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-9 pr-3 py-2 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono shadow-2xs w-full sm:w-auto"
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

          {/* Master Catalog Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">Product &amp; SKU</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Supplier</th>
                  <th className="p-2.5 text-right">Cost</th>
                  <th className="p-2.5 text-right">Retail</th>
                  <th className="p-2.5 text-right">Stock</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                      No products found matching active filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const hasVariants = p.variants && p.variants.length > 0;
                    const isExpanded = expandedProductIds[p.id];
                    return (
                      <React.Fragment key={p.id}>
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5">
                            <div className="flex items-center gap-2.5">
                              {hasVariants && (
                                <button
                                  onClick={() => toggleExpand(p.id)}
                                  className="text-slate-400 hover:text-slate-900 p-0.5"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                              {p.imageUrl && (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-8 h-8 object-cover border border-slate-200 shrink-0"
                                />
                              )}
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  SKU: {p.sku} {p.barcode && `| Barcode: ${p.barcode}`}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-2.5 text-slate-700">{p.categoryName}</td>
                          <td className="p-2.5 text-slate-700">{p.supplierName}</td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {formatCurrency(p.costPrice, currencySymbol)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(p.retailPrice, currencySymbol)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {p.stockQuantity}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                                p.status === 'Healthy'
                                  ? 'text-emerald-800 border-emerald-300 bg-emerald-50'
                                  : p.status === 'Low Stock'
                                  ? 'text-amber-800 border-amber-300 bg-amber-50'
                                  : 'text-rose-800 border-rose-300 bg-rose-50'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setLabelModalProduct(p);
                                  setLabelModalVariant(null);
                                }}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title="Print Barcode Labels"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditProduct(p)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title="Edit Product"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteProduct(p.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-slate-100 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Variants Rows */}
                        {hasVariants &&
                          isExpanded &&
                          p.variants?.map((v) => (
                            <tr key={v.id} className="bg-slate-50/80 text-[11px]">
                              <td className="py-2 pl-12 pr-2 font-mono text-slate-700">
                                ↳ <span className="font-bold text-slate-900">{v.name}</span> (SKU: {v.sku})
                              </td>
                              <td className="p-2 text-slate-500">Variant</td>
                              <td className="p-2 text-slate-500">—</td>
                              <td className="p-2 text-right font-mono text-slate-500">
                                {formatCurrency(v.costPrice, currencySymbol)}
                              </td>
                              <td className="p-2 text-right font-mono font-bold text-slate-900">
                                {formatCurrency(v.retailPrice, currencySymbol)}
                              </td>
                              <td className="p-2 text-right font-mono text-slate-900">{v.stockQuantity}</td>
                              <td className="p-2 text-center text-slate-400">—</td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => {
                                    setLabelModalProduct(p);
                                    setLabelModalVariant(v);
                                  }}
                                  className="px-2 py-0.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 text-[10px] uppercase font-bold"
                                >
                                  Label
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

      {/* CATEGORIES SUB-TAB */}
      {activeSubTab === 'categories' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
            Product Categories ({categories.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-xs uppercase">{c.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {products.filter((p) => p.categoryId === c.id).length} Active Products
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPPLIERS SUB-TAB */}
      {activeSubTab === 'suppliers' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
            Approved Vendors &amp; Suppliers ({suppliers.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suppliers.map((s) => (
              <div key={s.id} className="p-4 bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono">
                <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                <p className="text-slate-600">{s.email || 'No email registered'} | {s.phone || 'No phone'}</p>
                <p className="text-[10px] text-slate-500">Lead Time: {s.leadTimeDays || 5} days avg</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'EDIT MASTER PRODUCT' : 'NEW MASTER PRODUCT'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
              {formError}
            </div>
          )}

          {/* Form Tabs */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold uppercase">
            {(['basic', 'variants', 'custom-fields', 'lots'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setModalFormTab(tab)}
                className={`pb-2 transition-colors ${
                  modalFormTab === tab
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'basic' ? 'Basic Info' : tab === 'variants' ? 'Variants' : tab === 'custom-fields' ? 'Custom Fields' : 'Lots & Expiry'}
              </button>
            ))}
          </div>

          {modalFormTab === 'basic' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">SKU (Stock Keeping Unit) *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Barcode / UPC</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Cost Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={retailPrice || ''}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity || ''}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Reorder Point *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={reorderPoint || ''}
                    onChange={(e) => setReorderPoint(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/product.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                />
              </div>
            </div>
          )}

          {modalFormTab === 'variants' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">Add SKUs for Size, Color, or Material variations.</p>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
                >
                  + Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <p className="text-slate-400 italic text-xs p-4 bg-slate-50 border border-slate-200 text-center">
                  No product variants defined yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {variants.map((v, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Variant Name"
                        value={v.name}
                        onChange={(e) => handleUpdateVariant(i, 'name', e.target.value)}
                        className="bg-white border border-slate-300 p-1.5 text-xs text-slate-900"
                      />
                      <input
                        type="text"
                        placeholder="SKU"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(i, 'sku', e.target.value.toUpperCase())}
                        className="bg-white border border-slate-300 p-1.5 text-xs text-slate-900 uppercase font-mono"
                      />
                      <input
                        type="number"
                        placeholder="Retail ($)"
                        value={v.retailPrice || ''}
                        onChange={(e) => handleUpdateVariant(i, 'retailPrice', Number(e.target.value))}
                        className="bg-white border border-slate-300 p-1.5 text-xs text-slate-900 text-right font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="text-xs text-rose-700 hover:underline font-bold uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {modalFormTab === 'custom-fields' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Attribute (e.g. Brand, Warranty)"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 p-2 text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Logitech, 2 Years)"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 p-2 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="px-3 py-2 bg-slate-900 text-white font-bold text-xs uppercase"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {Object.entries(customFields).map(([k, val]) => (
                  <div key={k} className="p-2 bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <span>
                      <strong>{k}:</strong> {val}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(k)}
                      className="text-rose-700 font-bold uppercase text-[10px]"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {modalFormTab === 'lots' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Lot Number</label>
                <input
                  type="text"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Labels Modal */}
      <LabelPrintModal
        isOpen={!!labelModalProduct}
        onClose={() => {
          setLabelModalProduct(null);
          setLabelModalVariant(null);
        }}
        product={labelModalProduct}
        selectedVariant={labelModalVariant}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
