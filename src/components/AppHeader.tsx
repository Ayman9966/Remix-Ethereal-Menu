import { Link, useLocation } from '@tanstack/react-router';
import { UtensilsCrossed, LayoutGrid, ChefHat, Menu as MenuIcon, Settings, X, Search } from 'lucide-react';
import { useState } from 'react';
import { useMenu } from '@/hooks/use-menu-context';
import { ConnectionStatus } from '@/components/ConnectionStatus';

const navItems = [
  { to: '/pos', label: 'POS', icon: LayoutGrid },
  { to: '/kitchen', label: 'Kitchen', icon: ChefHat },
  { to: '/menu', label: 'Digital Menu', icon: UtensilsCrossed },
  { to: '/admin', label: 'Admin', icon: Settings },
] as const;

export function AppHeader() {
  const location = useLocation();
  const { brand, searchQuery, setSearchQuery } = useMenu();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavItems = navItems.filter((item) => {
    if (location.pathname === '/admin') return true;

    if (location.pathname === '/pos') return item.to === '/pos';
    if (location.pathname === '/kitchen') return item.to === '/kitchen';

    return true;
  });

  return (
    <header className="sticky top-0 z-50 glass shadow-ambient-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            {brand.restaurantName}
          </span>
        </Link>
        
        {location.pathname === '/pos' && (
          <div className="relative mx-4 flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-surface-low py-2 pl-10 pr-4 text-sm outline-none border border-border focus:border-primary"
            />
          </div>
        )}

        <nav className="hidden items-center gap-1 md:flex">
          {visibleNavItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-surface-low hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <ConnectionStatus />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-low md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/30 bg-card px-4 pb-4 pt-2 md:hidden">
          {visibleNavItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-surface-low'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
