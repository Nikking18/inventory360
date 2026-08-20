import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { BLOG_POSTS, getBlogPostBySlug } from '../../../lib/blogData';
import { BlogPostClient } from '../../../components/blog/BlogPostClient';

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
    authors: [{ name: post.author.name, url: 'https://inventory360.shop' }],
    alternates: {
      canonical: `https://inventory360.shop/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://inventory360.shop/blog/${post.slug}`,
      siteName: 'Inventory 360',
      type: 'article',
      publishedTime: '2026-08-14T00:00:00Z',
      modifiedTime: '2026-08-20T00:00:00Z',
      authors: [post.author.name],
      tags: post.keywords,
      images: [
        {
          url: 'https://inventory360.shop/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: ['https://inventory360.shop/og-image.png'],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLdArticleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        '@id': `https://inventory360.shop/blog/${post.slug}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://inventory360.shop',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Blog',
            'item': 'https://inventory360.shop/blog',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': post.title,
            'item': `https://inventory360.shop/blog/${post.slug}`,
          },
        ],
      },
      {
        '@type': 'TechArticle',
        '@id': `https://inventory360.shop/blog/${post.slug}#article`,
        'headline': post.title,
        'description': post.metaDescription,
        'url': `https://inventory360.shop/blog/${post.slug}`,
        'datePublished': '2026-08-14T00:00:00Z',
        'dateModified': '2026-08-20T00:00:00Z',
        'image': 'https://inventory360.shop/og-image.png',
        'author': {
          '@type': 'Person',
          'name': post.author.name,
          'jobTitle': post.author.role,
        },
        'publisher': {
          '@type': 'Organization',
          '@id': 'https://inventory360.shop/#organization',
          'name': 'Inventory 360 Enterprise',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://inventory360.shop/icon.png',
          },
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `https://inventory360.shop/blog/${post.slug}`,
        },
        'keywords': post.keywords.join(', '),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticleSchema) }}
      />
      <BlogPostClient initialPost={post} slug={slug} />
    </>
  );
}
