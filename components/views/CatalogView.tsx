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
  FolderPlus,
  Building2,
  Mail,
  Phone,
  Clock,
  MapPin,
  Tag,
  Boxes,
  AlertTriangle,
  CheckSquare,
  Square,
  X,
  CheckCircle2,
  Check,
} from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  locations: Location[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onBulkDeleteProducts?: (ids: string[]) => Promise<void>;
  onAddCategory?: (category: Omit<Category, 'id'>) => Promise<void>;
  onUpdateCategory?: (category: Category) => Promise<void>;
  onDeleteCategory?: (id: string) => Promise<void>;
  onBulkDeleteCategories?: (ids: string[]) => Promise<void>;
  onAddSupplier?: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  onUpdateSupplier?: (supplier: Supplier) => Promise<void>;
  onDeleteSupplier?: (id: string) => Promise<void>;
  onBulkDeleteSuppliers?: (ids: string[]) => Promise<void>;
  currencySymbol: string;
  activeSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories = [],
  suppliers = [],
  locations = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkDeleteProducts,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onBulkDeleteCategories,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onBulkDeleteSuppliers,
  currencySymbol,
  activeSubTab = 'products',
  onSubTabChange,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Product Selection & Delete Confirmation States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isBulkDeleteProductModalOpen, setIsBulkDeleteProductModalOpen] = useState(false);

  // Category Selection & Delete Confirmation States
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isBulkDeleteCategoryModalOpen, setIsBulkDeleteCategoryModalOpen] = useState(false);

  // Supplier Selection & Delete Confirmation States
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isBulkDeleteSupplierModalOpen, setIsBulkDeleteSupplierModalOpen] = useState(false);

  // Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Supplier Modal State
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supLeadTime, setSupLeadTime] = useState<number>(5);
  const [supplierError, setSupplierError] = useState<string | null>(null);

  // Toast & Quick Tax States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingTaxProduct, setEditingTaxProduct] = useState<Product | null>(null);
  const [quickTaxInput, setQuickTaxInput] = useState<number | string>('');

  // Print Label Modal State
  const [labelModalProduct, setLabelModalProduct] = useState<Product | null>(null);
  const [labelModalVariant, setLabelModalVariant] = useState<ProductVariant | null>(null);

  // Expanded Variant Rows
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});

  // Active Tab in Product Form Modal
  const [modalFormTab, setModalFormTab] = useState<'basic' | 'variants' | 'custom-fields' | 'lots'>('basic');

  // Product Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [reorderPoint, setReorderPoint] = useState<number>(10);
  const [taxRate, setTaxRate] = useState<number | string>('');
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

  // Product Modals
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
    setTaxRate('');
    setSupplierId(suppliers[0]?.id || '');
    setImageUrl('');
    setVariants([]);
    setCustomFields({});
    setLotNumber('');
    setBatchNumber('');
    setSerialNumber('');
    setExpirationDate('');
    setFormError(null);
    setModalFormTab('basic');
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
    setTaxRate(p.taxRate !== undefined ? p.taxRate : '');
    setSupplierId(p.supplierId);
    setImageUrl(p.imageUrl || '');
    setVariants(p.variants || []);
    setCustomFields(p.customFields || {});
    setLotNumber(p.lotNumber || '');
    setBatchNumber(p.batchNumber || '');
    setSerialNumber(p.serialNumber || '');
    setExpirationDate(p.expirationDate || '');
    setFormError(null);
    setModalFormTab('basic');
    setIsModalOpen(true);
  };

  // Category Modals
  const openNewCategory = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryError(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDescription(cat.description || '');
    setCategoryError(null);
    setIsCategoryModalOpen(true);
  };

  // Supplier Modals
  const openNewSupplier = () => {
    setEditingSupplier(null);
    setSupName('');
    setSupContact('');
    setSupEmail('');
    setSupPhone('');
    setSupAddress('');
    setSupLeadTime(5);
    setSupplierError(null);
    setIsSupplierModalOpen(true);
  };

  const openEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupName(sup.name);
    setSupContact(sup.contactPerson || '');
    setSupEmail(sup.email || '');
    setSupPhone(sup.phone || '');
    setSupAddress(sup.address || '');
    setSupLeadTime(sup.leadTimeDays || 5);
    setSupplierError(null);
    setIsSupplierModalOpen(true);
  };

  // Dynamic top button action and label
  const handleTopActionClick = () => {
    if (activeSubTab === 'categories') {
      openNewCategory();
    } else if (activeSubTab === 'suppliers') {
      openNewSupplier();
    } else {
      openNewProduct();
    }
  };

  const getTopActionLabel = () => {
    if (activeSubTab === 'categories') return 'Add Category';
    if (activeSubTab === 'suppliers') return 'Add Supplier';
    return 'Add Product';
  };

  const handleAddVariant = () => {
    const varCount = variants.length + 1;
    const newVariant: ProductVariant = {
      id: `var_${Date.now()}_${varCount}`,
      name: `Variant ${varCount}`,
      sku: sku ? `${sku}-V${varCount}` : `VAR-${varCount}`,
      barcode: '',
      costPrice: costPrice || 0,
      retailPrice: retailPrice || 0,
      stockQuantity: 0,
      attributes: {},
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: val };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleAddCustomField = () => {
    if (!newFieldKey.trim() || !newFieldValue.trim()) return;
    setCustomFields({ ...customFields, [newFieldKey.trim()]: newFieldValue.trim() });
    setNewFieldKey('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (key: string) => {
    const copy = { ...customFields };
    delete copy[key];
    setCustomFields(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Mandatory Basic Info Validations
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setModalFormTab('basic');
      setFormError('Product Name is mandatory (must be at least 2 characters).');
      return;
    }

    const trimmedSku = sku.trim().toUpperCase();
    if (!trimmedSku || trimmedSku.length < 2) {
      setModalFormTab('basic');
      setFormError('SKU (Stock Keeping Unit) is mandatory (minimum 2 characters).');
      return;
    }

    if (!categoryId) {
      setModalFormTab('basic');
      setFormError('Please select a Category. Category is mandatory.');
      return;
    }

    if (!supplierId) {
      setModalFormTab('basic');
      setFormError('Please select a Supplier. Supplier is mandatory.');
      return;
    }

    const numCostPrice = Number(costPrice);
    if (isNaN(numCostPrice) || numCostPrice < 0) {
      setModalFormTab('basic');
      setFormError('Cost Price is mandatory and cannot be negative.');
      return;
    }

    const numRetailPrice = Number(retailPrice);
    if (isNaN(numRetailPrice) || numRetailPrice <= 0) {
      setModalFormTab('basic');
      setFormError('Retail Price is mandatory and must be greater than 0.');
      return;
    }

    const numStock = Number(stockQuantity);
    if (isNaN(numStock) || numStock < 0) {
      setModalFormTab('basic');
      setFormError('Current Stock is mandatory (enter 0 or greater).');
      return;
    }

    const numReorderPoint = Number(reorderPoint);
    if (isNaN(numReorderPoint) || numReorderPoint < 0) {
      setModalFormTab('basic');
      setFormError('Reorder Point is mandatory (default is 10).');
      return;
    }

    // Validate Variants if added
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name || !v.name.trim()) {
        setModalFormTab('variants');
        setFormError(`Variant #${i + 1}: Name is mandatory.`);
        return;
      }
      if (!v.sku || !v.sku.trim()) {
        setModalFormTab('variants');
        setFormError(`Variant #${i + 1}: SKU is mandatory.`);
        return;
      }
      if (isNaN(Number(v.retailPrice)) || Number(v.retailPrice) <= 0) {
        setModalFormTab('variants');
        setFormError(`Variant #${i + 1}: Retail Price must be greater than 0.`);
        return;
      }
    }

    // Collision checks for SKU
    const existingSku = products.find(
      (p) => p.sku.toLowerCase() === trimmedSku.toLowerCase() && p.id !== editingProduct?.id
    );
    if (existingSku) {
      setModalFormTab('basic');
      setFormError(`A product with SKU "${trimmedSku}" already exists in the catalog.`);
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    const sup = suppliers.find((s) => s.id === supplierId);

    const finalTaxRate = taxRate !== '' && !isNaN(Number(taxRate)) ? Number(taxRate) : undefined;

    const productPayload = {
      name: trimmedName,
      sku: trimmedSku,
      barcode: barcode.trim() || '',
      description: description.trim() || '',
      categoryId,
      categoryName: cat?.name || 'Uncategorized',
      supplierId,
      supplierName: sup?.name || 'Primary Supplier',
      costPrice: numCostPrice,
      retailPrice: numRetailPrice,
      stockQuantity: numStock,
      reorderPoint: numReorderPoint,
      taxRate: finalTaxRate,
      locationQuantities: editingProduct?.locationQuantities || {
        [locations[0]?.id || 'loc_downtown']: numStock,
      },
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
      const updatedProductObj: Product = {
        ...editingProduct,
        ...productPayload,
        taxRate: finalTaxRate,
      };
      if (finalTaxRate === undefined) {
        delete (updatedProductObj as any).taxRate;
      }
      await onUpdateProduct(updatedProductObj);
      setToastMessage(`Product "${trimmedName}" updated successfully (Tax Rate: ${finalTaxRate !== undefined ? `${finalTaxRate}%` : 'Default Store Tax'}).`);
    } else {
      const newProductObj = {
        ...productPayload,
        taxRate: finalTaxRate,
      };
      if (finalTaxRate === undefined) {
        delete (newProductObj as any).taxRate;
      }
      await onAddProduct(newProductObj);
      setToastMessage(`New product "${trimmedName}" created successfully!`);
    }

    setTimeout(() => setToastMessage(null), 3500);
    setIsModalOpen(false);
  };

  // Category Submit Handler
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    const trimmed = categoryName.trim();
    if (!trimmed || trimmed.length < 2) {
      setCategoryError('Category Name is mandatory (minimum 2 characters).');
      return;
    }

    if (editingCategory) {
      if (onUpdateCategory) {
        await onUpdateCategory({
          ...editingCategory,
          name: trimmed,
          description: categoryDescription.trim() || undefined,
        });
      }
    } else {
      if (onAddCategory) {
        await onAddCategory({
          name: trimmed,
          description: categoryDescription.trim() || undefined,
        });
      }
    }
    setIsCategoryModalOpen(false);
  };

  // Supplier Submit Handler
  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupplierError(null);
    const trimmed = supName.trim();
    if (!trimmed || trimmed.length < 2) {
      setSupplierError('Supplier / Vendor Name is mandatory (minimum 2 characters).');
      return;
    }

    const payload = {
      name: trimmed,
      contactPerson: supContact.trim() || 'Primary Representative',
      email: supEmail.trim() || '',
      phone: supPhone.trim() || '',
      address: supAddress.trim() || '',
      leadTimeDays: Number(supLeadTime) >= 0 ? Number(supLeadTime) : 5,
    };

    if (editingSupplier) {
      if (onUpdateSupplier) {
        await onUpdateSupplier({
          ...editingSupplier,
          ...payload,
        });
      }
    } else {
      if (onAddSupplier) {
        await onAddSupplier(payload);
      }
    }
    setIsSupplierModalOpen(false);
  };

  const handleOpenQuickTax = (p: Product) => {
    setEditingTaxProduct(p);
    setQuickTaxInput(p.taxRate !== undefined ? p.taxRate : '');
  };

  const handleSaveQuickTax = async () => {
    if (!editingTaxProduct) return;
    const finalTax = quickTaxInput !== '' && !isNaN(Number(quickTaxInput)) ? Number(quickTaxInput) : undefined;
    const updated: Product = {
      ...editingTaxProduct,
      taxRate: finalTax,
      updatedAt: new Date().toISOString(),
    };
    if (finalTax === undefined) {
      delete (updated as any).taxRate;
    }
    await onUpdateProduct(updated);
    setToastMessage(`Tax rate for "${editingTaxProduct.name}" updated to ${finalTax !== undefined ? `${finalTax}%` : 'Store Default'}!`);
    setTimeout(() => setToastMessage(null), 3500);
    setEditingTaxProduct(null);
  };

  // Filtered dataset calculations
  const filteredProducts = products.filter((p) => {
    const searchLower = search.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      (p.name || '').toLowerCase().includes(searchLower) ||
      (p.sku || '').toLowerCase().includes(searchLower) ||
      (p.barcode || '').toLowerCase().includes(searchLower) ||
      (p.variants || []).some(
        (v) =>
          (v.sku && v.sku.toLowerCase().includes(searchLower)) ||
          (v.name && v.name.toLowerCase().includes(searchLower)) ||
          (v.barcode && v.barcode.toLowerCase().includes(searchLower))
      );
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredCategories = categories.filter((c) => {
    const s = search.trim().toLowerCase();
    return !s || c.name.toLowerCase().includes(s) || (c.description || '').toLowerCase().includes(s);
  });

  const filteredSuppliers = suppliers.filter((sup) => {
    const s = search.trim().toLowerCase();
    return (
      !s ||
      sup.name.toLowerCase().includes(s) ||
      (sup.contactPerson || '').toLowerCase().includes(s) ||
      (sup.email || '').toLowerCase().includes(s) ||
      (sup.phone || '').toLowerCase().includes(s)
    );
  });

  // Bulk Product selection helpers
  const handleSelectAllProducts = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleProductSelection = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Bulk Category selection helpers
  const handleSelectAllCategories = () => {
    if (selectedCategoryIds.length === filteredCategories.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(filteredCategories.map((c) => c.id));
    }
  };

  const handleToggleCategorySelection = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  // Bulk Supplier selection helpers
  const handleSelectAllSuppliers = () => {
    if (selectedSupplierIds.length === filteredSuppliers.length) {
      setSelectedSupplierIds([]);
    } else {
      setSelectedSupplierIds(filteredSuppliers.map((s) => s.id));
    }
  };

  const handleToggleSupplierSelection = (id: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  // Single & Bulk Deletion Executions
  const executeSingleProductDelete = async () => {
    if (productToDelete) {
      await onDeleteProduct(productToDelete.id);
      setSelectedProductIds((prev) => prev.filter((id) => id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  const executeBulkProductDelete = async () => {
    if (selectedProductIds.length > 0) {
      if (onBulkDeleteProducts) {
        await onBulkDeleteProducts(selectedProductIds);
      } else {
        for (const id of selectedProductIds) {
          await onDeleteProduct(id);
        }
      }
      setSelectedProductIds([]);
      setIsBulkDeleteProductModalOpen(false);
    }
  };

  const executeSingleCategoryDelete = async () => {
    if (categoryToDelete && onDeleteCategory) {
      await onDeleteCategory(categoryToDelete.id);
      setSelectedCategoryIds((prev) => prev.filter((id) => id !== categoryToDelete.id));
      setCategoryToDelete(null);
    }
  };

  const executeBulkCategoryDelete = async () => {
    if (selectedCategoryIds.length > 0) {
      if (onBulkDeleteCategories) {
        await onBulkDeleteCategories(selectedCategoryIds);
      } else if (onDeleteCategory) {
        for (const id of selectedCategoryIds) {
          await onDeleteCategory(id);
        }
      }
      setSelectedCategoryIds([]);
      setIsBulkDeleteCategoryModalOpen(false);
    }
  };

  const executeSingleSupplierDelete = async () => {
    if (supplierToDelete && onDeleteSupplier) {
      await onDeleteSupplier(supplierToDelete.id);
      setSelectedSupplierIds((prev) => prev.filter((id) => id !== supplierToDelete.id));
      setSupplierToDelete(null);
    }
  };

  const executeBulkSupplierDelete = async () => {
    if (selectedSupplierIds.length > 0) {
      if (onBulkDeleteSuppliers) {
        await onBulkDeleteSuppliers(selectedSupplierIds);
      } else if (onDeleteSupplier) {
        for (const id of selectedSupplierIds) {
          await onDeleteSupplier(id);
        }
      }
      setSelectedSupplierIds([]);
      setIsBulkDeleteSupplierModalOpen(false);
    }
  };

  return (
    <div id="tour-catalog-table" className="space-y-6 text-slate-900 font-mono">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-emerald-900 text-white p-3 border border-emerald-700 shadow-md flex items-center justify-between transition-all">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white text-xs font-bold px-2 py-0.5 uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wider font-heading">
            {t('catalog', 'Master Product Catalog')}
          </h1>
          <p className="text-xs text-slate-600">
            Enterprise multi-variant registry, category taxonomies, approved vendor contracts, and barcode labels.
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

          {/* DYNAMIC TOP ACTION BUTTON */}
          <button
            onClick={handleTopActionClick}
            className="px-4 py-2 bg-slate-900 text-white hover:bg-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{getTopActionLabel()}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRODUCTS & VARIANTS SUB-TAB                                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'products' && (
        <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
          {/* Bulk Action Banner for Products */}
          {selectedProductIds.length > 0 && (
            <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>{selectedProductIds.length} Products Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs uppercase font-bold tracking-wider"
                >
                  Deselect All
                </button>
                <button
                  onClick={() => setIsBulkDeleteProductModalOpen(true)}
                  className="px-3.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Delete ({selectedProductIds.length})</span>
                </button>
              </div>
            </div>
          )}

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
                  <th className="p-2.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllProducts}
                      className="text-slate-600 hover:text-slate-900"
                      title="Select all products"
                    >
                      {filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
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
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                      No products found matching active filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const hasVariants = p.variants && p.variants.length > 0;
                    const isExpanded = expandedProductIds[p.id];
                    const isSelected = selectedProductIds.includes(p.id);

                    return (
                      <React.Fragment key={p.id}>
                        <tr
                          className={`transition-colors ${
                            isSelected ? 'bg-slate-100/80' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleProductSelection(p.id)}
                              className="cursor-pointer accent-slate-900 rounded-none w-3.5 h-3.5"
                            />
                          </td>
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
                            <div>{formatCurrency(p.retailPrice, currencySymbol)}</div>
                            <button
                              type="button"
                              onClick={() => handleOpenQuickTax(p)}
                              className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase transition-colors inline-block mt-0.5 cursor-pointer ${
                                p.taxRate !== undefined
                                  ? p.taxRate === 0
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100'
                                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                              }`}
                              title="Click to edit Tax / GST Rate"
                            >
                              {p.taxRate !== undefined ? `${p.taxRate}% Tax ✎` : 'Std Tax ✎'}
                            </button>
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
                                onClick={() => setProductToDelete(p)}
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
                              <td className="p-2 text-center text-slate-400">—</td>
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

      {/* ========================================================================= */}
      {/* 2. PRODUCT CATEGORIES SUB-TAB (FULL CRUD & BULK DELETE)                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'categories' && (
        <div className="bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
          {/* Bulk Action Banner for Categories */}
          {selectedCategoryIds.length > 0 && (
            <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>{selectedCategoryIds.length} Categories Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCategoryIds([])}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs uppercase font-bold tracking-wider"
                >
                  Deselect All
                </button>
                <button
                  onClick={() => setIsBulkDeleteCategoryModalOpen(true)}
                  className="px-3.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Delete ({selectedCategoryIds.length})</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllCategories}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider bg-slate-100 px-2.5 py-1.5 border border-slate-300"
                title="Select all categories"
              >
                {filteredCategories.length > 0 && selectedCategoryIds.length === filteredCategories.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-slate-900" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>Select All</span>
              </button>

              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Product Categories ({categories.length})
                </h3>
                <p className="text-[11px] text-slate-500">Organize and group catalog items for fast POS filtering and reporting.</p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-1.5 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                No product categories found. Click &quot;Add Category&quot; to create one.
              </div>
            ) : (
              filteredCategories.map((c) => {
                const productCount = products.filter((p) => p.categoryId === c.id).length;
                const isSelected = selectedCategoryIds.includes(c.id);

                return (
                  <div
                    key={c.id}
                    className={`p-4 border transition-colors flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-slate-100 border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleCategorySelection(c.id)}
                            className="cursor-pointer accent-slate-900 rounded-none w-3.5 h-3.5"
                          />
                          <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                          <h4 className="font-bold text-slate-900 text-xs uppercase">{c.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-700">
                          {productCount} SKUs
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{c.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => openEditCategory(c)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-[10px] font-bold uppercase flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      {onDeleteCategory && (
                        <button
                          onClick={() => setCategoryToDelete(c)}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-rose-50 text-rose-700 text-[10px] font-bold uppercase flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VENDORS & SUPPLIERS SUB-TAB (FULL CRUD & BULK DELETE)                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'suppliers' && (
        <div className="bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
          {/* Bulk Action Banner for Suppliers */}
          {selectedSupplierIds.length > 0 && (
            <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>{selectedSupplierIds.length} Suppliers Selected</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSupplierIds([])}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs uppercase font-bold tracking-wider"
                >
                  Deselect All
                </button>
                <button
                  onClick={() => setIsBulkDeleteSupplierModalOpen(true)}
                  className="px-3.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bulk Delete ({selectedSupplierIds.length})</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllSuppliers}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider bg-slate-100 px-2.5 py-1.5 border border-slate-300"
                title="Select all suppliers"
              >
                {filteredSuppliers.length > 0 && selectedSupplierIds.length === filteredSuppliers.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-slate-900" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>Select All</span>
              </button>

              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Approved Vendors &amp; Suppliers ({suppliers.length})
                </h3>
                <p className="text-[11px] text-slate-500">Manage procurement partner profiles, lead times, and contact points.</p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search vendors & suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-1.5 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredSuppliers.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                No vendors or suppliers found. Click &quot;Add Supplier&quot; to register one.
              </div>
            ) : (
              filteredSuppliers.map((s) => {
                const suppliedProductsCount = products.filter((p) => p.supplierId === s.id).length;
                const isSelected = selectedSupplierIds.includes(s.id);

                return (
                  <div
                    key={s.id}
                    className={`p-4 border transition-colors flex flex-col justify-between space-y-3 text-xs font-mono ${
                      isSelected
                        ? 'bg-slate-100 border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSupplierSelection(s.id)}
                            className="cursor-pointer accent-slate-900 rounded-none w-3.5 h-3.5"
                          />
                          <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                          <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-700">
                          {suppliedProductsCount} Catalog Items
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-600 text-[11px]">
                        {s.contactPerson && (
                          <p>
                            <strong>Rep:</strong> {s.contactPerson}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          {s.email && (
                            <span className="flex items-center gap-1 text-slate-700">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {s.email}
                            </span>
                          )}
                          {s.phone && (
                            <span className="flex items-center gap-1 text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {s.phone}
                            </span>
                          )}
                        </div>
                        {s.address && (
                          <p className="flex items-center gap-1 text-slate-500 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {s.address}
                          </p>
                        )}
                        <p className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Avg Lead Time: <strong>{s.leadTimeDays || 5} days</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => openEditSupplier(s)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-[10px] font-bold uppercase flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      {onDeleteSupplier && (
                        <button
                          onClick={() => setSupplierToDelete(s)}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-rose-50 text-rose-700 text-[10px] font-bold uppercase flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE PRODUCT DELETE CONFIRMATION MODAL                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="CONFIRM PRODUCT DELETION"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900 uppercase">Warning: Permanent Deletion</p>
              <p className="text-rose-700 leading-relaxed">
                Are you sure you want to delete <strong className="font-bold text-slate-900">{productToDelete?.name}</strong> (SKU: <span className="font-mono">{productToDelete?.sku}</span>)?
              </p>
            </div>
          </div>
          <p className="text-slate-600">
            This will permanently remove the item, its variants, and associated barcode metadata from your local store.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setProductToDelete(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeSingleProductDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Product</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* BULK PRODUCT DELETE CONFIRMATION MODAL                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isBulkDeleteProductModalOpen}
        onClose={() => setIsBulkDeleteProductModalOpen(false)}
        title={`CONFIRM BULK DELETE (${selectedProductIds.length} PRODUCTS)`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900 uppercase">Bulk Action Warning</p>
              <p className="text-rose-700 leading-relaxed">
                You are about to permanently delete <strong className="font-bold text-slate-900">{selectedProductIds.length} selected products</strong> from your master catalog.
              </p>
            </div>
          </div>

          <div className="max-h-36 overflow-y-auto border border-slate-200 p-2 bg-slate-50 divide-y divide-slate-200 text-[11px]">
            {products
              .filter((p) => selectedProductIds.includes(p.id))
              .map((p) => (
                <div key={p.id} className="py-1 flex justify-between">
                  <span className="font-bold text-slate-800 truncate max-w-[220px]">{p.name}</span>
                  <span className="text-slate-500 font-mono">{p.sku}</span>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBulkDeleteProductModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeBulkProductDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm &amp; Delete All</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* SINGLE CATEGORY DELETE CONFIRMATION MODAL                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="CONFIRM CATEGORY DELETION"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900 uppercase">Delete Category</p>
              <p className="text-rose-700 leading-relaxed">
                Are you sure you want to delete category <strong className="font-bold text-slate-900">{categoryToDelete?.name}</strong>?
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-[11px]">
            Note: Catalog products linked to this category will not be removed, but their category association will default to &quot;Uncategorized&quot;.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setCategoryToDelete(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeSingleCategoryDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Category</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* BULK CATEGORY DELETE CONFIRMATION MODAL                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isBulkDeleteCategoryModalOpen}
        onClose={() => setIsBulkDeleteCategoryModalOpen(false)}
        title={`CONFIRM BULK DELETE (${selectedCategoryIds.length} CATEGORIES)`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900 uppercase">Bulk Category Deletion</p>
              <p className="text-rose-700 leading-relaxed">
                You are about to delete <strong className="font-bold text-slate-900">{selectedCategoryIds.length} categories</strong>.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBulkDeleteCategoryModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeBulkCategoryDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm &amp; Delete Categories</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* SINGLE SUPPLIER DELETE CONFIRMATION MODAL                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!supplierToDelete}
        onClose={() => setSupplierToDelete(null)}
        title="CONFIRM VENDOR / SUPPLIER DELETION"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900 uppercase">Delete Supplier Record</p>
              <p className="text-rose-700 leading-relaxed">
                Are you sure you want to delete vendor <strong className="font-bold text-slate-900">{supplierToDelete?.name}</strong>?
              </p>
            </div>
          </div>
          <p className="text-slate-600 text-[11px]">
            Past purchase order history will remain preserved in your reporting and accounting ledgers.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSupplierToDelete(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeSingleSupplierDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Supplier</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* BULK SUPPLIER DELETE CONFIRMATION MODAL                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isBulkDeleteSupplierModalOpen}
        onClose={() => setIsBulkDeleteSupplierModalOpen(false)}
        title={`CONFIRM BULK DELETE (${selectedSupplierIds.length} SUPPLIERS)`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-900 uppercase">Bulk Vendor Deletion</p>
              <p className="text-rose-700 leading-relaxed">
                You are about to delete <strong className="font-bold text-slate-900">{selectedSupplierIds.length} vendor profiles</strong> from your supplier registry.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBulkDeleteSupplierModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={executeBulkSupplierDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Confirm &amp; Delete Suppliers</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL                                                  */}
      {/* ========================================================================= */}
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
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    required
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Supplier *</label>
                  <select
                    value={supplierId}
                    required
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  >
                    <option value="">Select Supplier...</option>
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

              {/* Individual Item Tax Rate */}
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase text-slate-700">
                    Individual Item Tax / GST Rate (%)
                  </label>
                  <span className="text-[10px] text-slate-500">
                    Leave blank to use store default rate
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="Store Default (e.g. 8.5%)"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full sm:w-48 bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-right"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setTaxRate(rate)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors ${
                          taxRate === rate || taxRate === String(rate)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {rate === 0 ? '0% (Exempt)' : `${rate}%`}
                      </button>
                    ))}
                    {taxRate !== '' && (
                      <button
                        type="button"
                        onClick={() => setTaxRate('')}
                        className="px-2 py-1 text-[10px] font-bold uppercase text-rose-600 hover:underline"
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
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

      {/* ========================================================================= */}
      {/* ADD / EDIT CATEGORY MODAL                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'EDIT CATEGORY' : 'NEW PRODUCT CATEGORY'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCategorySubmit} className="space-y-4 font-mono text-xs">
          {categoryError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
              {categoryError}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Footwear, Electronics, Beverages"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of this product classification..."
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* ADD / EDIT SUPPLIER MODAL                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={editingSupplier ? 'EDIT VENDOR / SUPPLIER' : 'REGISTER VENDOR / SUPPLIER'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSupplierSubmit} className="space-y-4 font-mono text-xs">
          {supplierError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold">
              {supplierError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Company / Vendor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anker Direct Logistics"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. Account Manager"
                value={supContact}
                onChange={(e) => setSupContact(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="orders@vendor.com"
                value={supEmail}
                onChange={(e) => setSupEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+1 800-555-0199"
                value={supPhone}
                onChange={(e) => setSupPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Warehouse / Office Address
              </label>
              <input
                type="text"
                placeholder="100 Logistics Blvd, Dock 4"
                value={supAddress}
                onChange={(e) => setSupAddress(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Lead Time (Days)
              </label>
              <input
                type="number"
                min="0"
                value={supLeadTime}
                onChange={(e) => setSupLeadTime(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-right"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs uppercase hover:bg-slate-200 border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
            >
              {editingSupplier ? 'Save Changes' : 'Register Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Tax Rate Edit Modal */}
      {editingTaxProduct && (
        <Modal
          isOpen={!!editingTaxProduct}
          onClose={() => setEditingTaxProduct(null)}
          title={`ADJUST ITEM TAX RATE: ${editingTaxProduct.name.toUpperCase()}`}
        >
          <div className="space-y-4 font-mono text-xs text-slate-900">
            <div className="p-3 bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-900">{editingTaxProduct.name}</p>
              <p className="text-[11px] text-slate-600">
                SKU: {editingTaxProduct.sku} • Retail Price: {formatCurrency(editingTaxProduct.retailPrice, currencySymbol)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Current Applied Rate: {editingTaxProduct.taxRate !== undefined ? `${editingTaxProduct.taxRate}% (Custom Rate)` : 'Store Default Tax Rate'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-700">
                Specific Item Tax / GST Percentage (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="Store Default Rate"
                  value={quickTaxInput}
                  onChange={(e) => setQuickTaxInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-right"
                  autoFocus
                />
                <span className="font-bold text-slate-700">%</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[0, 5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setQuickTaxInput(rate)}
                    className={`px-2 py-1 text-[10px] font-bold uppercase border transition-colors ${
                      quickTaxInput === rate || quickTaxInput === String(rate)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {rate === 0 ? '0% (Exempt)' : `${rate}%`}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setQuickTaxInput('')}
                  className="px-2 py-1 text-[10px] font-bold uppercase text-rose-600 hover:underline"
                >
                  Reset Default
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingTaxProduct(null)}
                className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-700 font-bold uppercase hover:bg-slate-200 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickTax}
                className="px-5 py-2 bg-slate-900 text-white font-bold uppercase hover:bg-black shadow-xs text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Tax Rate</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

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
