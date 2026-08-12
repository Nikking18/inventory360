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
      <div className="space-y-4 font-mono text-neutral-200 text-xs">
        {/* Camera Permission & Usage Info Box */}
        <div className="p-3 bg-neutral-950 border border-neutral-800 flex items-start gap-2.5 text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-white uppercase text-[10px] tracking-wider">
              {t('camera_permission_title', 'Camera Access for Barcode Scanning')}
            </p>
            <p className="text-neutral-400 text-[10px] leading-relaxed">
              {t(
                'camera_permission_desc',
                'Camera permission is required solely for scanning product barcodes and SKUs directly via your device camera. No video or images are stored or transmitted.'
              )}
            </p>
          </div>
        </div>

        {/* Camera Toggle & Scanner Frame */}
        <div className="bg-neutral-950 border border-neutral-800 p-4 text-center space-y-3">
          {!isCameraActive ? (
            <button
              onClick={() => setIsCameraActive(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>{t('start_camera_scanner', 'Start Camera Scanner')}</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div id="reader" className="w-full overflow-hidden bg-black min-h-[200px] border border-neutral-800" />
              <button
                onClick={() => setIsCameraActive(false)}
                className="text-xs text-neutral-400 hover:text-white underline font-mono uppercase"
              >
                {t('stop_camera_scanner', 'Stop Camera Scanner')}
              </button>
            </div>
          )}
        </div>

        {/* Manual Barcode / SKU Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            {t('enter_barcode_manually', 'Enter Barcode / SKU Manually')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. 883920194821 or LOG-MX3S-GRY"
                className="w-full text-xs bg-neutral-950 border border-neutral-800 text-white pl-9 pr-3 py-2 focus:outline-none focus:border-white font-mono"
                autoFocus
              />
              <Barcode className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200"
            >
              {t('lookup', 'Lookup')}
            </button>
          </div>
        </form>

        {/* Scan Result */}
        {foundProduct && (
          <div className="p-4 bg-neutral-950 border border-emerald-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {foundProduct.imageUrl && (
                <img
                  src={foundProduct.imageUrl}
                  alt={foundProduct.name}
                  className="w-10 h-10 object-cover border border-neutral-800"
                />
              )}
              <div>
                <p className="text-xs font-bold text-white">{foundProduct.name}</p>
                <p className="text-[10px] text-neutral-400 font-mono">
                  SKU: {foundProduct.sku} | Barcode: {foundProduct.barcode}
                </p>
                <p className="text-xs font-bold text-emerald-400 mt-0.5">
                  ${foundProduct.retailPrice.toFixed(2)} — {foundProduct.stockQuantity} in stock
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirmAdd}
              className="px-3.5 py-1.5 bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-emerald-300 flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('select_item', 'Select Item')}</span>
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-neutral-950 border border-rose-800 text-rose-400 text-xs font-bold uppercase tracking-wider">
            {errorMsg}
          </div>
        )}
      </div>
    </Modal>
  );
};
