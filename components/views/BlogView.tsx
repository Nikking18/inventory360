'use client';

import React, { useState, useMemo } from 'react';
import { BLOG_POSTS, BlogPost } from '../../lib/blogData';
import { useTranslation } from '../../context/I18nContext';
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Share2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ShoppingBag,
  Boxes,
  Settings,
  BarChart3,
  Check,
} from 'lucide-react';

interface BlogViewProps {
  activeSubTab?: string;
  onSubTabChange?: (subTab: string) => void;
  onNavigateToTab?: (tab: string, subTab?: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  activeSubTab = 'all',
  onSubTabChange,
  onNavigateToTab,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedPost = useMemo(() => {
    if (!selectedPostSlug) return null;
    return BLOG_POSTS.find((p) => p.slug === selectedPostSlug) || null;
  }, [selectedPostSlug]);

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'pos-tech', label: 'POS & Technology', match: 'POS & Technology' },
    { id: 'inventory-strategy', label: 'Inventory Strategy', match: 'Inventory Strategy' },
    { id: 'omnichannel', label: 'Omnichannel Retail', match: 'Omnichannel Retail' },
    { id: 'compliance', label: 'Operations & Compliance', match: 'Operations & Compliance' },
    { id: 'hardware', label: 'Hardware & Guides', match: 'Hardware & Guides' },
  ];

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      // Category Filter
      if (activeSubTab && activeSubTab !== 'all') {
        const cat = categories.find((c) => c.id === activeSubTab);
        if (cat && cat.match && post.category !== cat.match) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchesKeywords = post.keywords.some((k) => k.toLowerCase().includes(q));
        const matchesContent = post.content.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt && !matchesKeywords && !matchesContent) {
          return false;
        }
      }

      return true;
    });
  }, [activeSubTab, searchQuery]);

  const handleShare = (slug: string) => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/blog/${slug}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // If a post is selected, render the dedicated reader view
  if (selectedPost) {
    return (
      <div className="space-y-6 text-slate-900 font-mono max-w-5xl mx-auto pb-12">
        {/* Back navigation & Share bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => setSelectedPostSlug(null)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare(selectedPost.slug)}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-slate-900 text-white hover:bg-black transition-colors shadow-2xs cursor-pointer"
              title="Copy public link to share"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Public Link'}</span>
            </button>
            <a
              href={`/blog/${selectedPost.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
              title="Open full standalone article in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Full Page</span>
            </a>
          </div>
        </div>

        {/* Article Header Card */}
        <article className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="bg-slate-900 text-white px-2 py-0.5">{selectedPost.category}</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3" />
                {selectedPost.readTime}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3 h-3" />
                {selectedPost.publishedAt}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight font-heading">
              {selectedPost.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed font-sans font-medium border-l-2 border-slate-900 pl-3">
              {selectedPost.excerpt}
            </p>

            {/* Author Profile */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-200">
              <img
                src={selectedPost.author.avatar}
                alt={selectedPost.author.name}
                className="w-10 h-10 rounded-full border border-slate-300 object-cover"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">{selectedPost.author.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">{selectedPost.author.role}</p>
              </div>
            </div>
          </div>

          {/* Table of Contents Box */}
          {selectedPost.tableOfContents && selectedPost.tableOfContents.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                Table of Contents:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                {selectedPost.tableOfContents.map((toc, idx) => (
                  <div key={toc.id} className="flex items-center gap-1.5 text-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">0{idx + 1}.</span>
                    <span className="hover:text-slate-900">{toc.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article Body Content */}
          <div className="prose prose-slate max-w-none font-sans text-sm text-slate-800 leading-relaxed space-y-4 pt-2 border-t border-slate-200">
            {selectedPost.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-base sm:text-lg font-bold text-slate-900 font-heading pt-4 pb-1 border-b border-slate-200">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-sm font-bold text-slate-900 font-heading pt-2">
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('> ')) {
                return (
                  <blockquote key={idx} className="p-3 bg-emerald-50 border-l-4 border-emerald-600 text-emerald-900 text-xs font-mono my-3">
                    {paragraph.replace('> ', '')}
                  </blockquote>
                );
              }
              if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1 text-xs font-mono text-slate-700">
                    {items.map((it, i) => (
                      <li key={i}>{it.replace(/^[\*\-]\s+/, '')}</li>
                    ))}
                  </ul>
                );
              }
              if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ')) {
                const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
                return (
                  <ol key={idx} className="list-decimal pl-5 space-y-1.5 text-xs font-mono text-slate-700">
                    {items.map((it, i) => (
                      <li key={i}>{it.replace(/^\d+\.\s+/, '')}</li>
                    ))}
                  </ol>
                );
              }
              if (paragraph.trim() === '---') {
                return <hr key={idx} className="border-slate-200 my-4" />;
              }
              return (
                <p key={idx} className="text-xs sm:text-sm text-slate-700 font-mono leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Keywords Tag Cloud */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-500 mr-1">Topics:</span>
            {selectedPost.keywords.map((kw) => (
              <span key={kw} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-[10px] text-slate-700">
                #{kw}
              </span>
            ))}
          </div>
        </article>

        {/* Feature Action Banner */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold uppercase tracking-wider font-heading flex items-center gap-2 justify-center sm:justify-start">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Put This Strategy to Work in Inventory360</span>
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              Test out the zero-latency POS, auto-save backups, and inventory valuation analytics directly inside your workspace.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('sell', 'quick-sale')}
              className="px-4 py-2 bg-emerald-500 text-slate-900 font-bold text-xs uppercase hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Launch POS Terminal &rarr;
            </button>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('home', 'retail-dashboard')}
              className="px-4 py-2 bg-white text-slate-900 font-bold text-xs uppercase hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: All Articles Grid View
  return (
    <div className="space-y-6 text-slate-900 font-mono">
      {/* 1. Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 uppercase tracking-wider font-heading">
              {t('knowledge_blog', 'Retail Engineering & Inventory Blog')}
            </h1>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Deep-dive guides on local-first POS systems, stock velocity math, barcode standards, and multi-channel fulfillment.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search 10 master guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-900 font-mono shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-700"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSubTabChange && onSubTabChange(cat.id)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
              activeSubTab === cat.id
                ? 'bg-slate-900 text-white font-bold shadow-2xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Blog Posts Cards Grid (10 Articles) */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-bold text-sm text-slate-800 uppercase">No articles found</p>
          <p className="text-xs text-slate-500">Try adjusting your search terms or category filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              if (onSubTabChange) onSubTabChange('all');
            }}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase hover:bg-black"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post, idx) => (
            <div
              key={post.slug}
              onClick={() => setSelectedPostSlug(post.slug)}
              className="bg-white border border-slate-200 p-5 flex flex-col justify-between space-y-4 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    {post.category}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2 font-heading">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-sans">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full border border-slate-300 object-cover"
                  />
                  <span className="text-[10px] font-bold text-slate-700">{post.author.name}</span>
                </div>

                <span className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1 text-[11px] uppercase">
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
