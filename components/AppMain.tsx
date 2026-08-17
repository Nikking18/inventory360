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

import { Sidebar, NavItemKey } from './Sidebar';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { SellView } from './views/SellView';
import { FulfillmentView } from './views/FulfillmentView';
import { CatalogView } from './views/CatalogView';
import { InventoryView } from './views/InventoryView';
import { CustomersView } from './views/CustomersView';
import { ReportingView } from './views/ReportingView';
import { SetupView } from './views/SetupView';
import { PrintReceipt } from './PrintReceipt';
import { DataPolicyModal } from './common/DataPolicyModal';
import { ProductTourModal } from './common/ProductTourModal';
import { calculateStockStatus } from '../lib/utils';
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

export default function AppMain() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('home');
  const [activeSubTab, setActiveSubTab] = useState<string>('retail-dashboard');
  // Default to Main Page (Landing Portal). When user clicks Dashboard, show them the dashboard and left panel!
  const [showLanding, setShowLanding] = useState<boolean>(true);
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

  // Route persistence: Restore page from hash or localStorage on load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedFormat = localStorage.getItem('inventory360_receipt_format');
    if (savedFormat === '80mm' || savedFormat === '58mm' || savedFormat === 'A4') {
      setReceiptFormat(savedFormat);
    }

    const parseRoute = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const validTabs: NavItemKey[] = [
        'home',
        'sell',
        'fulfillment',
        'reporting',
        'catalog',
        'inventory',
        'customers',
        'setup',
      ];

      if (hash === 'landing') {
        setShowLanding(true);
        return;
      }

      if (hash) {
        const parts = hash.split('/');
        const tab = (parts[0] === 'dashboard' ? 'home' : parts[0]) as NavItemKey;
        const sub = parts[1] || '';
        if (validTabs.includes(tab)) {
          setActiveTab(tab);
          if (sub) setActiveSubTab(sub);
          setShowLanding(false);
          return;
        }
      }

      // Check localStorage if no specific hash
      const savedLanding = localStorage.getItem('inventory360_show_landing');
      if (savedLanding === 'false') {
        const savedTab = localStorage.getItem('inventory360_active_tab') as NavItemKey;
        const savedSub = localStorage.getItem('inventory360_active_subtab');
        if (savedTab && validTabs.includes(savedTab)) {
          setActiveTab(savedTab);
          if (savedSub) setActiveSubTab(savedSub);
          setShowLanding(false);
        }
      }
    };

    parseRoute();

    const onHashChange = () => {
      parseRoute();
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Sync state to URL hash and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('inventory360_show_landing', String(showLanding));
    localStorage.setItem('inventory360_active_tab', activeTab);
    localStorage.setItem('inventory360_active_subtab', activeSubTab);

    const targetHash = showLanding ? '#/landing' : `/#/${activeTab}${activeSubTab ? '/' + activeSubTab : ''}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, [showLanding, activeTab, activeSubTab]);

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
    const tabName = showLanding ? 'Portal' : activeTab.toUpperCase();
    const subTabName = showLanding ? 'Overview' : activeSubTab.replace('-', ' ').toUpperCase();
    document.title = `${tabName} • ${subTabName} | ${settings.businessName || 'Inventory 360'}`;
  }, [activeTab, activeSubTab, showLanding, settings.businessName]);

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
          setSettings(storedSettings[0]);
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

  // Handle browser back button (popstate) so pressing back while in dashboard smoothly returns to Landing Portal
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view === 'workspace') {
        setShowLanding(false);
        if (event.state.tab) setActiveTab(event.state.tab);
        if (event.state.subTab) setActiveSubTab(event.state.subTab);
      } else {
        setShowLanding(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openWorkspace = (tab: NavItemKey = 'home', subTab: string = 'retail-dashboard') => {
    setShowLanding(false);
    setActiveTab(tab);
    setActiveSubTab(subTab);
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'workspace', tab, subTab }, '', '/#app');
    }
  };

  const closeToLanding = () => {
    setShowLanding(true);
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.pushState({ view: 'landing' }, '', '/');
    }
  };

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
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const productWithTimestamp: Product = {
      ...updatedProduct,
      updatedAt: new Date().toISOString(),
      status: calculateStockStatus(updatedProduct),
    };
    await putToStore('products', productWithTimestamp);
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? productWithTimestamp : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteFromStore('products', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
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

        const updatedProd: Product = {
          ...prod,
          stockQuantity: newStock,
          status: calculateStockStatus({ ...prod, stockQuantity: newStock }),
          lastSoldAt: newSale.createdAt,
          updatedAt: new Date().toISOString(),
        };

        updatedProds[idx] = updatedProd;
        await putToStore('products', updatedProd);

        const mov: StockMovement = {
          id: `sm_${Date.now()}_${Math.random()}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'Sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          locationId: newSale.locationId,
          locationName: newSale.locationName,
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

        const updatedProd: Product = {
          ...prod,
          stockQuantity: newStock,
          status: calculateStockStatus({ ...prod, stockQuantity: newStock }),
          updatedAt: new Date().toISOString(),
        };

        updatedProds[idx] = updatedProd;
        await putToStore('products', updatedProd);

        const mov: StockMovement = {
          id: `sm_${Date.now()}_ref_${Math.random()}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'Return',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          locationId: sale.locationId,
          locationName: sale.locationName,
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

          const updatedProd: Product = {
            ...prod,
            stockQuantity: newStock,
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
            locationId: po.locationId,
            locationName: po.locationName,
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
  };

  // Bulk Auto-Generate POs for Low Stock
  const handleBulkAutoGeneratePOs = async () => {
    const lowStockItems = products.filter((p) => p.stockQuantity <= p.reorderPoint && p.status !== 'Dead Stock');
    if (lowStockItems.length === 0) return;

    const supplierGroups: Record<string, Product[]> = {};
    lowStockItems.forEach((p) => {
      if (!supplierGroups[p.supplierId]) {
        supplierGroups[p.supplierId] = [];
      }
      supplierGroups[p.supplierId].push(p);
    });

    const newPOs: PurchaseOrder[] = [];
    for (const [supId, prods] of Object.entries(supplierGroups)) {
      const sup = suppliers.find((s) => s.id === supId) || {
        id: supId,
        name: prods[0]?.supplierName || 'Primary Supplier',
      };
      const items = prods.map((p) => {
        const orderQty = Math.max(20, p.reorderPoint * 2 - p.stockQuantity);
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
        notes: 'Automated reorder PO generated from low stock threshold alerts.',
        createdAt: new Date().toISOString(),
      };

      newPOs.push(po);
      await putToStore('purchaseOrders', po);
    }

    setPurchaseOrders((prev) => [...newPOs, ...prev]);
  };

  // MULTI-CHANNEL SALES SYNC & FULFILLMENT HANDLERS
  const handleSyncAllChannels = async () => {
    const updated = salesChannels.map((c) => ({
      ...c,
      status: 'Tracked' as const,
      lastSyncedAt: new Date().toISOString(),
      activeListingsCount: products.filter((p) => p.status !== 'Out of Stock').length,
    }));
    await putManyToStore('salesChannels', updated);
    setSalesChannels(updated);
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

          const updatedProd: Product = {
            ...prod,
            stockQuantity: newStock,
            status: calculateStockStatus({ ...prod, stockQuantity: newStock }),
          };

          updatedProds[pIdx] = updatedProd;
          await putToStore('products', updatedProd);

          const mov: StockMovement = {
            id: `sm_${Date.now()}_ful_${Math.random().toString(36).substr(2, 4)}`,
            productId: prod.id,
            productName: prod.name,
            sku: prod.sku,
            type: 'Fulfillment',
            quantityChange: -item.quantity,
            previousStock: prevStock,
            newStock: newStock,
            locationId: order.assignedLocationId,
            locationName: order.assignedLocationName,
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
  };

  // HANDLER FOR STOCK ADJUSTMENT
  const handleStockAdjustment = async (productId: string, qtyChange: number, reason: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;

    const prevStock = p.stockQuantity;
    const newStock = Math.max(0, prevStock + qtyChange);
    const updated = {
      ...p,
      stockQuantity: newStock,
      status: calculateStockStatus({ ...p, stockQuantity: newStock }),
    };

    await putToStore('products', updated);
    setProducts((prev) => prev.map((prod) => (prod.id === productId ? updated : prod)));

    const mov: StockMovement = {
      id: `sm_${Date.now()}`,
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      type: 'Adjustment',
      quantityChange: qtyChange,
      previousStock: prevStock,
      newStock: newStock,
      locationId: locations[0]?.id || 'loc_downtown',
      locationName: locations[0]?.name || 'Downtown Flagship',
      notes: reason,
      createdAt: new Date().toISOString(),
    };
    await putToStore('stockMovements', mov);
    setMovements((prev) => [mov, ...prev]);
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
        const srcQty = prod.locationQuantities?.[transfer.sourceLocationId] || 0;
        const dstQty = prod.locationQuantities?.[transfer.targetLocationId] || 0;

        const updatedLocationQuantities = {
          ...(prod.locationQuantities || {}),
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
          id: `sm_${Date.now()}_out_${Math.random()}`,
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
          id: `sm_${Date.now()}_in_${Math.random()}`,
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
  };

  // HANDLERS FOR SETTINGS & LOCATIONS
  const handleUpdateSettings = async (newSettings: BusinessSettings) => {
    await putToStore('settings', newSettings);
    setSettings(newSettings);
  };

  const handleAddLocation = async (locData: Omit<Location, 'id'>) => {
    const newLoc: Location = {
      ...locData,
      id: `loc_${Date.now()}`,
    };
    await putToStore('locations', newLoc);
    setLocations((prev) => [...prev, newLoc]);
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
      {/* If showLanding is true, render the Main Webapp Landing Portal */}
      {showLanding ? (
        <LandingView
          onOpenDashboard={() => openWorkspace('home', 'retail-dashboard')}
          onOpenPOS={() => openWorkspace('sell', 'quick-sale')}
          onStartDemo={async () => {
            await seedDemoData();
            openWorkspace('home', 'retail-dashboard');
          }}
          onStartFresh={async () => {
            await initCleanData();
            openWorkspace('home', 'retail-dashboard');
          }}
          onOpenTour={() => {
            openWorkspace('home', 'retail-dashboard');
            setIsTourOpen(true);
          }}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : (
        /* When showLanding is false, display the full workspace with the Left Sidebar Panel and views */
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
              onOpenLanding={closeToLanding}
              onOpenTour={() => setIsTourOpen(true)}
              onOpenDataPolicy={() => setShowDataPolicyNotice(true)}
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
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Main Application Frame */}
          <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto bg-slate-50">
            {/* Top Header Bar */}
            <header className="h-16 px-3 sm:px-6 lg:px-8 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between no-print gap-1.5 sm:gap-4 overflow-hidden shadow-2xs">
              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-300 shrink-0"
                  aria-label="Toggle Navigation"
                >
                  <Menu className="w-4 h-4" />
                </button>

                {/* Back to Portal Button */}
                <button
                  onClick={closeToLanding}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold font-mono uppercase tracking-wider border border-slate-300 transition-colors flex items-center gap-1.5 shrink-0"
                  title="Return to Main Portal"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Main Portal</span>
                </button>

                {/* Clickable Breadcrumbs Navigation */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono">
                  <button
                    onClick={() => {
                      setActiveTab('home');
                      setActiveSubTab('retail-dashboard');
                    }}
                    className="text-slate-500 hover:text-slate-900 uppercase font-bold transition-colors flex items-center gap-1"
                    title="Return to Main Dashboard"
                  >
                    <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45 hidden sm:block shrink-0" />
                    <span>Inventory 360</span>
                  </button>
                  <span className="text-slate-400 shrink-0">/</span>
                  <span className="text-slate-600 uppercase tracking-wider truncate">
                    {activeTab}
                  </span>
                  <span className="text-slate-400 shrink-0">/</span>
                  <span className="text-slate-900 font-bold uppercase tracking-wider truncate max-w-[90px] sm:max-w-none bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                    {activeSubTab.replace('-', ' ')}
                  </span>
                </nav>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                {/* Instant Currency Selector */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-2xs">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <select
                    value={settings.currencyCode || 'USD'}
                    onChange={async (e) => {
                      const found = CURRENCIES.find((c) => c.code === e.target.value);
                      if (found) {
                        await handleUpdateSettings({
                          ...settings,
                          currencyCode: found.code,
                          currencySymbol: found.symbol,
                        });
                      }
                    }}
                    className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-[11px]"
                    title="Change Global Currency"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Instant Language Selector */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 text-xs font-mono shadow-2xs">
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <select
                    value={settings.language || 'en'}
                    onChange={async (e) => {
                      await handleUpdateSettings({
                        ...settings,
                        language: e.target.value as SupportedLanguage,
                      });
                    }}
                    className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-[11px]"
                    title="Change Global Language"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.flag} {l.code.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Business Badge */}
                <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 rounded-none text-[10px] sm:text-[11px] font-mono shrink-0">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse shrink-0" />
                  <span className="truncate max-w-[110px] uppercase font-bold text-slate-900">
                    {settings.businessName}
                  </span>
                </div>

                {/* Interactive Product Tour Button */}
                <button
                  onClick={() => setIsTourOpen(true)}
                  className="px-2.5 sm:px-3 py-1.5 bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] sm:text-xs hover:bg-black transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Tour</span>
                </button>

                {/* Demo Mode Badge */}
                <button
                  onClick={async () => {
                    await seedDemoData();
                  }}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 text-[10px] font-mono uppercase tracking-wider transition-colors shadow-2xs"
                  title="Reload Demo Store Datasets"
                >
                  <Layers className="w-3 h-3 text-emerald-600" />
                  <span>Reset</span>
                </button>
              </div>
            </header>

            {/* View Container */}
            <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
                  currencySymbol={settings.currencySymbol}
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
            </div>
          </main>

          {/* Printable Receipt Hidden Render Target */}
          <PrintReceipt sale={printableSale} settings={settings} receiptFormat={receiptFormat} />

          {/* Data Policy & Backup Notice Modal */}
          <DataPolicyModal
            isOpen={showDataPolicyNotice}
            onClose={() => setShowDataPolicyNotice(false)}
            onGoToBackup={() => {
              setShowDataPolicyNotice(false);
              setShowLanding(false);
              setActiveTab('setup');
              setActiveSubTab('data');
            }}
          />

          {/* Interactive Product Walkthrough Tour */}
          <ProductTourModal
            isOpen={isTourOpen}
            onClose={() => setIsTourOpen(false)}
            onNavigateTab={(tab, subTab) => {
              setShowLanding(false);
              setActiveTab(tab as NavItemKey);
              if (subTab) setActiveSubTab(subTab);
            }}
          />
        </div>
      )}
    </I18nProvider>
  );
}
