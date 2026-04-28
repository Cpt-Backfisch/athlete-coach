import { useEffect, useRef, useState } from 'react';

const LAST_ACTIVE_KEY = 'ac_lastActive';
const COLD_THRESHOLD_MS = 5 * 60 * 1000; // 5 Minuten

function isColdStart(): boolean {
  try {
    const last = localStorage.getItem(LAST_ACTIVE_KEY);
    if (!last) return true;
    return Date.now() - parseInt(last, 10) > COLD_THRESHOLD_MS;
  } catch {
    return false;
  }
}

function updateLastActive() {
  try {
    localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
  } catch {
    // Storage nicht verfügbar — kein Splash
  }
}

export function SplashScreen() {
  const [visible, setVisible] = useState(() => isColdStart());
  const [animating, setAnimating] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    if (!visible || hasShown.current) return;
    hasShown.current = true;
    updateLastActive();

    const pauseTimer = setTimeout(() => {
      setAnimating(true);
    }, 300);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 900);

    return () => {
      clearTimeout(pauseTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  // Letzte aktive Zeit beim Verlassen der Seite aktualisieren
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') updateLastActive();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center pointer-events-none">
      <span
        className={`text-2xl font-semibold tracking-tight select-none ${animating ? 'splash-zoom-out' : ''}`}
      >
        athlete
        <span style={{ color: 'var(--sport-run)' }}>·</span>
        coach
      </span>
    </div>
  );
}
