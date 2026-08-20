'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    kofiWidgetOverlay?: {
      draw: (username: string, options: Record<string, string>) => void;
    };
  }
}

export const KofiWidget: React.FC = () => {
  useEffect(() => {
    // Check if script already injected
    const existingScript = document.getElementById('kofi-overlay-script');

    const drawWidget = () => {
      if (typeof window !== 'undefined' && window.kofiWidgetOverlay) {
        // Prevent drawing multiple times
        const existingKofiContainer = document.querySelector('.kofi-floating-chat-container');
        if (!existingKofiContainer) {
          try {
            window.kofiWidgetOverlay.draw('nikhilkhanpara', {
              type: 'floating-chat',
              'floating-chat.donateButton.text': 'Support me',
              'floating-chat.donateButton.background-color': '#323842',
              'floating-chat.donateButton.text-color': '#fff',
            });
          } catch (e) {
            console.error('Error initializing Ko-fi widget:', e);
          }
        }
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'kofi-overlay-script';
      script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
      script.async = true;
      script.onload = () => {
        drawWidget();
      };
      document.body.appendChild(script);
    } else {
      drawWidget();
    }
  }, []);

  return null;
};
