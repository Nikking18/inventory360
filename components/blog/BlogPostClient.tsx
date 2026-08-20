'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Share2,
  Check,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { BlogPost, BLOG_POSTS } from '../../lib/blogData';
import { SupportedLanguage } from '../../lib/i18n';
import { getBlogUIDictionary, getLocalizedPost } from '../../lib/blogI18n';
import { BlogContentRenderer } from '../common/BlogContentRenderer';
import { BlogHeader } from './BlogHeader';

interface BlogPostClientProps {
  initialPost: BlogPost;
  slug: string;
}

export const BlogPostClient: React.FC<BlogPostClientProps> = ({ initialPost, slug }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [copied, setCopied] = useState(false);

  // Load language preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('inventory360_language') as SupportedLanguage;
      if (stored) {
        setLanguage(stored);
      }
    } catch {}
  }, []);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    try {
      localStorage.setItem('inventory360_language', newLang);
    } catch {}
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const ui = getBlogUIDictionary(language);
  const isRtl = language === 'ar';
  const post = getLocalizedPost(initialPost, language);

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug)
    .slice(0, 2)
    .map((p) => getLocalizedPost(p, language));

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 text-slate-900 font-mono flex flex-col justify-between">
      {/* 1. TOP PORTAL HEADER WITH LANGUAGE SWITCHER */}
      <BlogHeader currentLanguage={language} onLanguageChange={handleLanguageChange} />

      {/* 2. MAIN ARTICLE CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 w-full flex-1">
        {/* Navigation Breadcrumb & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 uppercase">
            <Link href="/" className="hover:text-slate-900 font-semibold">{ui.home}</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-slate-900 font-semibold">{ui.blog}</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-[340px]">{post.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share / Copy Button */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title={ui.shareArticle}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{ui.shareArticle}</span>
                </>
              )}
            </button>

            {/* Back Button */}
            <Link
              href="/blog"
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-slate-900 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{ui.backToArticles}</span>
            </Link>
          </div>
        </div>

        {/* Article Header Card */}
        <div className="bg-white border border-slate-200 p-6 sm:p-10 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[10px] font-bold text-slate-900 uppercase px-2.5 py-1 bg-slate-100 border border-slate-200">
              {post.category}
            </span>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime.replace('min read', ui.readTime)}</span>
              <span>•</span>
              <span>{ui.publishedOn} {post.publishedAt}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight font-heading leading-tight">
            {post.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-l-2 border-emerald-500 pl-4 font-sans">
            {post.excerpt}
          </p>
        </div>

        {/* Main Content Body Card */}
        <div className="bg-white border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 leading-relaxed text-slate-800 text-xs sm:text-sm">
          {/* Table of Contents */}
          {post.tableOfContents && post.tableOfContents.length > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-heading">
                {ui.tableOfContents}
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 font-sans">
                {post.tableOfContents.map((toc, idx) => (
                  <li key={idx}>
                    <a
                      href={`#${toc.id}`}
                      className="hover:text-emerald-700 hover:underline flex items-center gap-2"
                    >
                      <span className="text-[10px] text-emerald-700 font-bold font-mono">0{idx + 1}.</span>
                      <span className="text-slate-800 hover:text-emerald-800">{toc.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Render Content Markdown */}
          <div className="pt-2">
            <BlogContentRenderer content={post.content} />
          </div>

          {/* Keyword Tags */}
          <div className="pt-6 border-t border-slate-200 space-y-2">
            <h4 className="text-[11px] font-bold uppercase text-slate-500 font-heading">
              {ui.relatedTopics}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {post.keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 uppercase font-mono"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. RELATED ARTICLES */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">
              {ui.recommendedReading}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.slug}
                  className="bg-white border border-slate-200 p-5 shadow-xs hover:border-slate-400 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-500 px-1.5 py-0.5 bg-slate-100">
                      {rel.category}
                    </span>
                    <Link href={`/blog/${rel.slug}`}>
                      <h4 className="font-bold text-xs text-slate-900 hover:text-emerald-700 leading-tight">
                        {rel.title}
                      </h4>
                    </Link>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{rel.excerpt}</p>
                  </div>
                  <Link
                    href={`/blog/${rel.slug}`}
                    className="text-[10px] font-bold text-slate-900 hover:text-emerald-700 uppercase flex items-center gap-1 pt-2"
                  >
                    <span>{ui.readArticle}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. WORKSPACE CTA CARD */}
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

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/blog" className="hover:text-slate-900 font-bold">
            ← {ui.backToArticles}
          </Link>
          <span>© {new Date().getFullYear()} {ui.footerRights}</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900">{ui.home}</Link>
            <Link href="/privacy" className="hover:text-slate-900">{ui.footerPrivacy}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
