'use client';

import React, { useState } from 'react';
import { Modal } from './common/Modal';
import { Product, ProductVariant } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { Printer, Copy, Check } from 'lucide-react';

interface LabelPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  selectedVariant?: ProductVariant | null;
  currencySymbol: string;
}

export const LabelPrintModal: React.FC<LabelPrintModalProps> = ({
  isOpen,
  onClose,
  product,
  selectedVariant,
  currencySymbol,
}) => {
  const [labelQuantity, setLabelQuantity] = useState(6);
  const [labelFormat, setLabelFormat] = useState<'standard' | 'compact' | 'qr-only'>('standard');
  const [copiedSku, setCopiedSku] = useState(false);

  if (!product) return null;

  const activeSku = selectedVariant?.sku || product.sku;
  const activeBarcode = selectedVariant?.barcode || product.barcode;
  const activePrice = selectedVariant?.retailPrice || product.retailPrice;
  const activeName = selectedVariant
    ? `${product.name} - ${selectedVariant.name}`
    : product.name;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySku = () => {
    navigator.clipboard.writeText(activeSku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  // Generate SVG QR pattern representation
  const renderSvgQr = (code: string) => {
    return (
      <svg className="w-14 h-14 bg-white p-1 border border-slate-200" viewBox="0 0 29 29" fill="none">
        <rect width="29" height="29" fill="white" />
        {/* Finder pattern Top-Left */}
        <rect x="2" y="2" width="7" height="7" fill="black" />
        <rect x="3" y="3" width="5" height="5" fill="white" />
        <rect x="4" y="4" width="3" height="3" fill="black" />

        {/* Finder pattern Top-Right */}
        <rect x="20" y="2" width="7" height="7" fill="black" />
        <rect x="21" y="3" width="5" height="5" fill="white" />
        <rect x="22" y="4" width="3" height="3" fill="black" />

        {/* Finder pattern Bottom-Left */}
        <rect x="2" y="20" width="7" height="7" fill="black" />
        <rect x="3" y="21" width="5" height="5" fill="white" />
        <rect x="4" y="22" width="3" height="3" fill="black" />

        {/* Dynamic data dots */}
        <rect x="11" y="4" width="2" height="2" fill="black" />
        <rect x="15" y="4" width="2" height="2" fill="black" />
        <rect x="11" y="8" width="2" height="2" fill="black" />
        <rect x="14" y="11" width="3" height="3" fill="black" />
        <rect x="10" y="14" width="2" height="2" fill="black" />
        <rect x="18" y="14" width="2" height="2" fill="black" />
        <rect x="14" y="18" width="2" height="2" fill="black" />
        <rect x="20" y="11" width="2" height="2" fill="black" />
        <rect x="23" y="14" width="2" height="2" fill="black" />
        <rect x="11" y="22" width="2" height="2" fill="black" />
        <rect x="15" y="24" width="2" height="2" fill="black" />
        <rect x="22" y="22" width="2" height="2" fill="black" />
      </svg>
    );
  };

  // Generate SVG 1D Barcode pattern representation
  const renderSvgBarcode = (code: string) => {
    return (
      <div className="flex flex-col items-center">
        <svg className="w-full h-8" viewBox="0 0 100 24" preserveAspectRatio="none">
          <rect width="100" height="24" fill="white" />
          <rect x="4" y="0" width="2" height="24" fill="black" />
          <rect x="8" y="0" width="1" height="24" fill="black" />
          <rect x="11" y="0" width="3" height="24" fill="black" />
          <rect x="16" y="0" width="1" height="24" fill="black" />
          <rect x="19" y="0" width="2" height="24" fill="black" />
          <rect x="23" y="0" width="4" height="24" fill="black" />
          <rect x="29" y="0" width="1" height="24" fill="black" />
          <rect x="32" y="0" width="2" height="24" fill="black" />
          <rect x="36" y="0" width="3" height="24" fill="black" />
          <rect x="41" y="0" width="1" height="24" fill="black" />
          <rect x="44" y="0" width="4" height="24" fill="black" />
          <rect x="50" y="0" width="2" height="24" fill="black" />
          <rect x="54" y="0" width="1" height="24" fill="black" />
          <rect x="57" y="0" width="3" height="24" fill="black" />
          <rect x="62" y="0" width="2" height="24" fill="black" />
          <rect x="66" y="0" width="1" height="24" fill="black" />
          <rect x="69" y="0" width="4" height="24" fill="black" />
          <rect x="75" y="0" width="2" height="24" fill="black" />
          <rect x="79" y="0" width="1" height="24" fill="black" />
          <rect x="82" y="0" width="3" height="24" fill="black" />
          <rect x="87" y="0" width="2" height="24" fill="black" />
          <rect x="91" y="0" width="1" height="24" fill="black" />
          <rect x="94" y="0" width="2" height="24" fill="black" />
        </svg>
        <span className="text-[9px] font-mono tracking-widest text-black font-bold mt-0.5">
          {code}
        </span>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="PRINT BARCODE &amp; QR LABELS" maxWidth="max-w-3xl">
      <div className="space-y-6 text-slate-900 font-mono">
        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200">
          <div>
            <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1">
              Label Quantity
            </label>
            <select
              value={labelQuantity}
              onChange={(e) => setLabelQuantity(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs p-2 focus:border-slate-900 outline-none"
            >
              <option value={1}>1 Label (Single Test)</option>
              <option value={4}>4 Labels</option>
              <option value={6}>6 Labels (Half Sheet)</option>
              <option value={12}>12 Labels (Full Sheet)</option>
              <option value={24}>24 Labels (Bulk Avery)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1">
              Label Template
            </label>
            <select
              value={labelFormat}
              onChange={(e) => setLabelFormat(e.target.value as any)}
              className="w-full bg-white border border-slate-300 text-slate-900 text-xs p-2 focus:border-slate-900 outline-none"
            >
              <option value="standard">Standard (Barcode + QR + Price)</option>
              <option value="compact">Compact Barcode Sticker</option>
              <option value="qr-only">QR Code Shelf Tag</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handlePrint}
              className="w-full py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Sheet</span>
            </button>
          </div>
        </div>

        {/* Product Details Header */}
        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 text-xs shadow-xs">
          <div>
            <p className="font-bold text-slate-900 uppercase">{activeName}</p>
            <p className="text-[11px] text-slate-600">
              SKU: <span className="text-slate-900 font-bold">{activeSku}</span> • Barcode: {activeBarcode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySku}
              className="p-1.5 bg-slate-100 border border-slate-300 hover:text-slate-900 text-slate-700 text-[10px] flex items-center gap-1"
            >
              {copiedSku ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSku ? 'Copied' : 'Copy SKU'}</span>
            </button>
            <span className="text-sm font-bold text-emerald-700 font-mono">
              {formatCurrency(activePrice, currencySymbol)}
            </span>
          </div>
        </div>

        {/* Printable Label Sheet Preview */}
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-600 font-bold">
            Print Preview ({labelQuantity} Labels Ready)
          </p>

          <div className="max-h-80 overflow-y-auto p-4 bg-slate-100 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(labelQuantity)].map((_, i) => (
              <div
                key={i}
                className="p-3 bg-white text-black border border-slate-300 shadow-sm flex flex-col justify-between space-y-2 rounded-sm"
              >
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    INVENTORY 360
                  </p>
                  <p className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-1">
                    {activeName}
                  </p>
                  <p className="text-[9px] font-mono text-slate-600">
                    SKU: {activeSku}
                  </p>
                </div>

                {labelFormat === 'standard' && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                    <div className="flex-1 min-w-0">
                      {renderSvgBarcode(activeBarcode)}
                    </div>
                    <div>{renderSvgQr(activeSku)}</div>
                  </div>
                )}

                {labelFormat === 'compact' && (
                  <div className="pt-1 border-t border-slate-200">
                    {renderSvgBarcode(activeBarcode)}
                  </div>
                )}

                {labelFormat === 'qr-only' && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-mono text-slate-600">SCAN TO LOOKUP</p>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(activePrice, currencySymbol)}</p>
                    </div>
                    <div>{renderSvgQr(activeSku)}</div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-bold border-t border-slate-200 pt-1">
                  <span className="text-slate-500 text-[8px] uppercase">Official Tag</span>
                  <span className="text-slate-900 text-xs font-mono">
                    {formatCurrency(activePrice, currencySymbol)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-300 text-xs uppercase font-bold hover:bg-slate-200"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-slate-900 text-white text-xs uppercase font-bold hover:bg-black flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print {labelQuantity} Labels</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
