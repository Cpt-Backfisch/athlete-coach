import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Trophy,
  CalendarDays,
  MessageSquare,
  Upload,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { ProfileModal } from './ProfileModal';
import { AvatarIcon } from './AvatarIcon';
import { ACCENT } from '@/lib/theme';

// Nav-Einträge der Sidebar
const NAV_LINKS = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/activities', label: 'Einheiten', Icon: Activity },
  { to: '/events', label: 'Events', Icon: Trophy },
  { to: '/training', label: 'Trainingsplan', Icon: CalendarDays },
  { to: '/coach', label: 'Coach', Icon: MessageSquare },
  { to: '/import', label: 'Import', Icon: Upload },
  { to: '/settings', label: 'Einstellungen', Icon: Settings },
];

interface SidebarProps {
  isSyncing?: boolean;
}

export function Sidebar({ isSyncing = false }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profilOffen, setProfilOffen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <aside className="hidden md:flex md:w-[220px] md:flex-shrink-0 md:flex-col md:fixed md:inset-y-0 md:left-0 bg-card border-r border-border">
      {/* Wordmark */}
      <div className="px-5 py-6">
        <span className="text-base font-semibold tracking-tight">
          athlete<span style={{ color: ACCENT }}>.</span>coach
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              ].join(' ')
            }
            style={({ isActive }) =>
              isActive ? { backgroundColor: `${ACCENT}22`, color: ACCENT } : {}
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sync-Indikator — nur sichtbar wenn Auto-Sync läuft */}
      {isSyncing && (
        <p className="px-5 py-2 text-xs text-muted-foreground animate-pulse">Synchronisiere…</p>
      )}

      {/* Benutzer-Bereich + Theme-Toggle unten */}
      <div className="px-4 py-4 border-t border-border space-y-2">
        {/* Profil-Avatar-Button */}
        <button
          onClick={() => setProfilOffen(true)}
          className="flex items-center gap-2.5 w-full rounded-lg px-1 py-1 hover:bg-muted transition-colors group"
          aria-label="Athletenprofil öffnen"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden border border-border group-hover:border-primary transition-colors flex-shrink-0">
            <AvatarIcon size={28} />
          </div>
          <span className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
            Profil
          </span>
        </button>
        <ThemeToggle />
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={14} />
          Abmelden
        </button>
      </div>

      <ProfileModal open={profilOffen} onClose={() => setProfilOffen(false)} />
    </aside>
  );
}
