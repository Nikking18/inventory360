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
  onReceivePO?: (poId: string) => Promise<void>;
  onStockAdjustment: (productId: string, qtyChange: number, reason: string) => Promise<void>;
  onStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>) => Promise<void>;
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

  const openCreatePOModal = (p: Product) => {
    setPoProduct(p);
    setPoOrderQty(Math.max(20, (p.reorderPoint * 2) - p.stockQuantity));
    setPoTargetLocId(locations[0]?.id || '');
    setIsPOModalOpen(true);
  };

  const handlePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poProduct) return;
    const targetLoc = locations.find((l) => l.id === poTargetLocId) || locations[0] || { id: 'main-loc', name: 'Main Outlet' };
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
          orderedQuantity: Number(poOrderQty),
          receivedQuantity: 0,
          unitCost: poProduct.costPrice,
          total: totalCost,
        },
      ],
      subtotal: totalCost,
      tax: 0,
      total: totalCost,
      expectedDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      locationId: targetLoc.id,
      locationName: targetLoc.name,
    });
    setIsPOModalOpen(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.reorderPoint || p.status === 'Low Stock' || p.status === 'Out of Stock'
  );

  const [showExportMenu, setShowExportMenu] = useState(false);

  const getExportData = () => {
    return filteredProducts.map((p) => ({
      'Product Name': p.name,
      SKU: p.sku,
      'Stock Quantity': p.stockQuantity,
      'Reorder Point': p.reorderPoint,
      'Cost Price': p.costPrice,
      'Selling Price': p.retailPrice,
      Status: p.status,
    }));
  };

  const handleExportCSV = () => {
    exportToCSV(`Inventory_${activeSubTab}_${new Date().toISOString().split('T')[0]}`, getExportData());
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    exportToExcel(`Inventory_${activeSubTab}_${new Date().toISOString().split('T')[0]}`, getExportData());
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    exportToPDF(
      `Inventory_${activeSubTab}_${new Date().toISOString().split('T')[0]}`,
      `Inventory Audit & Stock Record (${activeSubTab.toUpperCase().replace('-', ' ')})`,
      getExportData()
    );
    setShowExportMenu(false);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;
    await onStockAdjustment(selectedProductForAdjust.id, Number(adjustQty), adjustReason);
    setIsAdjustModalOpen(false);
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sourceLoc = locations.find((l) => l.id === sourceLocId);
    const targetLoc = locations.find((l) => l.id === targetLocId);
    const prod = products.find((p) => p.id === transferProductId);

    if (!sourceLoc || !targetLoc || !prod) return;

    await onStockTransfer({
      sourceLocationId: sourceLoc.id,
      sourceLocationName: sourceLoc.name,
      targetLocationId: targetLoc.id,
      targetLocationName: targetLoc.name,
      status: 'Completed',
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: Number(transferQty),
        },
      ],
    });
    setIsTransferModalOpen(false);
  };

  return (
    <div id="tour-inventory-hub" className="space-y-6 text-neutral-200 font-mono">
      {/* View Header Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => onSubTabChange && onSubTabChange('stock-levels')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'stock-levels'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('stock-levels', 'Stock Levels')}
            {activeSubTab === 'stock-levels' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('low-stock')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'low-stock'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('low_stock_alerts', 'Low Stock Alerts')} ({lowStockProducts.length})
            {activeSubTab === 'low-stock' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('movements')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'movements'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('stock_movements', 'Stock Movements')}
            {activeSubTab === 'movements' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('transfers')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'transfers'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('stock_transfers', 'Stock Transfers')}
            {activeSubTab === 'transfers' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('purchases')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'purchases'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('purchases', 'Purchase Orders')} ({purchaseOrders.length})
            {activeSubTab === 'purchases' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown Group */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-white text-white text-xs font-bold rounded-none uppercase tracking-wider flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>{t('export', 'Export')}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-neutral-900 border border-neutral-700 shadow-2xl z-30 divide-y divide-neutral-800">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors font-mono"
                >
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold uppercase">CSV (.csv)</div>
                    <div className="text-[10px] text-neutral-400">Comma-separated text file</div>
                  </div>
                </button>

                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors font-mono"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold uppercase">Excel (.xls / .xlsx)</div>
                    <div className="text-[10px] text-neutral-400">Sortable spreadsheet file</div>
                  </div>
                </button>

                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-4 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors font-mono"
                >
                  <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-bold uppercase">PDF (.pdf)</div>
                    <div className="text-[10px] text-neutral-400">Fixed document & printable record</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-white text-white text-xs font-bold rounded-none uppercase tracking-wider flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{t('transfer_stock', 'Transfer Stock')}</span>
          </button>
        </div>
      </div>

      {/* STOCK LEVELS SUBTAB */}
      {activeSubTab === 'stock-levels' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-5 space-y-4">
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder={t('search_catalog', 'Search by product title or SKU...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-none pl-9 pr-3 py-2 focus:outline-none focus:border-white font-mono"
            />
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500 font-bold uppercase text-[10px] tracking-widest">
                  <th className="py-2.5 px-3">{t('product_name', 'Product Name')}</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">{t('in_stock', 'In Stock')}</th>
                  <th className="py-2.5 px-3 text-right">{t('reorder_point', 'Reorder Point')}</th>
                  <th className="py-2.5 px-3 text-right">{t('cost_price', 'Cost Value')}</th>
                  <th className="py-2.5 px-3 text-center">{t('status', 'Status')}</th>
                  <th className="py-2.5 px-3 text-center">{t('actions', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-950/60 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{p.name}</td>
                    <td className="py-3 px-3 text-neutral-400">{p.sku}</td>
                    <td className="py-3 px-3 text-right font-bold text-white">{p.stockQuantity}</td>
                    <td className="py-3 px-3 text-right text-neutral-400">{p.reorderPoint}</td>
                    <td className="py-3 px-3 text-right text-neutral-300">
                      {formatCurrency(p.stockQuantity * p.costPrice, currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                        p.status === 'Healthy' ? 'border-emerald-800 text-emerald-400 bg-emerald-950/40' :
                        p.status === 'Low Stock' ? 'border-amber-800 text-amber-400 bg-amber-950/40' :
                        'border-rose-800 text-rose-400 bg-rose-950/40'
                      }`}>
                        {p.status === 'Healthy' ? t('in_stock', 'Healthy') : p.status === 'Low Stock' ? t('low_stock_badge', 'Low Stock') : t('out_of_stock', 'Out of Stock')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedProductForAdjust(p);
                          setAdjustQty(0);
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-white text-[10px] uppercase font-bold"
                      >
                        {t('adjust', 'Adjust')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LOW STOCK SUBTAB */}
      {activeSubTab === 'low-stock' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-5 space-y-4 font-mono">
          <div className="flex items-center gap-2 text-amber-400 border-b border-neutral-800 pb-3">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="font-bold text-sm uppercase tracking-wider">{t('low_stock_alerts', 'Low Stock Reorder Alerts')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="p-4 bg-neutral-950 border border-amber-900/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{p.name}</p>
                  <p className="text-[11px] text-neutral-400">SKU: {p.sku} | Supplier: {p.supplierName}</p>
                  <p className="text-xs text-amber-400 mt-1 font-bold">{p.stockQuantity} in stock (Min threshold: {p.reorderPoint})</p>
                </div>
                <button
                  onClick={() => openCreatePOModal(p)}
                  className="px-3 py-1.5 bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200"
                >
                  {t('reorder', 'Create PO')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MOVEMENTS SUBTAB */}
      {activeSubTab === 'movements' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-5 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
            {t('stock_movements', 'Audit Trail Stock Movements')}
          </h3>
          <div className="space-y-2">
            {movements.map((m) => (
              <div key={m.id} className="p-3 bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{m.productName}</p>
                  <p className="text-[10px] text-neutral-500">{m.type}{m.notes ? ` (${m.notes})` : ''} • {formatDateTime(m.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${m.quantityChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                  </span>
                  <p className="text-[10px] text-neutral-400">{m.locationName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PURCHASES SUBTAB */}
      {activeSubTab === 'purchases' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-none p-5 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
            {t('purchases', 'Purchase Orders Register')}
          </h3>
          <div className="space-y-3">
            {purchaseOrders.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4">No purchase orders created yet. Use Low Stock alerts to create a PO.</p>
            ) : (
              purchaseOrders.map((po) => (
                <div key={po.id} className="p-4 bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{po.poNumber}</p>
                    <p className="text-[11px] text-neutral-400">
                      {po.supplierName} • {formatDateTime(po.createdAt)} • {po.items?.length || 1} line item(s)
                    </p>
                    {po.items && po.items.length > 0 && (
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Items: {po.items.map((i) => `${i.productName} (${i.orderedQuantity} qty)`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white">{formatCurrency(po.total, currencySymbol)}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${
                        po.status === 'Received'
                          ? 'border-emerald-800 text-emerald-400 bg-emerald-950/60'
                          : 'border-amber-900/60 text-amber-400 bg-amber-950/60'
                      }`}>
                        {po.status}
                      </span>
                    </div>

                    {po.status !== 'Received' && onReceivePO && (
                      <button
                        onClick={() => onReceivePO(po.id)}
                        className="px-3 py-1.5 bg-white text-black font-bold uppercase text-[10px] hover:bg-neutral-200 transition-colors"
                      >
                        Receive Stock
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={t('adjust', 'Stock Quantity Adjustment')}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 font-mono text-xs">
          <p className="text-neutral-300 font-bold">{selectedProductForAdjust?.name}</p>
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('stock', 'Quantity Change (+ or -)')}</label>
            <input
              type="number"
              required
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('reason', 'Adjustment Reason')}</label>
            <input
              type="text"
              required
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="flex-1 py-2 bg-neutral-950 border border-neutral-800 text-white font-bold uppercase hover:bg-neutral-800"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-white text-black font-bold uppercase hover:bg-neutral-200"
            >
              {t('save_changes', 'Confirm Adjustment')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Transfer Stock Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title={t('transfer_stock', 'Inter-Outlet Stock Transfer')}
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('product_name', 'Select Product')}</label>
            <select
              value={transferProductId}
              onChange={(e) => setTransferProductId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (In stock: {p.stockQuantity})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('source_location', 'Source Location')}</label>
              <select
                value={sourceLocId}
                onChange={(e) => setSourceLocId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('target_location', 'Target Location')}</label>
              <select
                value={targetLocId}
                onChange={(e) => setTargetLocId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">{t('stock', 'Transfer Quantity')}</label>
            <input
              type="number"
              min="1"
              required
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="flex-1 py-2 bg-neutral-950 border border-neutral-800 text-white font-bold uppercase hover:bg-neutral-800"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-white text-black font-bold uppercase hover:bg-neutral-200"
            >
              {t('transfer_stock', 'Execute Transfer')}
            </button>
          </div>
        </form>
      </Modal>

      {/* PO Creation Customization Modal */}
      {isPOModalOpen && poProduct && (
        <Modal
          isOpen={isPOModalOpen}
          onClose={() => setIsPOModalOpen(false)}
          title={`Generate Purchase Order: ${poProduct.name}`}
        >
          <form onSubmit={handlePOSubmit} className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-1">
              <p className="text-white font-bold">{poProduct.name}</p>
              <p className="text-[10px] text-neutral-400">SKU: {poProduct.sku} | Supplier: {poProduct.supplierName}</p>
              <p className="text-[10px] text-neutral-400">Unit Cost: {formatCurrency(poProduct.costPrice, currencySymbol)}</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                Order Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={poOrderQty}
                onChange={(e) => setPoOrderQty(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">
                Destination Outlet Location
              </label>
              <select
                value={poTargetLocId}
                onChange={(e) => setPoTargetLocId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white font-mono"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 flex justify-between font-mono">
              <span className="text-neutral-400 uppercase text-[10px] font-bold">Estimated Order Total:</span>
              <span className="text-white font-bold">{formatCurrency(poProduct.costPrice * poOrderQty, currencySymbol)}</span>
            </div>

            <div className="flex gap-3 pt-4 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsPOModalOpen(false)}
                className="flex-1 py-2 bg-neutral-950 border border-neutral-800 text-white font-bold uppercase hover:bg-neutral-800"
              >
                {t('cancel', 'Cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-white text-black font-bold uppercase hover:bg-neutral-200"
              >
                Generate PO
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
