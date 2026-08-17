'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { BusinessSettings, Location } from '../../lib/types';
import { exportWorkspaceJSON, importWorkspaceJSON, exportToCSV, parseCSV } from '../../lib/exportImport';
import { CURRENCIES } from '../../lib/currencies';
import { LANGUAGES, SupportedLanguage } from '../../lib/i18n';
import { Download, Upload, RefreshCw, Trash2, Globe, DollarSign, Building2, ShieldCheck, Check } from 'lucide-react';

interface SetupViewProps {
  settings: BusinessSettings;
  onUpdateSettings: (settings: BusinessSettings) => Promise<void>;
  locations: Location[];
  onAddLocation: (loc: Omit<Location, 'id'>) => Promise<void>;
  onResetDemoData: () => Promise<void>;
  onClearAllData: () => Promise<void>;
  onReloadAllData: () => Promise<void>;
  products: any[];
  sales: any[];
  inventory: any[];
  activeSubTab?: string;
  onSubTabChange?: (sub: string) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  settings,
  onUpdateSettings,
  locations,
  onAddLocation,
  onResetDemoData,
  onClearAllData,
  onReloadAllData,
  products,
  sales,
  activeSubTab = 'profile',
  onSubTabChange,
}) => {
  const { t } = useTranslation();
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [currencyCode, setCurrencyCode] = useState(settings.currencyCode || 'USD');
  const [language, setLanguage] = useState<SupportedLanguage>((settings.language as SupportedLanguage) || 'en');
  const [taxRate, setTaxRate] = useState(settings.taxRate);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);

  const [newLocName, setNewLocName] = useState('');
  const [newLocCode, setNewLocCode] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');

  const [notification, setNotification] = useState<string | null>(null);

  const handleCurrencySelect = async (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencyCode(found.code);
      setCurrencySymbol(found.symbol);
      await onUpdateSettings({ ...settings, currencyCode: found.code, currencySymbol: found.symbol });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      ...settings,
      businessName,
      ownerName,
      currencySymbol,
      currencyCode,
      language,
      theme: 'light',
      taxRate: Number(taxRate),
      address,
      phone,
      email,
    });
    setNotification('Global business settings and preferences saved successfully.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddLoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName || !newLocCode) return;
    await onAddLocation({
      name: newLocName,
      code: newLocCode,
      address: newLocAddress,
      isMain: false,
    });
    setNewLocName('');
    setNewLocCode('');
    setNewLocAddress('');
    setNotification('New outlet location added.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportJSON = async () => {
    const jsonStr = await exportWorkspaceJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory360_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotification('JSON backup snapshot generated and downloaded.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const ok = await importWorkspaceJSON(text);
      if (ok) {
        await onReloadAllData();
        setNotification('Workspace database successfully restored from JSON file.');
      } else {
        setNotification('Failed to restore database from selected file.');
      }
    } catch {
      setNotification('Failed to read or parse selected backup file.');
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportProductsCSV = () => {
    exportToCSV('Catalog_Master_Export', products);
  };

  const handleExportSalesCSV = () => {
    exportToCSV('Sales_Ledger_Export', sales);
  };

  return (
    <div id="tour-setup-workspace" className="space-y-6 text-slate-900 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wider font-heading">
            {t('setup', 'System Settings & Workspace')}
          </h1>
          <p className="text-xs text-slate-600">
            Store profile, currencies, tax rates, multi-location registry, and encrypted backups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['profile', 'locations', 'data'] as const).map((tabId) => (
            <button
              key={tabId}
              onClick={() => onSubTabChange && onSubTabChange(tabId)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                activeSubTab === tabId
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tabId === 'profile' ? 'Profile & Tax' : tabId === 'locations' ? 'Locations' : 'Data & Backup'}
            </button>
          ))}
        </div>
      </div>

      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-700" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. BUSINESS PROFILE TAB */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
            Business Profile &amp; General Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                {t('business_name', 'Business Name')}
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                {t('owner_name', 'Owner / Manager Name')}
              </label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-500" />
                <span>Default Currency</span>
              </label>
              <select
                value={currencyCode}
                onChange={(e) => handleCurrencySelect(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-500" />
                <span>System Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                Default Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Physical Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors shadow-xs"
            >
              {t('save_changes', 'Save Settings')}
            </button>
          </div>
        </form>
      )}

      {/* 2. STORE LOCATIONS TAB */}
      {activeSubTab === 'locations' && (
        <div className="bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Store Outlets &amp; Warehouse Locations ({locations.length})
            </h3>
            <p className="text-xs text-slate-600">
              Manage branches for multi-outlet POS sales and stock transfers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm uppercase">{loc.name}</span>
                  {loc.isMain && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 border border-emerald-300 text-emerald-800 bg-emerald-50 uppercase">
                      Primary Hub
                    </span>
                  )}
                </div>
                <p className="text-slate-600">Code: <strong className="text-slate-900">{loc.code}</strong></p>
                <p className="text-slate-500 text-[11px]">{loc.address}</p>
              </div>
            ))}
          </div>

          {/* Add New Location Form */}
          <form onSubmit={handleAddLoc} className="p-4 bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">+ Register New Branch Outlet</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                placeholder="Branch Name (e.g. Northside Mall)"
                value={newLocName}
                onChange={(e) => setNewLocName(e.target.value)}
                className="bg-white border border-slate-300 p-2 text-xs text-slate-900 font-mono"
              />
              <input
                type="text"
                required
                placeholder="Outlet Code (e.g. LOC-NORTH)"
                value={newLocCode}
                onChange={(e) => setNewLocCode(e.target.value.toUpperCase())}
                className="bg-white border border-slate-300 p-2 text-xs text-slate-900 font-mono uppercase"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={newLocAddress}
                onChange={(e) => setNewLocAddress(e.target.value)}
                className="bg-white border border-slate-300 p-2 text-xs text-slate-900 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase hover:bg-black"
            >
              Add Outlet Location
            </button>
          </form>
        </div>
      )}

      {/* 3. DATA & BACKUP TAB */}
      {activeSubTab === 'data' && (
        <div className="bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Data Sovereignty, Backups &amp; Reset Tools
            </h3>
            <p className="text-xs text-slate-600">
              Export and import full encrypted snapshots of your local browser database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backup Snapshot */}
            <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Download className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-xs uppercase">Full JSON Backup Snapshot</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download an offline backup file containing all products, sales history, purchase orders, customers, and settings.
              </p>
              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup (JSON)</span>
              </button>
            </div>

            {/* Restore Snapshot */}
            <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Upload className="w-5 h-5 text-sky-700" />
                <h4 className="font-bold text-xs uppercase">Restore from JSON Backup</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload a previously saved JSON snapshot to restore your complete store database.
              </p>
              <label className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Select Backup File (JSON)</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>

          {/* Quick CSV Export Shortcuts */}
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-900">Direct CSV Table Exports</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportProductsCSV}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold uppercase"
              >
                Export Products (.csv)
              </button>
              <button
                onClick={handleExportSalesCSV}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold uppercase"
              >
                Export Sales Transactions (.csv)
              </button>
            </div>
          </div>

          {/* Dangerous Actions: Reset / Clear */}
          <div className="p-4 bg-rose-50 border border-rose-200 space-y-3">
            <h4 className="font-bold text-xs uppercase text-rose-900">Maintenance &amp; Reset Workspace</h4>
            <p className="text-xs text-rose-800">
              Reset the store with ACME Demo datasets, or clear all data to start fresh.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={onResetDemoData}
                className="px-4 py-2 bg-slate-900 text-white hover:bg-black text-xs font-bold uppercase flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load ACME Demo Dataset</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to erase all data and reset to a clean state?')) {
                    onClearAllData();
                  }
                }}
                className="px-4 py-2 bg-rose-700 text-white hover:bg-rose-800 text-xs font-bold uppercase flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Erase All Data &amp; Reset Clean</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
