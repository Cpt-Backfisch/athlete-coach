import { useCallback, useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 80;

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function usePullToRefresh({ onRefresh, disabled = false }: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || !isMobile || isRefreshing) return;
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
        isDraggingRef.current = false;
      }
    },
    [disabled, isMobile, isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || !isMobile || isRefreshing || startYRef.current === null) return;
      const deltaY = e.touches[0].clientY - startYRef.current;
      if (deltaY <= 0) {
        startYRef.current = null;
        return;
      }
      isDraggingRef.current = true;
      // sanftes Damping: Widerstand bei größerem Pull
      const damped = Math.min(deltaY * 0.45, PULL_THRESHOLD * 1.5);
      setPullDistance(damped);
      if (deltaY > 10) e.preventDefault();
    },
    [disabled, isMobile, isRefreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isMobile || !isDraggingRef.current) {
      setPullDistance(0);
      startYRef.current = null;
      return;
    }
    isDraggingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD * 0.45) {
      setPullDistance(0);
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
  }, [disabled, isMobile, pullDistance, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, isRefreshing };
}
