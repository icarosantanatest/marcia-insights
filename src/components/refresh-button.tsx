"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // router.refresh() re-fetches data for the current route
    await router.refresh();
    // A small delay to make the animation visible
    setTimeout(() => {
        setIsRefreshing(false);
    }, 500);
  };

  return (
    <Button onClick={handleRefresh} disabled={isRefreshing} size="icon" variant="outline">
      <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
      <span className="sr-only">Atualizar</span>
    </Button>
  );
}
