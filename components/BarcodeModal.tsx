'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from './common/Modal';
import { Camera, Barcode, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Product } from '../lib/types';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useTranslation } from '../context/I18nContext';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const { t } = useTranslation();
  const [manualCode, setManualCode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScannedCode = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;

      const matched = products.find(
        (p) =>
          p.barcode?.toLowerCase() === trimmed.toLowerCase() ||
          p.sku?.toLowerCase() === trimmed.toLowerCase()
      );

      if (matched) {
        setFoundProduct(matched);
        setErrorMsg('');
      } else {
        setFoundProduct(null);
        setErrorMsg(`${t('no_product_found_barcode', 'No product found matching Barcode / SKU')}: "${trimmed}"`);
      }
    },
    [products, t]
  );

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isOpen && isCameraActive) {
      scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 180 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          handleScannedCode(decodedText);
          if (scanner) {
            scanner.clear().catch(() => {});
          }
          setIsCameraActive(false);
        },
        () => {
          // ignore scan frame errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [isOpen, isCameraActive, handleScannedCode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScannedCode(manualCode);
  };

  const handleConfirmAdd = () => {
    if (foundProduct) {
      onSelectProduct(foundProduct);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('barcode_scanner_title', 'Barcode Scanner & SKU Lookup')}>
      <div className="space-y-4 font-mono text-slate-900 text-xs">
        {/* Camera Permission & Usage Info Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">
              {t('camera_permission_title', 'Camera Access for Barcode Scanning')}
            </p>
            <p className="text-slate-600 text-[10px] leading-relaxed">
              {t(
                'camera_permission_desc',
                'Camera permission is required solely for scanning product barcodes and SKUs directly via your device camera. No video or images are stored or transmitted.'
              )}
            </p>
          </div>
        </div>

        {/* Camera Toggle & Scanner Frame */}
        <div className="bg-slate-50 border border-slate-200 p-4 text-center space-y-3">
          {!isCameraActive ? (
            <button
              onClick={() => setIsCameraActive(true)}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>{t('start_camera_scanner', 'Start Camera Scanner')}</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div id="reader" className="w-full overflow-hidden bg-black min-h-[200px] border border-slate-300" />
              <button
                onClick={() => setIsCameraActive(false)}
                className="text-xs text-slate-600 hover:text-slate-900 underline font-mono uppercase"
              >
                {t('stop_camera_scanner', 'Stop Camera Scanner')}
              </button>
            </div>
          )}
        </div>

        {/* Manual Barcode / SKU Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            {t('enter_barcode_manually', 'Enter Barcode / SKU Manually')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. 883920194821 or LOG-MX3S-GRY"
                className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-9 pr-3 py-2 focus:outline-none focus:border-slate-900 font-mono"
                autoFocus
              />
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black"
            >
              {t('lookup', 'Lookup')}
            </button>
          </div>
        </form>

        {/* Scan Result */}
        {foundProduct && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {foundProduct.imageUrl && (
                <img
                  src={foundProduct.imageUrl}
                  alt={foundProduct.name}
                  className="w-10 h-10 object-cover border border-slate-200"
                />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900">{foundProduct.name}</p>
                <p className="text-[10px] text-slate-600 font-mono">
                  SKU: {foundProduct.sku} | Barcode: {foundProduct.barcode}
                </p>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">
                  ${foundProduct.retailPrice.toFixed(2)} — {foundProduct.stockQuantity} in stock
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirmAdd}
              className="px-3.5 py-1.5 bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-800 flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('select_item', 'Select Item')}</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold uppercase tracking-wider">
            {errorMsg}
          </div>
        )}
      </div>
    </Modal>
  );
};
