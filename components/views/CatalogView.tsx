'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { Product, Category, Supplier, Location } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';
import { Modal } from '../common/Modal';
import { Plus, Edit2, Trash2, Search, Package, Tag, Truck } from 'lucide-react';

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

  const [formError, setFormError] = useState<string | null>(null);

  const openNewProduct = () => {
    setEditingProduct(null);
    setFormError(null);
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
    setIsModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setFormError(null);
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
    setIsModalOpen(true);
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

    const payload = {
      name,
      sku,
      barcode,
      description,
      categoryId,
      categoryName: catObj?.name || 'General',
      costPrice: Number(costPrice),
      retailPrice: Number(retailPrice),
      stockQuantity: Number(stockQuantity),
      reorderPoint: Number(reorderPoint),
      supplierId,
      supplierName: supObj?.name || 'Primary Supplier',
      imageUrl,
      locationQuantities: editingProduct?.locationQuantities || {},
      lastSoldAt: editingProduct?.lastSoldAt,
      status: Number(stockQuantity) === 0 ? ('Out of Stock' as const) : Number(stockQuantity) <= Number(reorderPoint) ? ('Low Stock' as const) : ('Healthy' as const),
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
      p.barcode?.toLowerCase().includes(search.toLowerCase());
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
              activeSubTab === 'products'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('products', 'All Products')} ({products.length})
            {activeSubTab === 'products' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('categories')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'categories'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
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
              activeSubTab === 'suppliers'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
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
            <span>{t('new_product', '+ New Product')}</span>
          </button>
        )}
      </div>

      {activeSubTab === 'products' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-5 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder={t('search_catalog', 'Search products or SKU...')}
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

          {/* Product Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 font-bold uppercase text-[10px] tracking-widest">
                  <th className="py-2.5 px-3">{t('product_name', 'Product')}</th>
                  <th className="py-2.5 px-3">{t('category', 'Category')}</th>
                  <th className="py-2.5 px-3">{t('supplier', 'Supplier')}</th>
                  <th className="py-2.5 px-3 text-right">{t('cost', 'Cost')}</th>
                  <th className="py-2.5 px-3 text-right">{t('retail', 'Retail')}</th>
                  <th className="py-2.5 px-3 text-right">{t('profit_margin', 'Margin')}</th>
                  <th className="py-2.5 px-3 text-right">{t('stock', 'Stock')}</th>
                  <th className="py-2.5 px-3 text-center">{t('status', 'Status')}</th>
                  <th className="py-2.5 px-3 text-center">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-neutral-500">
                      <Package className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
                      <p className="font-bold text-neutral-400 uppercase text-xs tracking-wider">
                        {search.trim() ? `No catalog products match "${search}"` : t('no_sales', 'No Catalog Products')}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const marginPercent = p.retailPrice > 0 ? (((p.retailPrice - p.costPrice) / p.retailPrice) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={p.id} className="hover:bg-neutral-950/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
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
                              <p className="font-bold text-white">{p.name}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">
                                SKU: {p.sku} | BAR: {p.barcode}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-neutral-300">{p.categoryName}</td>
                        <td className="py-3 px-3 text-neutral-400">{p.supplierName}</td>
                        <td className="py-3 px-3 text-right text-neutral-400">
                          {formatCurrency(p.costPrice, currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-white">
                          {formatCurrency(p.retailPrice, currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                          {marginPercent}%
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-white">
                          {p.stockQuantity}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${
                              p.status === 'Healthy'
                                ? 'border-emerald-900 text-emerald-400 bg-emerald-950/60'
                                : p.status === 'Low Stock'
                                ? 'border-amber-900 text-amber-400 bg-amber-950/60'
                                : 'border-rose-900 text-rose-400 bg-rose-950/60'
                            }`}
                          >
                            {p.status === 'Healthy' ? t('in_stock', 'Healthy') : p.status === 'Low Stock' ? t('low_stock_badge', 'Low Stock') : t('out_of_stock', 'Out of Stock')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="p-1 text-neutral-400 hover:text-white"
                              title={t('edit_product', 'Edit')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1 text-neutral-500 hover:text-rose-400"
                              title={t('cancel', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORIES SUBTAB */}
      {activeSubTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((c) => {
            const count = products.filter((p) => p.categoryId === c.id).length;
            return (
              <div key={c.id} className="bg-neutral-900 border border-neutral-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Tag className="w-4 h-4 text-white" />
                  <span className="text-[10px] text-neutral-500 uppercase">{count} items</span>
                </div>
                <h4 className="font-bold text-white text-sm uppercase tracking-wider">{c.name}</h4>
                <p className="text-xs text-neutral-400">{c.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* SUPPLIERS SUBTAB */}
      {activeSubTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-neutral-900 border border-neutral-800 p-5 space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-white" />
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider">{s.name}</h4>
                </div>
                <span className="text-[10px] text-neutral-400 font-bold">{s.contactPerson}</span>
              </div>
              <p className="text-xs text-neutral-400">Email: {s.email} | Phone: {s.phone}</p>
              <p className="text-xs text-neutral-500">Lead Time: {s.leadTimeDays} days</p>
            </div>
          ))}
        </div>
      )}

      {/* Product Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? t('edit_product', 'Edit Product') : t('add_product', 'Add New Product')}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {formError && (
            <div className="p-3 bg-neutral-950 border border-rose-800 text-rose-400 font-bold text-xs uppercase">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
              {t('product_name', 'Product Name')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">SKU</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('barcode', 'Barcode')}</label>
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('category', 'Category')}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('supplier', 'Supplier')}</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('cost_price', 'Cost Price')} ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('retail_price', 'Retail Price')} ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('stock', 'Stock Quantity')}</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('reorder_point', 'Reorder Point')}</label>
              <input
                type="number"
                required
                value={reorderPoint}
                onChange={(e) => setReorderPoint(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2 bg-neutral-950 border border-neutral-800 text-white font-bold uppercase hover:bg-neutral-800"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-white text-black font-bold uppercase hover:bg-neutral-200"
            >
              {t('save_changes', 'Save Product')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
