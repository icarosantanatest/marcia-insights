"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { DateRange } from '@/lib/types';
import { cn } from '@/lib/utils';

export function DashboardFilters({ defaultDateRange }: { defaultDateRange: DateRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    setIsClient(true);
    // Set 'now' only on the client to ensure consistency
    setNow(new Date());
  }, []);

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        newSearchParams.set(key, value);
      }
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleDateChange = (from: Date, to: Date) => {
    router.push(pathname + '?' + createQueryString({ from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') }));
  };

  const isActive = (from: Date, to: Date) => {
    // Ensure defaultDateRange is client-side consistent before comparing
    if (!isClient) return false;
    return format(defaultDateRange.from, 'yyyy-MM-dd') === format(from, 'yyyy-MM-dd') &&
           format(defaultDateRange.to, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd');
  };
  
  const presets = [
    { label: 'Este Mês', from: startOfMonth(now), to: endOfMonth(now) },
    { label: 'Últimos 7 dias', from: subDays(now, 6), to: now },
    { label: 'Últimos 30 dias', from: subDays(now, 29), to: now },
    { label: 'Últimos 90 dias', from: subDays(now, 89), to: now },
  ];

  if (!isClient) {
      return (
        <div className="flex items-center gap-2">
            {presets.map(({label}) => (
              <Button key={label} variant="outline" size="sm" className="hidden md:inline-flex" disabled>{label}</Button>
            ))}
        </div>
      )
  }

  return (
    <div className="flex items-center gap-2">
      {presets.map(({ label, from, to }) => (
        <Button
          key={label}
          variant={isActive(from, to) ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleDateChange(from, to)}
          className={cn((!isActive(from, to) && label !== 'Este Mês') && "hidden md:inline-flex")}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
