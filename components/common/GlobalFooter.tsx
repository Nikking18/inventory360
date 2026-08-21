'use client';

import React from 'react';
import { Coffee } from 'lucide-react';
import { SupportedLanguage } from '../../lib/i18n';
import { ProductHuntBadge } from './ProductHuntBadge';

interface GlobalFooterProps {
  language?: SupportedLanguage;
  className?: string;
  showLinks?: boolean;
}

export const BUY_COFFEE_LABELS: Record<SupportedLanguage, string> = {
  en: 'Buy Me a Coffee',
  es: 'Cómprame un café',
  fr: 'Offrez-moi un café',
  de: 'Kauf mir einen Kaffee',
  hi: 'कॉफ़ी प्रायोजित करें',
  ja: 'コーヒーをおごる',
  zh: '请我喝杯咖啡',
  ar: 'اشترِ لي قهوة',
  pt: 'Pague-me um café',
  it: 'Offrimi un caffè',
  ru: 'Купить кофе',
};

export const PRODUCT_HUNT_LABELS: Record<SupportedLanguage, string> = {
  en: 'Find us on Product Hunt',
  es: 'Encuéntranos en Product Hunt',
  fr: 'Retrouvez-nous sur Product Hunt',
  de: 'Finde uns auf Product Hunt',
  hi: 'Product Hunt पर खोजें',
  ja: 'Product Hunt で見る',
  zh: '在 Product Hunt 发现我们',
  ar: 'اعثر علينا على Product Hunt',
  pt: 'Encontre-nos no Product Hunt',
  it: 'Trovaci su Product Hunt',
  ru: 'Мы на Product Hunt',
};

export function renderCreatorCredit(lang: SupportedLanguage = 'en') {
  switch (lang) {
    case 'es':
      return (
        <span>
          Creado con <span className="text-rose-500">❤️</span> por{' '}
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong>
        </span>
      );
    case 'fr':
      return (
        <span>
          Créé avec <span className="text-rose-500">❤️</span> par{' '}
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong>
        </span>
      );
    case 'de':
      return (
        <span>
          Erstellt mit <span className="text-rose-500">❤️</span> von{' '}
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong>
        </span>
      );
    case 'hi':
      return (
        <span>
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong> द्वारा{' '}
          <span className="text-rose-500">❤️</span> से बनाया गया
        </span>
      );
    case 'ja':
      return (
        <span>
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong> によって{' '}
          <span className="text-rose-500">❤️</span> で作成されました
        </span>
      );
    case 'zh':
      return (
        <span>
          由 <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong> 用{' '}
          <span className="text-rose-500">❤️</span> 倾情打造
        </span>
      );
    case 'ar':
      return (
        <span>
          تم إنشاؤه بـ <span className="text-rose-500">❤️</span> بواسطة{' '}
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong>
        </span>
      );
    case 'pt':
      return (
        <span>
          Criado com <span className="text-rose-500">❤️</span> por{' '}
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong>
        </span>
      );
    case 'it':
      return (
        <span>
          Creato con <span className="text-rose-500">❤️</span> da{' '}
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong>
        </span>
      );
    case 'ru':
      return (
        <span>
          Создано с <span className="text-rose-500">❤️</span> —{' '}
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong>
        </span>
      );
    case 'en':
    default:
      return (
        <span>
          Created with <span className="text-rose-500">❤️</span> by{' '}
          <strong className="text-slate-900 font-bold">Nikhil Khanpara</strong>
        </span>
      );
  }
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  language = 'en',
  className = '',
  showLinks = true,
}) => {
  const coffeeLabel = BUY_COFFEE_LABELS[language] || BUY_COFFEE_LABELS.en;
  const phLabel = PRODUCT_HUNT_LABELS[language] || PRODUCT_HUNT_LABELS.en;

  return (
    <footer
      className={`border-t border-slate-200 bg-white px-4 sm:px-8 py-4 font-mono text-xs text-slate-500 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Buttons for Buy Me a Coffee & Product Hunt */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          <a
            href="https://ko-fi.com/Y0H123WFGA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] uppercase tracking-wider transition-colors shadow-2xs border border-amber-600"
            title="Support this project on Ko-fi"
          >
            <Coffee className="w-3.5 h-3.5 text-slate-950" />
            <span>{coffeeLabel}</span>
          </a>

          <a
            href="https://www.producthunt.com/products/inventory-360?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-inventory-360"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-900 font-bold text-[11px] uppercase tracking-wider transition-colors shadow-2xs border border-slate-300"
            title="Find us on Product Hunt"
          >
            <svg className="w-3.5 h-3.5 fill-[#FF6154]" viewBox="0 0 24 24">
              <path d="M13.604 8.4h-3.405V12h3.405c.995 0 1.801-.806 1.801-1.8 0-.994-.806-1.8-1.801-1.8zM24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-8.595 0c1.99 0 3.604-1.614 3.604-3.6 0-1.987-1.614-3.6-3.604-3.6H7.2v14.4h3v-4.2h3.405c1.99 0 3.604-1.614 3.604-3.6z" />
            </svg>
            <span>{phLabel}</span>
          </a>
        </div>

        {/* Center: Translated Creator Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-[11px] text-slate-600">
          <div>{renderCreatorCredit(language)}</div>
          {showLinks && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="hidden sm:inline text-slate-300">•</span>
              <a
                href="https://github.com/Nikking18"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-950 font-bold underline"
              >
                GitHub
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://www.linkedin.com/in/nikhilkhanpara/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-950 font-bold underline"
              >
                LinkedIn
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="https://x.com/nikhilkhanpara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-slate-950 font-bold underline"
              >
                Twitter
              </a>
            </div>
          )}
        </div>

        {/* Right: Copyright & Architecture */}
        <div className="text-[10px] text-slate-500 text-center md:text-right">
          <span>© {new Date().getFullYear()} Inventory 360 • Local-First</span>
        </div>
      </div>
    </footer>
  );
};
