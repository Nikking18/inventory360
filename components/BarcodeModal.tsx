'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from './common/Modal';
import { Camera, Barcode, CheckCircle2, ShieldCheck, RefreshCw, AlertCircle, Sparkles, X } from 'lucide-react';
import { Product, ProductVariant } from '../lib/types';
import { Html5Qrcode } from 'html5-qrcode';
import { useTranslation } from '../context/I18nContext';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product, variant?: ProductVariant) => void;
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
  const [foundVariant, setFoundVariant] = useState<ProductVariant | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Search across both Parent Products AND Specific Variants
  const handleScannedCode = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) return;

      const lower = trimmed.toLowerCase();

      // 1. First check if it matches a specific variant SKU or Barcode
      for (const p of products) {
        if (p.variants && p.variants.length > 0) {
          const matchVar = p.variants.find(
            (v) =>
              (v.sku && v.sku.toLowerCase() === lower) ||
              (v.barcode && v.barcode.toLowerCase() === lower) ||
              (v.name && v.name.toLowerCase() === lower)
          );
          if (matchVar) {
            setFoundProduct(p);
            setFoundVariant(matchVar);
            setErrorMsg('');
            return;
          }
        }
      }

      // 2. Check if it matches parent product SKU or Barcode or ID
      const matched = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === lower) ||
          (p.sku && p.sku.toLowerCase() === lower) ||
          (p.id && p.id.toLowerCase() === lower)
      );

      if (matched) {
        setFoundProduct(matched);
        setFoundVariant(null);
        setErrorMsg('');
      } else {
        setFoundProduct(null);
        setFoundVariant(null);
        setErrorMsg(`${t('no_product_found_barcode', 'No product found matching Barcode / SKU')}: "${trimmed}"`);
      }
    },
    [products, t]
  );

  // Fetch available camera devices on mount
  useEffect(() => {
    if (isOpen) {
      Html5Qrcode.getCameras()
        .then((cameras) => {
          if (cameras && cameras.length > 0) {
            setAvailableCameras(cameras);
            setSelectedCameraId(cameras[0].id);
          }
        })
        .catch((err) => {
          console.warn('Camera device listing error:', err);
        });
    }
  }, [isOpen]);

  // Start Camera Stream Scanner
  const startCameraScanner = async (cameraId?: string) => {
    try {
      setCameraError('');
      setIsCameraActive(true);

      // Short delay to let the DOM element #barcode-reader-view mount
      await new Promise((resolve) => setTimeout(resolve, 150));

      const readerElement = document.getElementById('barcode-reader-view');
      if (!readerElement) {
        setCameraError('Camera container could not be initialized.');
        setIsCameraActive(false);
        return;
      }

      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const scanner = new Html5Qrcode('barcode-reader-view');
      html5QrCodeRef.current = scanner;

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 160 },
        aspectRatio: 1.777778,
      };

      const scanSuccessCallback = (decodedText: string) => {
        handleScannedCode(decodedText);
        stopCameraScanner();
      };

      // Try with chosen camera device or fallback facingMode
      if (cameraId) {
        await scanner.start(cameraId, config, scanSuccessCallback, () => {});
      } else if (selectedCameraId) {
        await scanner.start(selectedCameraId, config, scanSuccessCallback, () => {});
      } else {
        try {
          await scanner.start({ facingMode: 'environment' }, config, scanSuccessCallback, () => {});
        } catch {
          // If back environment camera fails, fallback to standard user webcam
          await scanner.start({ facingMode: 'user' }, config, scanSuccessCallback, () => {});
        }
      }
    } catch (err: any) {
      console.error('Camera startup failure:', err);
      setCameraError(
        err?.message || 'Unable to access camera. Please check browser camera permissions in site settings.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopCameraScanner();
      setManualCode('');
      setFoundProduct(null);
      setFoundVariant(null);
      setErrorMsg('');
      setCameraError('');
    }
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScannedCode(manualCode);
  };

  const handleConfirmAdd = () => {
    if (foundProduct) {
      onSelectProduct(foundProduct, foundVariant || undefined);
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
              {t('camera_permission_title', 'Camera & Barcode Scanner Access')}
            </p>
            <p className="text-slate-600 text-[10px] leading-relaxed">
              Use your device camera or attached USB / Bluetooth barcode gun to quickly scan products and individual variants directly into POS.
            </p>
          </div>
        </div>

        {/* Camera Toggle & Scanner Frame */}
        <div className="bg-slate-50 border border-slate-200 p-4 text-center space-y-3">
          {!isCameraActive ? (
            <div className="space-y-2">
              <button
                onClick={() => startCameraScanner()}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>{t('start_camera_scanner', 'Start Camera Scanner')}</span>
              </button>

              {availableCameras.length > 1 && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 pt-1">
                  <span>Camera:</span>
                  <select
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="bg-white border border-slate-300 p-1 text-[10px]"
                  >
                    {availableCameras.map((cam) => (
                      <option key={cam.id} value={cam.id}>
                        {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative w-full overflow-hidden bg-black border-2 border-slate-900 shadow-md">
                <div id="barcode-reader-view" className="w-full min-h-[220px]" />
                {/* Aiming Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-28 border-2 border-emerald-400 border-dashed bg-emerald-400/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 uppercase tracking-wider">
                      Align Barcode Here
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => startCameraScanner(selectedCameraId)}
                  className="flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 font-bold uppercase"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restart Camera</span>
                </button>
                <button
                  onClick={stopCameraScanner}
                  className="text-xs text-rose-700 hover:text-rose-900 font-bold font-mono uppercase"
                >
                  {t('stop_camera_scanner', 'Stop Camera')}
                </button>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 text-[11px] font-bold text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p>Camera Error: {cameraError}</p>
                <p className="text-[10px] font-normal mt-0.5 text-rose-600">
                  Tip: Make sure you have allowed camera permission in your browser or enter the SKU / barcode manually below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Barcode / SKU Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            {t('enter_barcode_manually', 'Enter Barcode or Variant SKU Manually')}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. LOG-MX3S-MAC, 883920194821 or KEY-K2-RED"
                className="w-full text-xs bg-white border border-slate-300 text-slate-900 pl-9 pr-3 py-2.5 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
                autoFocus
              />
              <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black shrink-0"
            >
              {t('lookup', 'Lookup')}
            </button>
          </div>
        </form>

        {/* Scan Result */}
        {foundProduct && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              {foundProduct.imageUrl && (
                <img
                  src={foundProduct.imageUrl}
                  alt={foundProduct.name}
                  className="w-12 h-12 object-cover border border-slate-200 shrink-0"
                />
              )}
              <div>
                <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 border border-emerald-300">
                  {foundVariant ? 'Variant Match Found' : 'Product Found'}
                </span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {foundVariant ? `${foundProduct.name} (${foundVariant.name})` : foundProduct.name}
                </p>
                <p className="text-[10px] text-slate-600 font-mono">
                  SKU: {foundVariant ? foundVariant.sku : foundProduct.sku}
                  {foundVariant?.barcode && ` | Barcode: ${foundVariant.barcode}`}
                </p>
                <p className="text-xs font-bold text-emerald-800 mt-0.5">
                  ${(foundVariant ? foundVariant.retailPrice : foundProduct.retailPrice).toFixed(2)} —{' '}
                  {foundVariant ? foundVariant.stockQuantity : foundProduct.stockQuantity} in stock
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirmAdd}
              className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-800 flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('select_item', 'Add To Cart')}</span>
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
