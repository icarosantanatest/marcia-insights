"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { DateRange } from '@/lib/types';
import { cn } from '@/lib/utils';

export function DashboardFilters({ defaultDateRange }: { defaultDateRange: DateRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  
  // Use a state for the current date to ensure consistency on the client
  const [currentDate, setCurrentDate] = useState(() => new Date());

  useEffect(() => {
    setIsClient(true);
    // This will run only on the client, so `new Date()` will be consistent
    // with other client-side date calculations.
    setCurrentDate(new Date());
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
    if (!isClient) return false;
    
    // The defaultDateRange comes from the server and might be a string.
    // We parse it to ensure we are comparing Date objects.
    const serverFrom = typeof defaultDateRange.from === 'string' ? parseISO(defaultDateRange.from) : defaultDateRange.from;
    const serverTo = typeof defaultDateRange.to === 'string' ? parseISO(defaultDateRange.to) : defaultDateRange.to;

    return format(serverFrom, 'yyyy-MM-dd') === format(from, 'yyyy-MM-dd') &&
           format(serverTo, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd');
  };
  
  const presets = [
    { label: 'Este Mês', from: startOfMonth(currentDate), to: endOfMonth(currentDate) },
    { label: 'Últimos 7 dias', from: subDays(currentDate, 6), to: currentDate },
    { label: 'Últimos 30 dias', from: subDays(currentDate, 29), to: currentDate },
    { label: 'Últimos 90 dias', from: subDays(currentDate, 89), to: currentDate },
  ];

  if (!isClient) {
      // Render disabled buttons on the server to avoid hydration mismatch
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
