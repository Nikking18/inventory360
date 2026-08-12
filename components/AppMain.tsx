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
  CLEAN_SETTINGS,
  CLEAN_LOCATIONS,
  CLEAN_CATEGORIES,
  CLEAN_SUPPLIERS,
} from '../lib/seedData';

import { Sidebar, NavItemKey } from './Sidebar';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { SellView } from './views/SellView';
import { CatalogView } from './views/CatalogView';
import { InventoryView } from './views/InventoryView';
import { CustomersView } from './views/CustomersView';
import { ReportingView } from './views/ReportingView';
import { SetupView } from './views/SetupView';
import { PrintReceipt } from './PrintReceipt';
import { DataPolicyModal } from './common/DataPolicyModal';
import { ProductTourModal } from './common/ProductTourModal';
import { calculateStockStatus } from '../lib/utils';
import { Layers, Sparkles, MapPin, Printer, Menu, X, Sun, Moon, Globe, DollarSign, Download, FileText, FileSpreadsheet, ChevronDown, BarChart3, HelpCircle } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../lib/exportImport';
import { LANGUAGES, SupportedLanguage } from '../lib/i18n';
import { CURRENCIES } from '../lib/currencies';
import { I18nProvider } from '../context/I18nContext';

export default function AppMain() {
  const [activeTab, setActiveTab] = useState<NavItemKey>('home');
  const [activeSubTab, setActiveSubTab] = useState<string>('retail-dashboard');
  const [showLanding, setShowLanding] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showDataPolicyNotice, setShowDataPolicyNotice] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  // Data Policy popup is controlled explicitly by user button clicks only

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

  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [printableSale, setPrintableSale] = useState<Sale | null>(null);

  const initCleanData = async () => {
    await clearAllStores();
    await putToStore('settings', CLEAN_SETTINGS);
    await putManyToStore('locations', CLEAN_LOCATIONS);
    await putManyToStore('categories', CLEAN_CATEGORIES);
    await putManyToStore('suppliers', CLEAN_SUPPLIERS);

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
  };

  const loadAllData = async () => {
    try {
      let storedSettings = await getAllFromStore<BusinessSettings>('settings');
      let storedLocations = await getAllFromStore<Location>('locations');

      if (!storedSettings || storedSettings.length === 0 || !storedLocations || storedLocations.length === 0) {
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

      if (storedSettings.length > 0) setSettings(storedSettings[0]);
      setLocations(storedLocations.length > 0 ? storedLocations : CLEAN_LOCATIONS);
      setCategories(storedCategories.length > 0 ? storedCategories : CLEAN_CATEGORIES);
      setSuppliers(storedSuppliers.length > 0 ? storedSuppliers : CLEAN_SUPPLIERS);
      setProducts(storedProducts);
      setCustomers(storedCustomers);
      setSales(storedSales);
      setPurchaseOrders(storedPOs);
      setMovements(storedMovements);
      setExpenses(storedExpenses);
    } catch (err) {
      console.error('Error loading DB state:', err);
    }
  };

  const toggleTheme = async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    const updated: BusinessSettings = { ...settings, theme: newTheme };
    setSettings(updated);
    await putToStore('settings', updated);
  };

  const changeLanguage = async (newLang: SupportedLanguage) => {
    const updated: BusinessSettings = { ...settings, language: newLang };
    setSettings(updated);
    await putToStore('settings', updated);
  };

  const changeCurrency = async (newCode: string) => {
    const found = CURRENCIES.find((c) => c.code === newCode);
    if (found) {
      const updated: BusinessSettings = { ...settings, currencyCode: found.code, currencySymbol: found.symbol };
      setSettings(updated);
      await putToStore('settings', updated);
    }
  };

  const [showHeaderExportMenu, setShowHeaderExportMenu] = useState<boolean>(false);

  const getHeaderExportData = () => {
    return products.map((p) => ({
      'Product Name': p.name,
      SKU: p.sku,
      Category: categories.find((c) => c.id === p.categoryId)?.name || 'General',
      'Stock Quantity': p.stockQuantity,
      'Reorder Point': p.reorderPoint,
      'Cost Price': `${settings.currencySymbol || '$'}${p.costPrice}`,
      'Retail Price': `${settings.currencySymbol || '$'}${p.retailPrice}`,
      Status: p.status,
    }));
  };

  const handleHeaderExportCSV = () => {
    exportToCSV(`Inventory_Report_${new Date().toISOString().split('T')[0]}`, getHeaderExportData());
    setShowHeaderExportMenu(false);
  };

  const handleHeaderExportExcel = () => {
    exportToExcel(`Inventory_Report_${new Date().toISOString().split('T')[0]}`, getHeaderExportData());
    setShowHeaderExportMenu(false);
  };

  const handleHeaderExportPDF = () => {
    exportToPDF(
      `Inventory_Report_${new Date().toISOString().split('T')[0]}`,
      `${settings.businessName || 'Inventory360'} - Executive Stock & Audit Report`,
      getHeaderExportData()
    );
    setShowHeaderExportMenu(false);
  };

  // Initialize DB & Load State
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        let storedSettings = await getAllFromStore<BusinessSettings>('settings');
        let storedLocations = await getAllFromStore<Location>('locations');

        if (!storedSettings || storedSettings.length === 0 || !storedLocations || storedLocations.length === 0) {
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

        if (active) {
          if (storedSettings.length > 0) setSettings(storedSettings[0]);
          setLocations(storedLocations.length > 0 ? storedLocations : CLEAN_LOCATIONS);
          setCategories(storedCategories.length > 0 ? storedCategories : CLEAN_CATEGORIES);
          setSuppliers(storedSuppliers.length > 0 ? storedSuppliers : CLEAN_SUPPLIERS);
          setProducts(storedProducts);
          setCustomers(storedCustomers);
          setSales(storedSales);
          setPurchaseOrders(storedPOs);
          setMovements(storedMovements);
          setExpenses(storedExpenses);
        }
      } catch (err) {
        console.error('Error loading DB state:', err);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  const handleClearAllData = async () => {
    await clearAllStores();
    const cleanSettings: BusinessSettings = {
      id: 'settings',
      businessName: 'My Store',
      ownerName: 'Store Manager',
      currencySymbol: '$',
      taxRate: 8.5,
      primaryLocationId: 'loc_1',
      address: 'Main Store Address',
      phone: '+1 555-0100',
      email: 'store@example.com',
      demoMode: false,
    };
    const cleanLoc: Location = { id: 'loc_1', name: 'Main Store', code: 'MS-01', address: 'Main Address', isMain: true };
    await putToStore('settings', cleanSettings);
    await putToStore('locations', cleanLoc);

    setSettings(cleanSettings);
    setLocations([cleanLoc]);
    setCategories([]);
    setSuppliers([]);
    setProducts([]);
    setCustomers([]);
    setSales([]);
    setPurchaseOrders([]);
    setMovements([]);
    setExpenses([]);
  };

  // HANDLERS FOR CATALOG
  const handleAddProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      status: calculateStockStatus(productData),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putToStore('products', newProd);
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = async (product: Product) => {
    const updated = {
      ...product,
      status: calculateStockStatus(product),
      updatedAt: new Date().toISOString(),
    };
    await putToStore('products', updated);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteFromStore('products', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // HANDLERS FOR SALES
  const handleCompleteSale = async (
    saleData: Omit<Sale, 'id' | 'saleNumber' | 'createdAt'>
  ): Promise<Sale> => {
    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}`,
      saleNumber: `SL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    await putToStore('sales', newSale);
    setSales((prev) => [newSale, ...prev]);

    // Update inventory & stock movements
    const updatedProds = [...products];
    const newMovements: StockMovement[] = [];

    for (const item of newSale.items) {
      const idx = updatedProds.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        const p = updatedProds[idx];
        const prevStock = p.stockQuantity;
        const newStock = Math.max(0, prevStock - item.quantity);
        const updated = {
          ...p,
          stockQuantity: newStock,
          status: calculateStockStatus({ ...p, stockQuantity: newStock }),
          lastSoldAt: new Date().toISOString(),
        };
        updatedProds[idx] = updated;
        await putToStore('products', updated);

        const mov: StockMovement = {
          id: `sm_${Date.now()}_${Math.random()}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'Sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          locationId: newSale.locationId,
          locationName: newSale.locationName,
          referenceId: newSale.saleNumber,
          createdAt: new Date().toISOString(),
        };
        newMovements.push(mov);
        await putToStore('stockMovements', mov);
      }
    }

    setProducts(updatedProds);
    setMovements((prev) => [...newMovements, ...prev]);

    // Update Customer CRM statistics
    if (newSale.customerId) {
      const custIdx = customers.findIndex((c) => c.id === newSale.customerId);
      if (custIdx !== -1) {
        const targetCust = customers[custIdx];
        const updatedCust: Customer = {
          ...targetCust,
          totalOrders: (targetCust.totalOrders || 0) + 1,
          totalRevenue: (targetCust.totalRevenue || 0) + newSale.total,
          lastPurchaseDate: new Date().toISOString(),
        };
        await putToStore('customers', updatedCust);
        setCustomers((prev) => prev.map((c) => (c.id === updatedCust.id ? updatedCust : c)));
      }
    }

    return newSale;
  };

  const handleRefundSale = async (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'Refunded') return;

    const updatedSale = { ...sale, status: 'Refunded' as const };
    await putToStore('sales', updatedSale);
    setSales((prev) => prev.map((s) => (s.id === saleId ? updatedSale : s)));

    // Restock items
    const updatedProds = [...products];
    for (const item of sale.items) {
      const idx = updatedProds.findIndex((p) => p.id === item.productId);
      if (idx !== -1) {
        const p = updatedProds[idx];
        const prevStock = p.stockQuantity;
        const newStock = prevStock + item.quantity;
        const updated = {
          ...p,
          stockQuantity: newStock,
          status: calculateStockStatus({ ...p, stockQuantity: newStock }),
        };
        updatedProds[idx] = updated;
        await putToStore('products', updated);

        const mov: StockMovement = {
          id: `sm_${Date.now()}_${Math.random()}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'Return',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          locationId: sale.locationId,
          locationName: sale.locationName,
          referenceId: sale.saleNumber,
          createdAt: new Date().toISOString(),
        };
        await putToStore('stockMovements', mov);
        setMovements((prev) => [mov, ...prev]);
      }
    }
    setProducts(updatedProds);

    // Update Customer CRM revenue on refund
    if (sale.customerId) {
      const custIdx = customers.findIndex((c) => c.id === sale.customerId);
      if (custIdx !== -1) {
        const targetCust = customers[custIdx];
        const updatedCust: Customer = {
          ...targetCust,
          totalRevenue: Math.max(0, (targetCust.totalRevenue || 0) - sale.total),
        };
        await putToStore('customers', updatedCust);
        setCustomers((prev) => prev.map((c) => (c.id === updatedCust.id ? updatedCust : c)));
      }
    }
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

    // Record stock movements and adjust product location quantities
    const updatedProds = [...products];
    const newMovements: StockMovement[] = [];

    for (const item of transfer.items) {
      const idx = updatedProds.findIndex((prod) => prod.id === item.productId);
      if (idx !== -1) {
        const p = updatedProds[idx];
        const currentLocQty = { ...(p.locationQuantities || {}) };
        const sourceQty = currentLocQty[transfer.sourceLocationId] ?? p.stockQuantity;
        const targetQty = currentLocQty[transfer.targetLocationId] ?? 0;

        currentLocQty[transfer.sourceLocationId] = Math.max(0, sourceQty - item.quantity);
        currentLocQty[transfer.targetLocationId] = targetQty + item.quantity;

        const updatedP: Product = {
          ...p,
          locationQuantities: currentLocQty,
          updatedAt: new Date().toISOString(),
        };
        updatedProds[idx] = updatedP;
        await putToStore('products', updatedP);

        const mov: StockMovement = {
          id: `sm_${Date.now()}_tr_${Math.random()}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: 'Transfer',
          quantityChange: item.quantity,
          previousStock: p.stockQuantity,
          newStock: p.stockQuantity,
          locationId: transfer.targetLocationId,
          locationName: transfer.targetLocationName,
          referenceId: transfer.transferNumber,
          notes: `Transferred ${item.quantity} units from ${transfer.sourceLocationName} to ${transfer.targetLocationName}`,
          createdAt: new Date().toISOString(),
        };
        newMovements.push(mov);
        await putToStore('stockMovements', mov);
      }
    }
    setProducts(updatedProds);
    setMovements((prev) => [...newMovements, ...prev]);
  };

  // HANDLER FOR CUSTOMERS
  const handleAddCustomer = async (
    customerData: Omit<Customer, 'id' | 'totalOrders' | 'totalRevenue' | 'outstandingBalance' | 'createdAt'>
  ) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust_${Date.now()}`,
      totalOrders: 0,
      totalRevenue: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    await putToStore('customers', newCust);
    setCustomers((prev) => [newCust, ...prev]);
  };

  // HANDLER FOR LOCATIONS & SETTINGS
  const handleAddLocation = async (locData: Omit<Location, 'id'>) => {
    const newLoc: Location = {
      ...locData,
      id: `loc_${Date.now()}`,
    };
    await putToStore('locations', newLoc);
    setLocations((prev) => [...prev, newLoc]);
  };

  const handleUpdateSettings = async (newSettings: BusinessSettings) => {
    const updated = { id: 'settings', ...newSettings };
    await putToStore('settings', updated);
    setSettings(updated);
  };

  const handlePrintReceipt = (sale: Sale) => {
    setPrintableSale(sale);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  };

  return (
    <I18nProvider language={(settings.language as SupportedLanguage) || 'en'}>
      <div className={`min-h-screen flex antialiased font-sans transition-colors duration-200 ${
        settings.theme === 'light' ? 'light-theme bg-slate-100 text-slate-900' : 'bg-neutral-950 text-neutral-200'
      }`}>
      {/* 1. Desktop Permanent Sidebar */}
      <aside className="hidden md:block shrink-0 border-r border-neutral-800">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setShowLanding(false);
          }}
          activeSubTab={activeSubTab}
          onSubTabChange={(sub) => setActiveSubTab(sub)}
          businessName={settings.businessName}
          ownerName={settings.ownerName}
          onOpenLanding={() => setShowLanding(true)}
          onOpenTour={() => setIsTourOpen(true)}
          onOpenDataPolicy={() => setShowDataPolicyNotice(true)}
        />
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-neutral-950 border-r border-neutral-800 flex flex-col">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between font-mono">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                System Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
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
                  setShowLanding(false);
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
                  setShowLanding(true);
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
      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-16 px-3 sm:px-6 lg:px-8 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between no-print gap-1.5 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-neutral-300 hover:text-white bg-neutral-900 border border-neutral-800 shrink-0"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-2 h-2 bg-white rotate-45 hidden sm:block shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-neutral-400 font-mono uppercase tracking-wider truncate">
              {showLanding ? 'Overview' : activeTab}
            </span>
            <span className="text-neutral-700 shrink-0 text-xs">/</span>
            <span className="text-[10px] sm:text-xs font-mono text-neutral-300 uppercase tracking-wider truncate max-w-[70px] sm:max-w-none">
              {showLanding ? 'Welcome' : activeSubTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Business Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-none text-[10px] sm:text-[11px] font-mono shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
              <span className="truncate max-w-[120px] uppercase font-bold text-white">
                {settings.businessName}
              </span>
            </div>

            {/* Interactive Product Tour Button */}
            <button
              onClick={() => setIsTourOpen(true)}
              className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 hover:border-white text-white text-xs font-bold rounded-none transition-colors flex items-center gap-1.5 uppercase tracking-wider shrink-0"
              title="Interactive Product Tour"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold">Product Tour</span>
            </button>

            {/* Header Export Report Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowHeaderExportMenu(!showHeaderExportMenu)}
                className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-none hover:bg-neutral-200 transition-colors flex items-center gap-1.5 uppercase tracking-wider shrink-0"
                title="Export Report"
              >
                <Download className="w-3.5 h-3.5 shrink-0 text-black" />
                <span className="font-bold">Export Report</span>
                <ChevronDown className="w-3 h-3 text-black shrink-0" />
              </button>

              {showHeaderExportMenu && (
                <div className="absolute right-0 mt-1.5 w-60 bg-neutral-900 border border-neutral-700 shadow-2xl z-30 divide-y divide-neutral-800 font-mono">
                  <div className="px-3 py-2 bg-neutral-950 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    Executive System Reports
                  </div>
                  <button
                    onClick={handleHeaderExportCSV}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold uppercase">Export CSV (.csv)</div>
                      <div className="text-[10px] text-neutral-400">Comma-separated text table</div>
                    </div>
                  </button>

                  <button
                    onClick={handleHeaderExportExcel}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold uppercase">Export Excel (.xls)</div>
                      <div className="text-[10px] text-neutral-400">Sortable spreadsheet workbook</div>
                    </div>
                  </button>

                  <button
                    onClick={handleHeaderExportPDF}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-bold uppercase">Export PDF (.pdf)</div>
                      <div className="text-[10px] text-neutral-400">Printable official report document</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('reporting');
                      setShowHeaderExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-white bg-neutral-950 hover:bg-neutral-800 flex items-center gap-2.5 transition-colors border-t border-neutral-800"
                  >
                    <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="font-bold uppercase">Full Analytics View →</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Outer Padding Container (responsive padding, max-width ~1440px) */}
        <div className="p-3.5 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto flex-1">
          {showLanding ? (
            <LandingView
              onStartDemo={() => {
                seedDemoData();
                setShowLanding(false);
                setActiveTab('home');
              }}
              onStartFresh={() => {
                handleClearAllData();
                setShowLanding(false);
                setActiveTab('catalog');
              }}
              onOpenTour={() => setIsTourOpen(true)}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <DashboardView
                  products={products}
                  sales={sales}
                  purchaseOrders={purchaseOrders}
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                  onNavigate={(tab, subTab) => {
                    setActiveTab(tab);
                    if (subTab) setActiveSubTab(subTab);
                  }}
                  currencySymbol={settings.currencySymbol}
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
                  onStockAdjustment={handleStockAdjustment}
                  onStockTransfer={handleStockTransfer}
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
                  currencySymbol={settings.currencySymbol}
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
            </>
          )}
        </div>
      </main>

      {/* Printable Receipt Hidden Render Target */}
      <PrintReceipt sale={printableSale} settings={settings} />

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
          setActiveTab(tab);
          if (subTab) setActiveSubTab(subTab);
          setShowLanding(false);
        }}
      />
    </div>
    </I18nProvider>
  );
}
