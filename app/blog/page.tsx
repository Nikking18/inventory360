import React from 'react';
import { Metadata } from 'next';
import { BLOG_POSTS } from '../../lib/blogData';
import { BlogIndexClient } from '../../components/blog/BlogIndexClient';

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
    canonical: 'https://www.inventory360.shop/blog',
  },
  openGraph: {
    title: 'Inventory & POS Operations Blog | Inventory 360',
    description: 'Expert guides on local-first POS systems, inventory turnover ratios, omnichannel retail fulfillment, lot & expiry tracking, and barcode label workflows.',
    url: 'https://www.inventory360.shop/blog',
    siteName: 'Inventory 360',
    type: 'website',
    images: [
      {
        url: 'https://www.inventory360.shop/og-image.png',
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
    images: ['https://www.inventory360.shop/og-image.png'],
  },
};

export default function BlogIndexPage() {
  const jsonLdBlogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://www.inventory360.shop/blog/#blog',
    'name': 'Inventory 360 Operational Insights & Retail ERP Blog',
    'description': 'Expert guides on local-first POS systems, inventory turnover ratios, omnichannel retail fulfillment, and barcode workflows.',
    'url': 'https://www.inventory360.shop/blog',
    'publisher': {
      '@type': 'Organization',
      '@id': 'https://www.inventory360.shop/#organization',
      'name': 'Inventory 360 Enterprise',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.inventory360.shop/icon.png',
      },
    },
    'blogPost': BLOG_POSTS.map((post) => ({
      '@type': 'BlogPosting',
      '@id': `https://www.inventory360.shop/blog/${post.slug}#article`,
      'headline': post.title,
      'description': post.excerpt,
      'url': `https://www.inventory360.shop/blog/${post.slug}`,
      'datePublished': '2026-08-14T00:00:00Z',
      'dateModified': '2026-08-20T00:00:00Z',
      'author': {
        '@type': 'Person',
        'name': post.author.name,
      },
      'keywords': post.keywords.join(', '),
      'image': 'https://www.inventory360.shop/og-image.png',
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlogSchema) }}
      />
      <BlogIndexClient />
    </>
  );
}
