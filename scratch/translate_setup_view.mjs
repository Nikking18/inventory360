import fs from 'fs';

const filePath = 'components/views/SetupView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Subtabs labels
content = content.replace(
  `{tabId === 'profile' ? 'Profile & Tax' : tabId === 'locations' ? 'Locations' : 'Data & Backup'}`,
  `{tabId === 'profile' ? t('profile', 'Profile & Tax') : tabId === 'locations' ? t('locations', 'Locations') : t('data', 'Data & Backup')}`
);

// 2. Business Profile section header and labels
content = content.replace(
  `Business Profile &amp; General Configuration`,
  `{t('business_profile', 'Business Profile & General Configuration')}`
);
content = content.replace(
  `Company Logo &amp; Document Brand`,
  `{t('business_logo_label', 'Company Logo & Document Brand')}`
);
content = content.replace(
  `Tax Identification / GSTIN / VAT Number`,
  `{t('tax_number_label', 'Tax Identification / GSTIN / VAT Number')}`
);
content = content.replace(
  `Default General Sales Tax Rate (%)`,
  `{t('sales_tax_rate_label', 'Default General Sales Tax Rate (%)')}`
);
content = content.replace(
  `<span>Default Currency</span>`,
  `<span>{t('store_currency', 'Default Currency')}</span>`
);
content = content.replace(
  `<span>System Language</span>`,
  `<span>{t('system_language', 'System Language')}</span>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Phone Number</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('phone', 'Phone Number')}</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Email Address</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('email', 'Email Address')}</label>`
);
content = content.replace(
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Physical Address</label>`,
  `<label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">{t('address', 'Physical Address')}</label>`
);

// 3. Locations section
content = content.replace(
  `Store Outlets &amp; Warehouse Locations ({locations.length})`,
  `{t('locations', 'Store Outlets & Warehouse Locations')} ({locations.length})`
);
content = content.replace(
  `+ Register New Branch Outlet`,
  `+ {t('add_location', 'Register New Branch Outlet')}`
);
content = content.replace(
  `Add Outlet Location\n            </button>`,
  `{t('add_location', 'Add Outlet Location')}\n            </button>`
);

// 4. Data & Backup section
content = content.replace(
  `Automated Local JSON Backups`,
  `{t('automated_backups', 'Automated Local JSON Backups')}`
);
content = content.replace(
  `<span>Export Manual Backup (JSON)</span>`,
  `<span>{t('export_backup', 'Export Manual Backup (JSON)')}</span>`
);
content = content.replace(
  `<span>Select Backup File (JSON)</span>`,
  `<span>{t('import_backup', 'Select Backup File (JSON)')}</span>`
);
content = content.replace(
  `<span>Load ACME Demo Dataset</span>`,
  `<span>{t('reset_demo_data', 'Load ACME Demo Dataset')}</span>`
);
content = content.replace(
  `<span>Erase All Data &amp; Reset Clean</span>`,
  `<span>{t('clear_all_data', 'Erase All Data & Reset Clean')}</span>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully translated SetupView.tsx!');
