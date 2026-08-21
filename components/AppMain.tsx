'use client';

import React, { useEffect, useState } from 'react';
import {
  Product,
  Category,
  Supplier,
  Customer,
  Location,
  Sale,
  PurchaseOrder,
  StockMovement,
  Expense,
  BusinessSettings,
  StockTransfer,
  SalesChannel,
  FulfillmentOrder,
  FulfillmentStatus,
} from '../lib/types';
import {
  getAllFromStore,
  putToStore,
  putManyToStore,
  deleteFromStore,
  deleteManyFromStore,
  clearAllStores,
} from '../lib/db';
import {
  INITIAL_SETTINGS,
  INITIAL_LOCATIONS,
  INITIAL_CATEGORIES,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_EXPENSES,
  INITIAL_SALES_CHANNELS,
  INITIAL_FULFILLMENT_ORDERS,
  CLEAN_SETTINGS,
  CLEAN_LOCATIONS,
  CLEAN_CATEGORIES,
  CLEAN_SUPPLIERS,
} from '../lib/seedData';

import dynamic from 'next/dynamic';
import { Sidebar, NavItemKey } from './Sidebar';
import { DashboardView } from './views/DashboardView';

const SellView = dynamic(() => import('./views/SellView').then((m) => m.SellView), {
  loading: () => <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading POS Terminal...</div>,
});
const FulfillmentView = dynamic(() => import('./views/FulfillmentView').then((m) => m.FulfillmentView), {
  loading: () => <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading Fulfillment...</div>,
});
const CatalogView = dynamic(() => import('./views/CatalogView').then((m) => m.CatalogView), {
  loading: () => <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading Catalog...</div>,
});
const InventoryView = dynamic(() => import('./views/InventoryView').then((m) => m.InventoryView), {
  loading: () => <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading Inventory...</div>,
});
const CustomersView = dynamic(() => import('./views/CustomersView').then((m) => m.CustomersView), {
  loading: () => <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading CRM...</div>,
});
const ReportingView = dynamic(() => import('./views/ReportingView').then((m) => m.ReportingView), {
  loading: () => <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading Reports...</div>,
});
const SetupView = dynamic(() => import('./views/SetupView').then((m) => m.SetupView), {
  loading: () => <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading Settings...</div>,
});
const PrintReceipt = dynamic(() => import('./PrintReceipt').then((m) => m.PrintReceipt));
const DataPolicyModal = dynamic(() => import('./common/DataPolicyModal').then((m) => m.DataPolicyModal));
const ProductTourModal = dynamic(() => import('./common/ProductTourModal').then((m) => m.ProductTourModal));
import { ErrorBoundary } from './common/ErrorBoundary';
import { useBroadcastSync } from '../hooks/useBroadcastSync';
import { calculateStockStatus } from '../lib/utils';
import { performAutoSave } from '../lib/autoSaveService';
import {
  Layers,
  Sparkles,
  Menu,
  X,
  Home,
  ArrowLeft,
  Globe,
  DollarSign,
} from 'lucide-react';
import { SupportedLanguage, LANGUAGES } from '../lib/i18n';
import { CURRENCIES } from '../lib/currencies';
import { I18nProvider } from '../context/I18nContext';

const VALID_TABS: NavItemKey[] = [
  'home',
  'sell',
  'fulfillment',
  'reporting',
  'catalog',
  'inventory',
  'customers',
  'setup',
];

const DEFAULT_SUB_FOR_TAB: Record<string, string> = {
  reporting: 'retail-dashboard',
  inventory: 'stock-levels',
  catalog: 'all-products',
  fulfillment: 'all-orders',
  setup: 'general',
};

function getInitialRouteState(): { tab: NavItemKey; subTab: string } {
  if (typeof window === 'undefined') {
    return { tab: 'home', subTab: 'retail-dashboard' };
  }

  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash && hash !== 'landing') {
    const parts = hash.split('/');
    const tabCandidate = (parts[0] === 'dashboard' ? 'home' : parts[0]) as NavItemKey;
    const sub = parts[1] || DEFAULT_SUB_FOR_TAB[tabCandidate] || '';
    if (VALID_TABS.includes(tabCandidate)) {
      return { tab: tabCandidate, subTab: sub };
    }
  }

  // Check localStorage if no specific hash present
  try {
    const savedTab = localStorage.getItem('inventory360_active_tab') as NavItemKey;
    const savedSub = localStorage.getItem('inventory360_active_subtab');
    if (savedTab && VALID_TABS.includes(savedTab)) {
      return {
        tab: savedTab,
        subTab: savedSub || DEFAULT_SUB_FOR_TAB[savedTab] || '',
      };
    }
  } catch {
    // Ignore storage errors
  }

  return { tab: 'home', subTab: 'retail-dashboard' };
}

export default function AppMain() {
  const initialRoute = getInitialRouteState();
  const [activeTab, setActiveTab] = useState<NavItemKey>(initialRoute.tab);
  const [activeSubTab, setActiveSubTab] = useState<string>(initialRoute.subTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showDataPolicyNotice, setShowDataPolicyNotice] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Core Data States
  const [settings, setSettings] = useState<BusinessSettings>(CLEAN_SETTINGS);
  const [locations, setLocations] = useState<Location[]>(CLEAN_LOCATIONS);
  const [categories, setCategories] = useState<Category[]>(CLEAN_CATEGORIES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(CLEAN_SUPPLIERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salesChannels, setSalesChannels] = useState<SalesChannel[]>([]);
  const [fulfillmentOrders, setFulfillmentOrders] = useState<FulfillmentOrder[]>([]);

  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [printableSale, setPrintableSale] = useState<Sale | null>(null);
  const [receiptFormat, setReceiptFormat] = useState<'80mm' | '58mm' | 'A4'>('80mm');

  // Route persistence: Listen for browser back/forward and hash changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedFormat = localStorage.getItem('inventory360_receipt_format');
      if (savedFormat === '80mm' || savedFormat === '58mm' || savedFormat === 'A4') {
        setReceiptFormat(savedFormat);
      }
    } catch {}

    const handleHashChange = () => {
      const current = getInitialRouteState();
      setActiveTab(current.tab);
      if (current.subTab) setActiveSubTab(current.subTab);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync active state to URL hash and localStorage seamlessly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('inventory360_active_tab', activeTab);
      localStorage.setItem('inventory360_active_subtab', activeSubTab);
    } catch {}

    const isDefaultDashboard = activeTab === 'home' && (!activeSubTab || activeSubTab === 'retail-dashboard');
    if (isDefaultDashboard) {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } else {
      const targetHash = `#/${activeTab}${activeSubTab ? '/' + activeSubTab : ''}`;
      if (window.location.hash !== targetHash) {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [activeTab, activeSubTab]);

  const initCleanData = async () => {
    await clearAllStores();
    await putToStore('settings', CLEAN_SETTINGS);
    await putManyToStore('locations', CLEAN_LOCATIONS);
    await putManyToStore('categories', CLEAN_CATEGORIES);
    await putManyToStore('suppliers', CLEAN_SUPPLIERS);
    await putManyToStore('salesChannels', INITIAL_SALES_CHANNELS);

    setSettings(CLEAN_SETTINGS);
    setLocations(CLEAN_LOCATIONS);
    setCategories(CLEAN_CATEGORIES);
    setSuppliers(CLEAN_SUPPLIERS);
    setProducts([]);
    setCustomers([]);
    setSales([]);
    setPurchaseOrders([]);
    setMovements([]);
    setExpenses([]);
    setSalesChannels(INITIAL_SALES_CHANNELS);
    setFulfillmentOrders([]);
  };

  const seedDemoData = async () => {
    await clearAllStores();
    await putToStore('settings', INITIAL_SETTINGS);
    await putManyToStore('locations', INITIAL_LOCATIONS);
    await putManyToStore('categories', INITIAL_CATEGORIES);
    await putManyToStore('suppliers', INITIAL_SUPPLIERS);
    await putManyToStore('products', INITIAL_PRODUCTS);
    await putManyToStore('customers', INITIAL_CUSTOMERS);
    await putManyToStore('sales', INITIAL_SALES);
    await putManyToStore('purchaseOrders', INITIAL_PURCHASE_ORDERS);
    await putManyToStore('stockMovements', INITIAL_STOCK_MOVEMENTS);
    await putManyToStore('expenses', INITIAL_EXPENSES);
    await putManyToStore('salesChannels', INITIAL_SALES_CHANNELS);
    await putManyToStore('fulfillmentOrders', INITIAL_FULFILLMENT_ORDERS);

    setSettings(INITIAL_SETTINGS);
    setLocations(INITIAL_LOCATIONS);
    setCategories(INITIAL_CATEGORIES);
    setSuppliers(INITIAL_SUPPLIERS);
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSales(INITIAL_SALES);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setMovements(INITIAL_STOCK_MOVEMENTS);
    setExpenses(INITIAL_EXPENSES);
    setSalesChannels(INITIAL_SALES_CHANNELS);
    setFulfillmentOrders(INITIAL_FULFILLMENT_ORDERS);
  };

  const handleClearAllData = async () => {
    await initCleanData();
  };

  const loadAllData = async () => {
    const s = await getAllFromStore<BusinessSettings>('settings');
    const locs = await getAllFromStore<Location>('locations');
    const cats = await getAllFromStore<Category>('categories');
    const sups = await getAllFromStore<Supplier>('suppliers');
    const prods = await getAllFromStore<Product>('products');
    const custs = await getAllFromStore<Customer>('customers');
    const sls = await getAllFromStore<Sale>('sales');
    const pos = await getAllFromStore<PurchaseOrder>('purchaseOrders');
    const movs = await getAllFromStore<StockMovement>('stockMovements');
    const exps = await getAllFromStore<Expense>('expenses');
    const chans = await getAllFromStore<SalesChannel>('salesChannels');
    const fuls = await getAllFromStore<FulfillmentOrder>('fulfillmentOrders');

    if (s && s.length > 0) setSettings(s[0]);
    if (locs) setLocations(locs);
    if (cats) setCategories(cats);
    if (sups) setSuppliers(sups);
    if (prods) setProducts(prods);
    if (custs) setCustomers(custs);
    if (sls) setSales(sls);
    if (pos) setPurchaseOrders(pos);
    if (movs) setMovements(movs);
    if (exps) setExpenses(exps);
    setSalesChannels(chans && chans.length > 0 ? chans : INITIAL_SALES_CHANNELS);
    setFulfillmentOrders(fuls && fuls.length > 0 ? fuls : INITIAL_FULFILLMENT_ORDERS);
  };

  // Dynamic Page Title Sync
  useEffect(() => {
    const tabName = activeTab.toUpperCase();
    const subTabName = activeSubTab.replace('-', ' ').toUpperCase();
    document.title = `${tabName} • ${subTabName} | ${settings.businessName || 'Inventory 360'}`;
  }, [activeTab, activeSubTab, settings.businessName]);

  // Initialize DB & Load State
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        let storedSettings = await getAllFromStore<BusinessSettings>('settings');
        let storedLocations = await getAllFromStore<Location>('locations');

        if (!storedSettings || storedSettings.length === 0 || !storedLocations || storedLocations.length === 0) {
          // Initialize clean starter data
          await initCleanData();
          return;
        }

        let storedProducts = await getAllFromStore<Product>('products');
        let storedCategories = await getAllFromStore<Category>('categories');
        let storedSuppliers = await getAllFromStore<Supplier>('suppliers');
        let storedCustomers = await getAllFromStore<Customer>('customers');
        let storedSales = await getAllFromStore<Sale>('sales');
        let storedPOs = await getAllFromStore<PurchaseOrder>('purchaseOrders');
        let storedMovements = await getAllFromStore<StockMovement>('stockMovements');
        let storedExpenses = await getAllFromStore<Expense>('expenses');
        let storedChannels = await getAllFromStore<SalesChannel>('salesChannels');
        let storedFuls = await getAllFromStore<FulfillmentOrder>('fulfillmentOrders');

        if (active) {
          const loadedSetting = storedSettings[0];
          try {
            const storedLang = localStorage.getItem('inventory360_language');
            if (storedLang && storedLang !== loadedSetting.language) {
              loadedSetting.language = storedLang as SupportedLanguage;
            } else if (loadedSetting.language) {
              localStorage.setItem('inventory360_language', loadedSetting.language);
            }
          } catch {}

          setSettings(loadedSetting);
          setLocations(storedLocations);
          setCategories(storedCategories || []);
          setSuppliers(storedSuppliers || []);
          setProducts(storedProducts || []);
          setCustomers(storedCustomers || []);
          setSales(storedSales || []);
          setPurchaseOrders(storedPOs || []);
          setMovements(storedMovements || []);
          setExpenses(storedExpenses || []);
          setSalesChannels(storedChannels && storedChannels.length > 0 ? storedChannels : INITIAL_SALES_CHANNELS);
          setFulfillmentOrders(storedFuls && storedFuls.length > 0 ? storedFuls : INITIAL_FULFILLMENT_ORDERS);
        }
      } catch (err) {
        console.error('Failed to load local DB:', err);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  // Background Auto-Save Engine (Checks every 30s and runs silent scheduled backups)
  useEffect(() => {
    if (!settings.autoSaveConfig?.enabled) return;

    const checkAndRunAutoSave = async () => {
      const config = settings.autoSaveConfig;
      if (!config || !config.enabled) return;

      const now = Date.now();
      const nextDue = config.nextAutoSaveDueAt ? new Date(config.nextAutoSaveDueAt).getTime() : 0;

      if (now >= nextDue) {
        try {
          const { record, updatedConfig } = await performAutoSave(config, 'Scheduled Background Timer');
          const updatedSettings = { ...settings, autoSaveConfig: updatedConfig };
          await putToStore('settings', updatedSettings);
          setSettings(updatedSettings);
          console.log(`[AutoSave] Silent backup saved to ${record.folderName}: ${record.filename}`);
        } catch (err) {
          console.error('[AutoSave] Background auto-save failed:', err);
        }
      }
    };

    checkAndRunAutoSave();
    const intervalId = setInterval(checkAndRunAutoSave, 30000);

    return () => clearInterval(intervalId);
  }, [settings]);

  const openWorkspace = (tab: NavItemKey = 'home', subTab: string = 'retail-dashboard') => {
    setActiveTab(tab);
    setActiveSubTab(subTab);
    try {
      localStorage.setItem('inventory360_active_tab', tab);
      localStorage.setItem('inventory360_active_subtab', subTab);
    } catch {}
    if (typeof window !== 'undefined') {
      const isDefaultDashboard = tab === 'home' && (!subTab || subTab === 'retail-dashboard');
      if (isDefaultDashboard) {
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        window.location.hash = `#/${tab}/${subTab}`;
      }
    }
  };

  const closeToLanding = () => {
    openWorkspace('home', 'retail-dashboard');
  };

  // Multi-tab / multi-window database state synchronization
  const { broadcastChange: broadcastSync } = useBroadcastSync(loadAllData);

  // HANDLERS FOR PRODUCTS
  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putToStore('products', newProduct);
    setProducts((prev) => [newProduct, ...prev]);
    broadcastSync();
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const productWithTimestamp: Product = {
      ...updatedProduct,
      updatedAt: new Date().toISOString(),
      status: calculateStockStatus(updatedProduct),
    };
    await putToStore('products', productWithTimestamp);
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? productWithTimestamp : p)));
    broadcastSync();
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteFromStore('products', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    broadcastSync();
  };

  const handleBulkDeleteProducts = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    await deleteManyFromStore('products', ids);
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    broadcastSync();
  };

  // HANDLERS FOR CATEGORIES
  const handleAddCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}`,
    };
    await putToStore('categories', newCat);
    setCategories((prev) => [...prev, newCat]);
    broadcastSync();
  };

  const handleUpdateCategory = async (updatedCat: Category) => {
    await putToStore('categories', updatedCat);
    setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
    broadcastSync();
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteFromStore('categories', id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    broadcastSync();
  };

  const handleBulkDeleteCategories = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    await deleteManyFromStore('categories', ids);
    setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
    broadcastSync();
  };

  // HANDLERS FOR SUPPLIERS
  const handleAddSupplier = async (supData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supData,
      id: `sup_${Date.now()}`,
    };
    await putToStore('suppliers', newSup);
    setSuppliers((prev) => [...prev, newSup]);
    broadcastSync();
  };

  const handleUpdateSupplier = async (updatedSup: Supplier) => {
    await putToStore('suppliers', updatedSup);
    setSuppliers((prev) => prev.map((s) => (s.id === updatedSup.id ? updatedSup : s)));
    broadcastSync();
  };

  const handleDeleteSupplier = async (id: string) => {
    await deleteFromStore('suppliers', id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    broadcastSync();
  };

  const handleBulkDeleteSuppliers = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    await deleteManyFromStore('suppliers', ids);
    setSuppliers((prev) => prev.filter((s) => !ids.includes(s.id)));
    broadcastSync();
  };

  // HANDLERS FOR CUSTOMERS
  const handleAddCustomer = async (custData: Omit<Customer, 'id' | 'totalOrders' | 'totalRevenue' | 'outstandingBalance' | 'createdAt'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust_${Date.now()}`,
      totalOrders: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    await putToStore('customers', newCust);
    setCustomers((prev) => [newCust, ...prev]);
    broadcastSync();
  };

  // HANDLERS FOR SALES & POS
  const handleCompleteSale = async (saleData: Omit<Sale, 'id' | 'saleNumber' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      saleNumber: `SL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      channel: 'In-Store POS',
      createdAt: new Date().toISOString(),
    };

    await putToStore('sales', newSale);
    setSales((prev) => [newSale, ...prev]);

    // Update Product Stock Levels and Movements
    const updatedProds = [...products];
    const newMovements: StockMovement[] = [];

    for (const item of newSale.items) {
      const idx = updatedProds.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        const prod = updatedProds[idx];
        const prevStock = prod.stockQuantity;
        const newStock = Math.max(0, prevStock - item.quantity);
        const saleLocId = newSale.locationId || locations[0]?.id || 'loc_downtown';
        const currentLocQty = prod.locationQuantities?.[saleLocId] ?? prevStock;

        const updatedLocQuantities = {
          ...(prod.locationQuantities || {}),
          [saleLocId]: Math.max(0, currentLocQty - item.quantity),
        };

        const updatedProd: Product = {
          ...prod,
          stockQuantity: newStock,
          locationQuantities: updatedLocQuantities,
          status: calculateStockStatus({ ...prod, stockQuantity: newStock }),
          lastSoldAt: newSale.createdAt,
          updatedAt: new Date().toISOString(),
        };

        updatedProds[idx] = updatedProd;
        await putToStore('products', updatedProd);

        const mov: StockMovement = {
          id: `sm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'Sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          locationId: saleLocId,
          locationName: newSale.locationName || 'Downtown Flagship',
          referenceId: newSale.saleNumber,
          notes: `POS Sale #${newSale.saleNumber}`,
          createdAt: new Date().toISOString(),
        };
        newMovements.push(mov);
        await putToStore('stockMovements', mov);
      }
    }

    setProducts(updatedProds);
    setMovements((prev) => [...newMovements, ...prev]);

    // Update Customer profile stats if attached
    if (newSale.customerId) {
      const cIdx = customers.findIndex((c) => c.id === newSale.customerId);
      if (cIdx !== -1) {
        const cust = customers[cIdx];
        const updatedCust: Customer = {
          ...cust,
          totalOrders: cust.totalOrders + 1,
          totalRevenue: cust.totalRevenue + newSale.total,
          lastPurchaseDate: newSale.createdAt,
        };
        await putToStore('customers', updatedCust);
        setCustomers((prev) => prev.map((c) => (c.id === cust.id ? updatedCust : c)));
      }
    }

    broadcastSync();
    return newSale;
  };

  const handleRefundSale = async (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'Refunded') return;

    const updatedSale: Sale = { ...sale, status: 'Refunded' };
    await putToStore('sales', updatedSale);
    setSales((prev) => prev.map((s) => (s.id === saleId ? updatedSale : s)));

    // Restock returned items
    const updatedProds = [...products];
    const newMovements: StockMovement[] = [];

    for (const item of sale.items) {
      const idx = updatedProds.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        const prod = updatedProds[idx];
        const prevStock = prod.stockQuantity;
        const newStock = prevStock + item.quantity;
        const refundLocId = sale.locationId || locations[0]?.id || 'loc_downtown';
        const currentLocQty = prod.locationQuantities?.[refundLocId] ?? prevStock;

        const updatedLocQuantities = {
          ...(prod.locationQuantities || {}),
          [refundLocId]: currentLocQty + item.quantity,
        };

        const updatedProd: Product = {
          ...prod,
          stockQuantity: newStock,
          locationQuantities: updatedLocQuantities,
          status: calculateStockStatus({ ...prod, stockQuantity: newStock }),
          updatedAt: new Date().toISOString(),
        };

        updatedProds[idx] = updatedProd;
        await putToStore('products', updatedProd);

        const mov: StockMovement = {
          id: `sm_${Date.now()}_ref_${Math.random().toString(36).substr(2, 4)}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'Return',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          locationId: refundLocId,
          locationName: sale.locationName || 'Downtown Flagship',
          referenceId: sale.saleNumber,
          notes: `Refund for sale #${sale.saleNumber}`,
          createdAt: new Date().toISOString(),
        };
        newMovements.push(mov);
        await putToStore('stockMovements', mov);
      }
    }

    setProducts(updatedProds);
    setMovements((prev) => [...newMovements, ...prev]);
    broadcastSync();
  };

  // HANDLER FOR PURCHASE ORDERS
  const handleCreatePO = async (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>) => {
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po_${Date.now()}`,
      poNumber: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };
    await putToStore('purchaseOrders', newPO);
    setPurchaseOrders((prev) => [newPO, ...prev]);
    broadcastSync();
  };

  const handleReceivePO = async (poId: string, receivedItemsMap?: Record<string, number>) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    if (!po || po.status === 'Received') return;

    let isAllReceived = true;
    const updatedItems = po.items.map((item) => {
      const addedQty = receivedItemsMap ? receivedItemsMap[item.productId] ?? (item.orderedQuantity - (item.receivedQuantity || 0)) : (item.orderedQuantity - (item.receivedQuantity || 0));
      const totalRcvd = (item.receivedQuantity || 0) + addedQty;
      if (totalRcvd < item.orderedQuantity) {
        isAllReceived = false;
      }
      return {
        ...item,
        receivedQuantity: totalRcvd,
      };
    });

    const updatedPO: PurchaseOrder = {
      ...po,
      status: isAllReceived ? 'Received' : 'Partial',
      receivedDate: new Date().toISOString(),
      items: updatedItems,
    };

    await putToStore('purchaseOrders', updatedPO);
    setPurchaseOrders((prev) => prev.map((p) => (p.id === poId ? updatedPO : p)));

    // Increment product stock and record audit movements
    const updatedProds = [...products];
    const newMovements: StockMovement[] = [];

    for (const item of po.items) {
      const addedQty = receivedItemsMap ? receivedItemsMap[item.productId] ?? (item.orderedQuantity - (item.receivedQuantity || 0)) : (item.orderedQuantity - (item.receivedQuantity || 0));
      if (addedQty > 0) {
        const idx = updatedProds.findIndex((prod) => prod.id === item.productId);
        if (idx !== -1) {
          const prod = updatedProds[idx];
          const prevStock = prod.stockQuantity;
          const newStock = prevStock + addedQty;
          const poLocId = po.locationId || locations[0]?.id || 'loc_downtown';
          const currentLocQty = prod.locationQuantities?.[poLocId] ?? prevStock;

          const updatedLocQuantities = {
            ...(prod.locationQuantities || {}),
            [poLocId]: currentLocQty + addedQty,
          };

          const updatedProd: Product = {
            ...prod,
            stockQuantity: newStock,
            locationQuantities: updatedLocQuantities,
            status: calculateStockStatus({ ...prod, stockQuantity: newStock }),
            updatedAt: new Date().toISOString(),
          };

          updatedProds[idx] = updatedProd;
          await putToStore('products', updatedProd);

          const mov: StockMovement = {
            id: `sm_${Date.now()}_po_${Math.random().toString(36).substr(2, 4)}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'Purchase',
            quantityChange: addedQty,
            previousStock: prevStock,
            newStock: newStock,
            locationId: poLocId,
            locationName: po.locationName || 'Downtown Flagship',
            referenceId: po.poNumber,
            lotNumber: prod.lotNumber,
            notes: `Received PO #${po.poNumber} (${addedQty} qty) from ${po.supplierName}`,
            createdAt: new Date().toISOString(),
          };
          newMovements.push(mov);
          await putToStore('stockMovements', mov);
        }
      }
    }

    setProducts(updatedProds);
    setMovements((prev) => [...newMovements, ...prev]);
    broadcastSync();
  };

  // Bulk Auto-Generate POs for Low Stock
  const handleBulkAutoGeneratePOs = async () => {
    const lowStockItems = products.filter(
      (p) => p.stockQuantity <= p.reorderPoint && p.status !== 'Dead Stock' && p.status !== 'Quarantined'
    );
    if (lowStockItems.length === 0) return;

    const supplierGroups: Record<string, Product[]> = {};
    lowStockItems.forEach((p) => {
      const supKey = p.supplierId || suppliers[0]?.id || 'sup_general';
      if (!supplierGroups[supKey]) {
        supplierGroups[supKey] = [];
      }
      supplierGroups[supKey].push(p);
    });

    const newPOs: PurchaseOrder[] = [];
    for (const [supId, prods] of Object.entries(supplierGroups)) {
      const sup = suppliers.find((s) => s.id === supId) || {
        id: supId,
        name: prods[0]?.supplierName || suppliers[0]?.name || 'Primary Supplier',
      };
      const items = prods.map((p) => {
        const orderQty = Math.max(10, p.reorderPoint * 2 - p.stockQuantity);
        return {
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          unitCost: p.costPrice,
          orderedQuantity: orderQty,
          receivedQuantity: 0,
          total: p.costPrice * orderQty,
        };
      });

      const subtotal = items.reduce((acc, i) => acc + i.total, 0);
      const po: PurchaseOrder = {
        id: `po_auto_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        poNumber: `PO-2026-AUTO-${Math.floor(100 + Math.random() * 900)}`,
        supplierId: sup.id,
        supplierName: sup.name,
        items,
        subtotal,
        tax: subtotal * 0.085,
        total: subtotal * 1.085,
        status: 'Sent',
        expectedDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        locationId: locations[0]?.id || 'loc_downtown',
        locationName: locations[0]?.name || 'Downtown Flagship',
        notes: 'Automated replenishment PO generated from low stock buffer alerts.',
        createdAt: new Date().toISOString(),
      };

      newPOs.push(po);
      await putToStore('purchaseOrders', po);
    }

    setPurchaseOrders((prev) => [...newPOs, ...prev]);
    broadcastSync();
  };

  const handleSyncAllChannels = async () => {
    const updated = salesChannels.map((c) => ({
      ...c,
      status: 'Tracked' as const,
      lastSyncedAt: new Date().toISOString(),
      activeListingsCount: products.filter((p) => p.status !== 'Out of Stock').length,
    }));
    await putManyToStore('salesChannels', updated);
    setSalesChannels(updated);
    broadcastSync();
  };

  const handleUpdateFulfillmentStatus = async (
    orderId: string,
    status: FulfillmentStatus,
    carrier?: 'FedEx' | 'UPS' | 'DHL' | 'USPS' | 'Local Courier',
    trackingNumber?: string
  ) => {
    const order = fulfillmentOrders.find((o) => o.id === orderId);
    if (!order) return;

    const updatedOrder: FulfillmentOrder = {
      ...order,
      status,
      carrier: carrier || order.carrier,
      trackingNumber: trackingNumber || order.trackingNumber,
      shippedAt: status === 'Shipped' ? new Date().toISOString() : order.shippedAt,
    };

    await putToStore('fulfillmentOrders', updatedOrder);
    setFulfillmentOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));

    if (status === 'Shipped' && order.status !== 'Shipped') {
      const newMovements: StockMovement[] = [];
      const updatedProds = [...products];

      for (const item of order.items) {
        const pIdx = updatedProds.findIndex((p) => p.id === item.productId);
        if (pIdx !== -1) {
          const prod = updatedProds[pIdx];
          const prevStock = prod.stockQuantity;
          const newStock = Math.max(0, prevStock - item.quantity);
          const shipLocId = order.assignedLocationId || locations[0]?.id || 'loc_downtown';
          const currentLocQty = prod.locationQuantities?.[shipLocId] ?? prevStock;

          const updatedLocQuantities = {
            ...(prod.locationQuantities || {}),
            [shipLocId]: Math.max(0, currentLocQty - item.quantity),
          };

          const updatedProd: Product = {
            ...prod,
            stockQuantity: newStock,
            locationQuantities: updatedLocQuantities,
            status: calculateStockStatus({ ...prod, stockQuantity: newStock }),
            updatedAt: new Date().toISOString(),
          };

          updatedProds[pIdx] = updatedProd;
          await putToStore('products', updatedProd);

          const mov: StockMovement = {
            id: `sm_${Date.now()}_ful_${Math.random().toString(36).substr(2, 4)}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'Sale',
            quantityChange: -item.quantity,
            previousStock: prevStock,
            newStock: newStock,
            locationId: shipLocId,
            locationName: order.assignedLocationName || 'Downtown Flagship',
            referenceId: order.orderNumber,
            notes: `Dispatched order #${order.orderNumber} via ${carrier || 'Courier'} (Tracking: ${trackingNumber || 'N/A'})`,
            createdAt: new Date().toISOString(),
          };

          newMovements.push(mov);
          await putToStore('stockMovements', mov);
        }
      }

      setProducts(updatedProds);
      setMovements((prev) => [...newMovements, ...prev]);
    }
    broadcastSync();
  };

  // HANDLER FOR STOCK ADJUSTMENT
  const handleStockAdjustment = async (productId: string, qtyChange: number, reason: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;

    const prevStock = p.stockQuantity;
    const newStock = Math.max(0, prevStock + qtyChange);
    const defaultLocId = locations[0]?.id || 'loc_downtown';
    const currentLocQty = p.locationQuantities?.[defaultLocId] ?? prevStock;

    const updatedLocQuantities = {
      ...(p.locationQuantities || {}),
      [defaultLocId]: Math.max(0, currentLocQty + qtyChange),
    };

    const updated: Product = {
      ...p,
      stockQuantity: newStock,
      locationQuantities: updatedLocQuantities,
      status: calculateStockStatus({ ...p, stockQuantity: newStock }),
      updatedAt: new Date().toISOString(),
    };

    await putToStore('products', updated);
    setProducts((prev) => prev.map((prod) => (prod.id === productId ? updated : prod)));

    const mov: StockMovement = {
      id: `sm_${Date.now()}_adj_${Math.random().toString(36).substr(2, 4)}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      type: 'Adjustment',
      quantityChange: qtyChange,
      previousStock: prevStock,
      newStock: newStock,
      locationId: defaultLocId,
      locationName: locations[0]?.name || 'Downtown Flagship',
      notes: reason,
      createdAt: new Date().toISOString(),
    };
    await putToStore('stockMovements', mov);
    setMovements((prev) => [mov, ...prev]);
    broadcastSync();
  };

  // HANDLER FOR STOCK TRANSFER
  const handleStockTransfer = async (
    transferData: Omit<StockTransfer, 'id' | 'transferNumber' | 'createdAt'>
  ) => {
    const transfer: StockTransfer = {
      ...transferData,
      id: `trans_${Date.now()}`,
      transferNumber: `TR-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };
    await putToStore('stockTransfers', transfer);

    const newMovements: StockMovement[] = [];
    const updatedProds = [...products];

    for (const item of transfer.items) {
      const idx = updatedProds.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        const prod = updatedProds[idx];
        const initialLocMap: Record<string, number> = {};
        locations.forEach((loc) => {
          initialLocMap[loc.id] = prod.locationQuantities?.[loc.id] ?? Math.floor(prod.stockQuantity / locations.length);
        });

        const srcQty = initialLocMap[transfer.sourceLocationId] ?? prod.stockQuantity;
        const dstQty = initialLocMap[transfer.targetLocationId] ?? 0;

        const updatedLocationQuantities = {
          ...initialLocMap,
          [transfer.sourceLocationId]: Math.max(0, srcQty - item.quantity),
          [transfer.targetLocationId]: dstQty + item.quantity,
        };

        const updatedProd: Product = {
          ...prod,
          locationQuantities: updatedLocationQuantities,
          updatedAt: new Date().toISOString(),
        };

        updatedProds[idx] = updatedProd;
        await putToStore('products', updatedProd);

        const movOut: StockMovement = {
          id: `sm_${Date.now()}_out_${Math.random().toString(36).substr(2, 4)}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'Transfer',
          quantityChange: -item.quantity,
          previousStock: srcQty,
          newStock: Math.max(0, srcQty - item.quantity),
          locationId: transfer.sourceLocationId,
          locationName: transfer.sourceLocationName,
          referenceId: transfer.transferNumber,
          notes: `Transfer OUT to ${transfer.targetLocationName}`,
          createdAt: new Date().toISOString(),
        };

        const movIn: StockMovement = {
          id: `sm_${Date.now()}_in_${Math.random().toString(36).substr(2, 4)}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'Transfer',
          quantityChange: item.quantity,
          previousStock: dstQty,
          newStock: dstQty + item.quantity,
          locationId: transfer.targetLocationId,
          locationName: transfer.targetLocationName,
          referenceId: transfer.transferNumber,
          notes: `Transfer IN from ${transfer.sourceLocationName}`,
          createdAt: new Date().toISOString(),
        };

        newMovements.push(movOut, movIn);
        await putToStore('stockMovements', movOut);
        await putToStore('stockMovements', movIn);
      }
    }

    setProducts(updatedProds);
    setMovements((prev) => [...newMovements, ...prev]);
    broadcastSync();
  };

  // HANDLER FOR LOT QUARANTINE / RELEASE
  const handleQuarantineProduct = async (productId: string, isQuarantine: boolean) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;

    const newStatus = isQuarantine ? ('Quarantined' as const) : calculateStockStatus(p);
    const updatedProd: Product = {
      ...p,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    await putToStore('products', updatedProd);
    setProducts((prev) => prev.map((prod) => (prod.id === productId ? updatedProd : prod)));

    const mov: StockMovement = {
      id: `sm_${Date.now()}_qr_${Math.random().toString(36).substr(2, 4)}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      type: 'Adjustment',
      quantityChange: 0,
      previousStock: p.stockQuantity,
      newStock: p.stockQuantity,
      locationId: locations[0]?.id || 'loc_downtown',
      locationName: locations[0]?.name || 'Downtown Flagship',
      notes: isQuarantine
        ? `Quarantine initiated for Lot #${p.lotNumber || 'N/A'}`
        : `Quarantine released for Lot #${p.lotNumber || 'N/A'}`,
      createdAt: new Date().toISOString(),
    };
    await putToStore('stockMovements', mov);
    setMovements((prev) => [mov, ...prev]);
    broadcastSync();
  };

  // HANDLER FOR UPDATING PRODUCT REORDER POINT
  const handleUpdateProductReorderPoint = async (productId: string, newReorderPoint: number) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;

    const updatedProd: Product = {
      ...p,
      reorderPoint: Math.max(0, newReorderPoint),
      status: calculateStockStatus({ ...p, reorderPoint: Math.max(0, newReorderPoint) }),
      updatedAt: new Date().toISOString(),
    };

    await putToStore('products', updatedProd);
    setProducts((prev) => prev.map((prod) => (prod.id === productId ? updatedProd : prod)));
    broadcastSync();
  };

  // HANDLERS FOR SETTINGS & LOCATIONS
  const handleUpdateSettings = async (newSettings: BusinessSettings) => {
    await putToStore('settings', newSettings);
    setSettings(newSettings);
    if (newSettings.language) {
      try {
        localStorage.setItem('inventory360_language', newSettings.language);
        window.dispatchEvent(new Event('inventory360_lang_change'));
      } catch {}
    }
    broadcastSync();
  };

  const handleAddLocation = async (locData: Omit<Location, 'id'>) => {
    const newLoc: Location = {
      ...locData,
      id: `loc_${Date.now()}`,
    };
    await putToStore('locations', newLoc);
    setLocations((prev) => [...prev, newLoc]);
    broadcastSync();
  };

  const handleUpdateLocation = async (updatedLoc: Location) => {
    await putToStore('locations', updatedLoc);
    setLocations((prev) => prev.map((l) => (l.id === updatedLoc.id ? updatedLoc : l)));
    broadcastSync();
  };

  const handleDeleteLocation = async (id: string) => {
    await deleteFromStore('locations', id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
    broadcastSync();
  };

  const handleUpdateReceiptFormat = (fmt: '80mm' | '58mm' | 'A4') => {
    setReceiptFormat(fmt);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory360_receipt_format', fmt);
    }
  };

  const handlePrintReceipt = (sale: Sale, format?: '80mm' | '58mm' | 'A4') => {
    if (format) {
      handleUpdateReceiptFormat(format);
    }
    setPrintableSale(sale);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <I18nProvider language={(settings.language as SupportedLanguage) || 'en'}>
      {/* Main Enterprise Retail Management Workspace */}
      <div className="flex h-screen bg-slate-50 text-slate-900 antialiased overflow-hidden font-mono">
        {/* 1. Left Fixed Navigation Rail */}
        <aside className="hidden md:block shrink-0">
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
            }}
            activeSubTab={activeSubTab}
            onSubTabChange={setActiveSubTab}
            businessName={settings.businessName}
            ownerName={settings.ownerName}
            currencyCode={settings.currencyCode}
            onCurrencyChange={async (code) => {
              const found = CURRENCIES.find((c) => c.code === code);
              if (found) {
                await handleUpdateSettings({
                  ...settings,
                  currencyCode: found.code,
                  currencySymbol: found.symbol,
                });
              }
            }}
            language={settings.language}
            onLanguageChange={async (lang) => {
              await handleUpdateSettings({
                ...settings,
                language: lang as SupportedLanguage,
              });
            }}
            onOpenLanding={closeToLanding}
            onOpenTour={() => setIsTourOpen(true)}
            onOpenDataPolicy={() => setShowDataPolicyNotice(true)}
            onResetDemoData={seedDemoData}
            autoSaveConfig={settings.autoSaveConfig}
          />
        </aside>

          {/* Mobile Drawer Navigation Overlay */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="relative z-10 w-72 max-w-[85vw] h-full bg-white border-r border-slate-200 flex flex-col text-slate-900 shadow-2xl">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between font-mono bg-slate-50">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    System Navigation
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar
                    activeTab={activeTab}
                    onTabChange={(tab) => {
                      setActiveTab(tab);
                      setIsMobileMenuOpen(false);
                    }}
                    activeSubTab={activeSubTab}
                    onSubTabChange={(sub) => {
                      setActiveSubTab(sub);
                      setIsMobileMenuOpen(false);
                    }}
                    businessName={settings.businessName}
                    ownerName={settings.ownerName}
                    currencyCode={settings.currencyCode}
                    onCurrencyChange={async (code) => {
                      const found = CURRENCIES.find((c) => c.code === code);
                      if (found) {
                        await handleUpdateSettings({
                          ...settings,
                          currencyCode: found.code,
                          currencySymbol: found.symbol,
                        });
                      }
                    }}
                    language={settings.language}
                    onLanguageChange={async (lang) => {
                      await handleUpdateSettings({
                        ...settings,
                        language: lang as SupportedLanguage,
                      });
                    }}
                    onOpenLanding={() => {
                      closeToLanding();
                      setIsMobileMenuOpen(false);
                    }}
                    onOpenTour={() => {
                      setIsTourOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    onOpenDataPolicy={() => {
                      setShowDataPolicyNotice(true);
                      setIsMobileMenuOpen(false);
                    }}
                    onResetDemoData={async () => {
                      await seedDemoData();
                      setIsMobileMenuOpen(false);
                    }}
                    autoSaveConfig={settings.autoSaveConfig}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Main Application Frame */}
          <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto bg-slate-50">
            {/* Mobile Header Bar Trigger */}
            <div className="md:hidden p-3 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-20 font-mono shadow-2xs">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-300 flex items-center gap-1.5 text-xs font-bold uppercase"
                aria-label="Toggle Navigation"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </button>

              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 truncate max-w-[180px]">
                {settings.businessName || 'Inventory 360'}
              </span>

              <button
                onClick={closeToLanding}
                className="px-2.5 py-1 bg-slate-100 border border-slate-300 text-[10px] font-bold uppercase text-slate-800 hover:bg-slate-200"
              >
                Portal
              </button>
            </div>

            {/* View Container */}
            <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <ErrorBoundary fallbackTitle="Module Safeguard" onReset={loadAllData}>
                {activeTab === 'home' && (
                  <DashboardView
                  products={products}
                  sales={sales}
                  customers={customers}
                  purchaseOrders={purchaseOrders}
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                  onNavigate={(tab, subTab) => {
                    setActiveTab(tab);
                    if (subTab) setActiveSubTab(subTab);
                  }}
                  currencySymbol={settings.currencySymbol}
                  settings={settings}
                  onPrintReceipt={handlePrintReceipt}
                />
              )}

              {activeTab === 'sell' && (
                <SellView
                  products={products}
                  customers={customers}
                  locations={locations}
                  selectedLocation={selectedLocation}
                  sales={sales}
                  onCompleteSale={handleCompleteSale}
                  onRefundSale={handleRefundSale}
                  currencySymbol={settings.currencySymbol}
                  taxRate={settings.taxRate}
                  onPrintReceipt={handlePrintReceipt}
                  receiptFormat={receiptFormat}
                  onUpdateReceiptFormat={handleUpdateReceiptFormat}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                />
              )}

              {activeTab === 'fulfillment' && (
                <FulfillmentView
                  channels={salesChannels}
                  orders={fulfillmentOrders}
                  products={products}
                  locations={locations}
                  onSyncAllChannels={handleSyncAllChannels}
                  onUpdateOrderStatus={handleUpdateFulfillmentStatus}
                  currencySymbol={settings.currencySymbol}
                  settings={settings}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                />
              )}

              {activeTab === 'catalog' && (
                <CatalogView
                  products={products}
                  categories={categories}
                  suppliers={suppliers}
                  locations={locations}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onBulkDeleteProducts={handleBulkDeleteProducts}
                  onAddCategory={handleAddCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onBulkDeleteCategories={handleBulkDeleteCategories}
                  onAddSupplier={handleAddSupplier}
                  onUpdateSupplier={handleUpdateSupplier}
                  onDeleteSupplier={handleDeleteSupplier}
                  onBulkDeleteSuppliers={handleBulkDeleteSuppliers}
                  currencySymbol={settings.currencySymbol}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  products={products}
                  movements={movements}
                  locations={locations}
                  suppliers={suppliers}
                  purchaseOrders={purchaseOrders}
                  selectedLocation={selectedLocation}
                  onCreatePO={handleCreatePO}
                  onReceivePO={handleReceivePO}
                  onStockAdjustment={handleStockAdjustment}
                  onStockTransfer={handleStockTransfer}
                  onBulkAutoGeneratePOs={handleBulkAutoGeneratePOs}
                  onQuarantineProduct={handleQuarantineProduct}
                  onUpdateProductReorderPoint={handleUpdateProductReorderPoint}
                  currencySymbol={settings.currencySymbol}
                  settings={settings}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  sales={sales}
                  onAddCustomer={handleAddCustomer}
                  currencySymbol={settings.currencySymbol}
                />
              )}

              {activeTab === 'reporting' && (
                <ReportingView
                  products={products}
                  sales={sales}
                  purchaseOrders={purchaseOrders}
                  locations={locations}
                  categories={categories}
                  currencySymbol={settings.currencySymbol}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                />
              )}

              {activeTab === 'setup' && (
                <SetupView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  locations={locations}
                  onAddLocation={handleAddLocation}
                  onResetDemoData={seedDemoData}
                  onClearAllData={handleClearAllData}
                  onReloadAllData={loadAllData}
                  products={products}
                  sales={sales}
                  inventory={products}
                  activeSubTab={activeSubTab}
                  onSubTabChange={setActiveSubTab}
                />
              )}
              </ErrorBoundary>
            </div>

            {/* Global In-App Bottom Footer */}
            <footer className="border-t border-slate-200 bg-white px-4 sm:px-8 py-3 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
              <span>© {new Date().getFullYear()} Inventory 360 Enterprise • Local-First Architecture</span>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span>Created with <span className="text-rose-500">❤️</span> by <strong className="text-slate-800">Nikhil Khanpara</strong></span>
                <span className="text-slate-400">•</span>
                <a href="https://github.com/Nikking18" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 underline font-medium">GitHub</a>
                <span className="text-slate-300">•</span>
                <a href="https://www.linkedin.com/in/nikhilkhanpara/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 underline font-medium">LinkedIn</a>
                <span className="text-slate-300">•</span>
                <a href="https://x.com/nikhilkhanpara" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 underline font-medium">Twitter</a>
              </div>
            </footer>
          </main>

          {/* Printable Receipt Hidden Render Target */}
          <PrintReceipt sale={printableSale} settings={settings} receiptFormat={receiptFormat} />
        </div>

      {/* Data Policy & Backup Notice Modal */}
      <DataPolicyModal
        isOpen={showDataPolicyNotice}
        onClose={() => setShowDataPolicyNotice(false)}
        onGoToBackup={() => {
          setShowDataPolicyNotice(false);
          openWorkspace('setup', 'data');
        }}
      />

      {/* Interactive Product Walkthrough Tour */}
      <ProductTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab, subTab) => {
          openWorkspace(tab as NavItemKey, subTab || 'retail-dashboard');
        }}
      />
    </I18nProvider>
  );
}
