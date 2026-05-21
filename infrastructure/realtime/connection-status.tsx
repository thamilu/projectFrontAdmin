/**
 * Real-Time Connection Status Indicator Component
 * Relocated to infrastructure/realtime since it couples directly with the websocket hook.
 */

'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWebSocketStatus } from '@/infrastructure/realtime/hooks/use-realtime-updates';

export function ConnectionStatus() {
  const { isConnected } = useWebSocketStatus();

  if (!isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-destructive text-destructive">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Real-time updates disconnected</p>
            <p className="text-xs text-muted-foreground">
              Attempting to reconnect...
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 border-emerald-500 text-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20">
            <Wifi className="h-3 w-3" />
            Connected
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Real-time status online</p>
          <p className="text-xs text-muted-foreground font-mono">
            WebSocket channel connected
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
