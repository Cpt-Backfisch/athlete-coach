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

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              ].join(' ')
            }
            style={({ isActive }) => (isActive ? { backgroundColor: ACCENT, color: '#fff' } : {})}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Benutzer-Bereich unten */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground truncate mb-2">{user?.email}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={14} />
          Abmelden
        </button>
      </div>
    </aside>
  );
}
