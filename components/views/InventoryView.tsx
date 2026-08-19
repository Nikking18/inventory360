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
  BusinessSettings,
} from '../../lib/types';
import { formatCurrency, formatDateTime, round2 } from '../../lib/utils';
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
  TrendingDown,
  TrendingUp,
  RotateCcw,
  CheckSquare,
  Eye,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  Sliders,
  Edit3,
} from 'lucide-react';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  downloadPOSlipPDF,
} from '../../lib/exportImport';

interface InventoryViewProps {
  products: Product[];
  movements: StockMovement[];
  locations: Location[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  selectedLocation?: string;
  onCreatePO: (po: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => Promise<void>;
  onReceivePO?: (poId: string, receivedItems?: Record<string, number>) => Promise<void>;
  onStockAdjustment: (productId: string, qtyChange: number, reason: string) => Promise<void>;
  onStockTransfer: (transfer: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>) => Promise<void>;
  onBulkAutoGeneratePOs?: () => Promise<void>;
  onQuarantineProduct?: (productId: string, isQuarantine: boolean) => Promise<void>;
  onUpdateProductReorderPoint?: (productId: string, newPoint: number) => Promise<void>;
  currencySymbol: string;
  settings?: BusinessSettings;
  activeSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  movements,
  locations = [],
  suppliers = [],
  purchaseOrders = [],
  selectedLocation,
  onCreatePO,
  onReceivePO,
  onStockAdjustment,
  onStockTransfer,
  onBulkAutoGeneratePOs,
  onQuarantineProduct,
  onUpdateProductReorderPoint,
  currencySymbol,
  settings,
  activeSubTab = 'stock-levels',
  onSubTabChange,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [movementTypeFilter, setMovementTypeFilter] = useState('all');
  const [poStatusFilter, setPoStatusFilter] = useState('all');

  // Low Stock Custom Threshold Limit
  const [customLowStockLimit, setCustomLowStockLimit] = useState<number | ''>('');
  const [isDuplicatePOModalOpen, setIsDuplicatePOModalOpen] = useState(false);
  const [editingReorderProduct, setEditingReorderProduct] = useState<Product | null>(null);
  const [newReorderPointInput, setNewReorderPointInput] = useState<number>(10);

  // Transfer Modal Form States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isRowTransferMode, setIsRowTransferMode] = useState(false);
  const [sourceLocId, setSourceLocId] = useState(locations[0]?.id || '');
  const [targetLocId, setTargetLocId] = useState(locations[1]?.id || locations[0]?.id || '');
  const [transferProductId, setTransferProductId] = useState(products[0]?.id || '');
  const [transferQty, setTransferQty] = useState<number>(5);
  const [transferNotes, setTransferNotes] = useState('');

  // Stock Adjustment Modal Form States
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductForAdjust, setSelectedProductForAdjust] = useState<Product | null>(null);
  const [adjustMode, setAdjustMode] = useState<'delta' | 'exact'>('delta');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [newExactStock, setNewExactStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('Cycle Count Physical Audit');

  // Purchase Order Creation Modal States
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState(suppliers[0]?.id || '');
  const [poProductId, setPoProductId] = useState(products[0]?.id || '');
  const [poOrderQty, setPoOrderQty] = useState<number>(50);
  const [poUnitCost, setPoUnitCost] = useState<number>(products[0]?.costPrice || 10);
  const [poTargetLocId, setPoTargetLocId] = useState(locations[0]?.id || '');
  const [poExpectedDate, setPoExpectedDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [poNotes, setPoNotes] = useState('');

  // PO Receiving Workflow Modal States
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [receivedQtyMap, setReceivedQtyMap] = useState<Record<string, number>>({});

  // Batch Recall & Expiry Quarantine States
  const [recallSearchQuery, setRecallSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Expanded PO Cards
  const [expandedPoIds, setExpandedPoIds] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const togglePoExpand = (poId: string) => {
    setExpandedPoIds((prev) => ({ ...prev, [poId]: !prev[poId] }));
  };

  // Calculations & Aggregates
  const lowStockItems = products.filter((p) => {
    if (p.status === 'Dead Stock' || p.status === 'Quarantined') return false;
    const effectiveLimit = customLowStockLimit !== '' ? Number(customLowStockLimit) : p.reorderPoint;
    return p.stockQuantity <= effectiveLimit;
  });

  const outOfStockItems = products.filter((p) => p.stockQuantity === 0);
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const totalCostValuation = round2(
    products.reduce((acc, p) => acc + (p.costPrice || 0) * (p.stockQuantity || 0), 0)
  );
  const totalRetailValuation = round2(
    products.reduce((acc, p) => acc + (p.retailPrice || 0) * (p.stockQuantity || 0), 0)
  );
  const totalRestockCostRequired = round2(
    lowStockItems.reduce(
      (acc, p) => acc + (p.costPrice || 0) * Math.max(10, (p.reorderPoint || 10) * 2 - (p.stockQuantity || 0)),
      0
    )
  );

  // Filtered Stock Levels
  const filteredProducts = products.filter((p) => {
    const s = search.trim().toLowerCase();
    const matchesSearch =
      !s ||
      (p.name || '').toLowerCase().includes(s) ||
      (p.sku || '').toLowerCase().includes(s) ||
      (p.barcode || '').toLowerCase().includes(s) ||
      (p.lotNumber || '').toLowerCase().includes(s);

    const matchesLocation =
      locationFilter === 'all' ||
      (p.locationQuantities && (p.locationQuantities[locationFilter] || 0) > 0);

    return matchesSearch && matchesLocation;
  });

  // Lots & Expiry Filtering & Days Remaining
  const lotTrackedProducts = products
    .filter((p) => p.lotNumber || p.batchNumber || p.expirationDate)
    .map((p) => {
      let daysRemaining = 999;
      let expiryStatus: 'Expired' | 'Critical' | 'Warning' | 'Valid' = 'Valid';

      if (p.expirationDate) {
        const expDate = new Date(p.expirationDate);
        const today = new Date();
        const diffTime = expDate.getTime() - today.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
          expiryStatus = 'Expired';
        } else if (daysRemaining <= 30) {
          expiryStatus = 'Critical';
        } else if (daysRemaining <= 90) {
          expiryStatus = 'Warning';
        }
      }

      const isQuarantined = p.status === 'Quarantined' || p.status === 'Dead Stock';

      return {
        ...p,
        daysRemaining,
        expiryStatus,
        isQuarantined,
      };
    });

  const filteredLots = lotTrackedProducts.filter((p) => {
    const q = recallSearchQuery.trim().toLowerCase();
    return (
      !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.lotNumber || '').toLowerCase().includes(q) ||
      (p.batchNumber || '').toLowerCase().includes(q) ||
      (p.serialNumber || '').toLowerCase().includes(q)
    );
  });

  // Filtered Movements
  const filteredMovements = movements.filter((m) => {
    const s = search.trim().toLowerCase();
    const matchesSearch =
      !s ||
      (m.productName || '').toLowerCase().includes(s) ||
      (m.sku || '').toLowerCase().includes(s) ||
      (m.referenceId || '').toLowerCase().includes(s) ||
      (m.notes || '').toLowerCase().includes(s);

    const matchesType = movementTypeFilter === 'all' || m.type === movementTypeFilter;
    const matchesLoc = locationFilter === 'all' || m.locationId === locationFilter;

    return matchesSearch && matchesType && matchesLoc;
  });

  // Filtered Purchase Orders
  const filteredPOs = purchaseOrders.filter((po) => {
    const s = search.trim().toLowerCase();
    const matchesSearch =
      !s ||
      po.poNumber.toLowerCase().includes(s) ||
      po.supplierName.toLowerCase().includes(s) ||
      po.items.some((i) => i.productName.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s));

    const matchesStatus = poStatusFilter === 'all' || po.status === poStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Quick Open Handlers
  const openCreatePOForProduct = (p: Product) => {
    setPoSupplierId(p.supplierId || suppliers[0]?.id || '');
    setPoProductId(p.id);
    setPoUnitCost(p.costPrice || 10);
    setPoOrderQty(Math.max(20, p.reorderPoint * 2 - p.stockQuantity));
    setPoTargetLocId(locations[0]?.id || '');
    setPoExpectedDate(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
    setPoNotes(`Replenishment PO for ${p.name} (${p.sku}).`);
    setIsPOModalOpen(true);
  };

  const openNewPOModal = () => {
    const firstProd = products[0];
    setPoSupplierId(firstProd?.supplierId || suppliers[0]?.id || '');
    setPoProductId(firstProd?.id || '');
    setPoUnitCost(firstProd?.costPrice || 10);
    setPoOrderQty(50);
    setPoTargetLocId(locations[0]?.id || '');
    setPoExpectedDate(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
    setPoNotes('');
    setIsPOModalOpen(true);
  };

  const handleProductChangeInPO = (prodId: string) => {
    setPoProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setPoUnitCost(prod.costPrice);
      if (prod.supplierId) {
        setPoSupplierId(prod.supplierId);
      }
    }
  };

  const handleCreatePOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === poProductId);
    const sup = suppliers.find((s) => s.id === poSupplierId) || {
      id: poSupplierId,
      name: prod?.supplierName || suppliers[0]?.name || 'Primary Supplier',
    };
    const targetLoc = locations.find((l) => l.id === poTargetLocId) || locations[0];

    if (!prod) return;

    const lineTotal = round2(poUnitCost * poOrderQty);
    const applicableTaxRate = settings?.taxRate !== undefined ? settings.taxRate : 8.5;
    const poTax = round2(lineTotal * (applicableTaxRate / 100));
    const poGrandTotal = round2(lineTotal + poTax);

    const poPayload: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'> = {
      supplierId: sup.id,
      supplierName: sup.name,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          unitCost: poUnitCost,
          orderedQuantity: poOrderQty,
          receivedQuantity: 0,
          total: lineTotal,
        },
      ],
      subtotal: lineTotal,
      tax: poTax,
      total: poGrandTotal,
      status: 'Sent',
      expectedDate: poExpectedDate,
      locationId: targetLoc?.id || 'loc_downtown',
      locationName: targetLoc?.name || 'Downtown Flagship',
      notes: poNotes.trim() || `Restock PO for ${prod.name}`,
    };

    await onCreatePO(poPayload);
    setIsPOModalOpen(false);
    showToast(`Purchase Order issued successfully for ${prod.name}!`);
  };

  // Auto-PO duplicate validation & creation
  const handleBulkAutoReorders = async () => {
    if (!onBulkAutoGeneratePOs) return;

    // Check if all low stock items already have active/pending auto POs
    const activeAutoPOs = purchaseOrders.filter(
      (po) => (po.status === 'Sent' || po.status === 'Partial') && po.poNumber.includes('AUTO')
    );

    const pendingItemIds = new Set(
      activeAutoPOs.flatMap((po) => po.items.map((i) => i.productId))
    );

    const unrequestedLowStock = lowStockItems.filter((p) => !pendingItemIds.has(p.id));

    if (unrequestedLowStock.length === 0 && lowStockItems.length > 0) {
      // All items already have open purchase orders created!
      setIsDuplicatePOModalOpen(true);
      return;
    }

    await onBulkAutoGeneratePOs();
    showToast('Automated Purchase Orders generated for low stock queue!');
  };

  const openAdjustModal = (p: Product) => {
    setSelectedProductForAdjust(p);
    setAdjustMode('delta');
    setAdjustQty(0);
    setNewExactStock(p.stockQuantity);
    setAdjustReason('Cycle Count Physical Audit');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForAdjust) return;

    let delta = adjustQty;
    if (adjustMode === 'exact') {
      delta = newExactStock - selectedProductForAdjust.stockQuantity;
    }

    if (delta === 0) {
      setIsAdjustModalOpen(false);
      return;
    }

    await onStockAdjustment(selectedProductForAdjust.id, delta, adjustReason);
    setIsAdjustModalOpen(false);
    showToast(`Stock level adjusted for ${selectedProductForAdjust.name} (${delta > 0 ? `+${delta}` : delta} units)`);
  };

  // Multi-Outlet Row-Specific Transfer Trigger
  const openRowTransferModal = (p: Product, preferredSourceLocId?: string) => {
    setTransferProductId(p.id);
    setIsRowTransferMode(true);

    // Pick source location where this product has stock
    let srcId = preferredSourceLocId || locations[0]?.id || '';
    if (!preferredSourceLocId) {
      const locWithStock = locations.find((l) => (p.locationQuantities?.[l.id] || 0) > 0);
      if (locWithStock) srcId = locWithStock.id;
    }
    setSourceLocId(srcId);

    // Pick first different location as default destination
    const dst = locations.find((l) => l.id !== srcId) || locations[0];
    setTargetLocId(dst?.id || '');
    setTransferQty(Math.min(5, Math.max(1, p.locationQuantities?.[srcId] || p.stockQuantity)));
    setTransferNotes('');
    setIsTransferModalOpen(true);
  };

  const openGeneralTransferModal = () => {
    setIsRowTransferMode(false);
    setTransferProductId(products[0]?.id || '');
    setSourceLocId(locations[0]?.id || '');
    setTargetLocId(locations[1]?.id || locations[0]?.id || '');
    setTransferQty(5);
    setTransferNotes('');
    setIsTransferModalOpen(true);
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
    showToast(`Transferred ${transferQty} units of ${prod.name} from ${src.name} to ${dst.name}!`);
  };

  const openReceiveModal = (po: PurchaseOrder) => {
    setReceivingPO(po);
    const initialMap: Record<string, number> = {};
    po.items.forEach((item) => {
      initialMap[item.productId] = Math.max(0, item.orderedQuantity - (item.receivedQuantity || 0));
    });
    setReceivedQtyMap(initialMap);
  };

  const handleConfirmReceive = async () => {
    if (!receivingPO || !onReceivePO) return;
    await onReceivePO(receivingPO.id, receivedQtyMap);
    showToast(`Received items for PO #${receivingPO.poNumber}. Stock updated!`);
    setReceivingPO(null);
  };

  const handleQuarantineToggle = async (p: Product, shouldQuarantine: boolean) => {
    if (onQuarantineProduct) {
      await onQuarantineProduct(p.id, shouldQuarantine);
      showToast(
        shouldQuarantine
          ? `Lot #${p.lotNumber || p.name} quarantined.`
          : `Lot #${p.lotNumber || p.name} released back to healthy inventory.`
      );
    }
  };

  const handleSaveReorderPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReorderProduct || !onUpdateProductReorderPoint) return;
    await onUpdateProductReorderPoint(editingReorderProduct.id, newReorderPointInput);
    showToast(`Minimum reorder par updated for ${editingReorderProduct.name} to ${newReorderPointInput} units.`);
    setEditingReorderProduct(null);
  };

  // Direct PDF & Spreadsheet Export Handlers
  const handleExportStockCSV = () => {
    const data = filteredProducts.map((p) => ({
      SKU: p.sku,
      'Product Name': p.name,
      Category: p.categoryName,
      Supplier: p.supplierName,
      'Cost Price ($)': p.costPrice.toFixed(2),
      'Retail Price ($)': p.retailPrice.toFixed(2),
      'Stock On Hand': p.stockQuantity,
      'Reorder Threshold': p.reorderPoint,
      'Total Cost Valuation ($)': (p.costPrice * p.stockQuantity).toFixed(2),
      'Total Retail Valuation ($)': (p.retailPrice * p.stockQuantity).toFixed(2),
      'Inventory Status': p.status,
    }));
    exportToCSV('Master_Stock_Levels_Report', data);
    showToast('Stock Levels exported to CSV!');
  };

  const handleExportStockExcel = () => {
    const data = filteredProducts.map((p) => ({
      SKU: p.sku,
      'Product Name': p.name,
      Category: p.categoryName,
      Supplier: p.supplierName,
      'Cost Price ($)': p.costPrice.toFixed(2),
      'Retail Price ($)': p.retailPrice.toFixed(2),
      'Stock On Hand': p.stockQuantity,
      'Reorder Threshold': p.reorderPoint,
      'Cost Valuation ($)': (p.costPrice * p.stockQuantity).toFixed(2),
      'Retail Valuation ($)': (p.retailPrice * p.stockQuantity).toFixed(2),
      'Inventory Status': p.status,
    }));
    exportToExcel('Master_Stock_Levels_Report', data);
    showToast('Stock Levels exported to Excel!');
  };

  const handleExportStockPDF = () => {
    const data = filteredProducts.map((p) => ({
      SKU: p.sku,
      Product: p.name,
      Category: p.categoryName,
      Supplier: p.supplierName,
      Cost: `${currencySymbol}${p.costPrice.toFixed(2)}`,
      Retail: `${currencySymbol}${p.retailPrice.toFixed(2)}`,
      'Tax %': p.taxRate !== undefined ? `${p.taxRate}%` : `${settings?.taxRate || 8.5}%`,
      Stock: p.stockQuantity,
      'Total Valuation': `${currencySymbol}${(p.costPrice * p.stockQuantity).toFixed(2)}`,
      Status: p.status,
    }));
    exportToPDF(
      'Stock_Levels_Report',
      'Master Stock Levels Valuation Report',
      data,
      settings?.businessName || 'Inventory 360 Enterprise',
      settings?.logoUrl,
      settings?.taxNumber
    );
    showToast('Stock Valuation Report PDF downloaded!');
  };

  const handleExportMovementsCSV = () => {
    const data = filteredMovements.map((m) => ({
      'Transaction Ref': m.referenceId || m.id,
      'Date & Time': formatDateTime(m.createdAt),
      'Movement Type': m.type,
      'Product Name': m.productName,
      SKU: m.sku,
      'Outlet / Location': m.locationName,
      'Quantity Delta': m.quantityChange > 0 ? `+${m.quantityChange}` : `${m.quantityChange}`,
      'Previous Stock': m.previousStock,
      'Resulting Stock': m.newStock,
      'Audit Notes / Reason': m.notes || 'System Ledger',
    }));
    exportToCSV('Stock_Movements_Audit_Ledger', data);
    showToast('Movements ledger exported to CSV!');
  };

  const handleDownloadSlip = (po: PurchaseOrder) => {
    downloadPOSlipPDF(
      po,
      currencySymbol,
      settings?.businessName || 'Inventory 360 Enterprise',
      settings?.logoUrl,
      settings?.taxNumber
    );
    showToast(`Purchase Order Slip PDF downloaded for ${po.poNumber}!`);
  };

  return (
    <div id="tour-inventory-hub" className="space-y-6 text-slate-900 font-mono">
      {/* Toast Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-900 text-white text-xs font-bold font-mono flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-slate-300 hover:text-white text-xs">
            &times;
          </button>
        </div>
      )}

      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wider font-heading">
            {t('inventory', 'Enterprise Inventory Control & Operations')}
          </h1>
          <p className="text-xs text-slate-600">
            Real-time stock valuation, multi-outlet transfer dispatch, low-stock threshold management, lot recalls, and procurement orders.
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
          ).map((tabId) => {
            const isLowStock = tabId === 'low-stock';
            return (
              <button
                key={tabId}
                onClick={() => onSubTabChange && onSubTabChange(tabId)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                  activeSubTab === tabId
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>
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
                </span>
                {isLowStock && lowStockItems.length > 0 && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeSubTab === tabId ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
                    }`}
                  />
                )}
              </button>
            );
          })}

          <button
            onClick={openGeneralTransferModal}
            className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. STOCK LEVELS TAB                                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'stock-levels' && (
        <div className="space-y-4">
          {/* KPI Valuation Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Active SKUs / Products</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{products.length}</h3>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {products.filter((p) => p.stockQuantity > 0).length} in stock
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Units on Hand</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{totalStockUnits.toLocaleString()}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Across {locations.length} branches</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Cost Inventory Value</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {formatCurrency(totalCostValuation, currencySymbol)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Asset book value</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Retail Valuation</p>
              <h3 className="text-xl font-bold text-emerald-700 mt-1 font-mono">
                {formatCurrency(totalRetailValuation, currencySymbol)}
              </h3>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Margin:{' '}
                {totalRetailValuation > 0
                  ? (((totalRetailValuation - totalCostValuation) / totalRetailValuation) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Main Table Card */}
          <div className="bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search stock by SKU, name, barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-2 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="text-xs bg-white border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
                >
                  <option value="all">All Outlets ({locations.length})</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportStockCSV}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Export Stock Levels to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={handleExportStockExcel}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Export Stock Levels to Excel Spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleExportStockPDF}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Download Stock Levels PDF Document"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-600" />
                  <span>PDF</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="p-2.5">Product &amp; SKU</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Supplier</th>
                    <th className="p-2.5 text-right">Cost Value</th>
                    <th className="p-2.5 text-right">Retail Value</th>
                    <th className="p-2.5 text-right">Stock On Hand</th>
                    <th className="p-2.5 text-right">Min Par</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                        No inventory matching search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const costVal = p.costPrice * p.stockQuantity;
                      const retailVal = p.retailPrice * p.stockQuantity;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5">
                            <div className="flex items-center gap-2">
                              {p.imageUrl && (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-7 h-7 object-cover border border-slate-200 shrink-0"
                                />
                              )}
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-2.5 text-slate-700">{p.categoryName}</td>
                          <td className="p-2.5 text-slate-700">{p.supplierName}</td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            {formatCurrency(costVal, currencySymbol)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(retailVal, currencySymbol)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            <span
                              className={`${
                                p.stockQuantity === 0
                                  ? 'text-rose-700 font-extrabold'
                                  : p.stockQuantity <= p.reorderPoint
                                  ? 'text-amber-700 font-bold'
                                  : 'text-slate-900'
                              }`}
                            >
                              {p.stockQuantity}
                            </span>
                          </td>
                          <td className="p-2.5 text-right text-slate-500 font-mono">{p.reorderPoint}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                                p.status === 'Healthy'
                                  ? 'text-emerald-800 border-emerald-300 bg-emerald-50'
                                  : p.status === 'Low Stock'
                                  ? 'text-amber-800 border-amber-300 bg-amber-50'
                                  : p.status === 'Quarantined'
                                  ? 'text-rose-900 border-rose-400 bg-rose-100'
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
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-[10px] uppercase font-bold transition-colors cursor-pointer"
                                title="Adjust Stock Quantity"
                              >
                                Adjust
                              </button>
                              <button
                                onClick={() => openCreatePOForProduct(p)}
                                className="px-2 py-1 bg-slate-900 hover:bg-black text-white text-[10px] uppercase font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
                                title="Create Purchase Order"
                              >
                                + PO
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOW STOCK & AUTO REORDERS TAB                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'low-stock' && (
        <div className="space-y-4">
          {/* Critical Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-4 bg-white border border-rose-200 shadow-2xs">
              <p className="text-[10px] text-rose-600 uppercase font-bold tracking-wider">
                Critical Out-of-Stock (0 Units)
              </p>
              <h3 className="text-2xl font-bold text-rose-700 mt-1">{outOfStockItems.length}</h3>
              <p className="text-[11px] text-rose-800 mt-0.5">Immediate lost sales risk</p>
            </div>

            <div className="p-4 bg-white border border-amber-200 shadow-2xs">
              <p className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">
                Below Active Low Stock Limit
              </p>
              <h3 className="text-2xl font-bold text-amber-800 mt-1">{lowStockItems.length}</h3>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {customLowStockLimit !== ''
                  ? `Custom threshold limit: ≤ ${customLowStockLimit} units`
                  : 'Based on each product’s safety buffer'}
              </p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Estimated Restock Spend
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {formatCurrency(totalRestockCostRequired, currencySymbol)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">To restore safety buffers</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-3 gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Low Stock Replenishment Queue ({lowStockItems.length})</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Products requiring procurement PO issuance to prevent stockouts.
                </p>
              </div>

              {/* User Adjustable Low Stock Limit Filter & Auto PO Button */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <label className="text-[10px] font-bold uppercase text-slate-600">
                    Low Stock Limit (&le; units):
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Product Par"
                    value={customLowStockLimit}
                    onChange={(e) =>
                      setCustomLowStockLimit(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))
                    }
                    className="w-20 bg-white border border-slate-300 px-2 py-0.5 text-xs text-right font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                    title="Set custom low stock limit for this view"
                  />
                  {customLowStockLimit !== '' && (
                    <button
                      onClick={() => setCustomLowStockLimit('')}
                      className="text-[10px] text-slate-400 hover:text-slate-700 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {lowStockItems.length > 0 && (
                  <button
                    onClick={handleBulkAutoReorders}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Generate All Restock POs</span>
                  </button>
                )}
              </div>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 uppercase text-xs">All Inventory Healthy</h4>
                <p className="text-xs text-slate-500 font-mono">
                  No catalog items currently breach the active low stock limit ({customLowStockLimit !== '' ? customLowStockLimit : 'Default Par'}).
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((p) => {
                  const recommendedQty = Math.max(10, p.reorderPoint * 2 - p.stockQuantity);
                  const estCost = p.costPrice * recommendedQty;

                  return (
                    <div
                      key={p.id}
                      className="p-4 bg-slate-50 border border-amber-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 border border-amber-300">
                            {p.stockQuantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                          </span>
                        </div>

                        {/* Progress Bar for Stock vs Reorder */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-600">
                            <span>Current: {p.stockQuantity}</span>
                            <span className="flex items-center gap-1">
                              Min Par: {p.reorderPoint}
                              <button
                                onClick={() => {
                                  setEditingReorderProduct(p);
                                  setNewReorderPointInput(p.reorderPoint);
                                }}
                                className="text-slate-400 hover:text-slate-800"
                                title="Edit Reorder Par Point"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 overflow-hidden">
                            <div
                              className={`h-full ${p.stockQuantity === 0 ? 'bg-rose-600' : 'bg-amber-500'}`}
                              style={{
                                width: `${Math.min(100, (p.stockQuantity / Math.max(1, p.reorderPoint)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-0.5 pt-1">
                          <p>
                            <strong>Vendor:</strong> {p.supplierName}
                          </p>
                          <p>
                            <strong>Suggested Order:</strong> {recommendedQty} units
                          </p>
                          <p>
                            <strong>Est. Restock Cost:</strong>{' '}
                            <span className="font-bold text-slate-900">
                              {formatCurrency(estCost, currencySymbol)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAdjustModal(p)}
                          className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[10px] font-bold uppercase transition-colors cursor-pointer"
                        >
                          Adjust
                        </button>
                        <button
                          onClick={() => openCreatePOForProduct(p)}
                          className="px-3 py-1 bg-slate-900 text-white hover:bg-black font-bold text-xs uppercase transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-emerald-400" />
                          <span>Issue PO</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LOTS & EXPIRY (FIFO & RECALLS)                                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'lots-expiry' && (
        <div className="space-y-4">
          {/* Expiry KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lot-Tracked Products</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{lotTrackedProducts.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Active batches</p>
            </div>

            <div className="p-4 bg-white border border-rose-200 shadow-2xs">
              <p className="text-[10px] text-rose-600 uppercase font-bold tracking-wider">Expired Batches</p>
              <h3 className="text-xl font-bold text-rose-700 mt-1">
                {lotTrackedProducts.filter((p) => p.expiryStatus === 'Expired').length}
              </h3>
              <p className="text-[11px] text-rose-800 mt-0.5">Quarantine / write-off</p>
            </div>

            <div className="p-4 bg-white border border-amber-200 shadow-2xs">
              <p className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">Expiring &le; 30 Days</p>
              <h3 className="text-xl font-bold text-amber-800 mt-1">
                {lotTrackedProducts.filter((p) => p.expiryStatus === 'Critical').length}
              </h3>
              <p className="text-[11px] text-amber-700 mt-0.5">FIFO clearance priority</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Quarantined Batches</p>
              <h3 className="text-xl font-bold text-rose-800 mt-1">
                {lotTrackedProducts.filter((p) => p.isQuarantined).length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Flagged for inspection</p>
            </div>
          </div>

          {/* Batch Recall & Expiry Table */}
          <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-sky-600" />
                  <span>Batch, Lot &amp; FIFO Expiration Registry</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Traceability for perishable goods, batch recalls, and manufacturer warranty tracking.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search by Lot #, Batch #, SKU..."
                  value={recallSearchQuery}
                  onChange={(e) => setRecallSearchQuery(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-1.5 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="p-2.5">Product &amp; SKU</th>
                    <th className="p-2.5">Lot #</th>
                    <th className="p-2.5">Batch #</th>
                    <th className="p-2.5">Serial #</th>
                    <th className="p-2.5">Expiration Date</th>
                    <th className="p-2.5 text-right">Units on Hand</th>
                    <th className="p-2.5 text-right">Batch Value</th>
                    <th className="p-2.5 text-center">FIFO Status</th>
                    <th className="p-2.5 text-center">Quarantine / Release</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLots.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                        No batch or lot records found matching active query.
                      </td>
                    </tr>
                  ) : (
                    filteredLots.map((p) => {
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50 transition-colors ${p.isQuarantined ? 'bg-rose-50/80' : ''}`}
                        >
                          <td className="p-2.5">
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">{p.lotNumber || '—'}</td>
                          <td className="p-2.5 text-slate-700">{p.batchNumber || '—'}</td>
                          <td className="p-2.5 text-slate-600">{p.serialNumber || '—'}</td>
                          <td className="p-2.5">
                            {p.expirationDate ? (
                              <div>
                                <p
                                  className={`font-bold ${
                                    p.expiryStatus === 'Expired'
                                      ? 'text-rose-700'
                                      : p.expiryStatus === 'Critical'
                                      ? 'text-amber-700'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {p.expirationDate}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {p.daysRemaining <= 0
                                    ? `Expired ${Math.abs(p.daysRemaining)}d ago`
                                    : `${p.daysRemaining} days left`}
                                </p>
                              </div>
                            ) : (
                              <span className="text-slate-400">Non-expiring</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">{p.stockQuantity}</td>
                          <td className="p-2.5 text-right font-mono text-slate-800">
                            {formatCurrency(p.costPrice * p.stockQuantity, currencySymbol)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                                p.isQuarantined
                                  ? 'text-rose-900 border-rose-400 bg-rose-100 font-extrabold'
                                  : p.expiryStatus === 'Expired'
                                  ? 'text-rose-800 border-rose-300 bg-rose-50'
                                  : p.expiryStatus === 'Critical'
                                  ? 'text-amber-800 border-amber-300 bg-amber-50'
                                  : p.expiryStatus === 'Warning'
                                  ? 'text-sky-800 border-sky-300 bg-sky-50'
                                  : 'text-emerald-800 border-emerald-300 bg-emerald-50'
                              }`}
                            >
                              {p.isQuarantined ? 'QUARANTINED' : p.expiryStatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleQuarantineToggle(p, !p.isQuarantined)}
                              className={`px-3 py-1 text-[10px] uppercase font-bold border transition-colors cursor-pointer ${
                                p.isQuarantined
                                  ? 'bg-slate-900 text-white border-slate-900 hover:bg-black'
                                  : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                              }`}
                            >
                              {p.isQuarantined ? 'Release' : 'Quarantine'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MULTI-OUTLET MATRIX TAB                                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'multi-location' && (
        <div className="space-y-4">
          {/* Location Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            {locations.map((loc) => {
              const locTotalUnits = products.reduce(
                (acc, p) => acc + (p.locationQuantities?.[loc.id] ?? Math.floor(p.stockQuantity / locations.length)),
                0
              );
              const locValuation = products.reduce((acc, p) => {
                const qty = p.locationQuantities?.[loc.id] ?? Math.floor(p.stockQuantity / locations.length);
                return acc + p.costPrice * qty;
              }, 0);

              return (
                <div key={loc.id} className="p-4 bg-white border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-xs uppercase">{loc.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">{loc.address || 'Retail / Warehouse Node'}</p>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-mono">
                    <span>
                      Units: <strong>{locTotalUnits.toLocaleString()}</strong>
                    </span>
                    <span>
                      Valuation: <strong>{formatCurrency(locValuation, currencySymbol)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Multi-Outlet Stock Allocation Matrix
                </h3>
                <p className="text-xs text-slate-600">
                  Cross-outlet stock parity, safety buffer allocation, and inter-branch transfer dispatch.
                </p>
              </div>

              <button
                onClick={openGeneralTransferModal}
                className="px-3.5 py-1.5 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ New Transfer Order</span>
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
                    <th className="p-2.5 text-right font-bold text-slate-900">Total Aggregate</th>
                    <th className="p-2.5 text-right">Min Par</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                      </td>
                      {locations.map((loc) => {
                        const locQty =
                          p.locationQuantities?.[loc.id] ??
                          Math.floor(p.stockQuantity / locations.length);
                        return (
                          <td key={loc.id} className="p-2.5 text-right font-mono text-slate-800">
                            {locQty}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                        {p.stockQuantity}
                      </td>
                      <td className="p-2.5 text-right text-slate-500 font-mono">{p.reorderPoint}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => openRowTransferModal(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-[10px] uppercase font-bold transition-colors cursor-pointer"
                        >
                          Transfer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STOCK MOVEMENTS AUDIT TRAIL                                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'movements' && (
        <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Immutable Stock Movement Audit Trail ({filteredMovements.length})
              </h3>
              <p className="text-xs text-slate-600">
                Detailed audit trail recording all POS sales, purchase arrivals, branch transfers, and manual variances.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMovementsCSV}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Export Movement Audit Ledger to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar for Movements */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search audit trail by SKU, ref #, reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-8 pr-3 py-2 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono"
            >
              <option value="all">All Movement Types</option>
              <option value="Sale">Sale (POS)</option>
              <option value="Purchase">Purchase Inbound</option>
              <option value="Adjustment">Manual Adjustment</option>
              <option value="Transfer">Inter-Outlet Transfer</option>
              <option value="Return">Return / Refund</option>
            </select>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 px-3 py-2 text-slate-900 font-mono"
            >
              <option value="all">All Outlets</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Movements Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                  <th className="p-2.5">Date &amp; Time</th>
                  <th className="p-2.5">Product &amp; SKU</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Outlet</th>
                  <th className="p-2.5 text-right">Qty Change</th>
                  <th className="p-2.5 text-right">Resulting Stock</th>
                  <th className="p-2.5">Audit Note / Ref #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                      No stock movement records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-slate-500 text-[10px] whitespace-nowrap">
                        {formatDateTime(m.createdAt)}
                      </td>
                      <td className="p-2.5">
                        <p className="font-bold text-slate-900">{m.productName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">SKU: {m.sku}</p>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                            m.type === 'Sale'
                              ? 'text-rose-800 border-rose-300 bg-rose-50'
                              : m.type === 'Purchase'
                              ? 'text-emerald-800 border-emerald-300 bg-emerald-50'
                              : m.type === 'Transfer'
                              ? 'text-sky-800 border-sky-300 bg-sky-50'
                              : m.type === 'Return'
                              ? 'text-purple-800 border-purple-300 bg-purple-50'
                              : 'text-amber-800 border-amber-300 bg-amber-50'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-700">{m.locationName}</td>
                      <td
                        className={`p-2.5 text-right font-bold ${
                          m.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {m.quantityChange > 0 ? `+${m.quantityChange}` : m.quantityChange}
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900 font-mono">{m.newStock}</td>
                      <td className="p-2.5 text-slate-600 text-[11px] max-w-xs truncate">
                        {m.notes || m.referenceId || 'System audit'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PURCHASE ORDERS PROCUREMENT TAB                                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'purchases' && (
        <div className="space-y-4">
          {/* PO KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Purchase Orders</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{purchaseOrders.length}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Procurement records</p>
            </div>

            <div className="p-4 bg-white border border-amber-200 shadow-2xs">
              <p className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">Pending Inbound POs</p>
              <h3 className="text-xl font-bold text-amber-800 mt-1">
                {purchaseOrders.filter((po) => po.status === 'Sent' || po.status === 'Partial').length}
              </h3>
              <p className="text-[11px] text-amber-700 mt-0.5">Awaiting supplier delivery</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 shadow-2xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Inbound Spend</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-mono">
                {formatCurrency(
                  purchaseOrders.reduce((acc, po) => acc + (po.total || 0), 0),
                  currencySymbol
                )}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Committed capital</p>
            </div>

            <div className="p-4 bg-white border border-emerald-200 shadow-2xs">
              <p className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">Received &amp; Stocked</p>
              <h3 className="text-xl font-bold text-emerald-800 mt-1">
                {purchaseOrders.filter((po) => po.status === 'Received').length}
              </h3>
              <p className="text-[11px] text-emerald-700 mt-0.5">Completed orders</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={openNewPOModal}
                  className="px-4 py-2 bg-slate-900 text-white hover:bg-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Create Purchase Order</span>
                </button>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'Sent', 'Partial', 'Received'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setPoStatusFilter(status)}
                    className={`px-2.5 py-1 text-xs font-mono uppercase font-bold transition-colors cursor-pointer ${
                      poStatusFilter === status
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'all' ? 'All Status' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* PO List */}
            <div className="space-y-3">
              {filteredPOs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                  No purchase orders found matching active filters.
                </div>
              ) : (
                filteredPOs.map((po) => {
                  const isExpanded = expandedPoIds[po.id];
                  const totalOrdered = po.items.reduce((acc, i) => acc + i.orderedQuantity, 0);
                  const totalReceived = po.items.reduce((acc, i) => acc + (i.receivedQuantity || 0), 0);

                  return (
                    <div
                      key={po.id}
                      className="border border-slate-200 bg-slate-50 p-4 space-y-3 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => togglePoExpand(po.id)}
                            className="p-1 text-slate-500 hover:text-slate-900 mt-0.5 cursor-pointer"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm font-mono">{po.poNumber}</h4>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 border uppercase ${
                                  po.status === 'Received'
                                    ? 'text-emerald-800 border-emerald-300 bg-emerald-50'
                                    : po.status === 'Partial'
                                    ? 'text-amber-800 border-amber-300 bg-amber-50'
                                    : 'text-sky-800 border-sky-300 bg-sky-50'
                                }`}
                              >
                                {po.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Supplier: <strong>{po.supplierName}</strong> &bull; Target Node:{' '}
                              <strong>{po.locationName}</strong>
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Issued: {formatDateTime(po.createdAt)} &bull; Expected: {po.expectedDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <p className="text-xs text-slate-500">
                              Units: {totalReceived}/{totalOrdered}
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                              {formatCurrency(po.total, currencySymbol)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDownloadSlip(po)}
                              className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                              title="Download Official Purchase Order Slip (PDF)"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-700" />
                              <span>Slip (PDF)</span>
                            </button>
                            {po.status !== 'Received' && (
                              <button
                                onClick={() => openReceiveModal(po)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Receive Goods</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Line Items */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-200">
                          <table className="w-full text-left text-xs font-mono">
                            <thead>
                              <tr className="text-slate-500 uppercase text-[10px] border-b border-slate-200">
                                <th className="pb-1">Product &amp; SKU</th>
                                <th className="pb-1 text-right">Unit Cost</th>
                                <th className="pb-1 text-right">Ordered</th>
                                <th className="pb-1 text-right">Received</th>
                                <th className="pb-1 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60">
                              {po.items.map((item, idx) => (
                                <tr key={idx} className="py-1">
                                  <td className="py-1.5">
                                    <p className="font-bold text-slate-900">{item.productName}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</p>
                                  </td>
                                  <td className="py-1.5 text-right font-mono text-slate-600">
                                    {formatCurrency(item.unitCost, currencySymbol)}
                                  </td>
                                  <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                                    {item.orderedQuantity}
                                  </td>
                                  <td className="py-1.5 text-right font-mono font-bold text-emerald-700">
                                    {item.receivedQuantity || 0}
                                  </td>
                                  <td className="py-1.5 text-right font-mono font-bold text-slate-900">
                                    {formatCurrency(item.total, currencySymbol)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {po.notes && (
                            <p className="text-[11px] text-slate-500 italic mt-2">Notes: {po.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DUPLICATE AUTO PO ALREADY GENERATED WARNING                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDuplicatePOModalOpen}
        onClose={() => setIsDuplicatePOModalOpen(false)}
        title="RESTOCK ORDERS ALREADY GENERATED"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs uppercase">Purchase Orders Already Active</p>
              <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                Replenishment purchase order requests have already been issued for all items currently in this low stock queue.
              </p>
              <p className="text-[11px] text-amber-800 mt-1">
                Please check the <strong>Purchase Orders</strong> section to inspect, download slips, or confirm dock receipts.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsDuplicatePOModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold uppercase text-xs cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                setIsDuplicatePOModalOpen(false);
                if (onSubTabChange) onSubTabChange('purchases');
              }}
              className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold uppercase text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Go to Purchase Orders &rarr;</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: EDIT PRODUCT REORDER PAR POINT                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!editingReorderProduct}
        onClose={() => setEditingReorderProduct(null)}
        title="EDIT MINIMUM REORDER PAR POINT"
        maxWidth="max-w-sm"
      >
        {editingReorderProduct && (
          <form onSubmit={handleSaveReorderPoint} className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 text-xs">{editingReorderProduct.name}</p>
              <p className="text-[10px] text-slate-500">SKU: {editingReorderProduct.sku}</p>
              <p className="text-[11px] text-slate-700">
                Current Stock On Hand: <strong>{editingReorderProduct.stockQuantity} units</strong>
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Minimum Safety Par Buffer (units) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={newReorderPointInput}
                onChange={(e) => setNewReorderPointInput(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-right font-bold text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                When stock falls &le; this number, low-stock alerts and auto-reorder recommendations will trigger.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingReorderProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold uppercase text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold uppercase text-xs cursor-pointer"
              >
                Save Par Point
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: STOCK ADJUSTMENT                                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="STOCK LEVEL AUDIT ADJUSTMENT"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 font-mono text-xs">
          {selectedProductForAdjust && (
            <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{selectedProductForAdjust.name}</p>
              <p className="text-[10px] text-slate-500">SKU: {selectedProductForAdjust.sku}</p>
              <p className="text-[11px] text-slate-700">
                Current Stock On Hand:{' '}
                <strong className="text-slate-900 font-bold">{selectedProductForAdjust.stockQuantity} units</strong>
              </p>
            </div>
          )}

          {/* Adjustment Mode Toggle */}
          <div className="flex border border-slate-300">
            <button
              type="button"
              onClick={() => setAdjustMode('delta')}
              className={`flex-1 py-1.5 text-xs font-bold uppercase ${
                adjustMode === 'delta' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              +/- Quantity Delta
            </button>
            <button
              type="button"
              onClick={() => {
                setAdjustMode('exact');
                if (selectedProductForAdjust) {
                  setNewExactStock(selectedProductForAdjust.stockQuantity);
                }
              }}
              className={`flex-1 py-1.5 text-xs font-bold uppercase ${
                adjustMode === 'exact' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Set Exact Count
            </button>
          </div>

          {adjustMode === 'delta' ? (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Quantity Delta (+ to add, - to deduct) *
              </label>
              <input
                type="number"
                required
                value={adjustQty || ''}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-right font-bold text-sm"
                placeholder="e.g. 5 or -2"
              />
              {selectedProductForAdjust && (
                <p className="text-[11px] text-slate-500 mt-1">
                  New resulting stock:{' '}
                  <strong className="text-slate-900">
                    {Math.max(0, (selectedProductForAdjust.stockQuantity || 0) + adjustQty)} units
                  </strong>
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                New Exact Physical Count *
              </label>
              <input
                type="number"
                min="0"
                required
                value={newExactStock}
                onChange={(e) => setNewExactStock(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-right font-bold text-sm"
              />
              {selectedProductForAdjust && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Variance delta:{' '}
                  <strong
                    className={
                      newExactStock - selectedProductForAdjust.stockQuantity >= 0
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }
                  >
                    {newExactStock - selectedProductForAdjust.stockQuantity >= 0 ? '+' : ''}
                    {newExactStock - selectedProductForAdjust.stockQuantity} units
                  </strong>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Audit Reason *
            </label>
            <select
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
            >
              <option value="Cycle Count Physical Audit">Cycle Count Physical Audit</option>
              <option value="Damaged Goods / Spillage">Damaged Goods / Spillage</option>
              <option value="Shrinkage / Loss">Shrinkage / Loss</option>
              <option value="Unaccounted Inbound Receipt">Unaccounted Inbound Receipt</option>
              <option value="Promotional Sample / Giveaway">Promotional Sample / Giveaway</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase text-xs hover:bg-slate-200 border border-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold uppercase text-xs hover:bg-black cursor-pointer"
            >
              Commit Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: INTER-BRANCH STOCK TRANSFER                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="INTER-BRANCH STOCK TRANSFER ORDER"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 font-mono text-xs">
          {/* Selected Product info */}
          {(() => {
            const currentProd = products.find((p) => p.id === transferProductId);
            const currentSrcLoc = locations.find((l) => l.id === sourceLocId);
            const availableUnits =
              currentProd?.locationQuantities?.[sourceLocId] ??
              (currentProd ? Math.floor(currentProd.stockQuantity / locations.length) : 0);

            return (
              <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-xs">
                  {currentProd?.name || 'Product'} (SKU: {currentProd?.sku})
                </p>
                <p className="text-[11px] text-slate-600">
                  Current Branch Location:{' '}
                  <strong className="text-slate-900">{currentSrcLoc?.name}</strong> &bull; Available:{' '}
                  <strong className="text-emerald-700">{availableUnits} units</strong>
                </p>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* If rowTransferMode is true, Source is locked/fixed */}
            {isRowTransferMode ? (
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Source Outlet (Current Location)
                </label>
                <div className="p-2 bg-slate-100 border border-slate-300 text-slate-900 font-bold font-mono text-xs">
                  {locations.find((l) => l.id === sourceLocId)?.name || 'Downtown Flagship'}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Source Outlet *
                </label>
                <select
                  value={sourceLocId}
                  onChange={(e) => setSourceLocId(e.target.value)}
                  className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Destination Outlet *
              </label>
              <select
                value={targetLocId}
                required
                onChange={(e) => setTargetLocId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
              >
                {locations
                  .filter((loc) => loc.id !== sourceLocId)
                  .map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {!isRowTransferMode && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Select Product to Transfer *
              </label>
              <select
                value={transferProductId}
                onChange={(e) => setTransferProductId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
              >
                {products.map((p) => {
                  const srcQty = p.locationQuantities?.[sourceLocId] ?? Math.floor(p.stockQuantity / locations.length);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku}) &mdash; {srcQty} units available
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Transfer Quantity *
            </label>
            <input
              type="number"
              min="1"
              required
              value={transferQty}
              onChange={(e) => setTransferQty(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-right font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Transfer Dispatch Notes
            </label>
            <textarea
              rows={2}
              value={transferNotes}
              onChange={(e) => setTransferNotes(e.target.value)}
              placeholder="e.g. Stock replenishment for branch demand..."
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase text-xs hover:bg-slate-200 border border-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold uppercase text-xs hover:bg-black cursor-pointer flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dispatch Transfer</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: CREATE PURCHASE ORDER                                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        title="CREATE PURCHASE ORDER"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreatePOSubmit} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Supplier *</label>
              <select
                value={poSupplierId}
                required
                onChange={(e) => setPoSupplierId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Receiving Destination Outlet *
              </label>
              <select
                value={poTargetLocId}
                required
                onChange={(e) => setPoTargetLocId(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
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
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
              Select Product *
            </label>
            <select
              value={poProductId}
              required
              onChange={(e) => handleProductChangeInPO(e.target.value)}
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku}) &mdash; Cost: {formatCurrency(p.costPrice, currencySymbol)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Order Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={poOrderQty}
                onChange={(e) => setPoOrderQty(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-right font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Negotiated Unit Cost ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={poUnitCost}
                onChange={(e) => setPoUnitCost(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono text-right font-bold text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                required
                value={poExpectedDate}
                onChange={(e) => setPoExpectedDate(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Estimated Total (Incl. Tax)
              </label>
              <div className="p-2 bg-slate-100 border border-slate-300 text-slate-900 font-bold font-mono text-right text-xs">
                {formatCurrency(poOrderQty * poUnitCost * 1.085, currencySymbol)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">PO Notes</label>
            <textarea
              rows={2}
              value={poNotes}
              onChange={(e) => setPoNotes(e.target.value)}
              placeholder="Delivery instructions, dock info..."
              className="w-full bg-white border border-slate-300 p-2 text-slate-900 font-mono resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsPOModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase text-xs hover:bg-slate-200 border border-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white font-bold uppercase text-xs hover:bg-black cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Issue Purchase Order</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: RECEIVE PURCHASE ORDER GOODS                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!receivingPO}
        onClose={() => setReceivingPO(null)}
        title={`RECEIVE GOODS: ${receivingPO?.poNumber}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 space-y-1">
            <p className="text-slate-700">
              Supplier: <strong>{receivingPO?.supplierName}</strong> &bull; Receiving Destination:{' '}
              <strong>{receivingPO?.locationName}</strong>
            </p>
            <p className="text-[10px] text-slate-500">
              Confirm actual physical quantities arriving at loading dock. Inventory stock will be updated immediately.
            </p>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {receivingPO?.items.map((item) => {
              const remainingToReceive = Math.max(0, item.orderedQuantity - (item.receivedQuantity || 0));
              const currentInput = receivedQtyMap[item.productId] ?? remainingToReceive;

              return (
                <div
                  key={item.productId}
                  className="p-3 bg-white border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      SKU: {item.sku} &bull; Ordered: {item.orderedQuantity} &bull; Previously Received:{' '}
                      {item.receivedQuantity || 0}
                    </p>
                  </div>

                  <div className="w-28 text-right">
                    <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">
                      Receiving Now
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={remainingToReceive}
                      value={currentInput}
                      onChange={(e) =>
                        setReceivedQtyMap({
                          ...receivedQtyMap,
                          [item.productId]: Number(e.target.value),
                        })
                      }
                      className="w-full bg-white border border-slate-300 p-1.5 text-slate-900 text-right font-mono font-bold"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setReceivingPO(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold uppercase text-xs hover:bg-slate-200 border border-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReceive}
              className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Dock Receipt</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
