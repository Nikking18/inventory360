'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, ChevronDown, Check } from 'lucide-react';
import { SupportedLanguage, LANGUAGES } from '../../lib/i18n';
import { getBlogUIDictionary } from '../../lib/blogI18n';

interface BlogHeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const BlogHeader: React.FC<BlogHeaderProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ui = getBlogUIDictionary(currentLanguage);
  const currentLangObj = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group cursor-pointer text-left"
          title="Return to Inventory 360 Home"
        >
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rotate-45 shrink-0 shadow-xs group-hover:bg-black transition-colors">
            <div className="w-3.5 h-3.5 bg-emerald-400 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-sm uppercase tracking-[0.25em] text-slate-900">
              INVENTORY<span className="text-emerald-600">360</span>
            </span>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider hidden sm:block">
              Local-First Enterprise Engine
            </span>
          </div>
        </Link>

        {/* Right: Language Selector & Launch App CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-mono">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
              title="Change Blog Language"
              aria-label="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden sm:inline uppercase text-[11px] font-bold tracking-wider">
                {currentLangObj.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1 w-48 sm:w-56 bg-white border border-slate-200 shadow-2xl z-50 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50">
                  {ui.selectLanguage} (11 Languages)
                </div>
                {LANGUAGES.map((lang) => {
                  const isSelected = lang.code === currentLanguage;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{lang.flag}</span>
                        <div>
                          <div className="text-xs">{lang.name}</div>
                          <div className="text-[9px] text-slate-400 uppercase">{lang.code}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Launch App Button */}
          <Link
            href="/"
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-900 text-white font-bold uppercase tracking-wider text-xs hover:bg-black transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span>{ui.launchApp}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
