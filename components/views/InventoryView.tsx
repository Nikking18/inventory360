'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import {
  Product,
  StockMovement,
  Location,
  Supplier,
  PurchaseOrder,
  StockTransfer,
} from '../../lib/types';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { Modal } from '../common/Modal';
import {
  Boxes,
  AlertTriangle,
  ArrowRightLeft,
  Truck,
  Plus,
  Package,
  Search,
  ClipboardList,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Building2,
  Sparkles,
  Check,
} from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../../lib/exportImport';

interface InventoryViewProps {
  products: Product[];
  movements: StockMovement[];
  locations: Location[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  selectedLocation: string;
  onCreatePO: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => Promise<void>;
  onReceivePO?: (poId: string, receivedItems?: Record<string, number>) => Promise<void>;
  onStockAdjustment: (productId: string, qtyChange: number, reason: string) => Promise<void>;
  onStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>) => Promise<void>;
  onBulkAutoGeneratePOs?: () => Promise<void>;
  currencySymbol: string;
  activeSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  movements,
  locations,
  suppliers,
  purchaseOrders,
  selectedLocation,
  onCreatePO,
  onReceivePO,
  onStockAdjustment,
  onStockTransfer,
  onBulkAutoGeneratePOs,
  currencySymbol,
  activeSubTab = 'stock-levels',
  onSubTabChange,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Stock Count Variance');

  // Transfer Form States
  const [sourceLocId, setSourceLocId] = useState(locations[0]?.id || '');
  const [targetLocId, setTargetLocId] = useState(locations[1]?.id || locations[0]?.id || '');
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(5);

  // PO Modal Form States
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poProduct, setPoProduct] = useState<Product | null>(null);
  const [poOrderQty, setPoOrderQty] = useState<number>(50);
  const [poTargetLocId, setPoTargetLocId] = useState(locations[0]?.id || '');

  // PO Receiving Modal States
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({});

  // Batch Recall & Expiry Tool States
  const [recallSearchQuery, setRecallSearchQuery] = useState('');
  const [bulkPOSuccess, setBulkPOSuccess] = useState(false);

  const openCreatePOModal = (p: Product) => {
    setPoProduct(p);
    setPoOrderQty(Math.max(20, p.reorderPoint * 2 - p.stockQuantity));
    setPoTargetLocId(locations[0]?.id || '');
    setIsPOModalOpen(true);
  };

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poProduct) return;
    const targetLoc =
      locations.find((l) => l.id === poTargetLocId) ||
      locations[0] || { id: 'main-loc', name: 'Main Outlet' };
    const totalCost = poProduct.costPrice * poOrderQty;

    await onCreatePO({
      supplierId: poProduct.supplierId,
      supplierName: poProduct.supplierName,
      status: 'Sent',
      items: [
        {
          productId: poProduct.id,
          productName: poProduct.name,
          sku: poProduct.sku,
          unitCost: poProduct.costPrice,
          orderedQuantity: poOrderQty,
          receivedQuantity: 0,
          total: totalCost,
        },
      ],
      subtotal: totalCost,
      tax: totalCost * 0.085,
      total: totalCost * 1.085,
      expectedDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      locationId: targetLoc.id,
      locationName: targetLoc.name,
      notes: `Restock order triggered from inventory low-stock alert.`,
    });
    setIsPOModalOpen(false);
  };

  const handleOpenReceiveModal = (po: PurchaseOrder) => {
    setReceivingPO(po);
    const initialMap: Record<string, number> = {};
    po.items?.forEach((item) => {
      initialMap[item.productId] = item.orderedQuantity - (item.receivedQuantity || 0);
    });
    setReceivedQtyMap(initialMap);
  };

  const handleConfirmReceivePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingPO || !onReceivePO) return;
    await onReceivePO(receivingPO.id, receivedQtyMap);
    setReceivingPO(null);
  };

  const handleBulkPO = async () => {
    if (onBulkAutoGeneratePOs) {
      await onBulkAutoGeneratePOs();
      setBulkPOSuccess(true);
      setTimeout(() => setBulkPOSuccess(false), 3000);
    }
  };

  // Expiration calculation helper
  const getDaysUntilExpiration = (expDate?: string) => {
    if (!expDate) return null;
    const exp = new Date(expDate).getTime();
    const today = new Date().getTime();
    return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  };

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.reorderPoint && p.status !== 'Dead Stock'
  );

  const lotProducts = products.filter((p) => p.lotNumber || p.expirationDate);

  const recalledMovements = movements.filter((m) => {
    if (!recallSearchQuery.trim()) return false;
    const q = recallSearchQuery.toLowerCase();
    return (
      (m.lotNumber && m.lotNumber.toLowerCase().includes(q)) ||
      m.productName.toLowerCase().includes(q) ||
      m.sku.toLowerCase().includes(q) ||
      (m.notes && m.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 text-neutral-200 font-mono">
      {/* Subtabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => onSubTabChange && onSubTabChange('stock-levels')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'stock-levels' ? 'text-white font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('stock_levels', 'Stock Levels')} ({products.length})
            {activeSubTab === 'stock-levels' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>

          <button
            onClick={() => onSubTabChange && onSubTabChange('low-stock')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'low-stock' ? 'text-amber-400 font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('low_stock', 'Low Stock &amp; Reorder')} ({lowStockProducts.length})
            {activeSubTab === 'low-stock' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => onSubTabChange && onSubTabChange('lots-expiry')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'lots-expiry' ? 'text-emerald-400 font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            Lot Tracking &amp; FIFO Expiry ({lotProducts.length})
            {activeSubTab === 'lots-expiry' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => onSubTabChange && onSubTabChange('multi-location')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'multi-location' ? 'text-white font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            Multi-Outlet Matrix ({locations.length})
            {activeSubTab === 'multi-location' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>

          <button
            onClick={() => onSubTabChange && onSubTabChange('movements')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'movements' ? 'text-white font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('movements', 'Audit Trail')} ({movements.length})
            {activeSubTab === 'movements' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>

          <button
            onClick={() => onSubTabChange && onSubTabChange('purchases')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'purchases' ? 'text-white font-bold' : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('purchases', 'Purchase Orders')} ({purchaseOrders.length})
            {activeSubTab === 'purchases' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-white hover:border-white text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transfer Stock</span>
          </button>

          {activeSubTab === 'low-stock' && onBulkAutoGeneratePOs && (
            <button
              onClick={handleBulkPO}
              className="px-3 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{bulkPOSuccess ? 'Draft POs Created!' : 'Bulk Auto-Generate POs'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. TAB: STOCK LEVELS */}
      {activeSubTab === 'stock-levels' && (
        <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search stock by SKU, product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-neutral-950 border border-neutral-800 text-white pl-9 pr-3 py-2 focus:outline-none focus:border-white"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            </div>

            <div className="text-right text-xs text-neutral-400">
              Total Stock Units: <strong className="text-white">{products.reduce((acc, p) => acc + p.stockQuantity, 0)}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Product Name &amp; SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Unit Cost</th>
                  <th className="p-3 text-right">Available Qty</th>
                  <th className="p-3 text-right">Reorder Point</th>
                  <th className="p-3 text-right">Stock Valuation</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {products
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(search.toLowerCase()) ||
                      p.sku.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-950/60 transition-colors">
                      <td className="p-3 font-bold text-white">
                        {p.name}
                        <p className="text-[10px] text-neutral-500 font-normal font-mono">
                          SKU: {p.sku} | Barcode: {p.barcode}
                        </p>
                      </td>
                      <td className="p-3 text-neutral-300">{p.categoryName}</td>
                      <td className="p-3 text-right text-neutral-400 font-mono">
                        {formatCurrency(p.costPrice, currencySymbol)}
                      </td>
                      <td className="p-3 text-right font-bold text-white font-mono">
                        {p.stockQuantity}
                      </td>
                      <td className="p-3 text-right text-neutral-400 font-mono">
                        {p.reorderPoint}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-400 font-mono">
                        {formatCurrency(p.costPrice * p.stockQuantity, currencySymbol)}
                      </td>
                      <td className="p-3 text-center">
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
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedProductForAdjust(p);
                            setAdjustQty(0);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 hover:border-white text-[10px] font-bold uppercase transition-colors"
                        >
                          Adjust Qty
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TAB: LOW STOCK ALERTS & REORDERS */}
      {activeSubTab === 'low-stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-950 border border-amber-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white uppercase">
                  {lowStockProducts.length} Items Below Reorder Threshold
                </p>
                <p className="text-[11px] text-neutral-400">
                  Generate instant supplier purchase orders to prevent stockout disruptions.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-white text-xs">{p.name}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    SKU: {p.sku} • Supplier: {p.supplierName}
                  </p>
                  <div className="flex items-center gap-3 text-xs mt-2">
                    <span className="text-rose-400 font-bold">Current Stock: {p.stockQuantity}</span>
                    <span className="text-neutral-500 font-mono">|</span>
                    <span className="text-neutral-400">Reorder Point: {p.reorderPoint}</span>
                  </div>
                </div>

                <button
                  onClick={() => openCreatePOModal(p)}
                  className="px-3 py-2 bg-white text-black font-bold uppercase text-[10px] hover:bg-neutral-200 shrink-0"
                >
                  Create PO
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB: LOT TRACKING & FIFO EXPIRATION */}
      {activeSubTab === 'lots-expiry' && (
        <div className="space-y-6">
          {/* Expiration Health Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-neutral-900 border border-neutral-800 space-y-1">
              <p className="text-[10px] uppercase font-bold text-neutral-400">Total Tracked Lots</p>
              <p className="text-xl font-bold text-white">{lotProducts.length} Batches</p>
            </div>

            <div className="p-3.5 bg-neutral-900 border border-rose-900/60 space-y-1">
              <p className="text-[10px] uppercase font-bold text-rose-400">Expired Batches</p>
              <p className="text-xl font-bold text-rose-400">
                {lotProducts.filter((p) => {
                  const days = getDaysUntilExpiration(p.expirationDate);
                  return days !== null && days <= 0;
                }).length}
              </p>
            </div>

            <div className="p-3.5 bg-neutral-900 border border-amber-900/60 space-y-1">
              <p className="text-[10px] uppercase font-bold text-amber-400">Expiring in &lt; 90 Days</p>
              <p className="text-xl font-bold text-amber-400">
                {lotProducts.filter((p) => {
                  const days = getDaysUntilExpiration(p.expirationDate);
                  return days !== null && days > 0 && days <= 90;
                }).length}
              </p>
            </div>

            <div className="p-3.5 bg-neutral-900 border border-emerald-900/60 space-y-1">
              <p className="text-[10px] uppercase font-bold text-emerald-400">FIFO Rotation Rule</p>
              <p className="text-xs font-bold text-emerald-400 mt-1">Oldest First Active</p>
            </div>
          </div>

          {/* Batch Recall Search Engine */}
          <div className="p-4 bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Instant Lot &amp; Batch Recall Lookup</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Enter any lot number or batch code to audit all current store outlets and transaction history.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={recallSearchQuery}
                onChange={(e) => setRecallSearchQuery(e.target.value)}
                placeholder="Search Lot Number (e.g. LOT-2026-MX3 or BATCH-SURPLUS)..."
                className="flex-1 text-xs bg-neutral-900 border border-neutral-700 text-white px-3 py-2 focus:outline-none focus:border-white font-mono"
              />
              {recallSearchQuery && (
                <button
                  onClick={() => setRecallSearchQuery('')}
                  className="px-3 py-2 bg-neutral-800 text-neutral-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {recallSearchQuery && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2 mt-2">
                <p className="text-[10px] uppercase font-bold text-white">
                  Recall Audit Results ({recalledMovements.length} Events Found)
                </p>
                {recalledMovements.length === 0 ? (
                  <p className="text-neutral-500 text-xs italic">No past movements matched this batch.</p>
                ) : (
                  <div className="space-y-1 text-xs">
                    {recalledMovements.map((m) => (
                      <div
                        key={m.id}
                        className="p-2 bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-white">
                            {m.productName} ({m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange} Qty)
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            Type: {m.type} • Outlet: {m.locationName} • Date: {formatDateTime(m.createdAt)}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 font-bold">{m.referenceId || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lot & Expiry Table with FIFO Flags */}
          <div className="bg-neutral-900 border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Lot Number</th>
                  <th className="p-3">Batch Code</th>
                  <th className="p-3">Expiration Date</th>
                  <th className="p-3">Days Left</th>
                  <th className="p-3 text-center">FIFO Dispatch Priority</th>
                  <th className="p-3 text-right">Available Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {lotProducts.map((p) => {
                  const daysLeft = getDaysUntilExpiration(p.expirationDate);
                  const isExpired = daysLeft !== null && daysLeft <= 0;
                  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 90;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-950/60 transition-colors">
                      <td className="p-3 font-bold text-white">
                        {p.name}
                        <p className="text-[10px] text-neutral-500 font-normal font-mono">{p.sku}</p>
                      </td>
                      <td className="p-3 font-mono text-emerald-400 font-bold">{p.lotNumber || '—'}</td>
                      <td className="p-3 font-mono text-neutral-300">{p.batchNumber || '—'}</td>
                      <td className="p-3 font-mono text-neutral-300">
                        {p.expirationDate ? p.expirationDate.split('T')[0] : '—'}
                      </td>
                      <td className="p-3 font-mono">
                        {daysLeft === null ? (
                          '—'
                        ) : isExpired ? (
                          <span className="text-rose-400 font-bold uppercase text-[10px]">
                            Expired ({Math.abs(daysLeft)}d ago)
                          </span>
                        ) : isUrgent ? (
                          <span className="text-amber-400 font-bold text-xs">{daysLeft} days remaining</span>
                        ) : (
                          <span className="text-emerald-400 text-xs">{daysLeft} days</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {isExpired ? (
                          <span className="text-[9px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800 px-2 py-0.5 uppercase">
                            Quarantine / Recall
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-2 py-0.5 uppercase">
                            FIFO Tier 1 (Ship First)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold font-mono text-white">{p.stockQuantity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. TAB: MULTI-OUTLET INVENTORY MATRIX */}
      {activeSubTab === 'multi-location' && (
        <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Outlet Stock Matrix</span>
              </h3>
              <p className="text-xs text-neutral-400">
                View real-time stock allocation and reorder thresholds across all retail outlets.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Product / SKU</th>
                  <th className="p-3 text-right">Total Aggregate</th>
                  {locations.map((loc) => (
                    <th key={loc.id} className="p-3 text-right">
                      {loc.name}
                      <p className="text-[8px] text-neutral-500 font-normal font-mono">{loc.code}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-950/60 transition-colors">
                    <td className="p-3 font-bold text-white">
                      {p.name}
                      <p className="text-[10px] text-neutral-500 font-normal font-mono">{p.sku}</p>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400 font-mono">
                      {p.stockQuantity}
                    </td>
                    {locations.map((loc) => {
                      const qty = p.locationQuantities?.[loc.id] || 0;
                      const locReorder = p.locationReorderPoints?.[loc.id] || p.reorderPoint;
                      const isLow = qty <= locReorder;

                      return (
                        <td key={loc.id} className="p-3 text-right font-mono">
                          <span className={`font-bold ${isLow ? 'text-amber-400' : 'text-white'}`}>
                            {qty}
                          </span>
                          <span className="text-[9px] text-neutral-500 ml-1">
                            (Min: {locReorder})
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB: MOVEMENTS AUDIT TRAIL */}
      {activeSubTab === 'movements' && (
        <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">
              {t('stock_movements', 'Stock Movements Ledger')}
            </h3>
            <span className="text-xs text-neutral-400">{movements.length} Total Audit Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[10px] text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Movement Type</th>
                  <th className="p-3 text-right">Change</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Reference / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-950/60 transition-colors">
                    <td className="p-3 whitespace-nowrap text-neutral-400 font-mono text-[10px]">
                      {formatDateTime(m.createdAt)}
                    </td>
                    <td className="p-3 font-bold text-white">{m.productName}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-[10px] font-bold text-neutral-300 uppercase px-1.5 py-0.5 bg-neutral-950 border border-neutral-800">
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold font-mono">
                      <span className={m.quantityChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {m.quantityChange >= 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-white font-bold">{m.newStock}</td>
                    <td className="p-3 text-neutral-300">{m.locationName}</td>
                    <td className="p-3 text-neutral-400 font-mono text-[10px]">
                      {m.referenceId ? `${m.referenceId} — ` : ''}
                      {m.notes || 'Routine inventory update'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB: PURCHASE ORDERS */}
      {activeSubTab === 'purchases' && (
        <div className="bg-neutral-900 border border-neutral-800 p-5 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
            {t('purchases', 'Purchase Orders Register')}
          </h3>
          <div className="space-y-3">
            {purchaseOrders.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4">
                No purchase orders created yet. Use Low Stock alerts to create a PO.
              </p>
            ) : (
              purchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="p-4 bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-white">{po.poNumber}</p>
                    <p className="text-[11px] text-neutral-400">
                      {po.supplierName} • {formatDateTime(po.createdAt)} • {po.items?.length || 1} line item(s)
                    </p>
                    {po.items && po.items.length > 0 && (
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Items:{' '}
                        {po.items
                          .map((i) => `${i.productName} (${i.receivedQuantity || 0}/${i.orderedQuantity} rcvd)`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white">{formatCurrency(po.total, currencySymbol)}</p>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${
                          po.status === 'Received'
                            ? 'border-emerald-800 text-emerald-400 bg-emerald-950/60'
                            : po.status === 'Partial'
                            ? 'border-sky-800 text-sky-400 bg-sky-950/60'
                            : 'border-amber-900/60 text-amber-400 bg-amber-950/60'
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>

                    {po.status !== 'Received' && onReceivePO && (
                      <button
                        onClick={() => handleOpenReceiveModal(po)}
                        className="px-3 py-1.5 bg-white text-black font-bold uppercase text-[10px] hover:bg-neutral-200 transition-colors"
                      >
                        Receive Shipment
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Interactive Partial/Full PO Receiving */}
      {receivingPO && (
        <Modal
          isOpen={Boolean(receivingPO)}
          onClose={() => setReceivingPO(null)}
          title={`RECEIVE SHIPMENT // PO #${receivingPO.poNumber}`}
        >
          <form onSubmit={handleConfirmReceivePO} className="space-y-4 font-mono text-xs text-neutral-200">
            <p className="text-neutral-400 leading-relaxed">
              Verify actual physical quantities received from supplier{' '}
              <strong className="text-white">{receivingPO.supplierName}</strong>. Partial receipts will mark PO
              as &apos;Partial&apos; and track backorders.
            </p>

            <div className="space-y-3 p-3 bg-neutral-950 border border-neutral-800">
              {receivingPO.items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <p className="font-bold text-white">{item.productName}</p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      SKU: {item.sku} • Ordered: {item.orderedQuantity} • Already Received:{' '}
                      {item.receivedQuantity || 0}
                    </p>
                  </div>

                  <div className="w-32">
                    <label className="block text-[9px] uppercase text-neutral-400 mb-0.5">
                      Receive Qty
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={item.orderedQuantity - (item.receivedQuantity || 0)}
                      value={receivedQtyMap[item.productId] ?? (item.orderedQuantity - (item.receivedQuantity || 0))}
                      onChange={(e) =>
                        setReceivedQtyMap({
                          ...receivedQtyMap,
                          [item.productId]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-neutral-950 border border-neutral-700 text-white p-1.5 text-xs text-right font-mono focus:border-white outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReceivingPO(null)}
                className="px-4 py-2 bg-neutral-900 text-neutral-300 uppercase font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-white text-black uppercase font-bold text-xs hover:bg-neutral-200 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Credit Inventory</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Inter-Outlet Stock Transfer */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="INTER-OUTLET STOCK TRANSFER"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const srcLoc = locations.find((l) => l.id === sourceLocId) || locations[0];
            const dstLoc = locations.find((l) => l.id === targetLocId) || locations[1] || locations[0];
            const p = products.find((prod) => prod.id === transferProductId);
            if (!p || !srcLoc || !dstLoc) return;

            await onStockTransfer({
              sourceLocationId: srcLoc.id,
              sourceLocationName: srcLoc.name,
              targetLocationId: dstLoc.id,
              targetLocationName: dstLoc.name,
              status: 'Completed',
              items: [
                {
                  productId: p.id,
                  productName: p.name,
                  sku: p.sku,
                  quantity: transferQty,
                },
              ],
            });
            setIsTransferModalOpen(false);
          }}
          className="space-y-4 font-mono text-xs text-neutral-200"
        >
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
              Select Product to Transfer
            </label>
            <select
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Total Avail: {p.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                Source Location
              </label>
              <select
                value={sourceLocId}
                onChange={(e) => setSourceLocId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
                Target Location
              </label>
              <select
                value={targetLocId}
                onChange={(e) => setTargetLocId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
              Transfer Quantity
            </label>
            <input
              type="number"
              min="1"
              required
              value={transferQty}
              onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 bg-neutral-900 text-neutral-300 uppercase font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-white text-black uppercase font-bold text-xs hover:bg-neutral-200 flex items-center gap-1"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Execute Transfer</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Adjust Stock */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="ADJUST STOCK QUANTITY"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedProductForAdjust) return;
            await onStockAdjustment(selectedProductForAdjust.id, adjustQty, adjustReason);
            setIsAdjustModalOpen(false);
          }}
          className="space-y-4 font-mono text-xs text-neutral-200"
        >
          {selectedProductForAdjust && (
            <div className="p-3 bg-neutral-950 border border-neutral-800">
              <p className="font-bold text-white">{selectedProductForAdjust.name}</p>
              <p className="text-[10px] text-neutral-400 font-mono">
                Current Stock: {selectedProductForAdjust.stockQuantity}
              </p>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
              Quantity Change (+ or -)
            </label>
            <input
              type="number"
              required
              value={adjustQty}
              onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
              placeholder="e.g. +5 or -2"
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
              Reason for Adjustment
            </label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
            >
              <option value="Physical Count Variance">Physical Count Variance</option>
              <option value="Damaged / Broken Inventory">Damaged / Broken Inventory</option>
              <option value="Returned by Customer">Returned by Customer</option>
              <option value="Supplier Promotional Sample">Supplier Promotional Sample</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 bg-neutral-900 text-neutral-300 uppercase font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-white text-black uppercase font-bold text-xs hover:bg-neutral-200"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create PO */}
      <Modal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        title="GENERATE PURCHASE ORDER"
      >
        <form onSubmit={handlePOSubmit} className="space-y-4 font-mono text-xs text-neutral-200">
          {poProduct && (
            <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-1">
              <p className="font-bold text-white">{poProduct.name}</p>
              <p className="text-[10px] text-neutral-400">
                Supplier: <strong className="text-white">{poProduct.supplierName}</strong>
              </p>
              <p className="text-[10px] text-neutral-400">
                Unit Cost: {formatCurrency(poProduct.costPrice, currencySymbol)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
              Quantity to Order
            </label>
            <input
              type="number"
              min="1"
              required
              value={poOrderQty}
              onChange={(e) => setPoOrderQty(parseInt(e.target.value) || 1)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">
              Destination Warehouse / Store
            </label>
            <select
              value={poTargetLocId}
              onChange={(e) => setPoTargetLocId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white p-2 focus:border-white outline-none"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPOModalOpen(false)}
              className="px-4 py-2 bg-neutral-900 text-neutral-300 uppercase font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-white text-black uppercase font-bold text-xs hover:bg-neutral-200 flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Issue Purchase Order</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
