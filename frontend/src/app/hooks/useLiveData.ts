import { useEffect, useRef } from 'react';
import { subscribeDataChanged } from '../services/realtime';

type UseLiveDataOptions = {
  enabled?: boolean;
  pollMs?: number;
  debounceMs?: number;
  refreshOnFocus?: boolean;
  refreshOnVisible?: boolean;
};

export const useLiveData = (
  refresh: () => void | Promise<void>,
  {
    enabled = true,
    pollMs = 15000,
    debounceMs = 350,
    refreshOnFocus = true,
    refreshOnVisible = true,
  }: UseLiveDataOptions = {},
) => {
  const refreshRef = useRef(refresh);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);
  const pendingRef = useRef(false);

  refreshRef.current = refresh;

  const runRefresh = async () => {
    if (runningRef.current) {
      pendingRef.current = true;
      return;
    }

    runningRef.current = true;
    try {
      await Promise.resolve(refreshRef.current());
    } finally {
      runningRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        void runRefresh();
      }
    }
  };

  const scheduleRefresh = () => {
    if (debounceMs <= 0) {
      void runRefresh();
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      void runRefresh();
    }, debounceMs);
  };

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribeDataChanged(() => {
      scheduleRefresh();
    });

    const handleFocus = () => {
      if (refreshOnFocus) scheduleRefresh();
    };

    const handleVisibility = () => {
      if (refreshOnVisible && document.visibilityState === 'visible') {
        scheduleRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    if (pollMs > 0) {
      intervalRef.current = setInterval(() => {
        scheduleRefresh();
      }, pollMs);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, pollMs, debounceMs, refreshOnFocus, refreshOnVisible]);
};

