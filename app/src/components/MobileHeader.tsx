import { useState } from 'react';
import { ACCENT } from '@/lib/theme';
import { ProfileModal } from './ProfileModal';
import { AvatarIcon } from './AvatarIcon';

// Sticky Top-Bar nur auf Mobile (md:hidden) — zeigt Wortmarke statt Seitenname
export function MobileHeader() {
  const [profilOffen, setProfilOffen] = useState(false);

  return (
    <>
      <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-card border-b border-border flex items-center justify-between px-4 h-[52px]">
        {/* Wortmarke */}
        <span className="text-base font-semibold tracking-tight">
          athlete<span style={{ color: ACCENT }}>.</span>coach
        </span>

        {/* Profil-Avatar-Button */}
        <button
          onClick={() => setProfilOffen(true)}
          className="w-8 h-8 rounded-full overflow-hidden border border-border hover:border-primary transition-colors flex-shrink-0"
          aria-label="Athletenprofil öffnen"
        >
          <AvatarIcon />
        </button>
      </header>

      <ProfileModal open={profilOffen} onClose={() => setProfilOffen(false)} />
    </>
  );
}
