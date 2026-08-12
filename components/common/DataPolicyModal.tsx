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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-700 rounded-none shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-neutral-200 font-mono">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5 text-amber-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="font-mono uppercase tracking-wider font-bold text-xs sm:text-sm text-white">
              {t('data_policy_notice_title', 'Data Policy & Backup Notice')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 flex items-start gap-3">
            <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {t('local_storage_badge', 'Browser Local Persistence')}
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {t(
                  'data_policy_notice_msg',
                  'Inventory360 stores your inventory, sales, and transaction records locally in your browser for maximum privacy and fast offline speed. To avoid data loss when clearing browser history or changing devices, please generate regular backups by going to Settings > Data & Backup.'
                )}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 bg-neutral-950 p-3 border border-neutral-800/80">
            <p className="font-bold text-neutral-300 uppercase mb-1">
              💡 {t('pro_tip', 'Backup Recommendation')}
            </p>
            <p className="leading-normal">
              {t(
                'backup_tip_desc',
                'Export your JSON backup before clearing site cache or performing browser updates to keep your business records safe.'
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {t('got_it_acknowledge', 'Acknowledge & Close')}
          </button>

          <button
            onClick={onGoToBackup}
            className="w-full sm:w-auto px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
          >
            <span>{t('go_to_backup', 'Go to Settings > Data & Backup')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
