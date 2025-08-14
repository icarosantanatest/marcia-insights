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

  useEffect(() => {
    setIsClient(true);
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
    return format(defaultDateRange.from, 'yyyy-MM-dd') === format(from, 'yyyy-MM-dd') &&
           format(defaultDateRange.to, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd');
  };

  if (!isClient) {
      return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:inline-flex" disabled>Este Mês</Button>
            <Button variant="outline" size="sm" className="hidden md:inline-flex" disabled>Últimos 7 dias</Button>
            <Button variant="outline" size="sm" className="hidden md:inline-flex" disabled>Últimos 30 dias</Button>
            <Button variant="outline" size="sm" className="hidden md:inline-flex" disabled>Últimos 90 dias</Button>
        </div>
      )
  }

  const today = new Date();
  const presets = [
    { label: 'Este Mês', from: startOfMonth(today), to: endOfMonth(today) },
    { label: 'Últimos 7 dias', from: subDays(today, 6), to: today },
    { label: 'Últimos 30 dias', from: subDays(today, 29), to: today },
    { label: 'Últimos 90 dias', from: subDays(today, 89), to: today },
  ];

  return (
    <div className="flex items-center gap-2">
      {presets.map(({ label, from, to }) => (
        <Button
          key={label}
          variant={isActive(from, to) ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleDateChange(from, to)}
          className={cn(!isActive(from, to) && "hidden md:inline-flex")}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
