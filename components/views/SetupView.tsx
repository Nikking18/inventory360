'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { BusinessSettings, Location } from '../../lib/types';
import { exportWorkspaceJSON, importWorkspaceJSON, exportToCSV, parseCSV } from '../../lib/exportImport';
import { CURRENCIES } from '../../lib/currencies';
import { LANGUAGES, SupportedLanguage } from '../../lib/i18n';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Globe,
  DollarSign,
  Building2,
  ShieldCheck,
  Check,
  Folder,
  FolderOpen,
  Clock,
  History,
  Play,
  AlertCircle,
  CheckCircle2,
  FileJson,
  Calendar,
  Save,
  Lock,
  ArrowDownToLine,
  Sparkles,
} from 'lucide-react';
import { AutoSaveConfig, AutoSaveInterval, AutoSaveRecord } from '../../lib/types';
import {
  AUTOSAVE_INTERVAL_OPTIONS,
  pickLocalDirectory,
  performAutoSave,
  getAutoSaveHistory,
  deleteAutoSaveRecord,
  clearAllAutoSaveHistory,
  downloadAutoSaveRecordFile,
  restoreFromAutoSaveRecord,
  isFileSystemAccessSupported,
} from '../../lib/autoSaveService';
import { formatDateTime, formatDate } from '../../lib/utils';
import { Modal } from '../common/Modal';

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
  const [taxNumber, setTaxNumber] = useState(settings.taxNumber || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);

  const [newLocName, setNewLocName] = useState('');
  const [newLocCode, setNewLocCode] = useState('');
  const [newLocAddress, setNewLocAddress] = useState('');

  // Auto-Save Management State
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(settings.autoSaveConfig?.enabled || false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<AutoSaveInterval>(
    settings.autoSaveConfig?.interval || '1h'
  );
  const [autoSaveFolderName, setAutoSaveFolderName] = useState(settings.autoSaveConfig?.folderName || '');
  const [autoSaveHistory, setAutoSaveHistory] = useState<AutoSaveRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);
  const [restoreConfirmRecord, setRestoreConfirmRecord] = useState<AutoSaveRecord | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const refreshAutoSaveHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const hist = await getAutoSaveHistory();
      setAutoSaveHistory(hist);
    } catch (err) {
      console.error('Failed to load autosave history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  React.useEffect(() => {
    setBusinessName(settings.businessName);
    setOwnerName(settings.ownerName);
    setCurrencySymbol(settings.currencySymbol || '$');
    setCurrencyCode(settings.currencyCode || 'USD');
    setLanguage((settings.language as SupportedLanguage) || 'en');
    setTaxRate(settings.taxRate);
    setTaxNumber(settings.taxNumber || '');
    setLogoUrl(settings.logoUrl || '');
    setAddress(settings.address);
    setPhone(settings.phone);
    setEmail(settings.email);

    if (settings.autoSaveConfig) {
      setAutoSaveEnabled(settings.autoSaveConfig.enabled);
      setAutoSaveInterval(settings.autoSaveConfig.interval || '1h');
      setAutoSaveFolderName(settings.autoSaveConfig.folderName || '');
    }

    refreshAutoSaveHistory();
  }, [settings]);

  const handleCurrencySelect = async (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencyCode(found.code);
      setCurrencySymbol(found.symbol);
      await onUpdateSettings({ ...settings, currencyCode: found.code, currencySymbol: found.symbol });
      setNotification(`Store currency updated to ${found.code} (${found.symbol}).`);
      setTimeout(() => setNotification(null), 2500);
    }
  };

  const handleLanguageSelect = async (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    await onUpdateSettings({ ...settings, language: newLang });
    setNotification(`System language updated to ${newLang.toUpperCase()}.`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setNotification('Logo file too large. Please select an image under 2MB.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
        setNotification('Logo uploaded successfully. Click "Save Settings" to apply.');
        setTimeout(() => setNotification(null), 3000);
      }
    };
    reader.readAsDataURL(file);
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
      taxNumber,
      logoUrl,
      address,
      phone,
      email,
    });
    setNotification('Global business settings, tax ID, and logo saved successfully.');
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

  const handlePickLocalDirectory = async () => {
    setAutoSaveError(null);
    const res = await pickLocalDirectory();
    if (res.success && res.folderName) {
      setAutoSaveFolderName(res.folderName);
      setNotification(`Local folder destination linked: 📁 ${res.folderName}`);
      setTimeout(() => setNotification(null), 3500);

      if (autoSaveEnabled) {
        const intervalMs = AUTOSAVE_INTERVAL_OPTIONS.find((o) => o.value === autoSaveInterval)?.ms || 3600000;
        const nextDue = new Date(Date.now() + intervalMs).toISOString();
        const updatedConfig: AutoSaveConfig = {
          enabled: true,
          interval: autoSaveInterval,
          folderName: res.folderName,
          destinationPath: res.folderName,
          nextAutoSaveDueAt: nextDue,
        };
        await onUpdateSettings({ ...settings, autoSaveConfig: updatedConfig });
      }
    } else if (res.error) {
      setAutoSaveError(res.error);
    }
  };

  const handleToggleAutoSave = async () => {
    setAutoSaveError(null);
    if (!autoSaveEnabled) {
      if (!autoSaveFolderName || autoSaveFolderName.trim() === '') {
        setAutoSaveError('Please select a local folder destination before activating automated backups.');
        return;
      }
      if (!autoSaveInterval) {
        setAutoSaveError('Please select an auto-save time interval.');
        return;
      }

      const intervalMs = AUTOSAVE_INTERVAL_OPTIONS.find((o) => o.value === autoSaveInterval)?.ms || 3600000;
      const nextDue = new Date(Date.now() + intervalMs).toISOString();

      const newConfig: AutoSaveConfig = {
        enabled: true,
        interval: autoSaveInterval,
        folderName: autoSaveFolderName,
        destinationPath: autoSaveFolderName,
        nextAutoSaveDueAt: nextDue,
      };

      setAutoSaveEnabled(true);
      await onUpdateSettings({ ...settings, autoSaveConfig: newConfig });
      setNotification(`Automated backups activated! Backups will be silently saved to "📁 ${autoSaveFolderName}" on schedule.`);
      setTimeout(() => setNotification(null), 4500);
    } else {
      const newConfig: AutoSaveConfig = {
        enabled: false,
        interval: autoSaveInterval,
        folderName: autoSaveFolderName,
        destinationPath: autoSaveFolderName,
      };
      setAutoSaveEnabled(false);
      await onUpdateSettings({ ...settings, autoSaveConfig: newConfig });
      setNotification('Automated backups deactivated.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleChangeInterval = async (newInterval: AutoSaveInterval) => {
    setAutoSaveInterval(newInterval);
    if (autoSaveEnabled && autoSaveFolderName) {
      const intervalMs = AUTOSAVE_INTERVAL_OPTIONS.find((o) => o.value === newInterval)?.ms || 3600000;
      const nextDue = new Date(Date.now() + intervalMs).toISOString();
      const newConfig: AutoSaveConfig = {
        ...settings.autoSaveConfig,
        enabled: true,
        interval: newInterval,
        folderName: autoSaveFolderName,
        destinationPath: autoSaveFolderName,
        nextAutoSaveDueAt: nextDue,
      };
      await onUpdateSettings({ ...settings, autoSaveConfig: newConfig });
      setNotification(`Auto-save interval updated to ${newInterval}.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleTriggerAutoSaveNow = async () => {
    if (!autoSaveFolderName) {
      setAutoSaveError('Please select a local folder destination first.');
      return;
    }
    setIsTriggeringBackup(true);
    setAutoSaveError(null);
    try {
      const config: AutoSaveConfig = {
        enabled: autoSaveEnabled,
        interval: autoSaveInterval,
        folderName: autoSaveFolderName,
      };
      const { record, updatedConfig } = await performAutoSave(config, 'Manual Instant Trigger');
      await onUpdateSettings({ ...settings, autoSaveConfig: updatedConfig });
      await refreshAutoSaveHistory();
      setNotification(`Backup snapshot "${record.filename}" successfully generated and saved silently to 📁 ${record.folderName}!`);
      setTimeout(() => setNotification(null), 4500);
    } catch (err: any) {
      setAutoSaveError(`Auto-save failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTriggeringBackup(false);
    }
  };

  const handleExecuteRestore = async () => {
    if (!restoreConfirmRecord) return;
    try {
      const ok = await restoreFromAutoSaveRecord(restoreConfirmRecord);
      if (ok) {
        await onReloadAllData();
        setRestoreConfirmRecord(null);
        setNotification(`Store database successfully restored from snapshot ${restoreConfirmRecord.filename}!`);
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification('Failed to restore database from selected snapshot.');
      }
    } catch (err: any) {
      setNotification(`Restore error: ${err.message || 'Failed to restore snapshot'}`);
    }
  };

  const handleDeleteHistoryRecord = async (id: string) => {
    await deleteAutoSaveRecord(id);
    await refreshAutoSaveHistory();
    setNotification('Backup history record removed.');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleClearAllHistoryRecords = async () => {
    if (!confirm('Are you sure you want to clear all backup history records? (Saved local files in your folder will not be deleted)')) {
      return;
    }
    await clearAllAutoSaveHistory();
    await refreshAutoSaveHistory();
    setNotification('Auto-save history cleared.');
    setTimeout(() => setNotification(null), 2500);
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
    exportToCSV('Catalog_Master_Export', products, (settings.language as SupportedLanguage) || 'en', settings.currencySymbol);
  };

  const handleExportSalesCSV = () => {
    exportToCSV('Sales_Ledger_Export', sales, (settings.language as SupportedLanguage) || 'en', settings.currencySymbol);
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
                activeSubTab === tabId || (tabId === 'data' && activeSubTab === 'autosave')
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {tabId === 'profile' ? t('profile', 'Profile & Tax') : tabId === 'locations' ? t('locations', 'Locations') : t('data', 'Data & Backup')}
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
            {t('business_profile', 'Business Profile & General Configuration')}
          </h3>

          {/* Company Logo & Branding */}
          <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
            <label className="block text-[10px] font-bold uppercase text-slate-700">
              {t('business_logo_label', 'Company Logo & Document Brand')}
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-300 flex items-center justify-center p-1 relative group shrink-0">
                {logoUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="Company Logo" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md hover:bg-rose-700"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <Building2 className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-500 uppercase font-bold">No Logo</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase cursor-pointer flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoFileUpload}
                      className="hidden"
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold uppercase"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="Or enter public Logo Image URL (https://...)"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    PNG, JPG, or SVG. This logo will be automatically rendered on your Dashboard header, thermal receipts, and all exported PDF slips.
                  </p>
                </div>
              </div>
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                {t('tax_number_label', 'Tax Identification / GSTIN / VAT Number')}
              </label>
              <input
                type="text"
                placeholder="e.g. GSTIN-27AABCT2834K1Z9 / US-EIN-98765432"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value.toUpperCase())}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono uppercase"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Official registration number displayed on PO slips, invoices, receipts, and tax reports.
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                {t('sales_tax_rate_label', 'Default General Sales Tax Rate (%)')}
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
              <p className="text-[10px] text-slate-500 mt-1">
                Fallback tax rate when a product does not specify an individual item tax percentage.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-500" />
                <span>{t('store_currency', 'Default Currency')}</span>
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
                <span>{t('system_language', 'System Language')}</span>
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageSelect(e.target.value as SupportedLanguage)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('phone', 'Phone Number')}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('email', 'Email Address')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('address', 'Physical Address')}</label>
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
              {t('locations', 'Store Outlets & Warehouse Locations')} ({locations.length})
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
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">+ {t('add_location', 'Register New Branch Outlet')}</h4>
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
              {t('add_location', 'Add Outlet Location')}
            </button>
          </form>
        </div>
      )}

      {/* 3. DATA & BACKUP TAB */}
      {(activeSubTab === 'data' || activeSubTab === 'autosave') && (
        <div className="bg-white border border-slate-200 p-6 space-y-8 shadow-sm">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Data Sovereignty, Automated Scheduled Backups &amp; Reset Tools
            </h3>
            <p className="text-xs text-slate-600">
              Configure automatic background JSON backups to your local machine, review backup logs, and manage offline data snapshots.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* A. AUTOMATED SCHEDULED BACKUPS TO LOCAL DESTINATION (CORE USER FEATURE)    */}
          {/* ========================================================================= */}
          <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-300 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-slate-900 text-white flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase text-slate-900 flex items-center gap-2">
                    <span>{t('automated_backups', 'Automated Local JSON Backups')}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 uppercase border ${
                        autoSaveEnabled
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {autoSaveEnabled ? 'Active (Scheduled)' : 'Inactive'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Automatically write full JSON database snapshots directly into your selected local folder on a schedule without prompt popups.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isTriggeringBackup || !autoSaveFolderName}
                  onClick={handleTriggerAutoSaveNow}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                    !autoSaveFolderName
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                  title="Run an instant silent backup right now to the configured destination"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isTriggeringBackup ? 'Saving...' : 'Backup Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleAutoSave}
                  className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors ${
                    autoSaveEnabled
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {autoSaveEnabled ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Deactivate Auto-Save</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Activate Auto-Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {autoSaveError && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{autoSaveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Step 1: Local Destination Folder */}
              <div className="p-4 bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase text-[10px] text-slate-700 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-indigo-600" />
                    <span>1. File Destination (Local Folder) *</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Required</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePickLocalDirectory}
                      className="px-3 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black flex items-center gap-1.5 shrink-0"
                    >
                      <FolderOpen className="w-4 h-4 text-emerald-400" />
                      <span>{autoSaveFolderName ? 'Change Local Folder' : 'Select Local Folder'}</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Folder path or label (e.g. D:\Backups)"
                      value={autoSaveFolderName}
                      onChange={(e) => setAutoSaveFolderName(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  {autoSaveFolderName ? (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Destination linked: <strong>📁 {autoSaveFolderName}</strong>
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-700">
                      ⚠️ Please select a folder on your machine. Once granted, auto-save will write backup JSON files silently without prompting.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Backup Frequency & Interval */}
              <div className="p-4 bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase text-[10px] text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>2. Auto-Save Frequency *</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Required</span>
                </div>

                <div className="space-y-2">
                  <select
                    value={autoSaveInterval}
                    onChange={(e) => handleChangeInterval(e.target.value as AutoSaveInterval)}
                    className="w-full bg-white border border-slate-300 p-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-slate-900"
                  >
                    {AUTOSAVE_INTERVAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Preset Interval Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {AUTOSAVE_INTERVAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleChangeInterval(opt.value)}
                        className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border transition-colors ${
                          autoSaveInterval === opt.value
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {opt.value}
                      </button>
                    ))}
                  </div>

                  {settings.autoSaveConfig?.nextAutoSaveDueAt && autoSaveEnabled && (
                    <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>
                        Next scheduled backup due: <strong>{formatDateTime(settings.autoSaveConfig.nextAutoSaveDueAt)}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. AUTOSAVE HISTORY LOG & RESTORE TABLE                                   */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-700" />
                <h4 className="font-bold text-xs uppercase text-slate-900">
                  Auto-Save History Log ({autoSaveHistory.length} Snapshots)
                </h4>
              </div>

              {autoSaveHistory.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshAutoSaveHistory}
                    className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-[10px] font-bold uppercase flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllHistoryRecords}
                    className="px-2.5 py-1 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-[10px] font-bold uppercase flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear History</span>
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto border border-slate-200">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                    <th className="p-2.5">Date &amp; Time</th>
                    <th className="p-2.5">Backup Filename</th>
                    <th className="p-2.5">Destination</th>
                    <th className="p-2.5 text-right">Size / Records</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {autoSaveHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        {isLoadingHistory
                          ? 'Loading backup history logs...'
                          : 'No automated backup history recorded yet. Configure your destination folder and click "Backup Now" or wait for the scheduled cycle.'}
                      </td>
                    </tr>
                  ) : (
                    autoSaveHistory.map((rec) => {
                      const sizeKb = (rec.sizeBytes / 1024).toFixed(1);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 text-slate-900 font-semibold whitespace-nowrap">
                            {formatDateTime(rec.timestamp)}
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              <FileJson className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="font-bold text-slate-900">{rec.filename}</span>
                            </div>
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px]">
                            📁 {rec.folderName || 'Browser Secure Storage'}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600 whitespace-nowrap">
                            {sizeKb} KB {rec.recordCount ? `(${rec.recordCount} items)` : ''}
                          </td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase ${
                                rec.status === 'Saved to Local Folder'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-sky-50 text-sky-800 border-sky-300'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => downloadAutoSaveRecordFile(rec)}
                                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-[10px] font-bold uppercase flex items-center gap-1"
                                title="Download this JSON backup file to your browser"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setRestoreConfirmRecord(rec)}
                                className="px-2 py-1 bg-slate-900 hover:bg-black text-white text-[10px] font-bold uppercase flex items-center gap-1"
                                title="Restore entire database from this snapshot"
                              >
                                <Upload className="w-3 h-3 text-emerald-400" />
                                <span>Restore</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteHistoryRecord(rec.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Remove log record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* ========================================================================= */}
          {/* C. MANUAL INSTANT EXPORT & IMPORT UTILITIES                                */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Backup Snapshot */}
            <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Download className="w-5 h-5 text-emerald-700" />
                <h4 className="font-bold text-xs uppercase">Manual JSON Snapshot</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download a one-off offline JSON file containing all products, sales history, purchase orders, customers, and settings.
              </p>
              <button
                onClick={handleExportJSON}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('export_backup', 'Export Manual Backup (JSON)')}</span>
              </button>
            </div>

            {/* Restore Snapshot */}
            <div className="p-5 bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Upload className="w-5 h-5 text-sky-700" />
                <h4 className="font-bold text-xs uppercase">Import JSON Snapshot File</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload any previously saved JSON snapshot from your computer to restore your complete store database.
              </p>
              <label className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>{t('import_backup', 'Select Backup File (JSON)')}</span>
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
                <span>{t('reset_demo_data', 'Load ACME Demo Dataset')}</span>
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
                <span>{t('clear_all_data', 'Erase All Data & Reset Clean')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={!!restoreConfirmRecord}
        onClose={() => setRestoreConfirmRecord(null)}
        title="CONFIRM DATABASE RESTORATION"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-amber-50 border border-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-900 uppercase">Warning: Overwrite Existing Data</p>
              <p className="text-amber-800 leading-relaxed">
                Restoring from <strong className="font-bold text-slate-900">{restoreConfirmRecord?.filename}</strong> (created on{' '}
                {restoreConfirmRecord ? formatDateTime(restoreConfirmRecord.timestamp) : ''}) will replace all current catalog items, sales, and settings with this backup snapshot.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setRestoreConfirmRecord(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteRestore}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold uppercase text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Confirm &amp; Restore</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
