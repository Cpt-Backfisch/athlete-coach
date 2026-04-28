import { ACCENT } from '@/lib/theme';

// Sticky Top-Bar nur auf Mobile (md:hidden) — zeigt Wortmarke statt Seitenname
export function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border flex items-center px-4 h-[52px]">
      {/* Logo-Slot — leer, wartet auf späteres Logo */}
      <span className="text-base font-semibold tracking-tight">
        athlete<span style={{ color: ACCENT }}>.</span>coach
      </span>
    </header>
  );
}
