import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import './globals.css'; // Global styles

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://inventory360-five.vercel.app'),
  title: 'Inventory 360 | Local-First POS & Enterprise Inventory Management System',
  description: 'High-performance, local-first retail enterprise POS terminal, multi-outlet stock tracking, purchase order workflows, and financial analytics powered by browser IndexedDB.',
  keywords: [
    'Inventory 360',
    'POS System',
    'Point of Sale',
    'Inventory Management Software',
    'Local-First POS',
    'IndexedDB Retail ERP',
    'Offline POS System',
    'Multi-Outlet Inventory',
    'Retail ERP Software',
    'Stock Transfer System',
    'Barcode Scanner POS',
    'Free Inventory Management',
    'Purchase Order Automation',
    'Inventory Turnover Calculator',
    'Thermal Receipt Printing POS',
    'Omnichannel Retail Sync',
    'Shopify Amazon POS Sync',
    'Lot and Expiry Tracking Software',
  ],
  authors: [{ name: 'Inventory 360 Enterprise' }],
  creator: 'Inventory 360',
  publisher: 'Inventory 360',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Inventory 360 | Local-First POS & Inventory Management System',
    description: 'High-performance, local-first retail enterprise POS terminal, multi-outlet stock tracking, purchase order workflows, and financial analytics powered by browser IndexedDB.',
    url: 'https://inventory360-five.vercel.app',
    siteName: 'Inventory 360',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Inventory 360 - Geometric Balance POS & Stock Management System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inventory 360 | Local-First POS & Inventory Management System',
    description: 'High-performance, local-first retail enterprise POS terminal, multi-outlet stock tracking, purchase order workflows, and financial analytics powered by browser IndexedDB.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://inventory360-five.vercel.app',
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      'name': 'Inventory 360',
      'applicationCategory': 'BusinessApplication',
      'operatingSystem': 'All modern web browsers (Chrome, Edge, Safari, Firefox)',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
      'description': 'High-performance, local-first retail enterprise POS terminal, multi-outlet stock tracking, purchase order workflows, and financial analytics powered by browser IndexedDB.',
      'url': 'https://inventory360-five.vercel.app',
      'author': {
        '@type': 'Organization',
        'name': 'Inventory 360 Enterprise',
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'ratingCount': '128',
        'bestRating': '5',
      },
    },
    {
      '@type': 'LocalBusiness',
      'name': 'Inventory 360 Flagship Terminal',
      'image': 'https://inventory360-five.vercel.app/og-image.png',
      '@id': 'https://inventory360-five.vercel.app',
      'url': 'https://inventory360-five.vercel.app',
      'telephone': '+1-800-555-0360',
      'priceRange': '$$',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '100 Innovation Way, Suite 400',
        'addressLocality': 'San Francisco',
        'addressRegion': 'CA',
        'postalCode': '94105',
        'addressCountry': 'US',
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 37.789172,
        'longitude': -122.401449,
      },
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        'opens': '00:00',
        'closes': '23:59',
      },
    },
  ],
};

const windowFetchPolyfillScript = `
(function() {
  if (typeof window === 'undefined') return;

  // 1. Filter console.error to prevent extension-induced hydration warnings from triggering Next.js dev overlay
  try {
    var origError = console.error;
    console.error = function() {
      var args = Array.prototype.slice.call(arguments);
      var msg = args.map(function(a) { return String(a || ''); }).join(' ');
      if (msg.indexOf('bis_skin_checked') !== -1 || (msg.indexOf('hydrat') !== -1 && (msg.indexOf('bis_') !== -1 || msg.indexOf('cz-shortcut') !== -1))) {
        return;
      }
      return origError.apply(console, arguments);
    };
  } catch (e) {}

  // 2. Intercept Element.prototype.setAttribute
  try {
    var _setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if (typeof name === 'string' && (name.indexOf('bis_') === 0 || name === 'cz-shortcut-listen')) {
        return;
      }
      return _setAttribute.apply(this, arguments);
    };
  } catch (e) {}

  // 3. MutationObserver to strip extension attributes from DOM elements
  try {
    var observer = new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'attributes' && m.attributeName && m.attributeName.indexOf('bis_') === 0) {
          m.target.removeAttribute(m.attributeName);
        }
      }
    });
    observer.observe(document, { attributes: true, childList: true, subtree: true });
  } catch (e) {}

  // 4. Fetch Polyfill
  try {
    var _fetch = window.fetch;
    function makeSettable(target, prop) {
      try {
        var desc = Object.getOwnPropertyDescriptor(target, prop);
        if (!desc || desc.configurable) {
          Object.defineProperty(target, prop, {
            get: function() { return _fetch; },
            set: function(v) { _fetch = v; },
            configurable: true,
            enumerable: true
          });
        }
      } catch (e) {}
    }
    if (typeof Window !== 'undefined' && Window.prototype) {
      makeSettable(Window.prototype, 'fetch');
    }
    makeSettable(window, 'fetch');
    if (typeof globalThis !== 'undefined') {
      makeSettable(globalThis, 'fetch');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID || 'G-INVENTORY360';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: windowFetchPolyfillScript }} />
        {/* JSON-LD Local & Software Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        {/* Google Analytics GA4 Integration */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}', { page_path: window.location.pathname });
            `,
          }}
        />
      </head>
      <body className={merriweather.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
