'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  Clock,
  ChevronRight,
  Search,
  Sparkles,
} from 'lucide-react';
import { BlogPost, BLOG_POSTS } from '../../lib/blogData';
import { SupportedLanguage } from '../../lib/i18n';
import { getBlogUIDictionary, getLocalizedPost } from '../../lib/blogI18n';
import { BlogHeader } from './BlogHeader';
import { CommunityFooterButtons } from '../common/CommunityFooterButtons';

export const BlogIndexClient: React.FC = () => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Load language from localStorage if available & listen to global updates
  useEffect(() => {
    const syncLang = () => {
      try {
        const stored = localStorage.getItem('inventory360_language') as SupportedLanguage;
        if (stored) {
          setLanguage(stored);
        }
      } catch {}
    };

    syncLang();
    window.addEventListener('storage', syncLang);
    window.addEventListener('inventory360_lang_change', syncLang);
    return () => {
      window.removeEventListener('storage', syncLang);
      window.removeEventListener('inventory360_lang_change', syncLang);
    };
  }, []);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('inventory360_language', newLang);
      window.dispatchEvent(new Event('inventory360_lang_change'));
    } catch {}
  };

  const ui = getBlogUIDictionary(language);
  const isRtl = language === 'ar';

  // Get localized post objects for active language
  const localizedPosts = BLOG_POSTS.map((post) => getLocalizedPost(post, language));

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(localizedPosts.map((p) => p.category)))];

  // Filter posts
  const filteredPosts = localizedPosts.filter((post) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || post.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.length > 0 ? filteredPosts.slice(1) : [];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 text-slate-900 font-mono flex flex-col justify-between">
      {/* 1. TOP PORTAL HEADER WITH LANGUAGE SWITCHER */}
      <BlogHeader currentLanguage={language} onLanguageChange={handleLanguageChange} />

      {/* 2. HERO HEADER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 w-full flex-1">
        {/* Breadcrumb Header */}
        <div className="space-y-3 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono uppercase">
            <Link href="/" className="hover:text-slate-900">{ui.home}</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">{ui.knowledgeBase}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>{ui.knowledgeBase}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight font-heading">
            {ui.blogTitle}
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            {ui.blogSubtitle}
          </p>

          {/* Search & Category Filter Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={ui.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:border-slate-900 transition-colors shadow-2xs placeholder:text-slate-400 font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? ui.allCategories : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. FEATURED POST CARD */}
        {featuredPost && (
          <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-sm hover:border-slate-400 transition-all space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 uppercase tracking-wider">
                {ui.featuredBadge}
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{featuredPost.readTime.replace('min read', ui.readTime)}</span>
                <span>•</span>
                <span>{featuredPost.publishedAt}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link href={`/blog/${featuredPost.slug}`}>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 hover:text-emerald-700 transition-colors font-heading">
                  {featuredPost.title}
                </h2>
              </Link>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-4xl">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {featuredPost.keywords.slice(0, 4).map((kw, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 uppercase"
                >
                  #{kw}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0"
              >
                <span>{ui.readMasterGuide}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 4. ARTICLES GRID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">
              {ui.allArticles} ({filteredPosts.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase">
              {ui.updatedDate}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {regularPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-white border border-slate-200 p-6 shadow-sm hover:border-slate-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-bold text-slate-900 uppercase px-2 py-0.5 bg-slate-100 border border-slate-200">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime.replace('min read', ui.readTime)}</span>
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors font-heading leading-snug">
                      {post.title}
                    </h4>
                  </Link>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {post.keywords.slice(0, 3).map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 uppercase"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 uppercase"
                    >
                      <span>{ui.readArticle}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* 5. CTA WORKSPACE CARD */}
        <div className="bg-slate-900 !text-white text-white p-8 border border-slate-800 shadow-xl space-y-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold font-heading !text-white text-white">
              {ui.ctaTitle}
            </h3>
            <p className="text-xs !text-slate-200 text-slate-200 max-w-xl leading-relaxed">
              {ui.ctaDescription}
            </p>
          </div>

          <Link
            href="/"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 !text-slate-950 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg"
          >
            <span>{ui.ctaButton}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="hover:text-slate-900 font-bold">
            ← {ui.footerHome}
          </Link>
          <CommunityFooterButtons />
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-900">{ui.footerPrivacy}</Link>
            <Link href="/" className="hover:text-slate-900">{ui.home}</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 text-center text-[10px] text-slate-400">
          <span>© {new Date().getFullYear()} {ui.footerRights}</span>
        </div>
      </footer>
    </div>
  );
};
