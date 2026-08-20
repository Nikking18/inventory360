import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BLOG_POSTS } from '../../lib/blogData';
import {
  BookOpen,
  ArrowRight,
  Clock,
  Tag,
  ShieldCheck,
  Search,
  ChevronRight,
  Home,
  Sparkles,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Inventory & POS Operations Blog | Inventory 360 Enterprise',
  description: 'Expert guides on local-first POS systems, inventory turnover ratios, omnichannel retail fulfillment, lot & expiry tracking, and barcode label workflows.',
  keywords: [
    'inventory management blog',
    'POS system guides',
    'local-first retail architecture',
    'inventory turnover formula',
    'omnichannel stock synchronization',
    'barcode label printing tutorial',
    'lot and expiry tracking best practices',
  ],
  alternates: {
    canonical: 'https://inventory360.shop/blog',
  },
  openGraph: {
    title: 'Inventory & POS Operations Blog | Inventory 360',
    description: 'Expert guides on local-first POS systems, inventory turnover ratios, omnichannel retail fulfillment, lot & expiry tracking, and barcode label workflows.',
    url: 'https://inventory360.shop/blog',
    siteName: 'Inventory 360',
    type: 'website',
    images: [
      {
        url: 'https://inventory360.shop/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Inventory 360 Engineering & Retail Strategy Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inventory & POS Operations Blog | Inventory 360',
    description: 'Expert guides on local-first POS systems, inventory turnover ratios, omnichannel retail fulfillment, lot & expiry tracking, and barcode label workflows.',
    images: ['https://inventory360.shop/og-image.png'],
  },
};

export default function BlogIndexPage() {
  const featuredPost = BLOG_POSTS[0];
  const regularPosts = BLOG_POSTS.slice(1);

  const jsonLdBlogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://inventory360.shop/blog/#blog',
    'name': 'Inventory 360 Operational Insights & Retail ERP Blog',
    'description': 'Expert guides on local-first POS systems, inventory turnover ratios, omnichannel retail fulfillment, and barcode workflows.',
    'url': 'https://inventory360.shop/blog',
    'publisher': {
      '@type': 'Organization',
      '@id': 'https://inventory360.shop/#organization',
      'name': 'Inventory 360 Enterprise',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://inventory360.shop/icon.png',
      },
    },
    'blogPost': BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      '@id': `https://inventory360.shop/blog/${post.slug}#article`,
      'headline': post.title,
      'description': post.excerpt,
      'url': `https://inventory360.shop/blog/${post.slug}`,
      'datePublished': '2026-08-14T00:00:00Z',
      'dateModified': '2026-08-20T00:00:00Z',
      'author': {
        '@type': 'Person',
        'name': post.author.name,
      },
      'keywords': post.keywords.join(', '),
      'image': 'https://inventory360.shop/og-image.png',
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-mono flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlogSchema) }}
      />

      {/* 1. TOP PORTAL HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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

          <nav className="flex items-center gap-3 text-xs font-mono">
            <Link
              href="/"
              className="px-4 py-2 bg-slate-900 text-white font-bold uppercase tracking-wider text-xs hover:bg-black transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. HERO HEADER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 w-full flex-1">
        {/* Breadcrumb Header */}
        <div className="space-y-3 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono uppercase">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <span>/</span>
            <span className="text-slate-900 font-bold">Knowledge Base &amp; Retail Guides</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Retail ERP &amp; Inventory Operations</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight font-heading">
            Engineering High-Velocity Retail Systems
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            In-depth guides on local-first POS engineering, inventory turnover mathematics, omnichannel marketplace synchronization, and regulatory lot tracking.
          </p>
        </div>

        {/* 3. FEATURED POST CARD */}
        {featuredPost && (
          <div className="bg-white border border-slate-200 p-6 sm:p-8 shadow-sm hover:border-slate-400 transition-all space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 uppercase tracking-wider">
                ★ Featured Master Guide
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{featuredPost.readTime}</span>
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
                <span>Read Master Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 4. ARTICLES GRID */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">
              All Publications &amp; Engineering Articles ({BLOG_POSTS.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono uppercase">
              Updated August 2026
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
                      <span>{post.readTime}</span>
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
                      <span>Read</span>
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
              Ready to Upgrade Your Retail Workflow?
            </h3>
            <p className="text-xs !text-slate-200 text-slate-200 max-w-xl leading-relaxed">
              Launch Inventory 360 directly inside your browser. 100% offline-ready, sub-50ms local barcode searches, thermal receipts, and encrypted backups.
            </p>
          </div>

          <Link
            href="/"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 !text-slate-950 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shrink-0 shadow-lg"
          >
            <span>Launch Inventory 360</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="hover:text-slate-900 font-bold">
            ← Return to Inventory 360 Main Portal
          </Link>
          <span>© {new Date().getFullYear()} Inventory 360 Enterprise. Local-First Architecture.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/thank-you" className="hover:text-slate-900">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
