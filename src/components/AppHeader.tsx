import { Link, useLocation } from '@tanstack/react-router';
import { UtensilsCrossed, LayoutGrid, ChefHat, Menu as MenuIcon, Settings, X, Search, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useMenu } from '@/hooks/use-menu-context';

const navItems = [
  { to: '/pos', label: 'POS', icon: LayoutGrid },
  { to: '/kitchen', label: 'Kitchen', icon: ChefHat },
  { to: '/menu', label: 'Digital Menu', icon: UtensilsCrossed },
  { to: '/admin', label: 'Admin', icon: Settings },
] as const;

function SyncStatusIndicator() {
  const { syncStatus, pendingChangesCount } = useMenu();

  if (syncStatus === 'synced') {
    return (
      <div className="flex h-9 w-9 items-center justify-center text-emerald-500 hover:bg-surface-low rounded-lg transition-colors" title="Synced">
        <Cloud className="h-5 w-5" />
      </div>
    );
  }

  if (syncStatus === 'offline') {
    return (
      <div className="flex h-9 w-9 items-center justify-center text-slate-400 hover:bg-surface-low rounded-lg transition-colors" title="Offline">
        <CloudOff className="h-5 w-5" />
      </div>
    );
  }

  if (syncStatus === 'syncing' || pendingChangesCount > 0) {
    return (
      <div className="flex h-9 w-9 items-center justify-center text-amber-500 hover:bg-surface-low rounded-lg transition-colors" title={pendingChangesCount > 0 ? `${pendingChangesCount} pending` : 'Syncing...'}>
        <RefreshCw className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return null;
}

export function AppHeader() {
  const location = useLocation();
  const { brand, searchQuery, setSearchQuery, posViewMode, setPosViewMode } = useMenu();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavItems = navItems.filter((item) => {
    if (location.pathname === '/admin') return true;

    if (location.pathname === '/pos') return item.to === '/pos';
    if (location.pathname === '/kitchen') return item.to === '/kitchen';

    return true;
  });

  return (
    <header className="sticky top-0 z-50 glass shadow-ambient-sm">
      <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">
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

        <div className="hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-1">
          {visibleNavItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            
            if (to === '/pos' && location.pathname === '/pos') {
              return (
                <div key={to} className="flex bg-surface-low rounded-lg p-1">
                  <button
                    onClick={() => setPosViewMode('pos')}
                    className={`flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-all ${
                      posViewMode === 'pos'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    POS
                  </button>
                  <button
                    onClick={() => setPosViewMode('history')}
                    className={`flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium transition-all ${
                      posViewMode === 'history'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ChefHat className="h-4 w-4" />
                    History
                  </button>
                </div>
              );
            }

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
        </div>

        <div className="flex items-center gap-1">
          <SyncStatusIndicator />
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
