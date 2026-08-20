'use client';

import { useEffect, useCallback } from 'react';

const CHANNEL_NAME = 'inventory360_realtime_sync';

/**
 * Hook to coordinate multi-tab / multi-window database state synchronization via BroadcastChannel.
 */
export function useBroadcastSync(onRemoteChange?: () => void) {
  const broadcastChange = useCallback(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: 'DATA_UPDATED', timestamp: Date.now() });
        bc.close();
      } catch (err) {
        console.warn('BroadcastChannel sync failed:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window) || !onRemoteChange) {
      return;
    }

    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data?.type === 'DATA_UPDATED') {
        onRemoteChange();
      }
    };

    return () => {
      try {
        bc.close();
      } catch {}
    };
  }, [onRemoteChange]);

  return { broadcastChange };
}
