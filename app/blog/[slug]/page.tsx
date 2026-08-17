import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { BLOG_POSTS, getBlogPostBySlug } from '../../../lib/blogData';
import {
  ArrowLeft,
  Clock,
  Tag,
  Share2,
  Bookmark,
  Home,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Inventory 360',
    };
  }

  return {
    title: `${post.title} | Inventory 360 Engineering Blog`,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    alternates: {
      canonical: `https://inventory360-five.vercel.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://inventory360-five.vercel.app/blog/${post.slug}`,
      siteName: 'Inventory 360',
      type: 'article',
      publishedTime: '2026-08-14T00:00:00Z',
      authors: [post.author.name],
      tags: post.keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  const jsonLdArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.metaDescription,
    'url': `https://inventory360-five.vercel.app/blog/${post.slug}`,
    'datePublished': '2026-08-14T00:00:00Z',
    'dateModified': '2026-08-17T00:00:00Z',
    'author': {
      '@type': 'Person',
      'name': post.author.name,
      'jobTitle': post.author.role,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Inventory 360 Enterprise',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://inventory360-five.vercel.app/icon.png',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://inventory360-five.vercel.app/blog/${post.slug}`,
    },
    'keywords': post.keywords.join(', '),
  };

  // Convert markdown format to HTML
  const formatMarkdownToHTML = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-900 mt-8 mb-3 font-heading">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-slate-900 mt-6 mb-2 font-heading">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 border border-slate-300 text-slate-900 font-mono text-xs">$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote class="p-4 my-4 bg-slate-50 border-l-4 border-slate-900 text-slate-800 text-xs italic leading-relaxed">$1</blockquote>')
      .replace(/---/g, '<hr class="my-6 border-slate-200" />');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-mono flex flex-col justify-between">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticleSchema) }}
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

          <nav className="flex items-center gap-4 text-xs font-mono">
            <Link
              href="/blog"
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>All Articles</span>
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 bg-slate-900 text-white font-bold uppercase tracking-wider text-xs hover:bg-black transition-colors shadow-xs"
            >
              Launch App
            </Link>
          </nav>
        </div>
      </header>

      {/* 2. MAIN ARTICLE CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono uppercase">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-900">Blog</Link>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[250px]">{post.title}</span>
        </div>

        {/* Article Header Card */}
        <div className="bg-white border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[10px] font-bold text-slate-900 uppercase px-2.5 py-1 bg-slate-100 border border-slate-200">
              {post.category}
            </span>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
              <span>•</span>
              <span>Published {post.publishedAt}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight font-heading leading-tight">
            {post.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-l-2 border-emerald-500 pl-4">
            {post.excerpt}
          </p>

          {/* Author Block */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-2xs"
              />
              <div>
                <p className="font-bold text-xs text-slate-900">{post.author.name}</p>
                <p className="text-[10px] text-slate-500">{post.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {post.keywords.slice(0, 3).map((kw, i) => (
                <span
                  key={i}
                  className="text-[9px] bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 uppercase hidden sm:inline-block"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Article Body & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Body */}
          <div className="lg:col-span-3 bg-white border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6 leading-relaxed text-slate-800 text-xs sm:text-sm">
            {/* Table of Contents */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 font-heading">
                Table of Contents
              </h3>
              <ul className="space-y-1 text-xs text-slate-600">
                {post.tableOfContents.map((toc, idx) => (
                  <li key={idx}>
                    <a
                      href={`#${toc.id}`}
                      className="hover:text-emerald-700 hover:underline flex items-center gap-1.5"
                    >
                      <span className="text-[10px] text-slate-400 font-mono">0{idx + 1}.</span>
                      <span>{toc.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Render Content */}
            <div
              className="space-y-4 prose prose-slate max-w-none text-xs sm:text-sm"
              dangerouslySetInnerHTML={{ __html: formatMarkdownToHTML(post.content) }}
            />

            {/* Keyword Tags */}
            <div className="pt-6 border-t border-slate-200 space-y-2">
              <h4 className="text-[11px] font-bold uppercase text-slate-500 font-heading">
                Related Topics &amp; Enterprise Keywords:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {post.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 uppercase"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Side Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Launch App Card */}
            <div className="bg-slate-900 text-white p-5 border border-slate-800 space-y-3 sticky top-20 shadow-md">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Live POS Terminal</span>
              </div>
              <h4 className="font-bold text-sm font-heading leading-tight">
                Experience Local-First Speed
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Test sub-50ms barcode searches, purchase order automation, and sales reporting.
              </p>
              <Link
                href="/"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 3. RELATED ARTICLES */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-heading">
              Recommended Reading
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
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/blog" className="hover:text-slate-900 font-bold">
            ← Return to All Articles
          </Link>
          <span>© {new Date().getFullYear()} Inventory 360 Enterprise. Local-First Architecture.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
