import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inventory 360 | Local-First POS & Enterprise Inventory System',
    short_name: 'Inventory 360',
    description:
      'High-performance, local-first retail enterprise POS terminal, multi-outlet stock tracking, and financial analytics powered by browser IndexedDB.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'any',
    id: 'inventory360-app',
    categories: ['business', 'finance', 'productivity', 'utilities'],
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
