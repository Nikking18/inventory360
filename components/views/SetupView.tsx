'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { BusinessSettings, Location } from '../../lib/types';
import { exportWorkspaceJSON, importWorkspaceJSON, exportToCSV, parseCSV } from '../../lib/exportImport';
import { CURRENCIES } from '../../lib/currencies';
import { LANGUAGES, SupportedLanguage } from '../../lib/i18n';
import { Download, Upload, RefreshCw, Trash2, Sun, Moon, Globe, DollarSign, Palette } from 'lucide-react';

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
  const [theme, setTheme] = useState<'dark' | 'light'>(settings.theme || 'dark');
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
      theme,
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
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory360_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const success = await importWorkspaceJSON(text);
          if (success) {
            await onReloadAllData();
            setNotification('Database restored from JSON backup file.');
            setTimeout(() => setNotification(null), 3000);
          } else {
            setNotification('Failed to restore: Invalid backup file structure.');
            setTimeout(() => setNotification(null), 4000);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCSVProductImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const rows = parseCSV(text);
          setNotification(`Parsed ${rows.length} CSV catalog records.`);
          setTimeout(() => setNotification(null), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div id="tour-setup-workspace" className="space-y-6 text-neutral-200 font-mono">
      {/* SubTab Navigation */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap pb-1">
          <button
            onClick={() => onSubTabChange && onSubTabChange('profile')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'profile'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('setup', 'Business Profile')}
            {activeSubTab === 'profile' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('locations')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'locations'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('locations', 'Store Locations')} ({locations.length})
            {activeSubTab === 'locations' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
          <button
            onClick={() => onSubTabChange && onSubTabChange('data')}
            className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all relative ${
              activeSubTab === 'data'
                ? 'text-white font-bold'
                : 'text-neutral-500 hover:text-white'
            }`}
          >
            {t('export_csv', 'Data & Backup')}
            {activeSubTab === 'data' && (
              <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-white" />
            )}
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-neutral-900 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          {notification}
        </div>
      )}

      {/* PROFILE SUBTAB */}
      {activeSubTab === 'profile' && (
        <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-2xl space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
            {t('system_overview', 'Business Profile & Tax Configuration')}
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  {t('setup', 'Business / Store Name')}
                </label>
                <input
                  required
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  {t('owner', 'Owner / Administrator')}
                </label>
                <input
                  required
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Global Preferences: Theme, Language, Currency */}
            <div className="pt-2 border-t border-neutral-800 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-neutral-400" /> {t('language', 'Global Language')}
                  </label>
                  <select
                    value={language}
                    onChange={async (e) => {
                      const newLang = e.target.value as SupportedLanguage;
                      setLanguage(newLang);
                      await onUpdateSettings({ ...settings, language: newLang });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white font-mono text-xs"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code} className="bg-neutral-900 text-white">
                        {l.flag} {l.name} ({l.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-neutral-400" /> {t('currency', 'Global Currency')}
                  </label>
                  <select
                    value={currencyCode}
                    onChange={(e) => handleCurrencySelect(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white font-mono text-xs"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-neutral-900 text-white">
                        {c.flag} {c.name} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  {t('currency', 'Active Currency Symbol')}
                </label>
                <input
                  required
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  {t('tax', 'Tax Rate')} (%)
                </label>
                <input
                  required
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  {t('phone', 'Contact Phone')}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                  {t('email', 'Contact Email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase mb-1">
                {t('address', 'Store Address')}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200 mt-2"
            >
              {t('save_changes', 'Save Configuration Changes')}
            </button>
          </form>
        </div>
      )}

      {/* LOCATIONS SUBTAB */}
      {activeSubTab === 'locations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="bg-neutral-900 border border-neutral-800 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm uppercase">{loc.name}</h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 border border-neutral-700 text-neutral-300">
                    {loc.code}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{loc.address}</p>
              </div>
            ))}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 max-w-xl space-y-4">
            <h4 className="font-bold text-xs uppercase text-white border-b border-neutral-800 pb-2">
              {t('add_location', 'Add Store Outlet / Warehouse')}
            </h4>
            <form onSubmit={handleAddLoc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">{t('locations', 'Location Name')}</label>
                  <input
                    required
                    type="text"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">{t('code', 'Outlet Code')}</label>
                  <input
                    required
                    type="text"
                    value={newLocCode}
                    onChange={(e) => setNewLocCode(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">{t('address', 'Address')}</label>
                <input
                  type="text"
                  value={newLocAddress}
                  onChange={(e) => setNewLocAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 text-white focus:outline-none focus:border-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200"
              >
                {t('add_location', 'Add Store Outlet')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DATA & BACKUP SUBTAB */}
      {activeSubTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
              {t('export_csv', 'Backup & Database Export')}
            </h3>
            <p className="text-xs text-neutral-400">
              Download your complete IndexedDB state (products, sales, movements, settings) as JSON or export CSV.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 bg-neutral-950 border border-neutral-800 hover:border-white text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Complete JSON Backup</span>
              </button>

              <button
                onClick={() => exportToCSV('Catalog_Products_Export', products)}
                className="w-full py-2.5 bg-neutral-950 border border-neutral-800 hover:border-white text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('export_csv', 'Export Product Catalog CSV')}</span>
              </button>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white border-b border-neutral-800 pb-3">
              Restore & System Reset
            </h3>

            <div className="space-y-3 pt-2">
              <label className="block w-full py-2.5 bg-neutral-950 border border-neutral-800 hover:border-white text-white font-bold text-xs uppercase tracking-wider text-center cursor-pointer">
                <Upload className="w-4 h-4 inline mr-2" />
                <span>Restore JSON Backup</span>
                <input type="file" accept=".json" onChange={handleJSONImport} className="hidden" />
              </label>

              <label className="block w-full py-2.5 bg-neutral-950 border border-neutral-800 hover:border-white text-white font-bold text-xs uppercase tracking-wider text-center cursor-pointer">
                <Upload className="w-4 h-4 inline mr-2" />
                <span>Import Products CSV</span>
                <input type="file" accept=".csv" onChange={handleCSVProductImport} className="hidden" />
              </label>

              <div className="pt-4 border-t border-neutral-800 flex gap-2">
                <button
                  onClick={onResetDemoData}
                  className="flex-1 py-2 bg-neutral-950 border border-amber-900/80 text-amber-400 hover:bg-amber-950 font-bold text-xs uppercase"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  Seed Demo Data
                </button>

                <button
                  onClick={onClearAllData}
                  className="flex-1 py-2 bg-neutral-950 border border-rose-900/80 text-rose-400 hover:bg-rose-950 font-bold text-xs uppercase"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
