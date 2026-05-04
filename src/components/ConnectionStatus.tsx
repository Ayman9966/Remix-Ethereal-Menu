import { useOnlineStatus } from '@/hooks/use-online-status';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function ConnectionStatus() {
  const { isOnline, showResynced } = useOnlineStatus();

  if (isOnline && !showResynced) {
    return (
      <span
        title="Online"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"
      >
        <Wifi className="h-4 w-4" />
      </span>
    );
  }

  if (showResynced) {
    return (
      <span
        title="Back online — data synced"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success animate-in fade-in"
      >
        <RefreshCw className="h-4 w-4" />
      </span>
    );
  }

  return (
    <span
      title="Offline — changes saved locally"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning"
    >
      <WifiOff className="h-4 w-4" />
    </span>
  );
}
