/**
 * Network Status Component
 * 
 * Displays online/offline status indicator.
 * Automatically detects connectivity changes.
 * 
 * @module shared/ui/network-status
 */

'use client';

import { useEffect, useState, useSyncExternalStore, useRef } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { announce } from './screen-reader-announcer';

const subscribeOnline = (callback: () => void) => {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
};

const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

/**
 * Network Status Indicator
 * 
 * Shows banner when user goes offline or comes back online.
 * Automatically hides after 3 seconds when online.
 * 
 * @example
 * ```tsx
 * <NetworkStatus />
 * ```
 */
export function NetworkStatus() {
  const isOnline = useSyncExternalStore(subscribeOnline, getSnapshot, getServerSnapshot);
  const [showBanner, setShowBanner] = useState(false);
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }

    Promise.resolve().then(() => {
      setShowBanner(true);
    });

    if (isOnline) {
      announce('You are back online', 'polite');
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    } else {
      announce('You are offline. Some features may not work.', 'assertive');
    }
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg px-4 py-2',
        'text-sm font-medium shadow-lg transition-all duration-300',
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-yellow-500 text-yellow-900'
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          You&apos;re offline
        </>
      )}
    </div>
  );
}
