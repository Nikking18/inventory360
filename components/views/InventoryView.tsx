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

  const handleCreatePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poProduct) return;

    const sup = suppliers.find((s) => s.id === poProduct.supplierId) || {
      id: poProduct.supplierId,
      name: poProduct.supplierName,
    };
    const targetLoc = locations.find((l) => l.id === poTargetLocId) || locations[0];

    const lineTotal = poProduct.costPrice * poOrderQty;
    const poPayload: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'> = {
      supplierId: sup.id,
      supplierName: sup.name,
      items: [
        {
          productId: poProduct.id,
          productName: poProduct.name,
          sku: poProduct.sku,
          unitCost: poProduct.costPrice,
          orderedQuantity: poOrderQty,
          receivedQuantity: 0,
          total: lineTotal,
        },
      ],
      subtotal: lineTotal,
      tax: lineTotal * 0.085,
      total: lineTotal * 1.085,
      status: 'Sent',
      expectedDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      locationId: targetLoc?.id || 'loc_downtown',
      locationName: targetLoc?.name || 'Downtown Flagship',
      notes: `Restock PO for ${poProduct.name} generated via Inventory Control.`,
    };

    await onCreatePO(poPayload);
    setIsPOModalOpen(false);
  };

  const handleBulkAutoReorders = async () => {
    if (onBulkAutoGeneratePOs) {
      await onBulkAutoGeneratePOs();
      setBulkPOSuccess(true);
      setTimeout(() => setBulkPOSuccess(false), 3500);
    }
  };

  const openAdjustModal = (p: Product) => {
    setSelectedProductForAdjust(p);
    setAdjustQty(0);
    setAdjustReason('Cycle Count Physical Audit');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;

    await onStockAdjustment(selectedProductForAdjust.id, adjustQty, adjustReason);
    setIsAdjustModalOpen(false);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceLocId === targetLocId) return;

    const prod = products.find((p) => p.id === transferProductId);
    const src = locations.find((l) => l.id === sourceLocId);
    const dst = locations.find((l) => l.id === targetLocId);

    if (!prod || !src || !dst) return;

    await onStockTransfer({
      sourceLocationId: src.id,
      sourceLocationName: src.name,
      targetLocationId: dst.id,
      targetLocationName: dst.name,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: transferQty,
        },
      ],
      status: 'Completed',
    });

    setIsTransferModalOpen(false);
  };

  const openReceiveModal = (po: PurchaseOrder) => {
    setReceivingPO(po);
    const initialMap: Record<string, number> = {};
    po.items.forEach((item) => {
      initialMap[item.productId] = item.orderedQuantity - (item.receivedQuantity || 0);
    });
    setReceivedQtyMap(initialMap);
  };

  const handleConfirmReceive = async () => {
    if (!receivingPO || !onReceivePO) return;
    await onReceivePO(receivingPO.id, receivedQtyMap);
    setReceivingPO(null);
  };

  const filteredProducts = products.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.lotNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = products.filter((p) => p.stockQuantity <= p.reorderPoint && p.status !== 'Dead Stock');
  const expiringItems = products.filter((p) => p.expirationDate);

  return (
    <div id="tour-inventory-hub" className="space-y-6 text-slate-900 font-mono">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wider font-heading">
            {t('inventory', 'Multi-Outlet Inventory Management')}
          </h1>
          <p className="text-xs text-slate-600">
            Stock ledger, inter-branch transfers, low-stock PO automation, and lot tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              'stock-levels',
              'low-stock',
              'lots-expiry',
              'multi-location',
              'movements',
              'purchases',
            ] as const
          ).map((tabId) => (
            <button
              key={tabId}
              onClick={() => onSubTabChange && onSubTabChange(tabId)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeSubTab === tabId
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tabId === 'stock-levels'
                ? 'Stock Levels'
                : tabId === 'low-stock'
                ? `Low Stock (${lowStockItems.length})`
                : tabId === 'lots-expiry'
                ? 'Lots & Expiry'
                : tabId === 'multi-location'
                ? 'Multi-Outlet'
                : tabId === 'movements'
                ? 'Movements'
                : 'Purchase Orders'}
            </button>
          ))}

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* 1. STOCK LEVELS TAB */}
      {activeSubTab === 'stock-levels' && (
        <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Search stock by SKU, product name, lot..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-9 pr-3 py-2 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>New Inter-Outlet Transfer</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">Product &amp; SKU</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Cost Value</th>
                  <th className="p-2.5 text-right">Retail Value</th>
                  <th className="p-2.5 text-right">In Stock</th>
                  <th className="p-2.5 text-right">Min Reorder</th>
                  <th className="p-2.5 text-center">Health</th>
                  <th className="p-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                    </td>
                    <td className="p-2.5 text-slate-700">{p.categoryName}</td>
                    <td className="p-2.5 text-right font-mono text-slate-600">
                      {formatCurrency(p.costPrice * p.stockQuantity, currencySymbol)}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(p.retailPrice * p.stockQuantity, currencySymbol)}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{p.stockQuantity}</td>
                    <td className="p-2.5 text-right text-slate-500">{p.reorderPoint}</td>
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
                          onClick={() => openAdjustModal(p)}
                          className="px-2 py-1 bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 text-[10px] uppercase font-bold"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => openCreatePOModal(p)}
                          className="px-2 py-1 bg-slate-900 text-white hover:bg-black text-[10px] uppercase font-bold"
                        >
                          + PO
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. LOW STOCK & AUTO REORDERS TAB */}
      {activeSubTab === 'low-stock' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Restock Alerts &amp; PO Generator ({lowStockItems.length})</span>
              </h3>
              <p className="text-xs text-slate-600">
                Products currently below defined minimum inventory thresholds.
              </p>
            </div>

            {lowStockItems.length > 0 && (
              <button
                onClick={handleBulkAutoReorders}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate All Restock POs</span>
              </button>
            )}
          </div>

          {bulkPOSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Automated purchase orders generated and dispatched to supplier registry.</span>
            </div>
          )}

          {lowStockItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 uppercase text-xs">All Inventory Healthy</h4>
              <p className="text-xs text-slate-500 font-mono">No products currently breach minimum reorder levels.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {lowStockItems.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 border border-amber-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                      <p className="text-[10px] text-slate-500">SKU: {p.sku}</p>
                      <p className="text-[10px] text-slate-600">Supplier: {p.supplierName}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-300">
                      {p.stockQuantity} / Min {p.reorderPoint}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      Cost: {formatCurrency(p.costPrice, currencySymbol)}
                    </span>
                    <button
                      onClick={() => openCreatePOModal(p)}
                      className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
                    >
                      Create PO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. LOTS & EXPIRY TAB */}
      {activeSubTab === 'lots-expiry' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Batch, Lot &amp; Expiration Tracking
            </h3>
            <p className="text-xs text-slate-600">
              FIFO audit trail and expiration date warnings across active lots.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">Product</th>
                  <th className="p-2.5">SKU</th>
                  <th className="p-2.5">Lot #</th>
                  <th className="p-2.5">Batch #</th>
                  <th className="p-2.5">Expiration Date</th>
                  <th className="p-2.5 text-right">In Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                      No batch/lot expiration dates assigned to products yet.
                    </td>
                  </tr>
                ) : (
                  expiringItems.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                      <td className="p-2.5 text-slate-600">{p.sku}</td>
                      <td className="p-2.5 text-slate-800 font-bold">{p.lotNumber || 'N/A'}</td>
                      <td className="p-2.5 text-slate-600">{p.batchNumber || 'N/A'}</td>
                      <td className="p-2.5 font-bold text-amber-800">{p.expirationDate}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{p.stockQuantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. MULTI-LOCATION MATRIX TAB */}
      {activeSubTab === 'multi-location' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Multi-Outlet Stock Allocation Matrix
            </h3>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
            >
              Transfer Stock
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">Product &amp; SKU</th>
                  {locations.map((loc) => (
                    <th key={loc.id} className="p-2.5 text-right">
                      {loc.name}
                    </th>
                  ))}
                  <th className="p-2.5 text-right">Total Aggregate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-2.5">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.sku}</p>
                    </td>
                    {locations.map((loc) => {
                      const locQty = p.locationQuantities?.[loc.id] ?? Math.floor(p.stockQuantity / locations.length);
                      return (
                        <td key={loc.id} className="p-2.5 text-right font-mono text-slate-800">
                          {locQty}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                      {p.stockQuantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MOVEMENTS AUDIT LOG TAB */}
      {activeSubTab === 'movements' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
            Immutable Stock Movement Audit Trail ({movements.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">Date &amp; Time</th>
                  <th className="p-2.5">Product &amp; SKU</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Outlet</th>
                  <th className="p-2.5 text-right">Qty Change</th>
                  <th className="p-2.5 text-right">Ending Stock</th>
                  <th className="p-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-500 text-[10px]">{formatDateTime(m.createdAt)}</td>
                    <td className="p-2.5 font-bold text-slate-900">{m.productName}</td>
                    <td className="p-2.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 border border-slate-300 bg-slate-100 text-slate-800 uppercase">
                        {m.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600">{m.locationName}</td>
                    <td
                      className={`p-2.5 text-right font-bold ${
                        m.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{m.newStock}</td>
                    <td className="p-2.5 text-slate-500 text-[10px] max-w-[200px] truncate">{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. PURCHASE ORDERS TAB */}
      {activeSubTab === 'purchases' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Purchase Orders ({purchaseOrders.length})
            </h3>
            {products[0] && (
              <button
                onClick={() => openCreatePOModal(products[0])}
                className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
              >
                + New PO
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">PO #</th>
                  <th className="p-2.5">Supplier</th>
                  <th className="p-2.5">Target Location</th>
                  <th className="p-2.5 text-right">Items</th>
                  <th className="p-2.5 text-right">Total</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Receiving</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{po.poNumber}</td>
                    <td className="p-2.5 text-slate-700">{po.supplierName}</td>
                    <td className="p-2.5 text-slate-600">{po.locationName}</td>
                    <td className="p-2.5 text-right text-slate-800">{po.items.length} SKUs</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {formatCurrency(po.total, currencySymbol)}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                          po.status === 'Received'
                            ? 'text-emerald-800 border-emerald-300 bg-emerald-50'
                            : 'text-amber-800 border-amber-300 bg-amber-50'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      {po.status !== 'Received' && (
                        <button
                          onClick={() => openReceiveModal(po)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold uppercase"
                        >
                          Receive Stock
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

      {/* Stock Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="INTER-OUTLET STOCK TRANSFER"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Select Product</label>
            <select
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — {p.stockQuantity} in stock
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Source Outlet</label>
              <select
                value={sourceLocId}
                onChange={(e) => setSourceLocId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Target Outlet</label>
              <select
                value={targetLocId}
                onChange={(e) => setTargetLocId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900"
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
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Transfer Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold uppercase hover:bg-black"
            >
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`ADJUST INVENTORY: ${selectedProductForAdjust?.name || ''}`}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <p className="text-slate-600">
              Current Stock: <strong>{selectedProductForAdjust?.stockQuantity}</strong>
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Quantity Change (+ / -)
            </label>
            <input
              type="number"
              required
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Reason / Note</label>
            <input
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold uppercase hover:bg-black"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Purchase Order Creation Modal */}
      <Modal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        title={`CREATE PO: ${poProduct?.name || ''}`}
      >
        <form onSubmit={handleCreatePOSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Supplier</label>
            <p className="p-2 bg-slate-50 border border-slate-200 font-bold text-slate-900">
              {poProduct?.supplierName || 'Default Supplier'}
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Ship to Location</label>
            <select
              value={poTargetLocId}
              onChange={(e) => setPoTargetLocId(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Order Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={poOrderQty}
              onChange={(e) => setPoOrderQty(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 flex justify-between">
            <span className="text-slate-600">Estimated Total:</span>
            <span className="font-bold text-slate-900">
              {formatCurrency((poProduct?.costPrice || 0) * poOrderQty * 1.085, currencySymbol)}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPOModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold uppercase hover:bg-black"
            >
              Dispatch PO
            </button>
          </div>
        </form>
      </Modal>

      {/* PO Receiving Modal */}
      {receivingPO && (
        <Modal
          isOpen={!!receivingPO}
          onClose={() => setReceivingPO(null)}
          title={`RECEIVE PURCHASE ORDER: ${receivingPO.poNumber}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <p className="text-slate-600">Verify received units to update active inventory levels.</p>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {receivingPO.items.map((item) => (
                <div key={item.productId} className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <p className="text-[10px] text-slate-500">Ordered: {item.orderedQuantity} | Received so far: {item.receivedQuantity || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-600 uppercase font-bold">Qty:</label>
                    <input
                      type="number"
                      min="0"
                      max={item.orderedQuantity - (item.receivedQuantity || 0)}
                      value={receivedQtyMap[item.productId] ?? 0}
                      onChange={(e) =>
                        setReceivedQtyMap({
                          ...receivedQtyMap,
                          [item.productId]: Number(e.target.value),
                        })
                      }
                      className="w-16 bg-white border border-slate-300 p-1 text-center font-bold text-slate-900"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReceivingPO(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReceive}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase"
              >
                Confirm Receipt &amp; Restock
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
