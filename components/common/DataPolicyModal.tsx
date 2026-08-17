'use client';

import React, { useEffect } from 'react';
import { useTranslation } from '../../context/I18nContext';
import { ShieldAlert, Database, ArrowRight, X } from 'lucide-react';

interface DataPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToBackup: () => void;
}

export const DataPolicyModal: React.FC<DataPolicyModalProps> = ({
  isOpen,
  onClose,
  onGoToBackup,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-none shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-900 font-mono">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5 text-amber-600">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="font-mono uppercase tracking-wider font-bold text-xs sm:text-sm text-slate-900">
              {t('data_policy_notice_title', 'Data Policy & Backup Notice')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 flex items-start gap-3">
            <Database className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                {t('local_storage_badge', 'Browser Local Persistence')}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {t(
                  'data_policy_notice_msg',
                  'Inventory360 stores your inventory, sales, and transaction records locally in your browser for maximum privacy and fast offline speed. To avoid data loss when clearing browser history or changing devices, please generate regular backups by going to Settings > Data & Backup.'
                )}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-amber-50/60 p-3 border border-amber-200">
            <p className="font-bold text-amber-900 uppercase mb-1">
              💡 {t('pro_tip', 'Backup Recommendation')}
            </p>
            <p className="leading-normal text-amber-800">
              {t(
                'backup_tip_desc',
                'Export your JSON backup before clearing site cache or performing browser updates to keep your business records safe.'
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {t('got_it_acknowledge', 'Acknowledge & Close')}
          </button>

          <button
            onClick={onGoToBackup}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-sm"
          >
            <span>{t('go_to_backup', 'Go to Settings > Data & Backup')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
