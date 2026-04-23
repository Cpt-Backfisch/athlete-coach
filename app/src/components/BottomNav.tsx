import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Trophy, MessageSquare, Settings } from 'lucide-react';
import { ACCENT } from '@/lib/theme';

// Die 5 wichtigsten Seiten für die Mobile-Bottom-Navigation
const NAV_LINKS = [
  { to: '/', Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/activities', Icon: Activity, label: 'Einheiten' },
  { to: '/events', Icon: Trophy, label: 'Events' },
  { to: '/coach', Icon: MessageSquare, label: 'Coach' },
  { to: '/settings', Icon: Settings, label: 'Einstellungen' },
];

export function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border flex items-start justify-around"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: '64px',
      }}
    >
      {NAV_LINKS.map(({ to, Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          aria-label={label}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] w-full pt-3"
          style={({ isActive }) =>
            isActive ? { color: ACCENT } : { color: 'var(--muted-foreground)' }
          }
        >
          <Icon size={22} strokeWidth={1.75} />
          <span className="text-[10px] font-medium leading-tight">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
