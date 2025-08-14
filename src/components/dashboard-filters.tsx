
"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange as DayPickerDateRange } from 'react-day-picker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from '@/lib/types';
import { cn } from '@/lib/utils';

export function DashboardFilters({ defaultDateRange }: { defaultDateRange: DateRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [date, setDate] = useState<DayPickerDateRange | undefined>({
    from: defaultDateRange.from,
    to: defaultDateRange.to,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date());
    setDate({
        from: parseISO(searchParams.get('from') || defaultDateRange.from.toISOString()),
        to: parseISO(searchParams.get('to') || defaultDateRange.to.toISOString())
    })
  }, [searchParams, defaultDateRange]);

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
  
  const handleDateSelect = (range: DayPickerDateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
        handleDateChange(range.from, range.to);
        setPopoverOpen(false);
    }
  }

  const isActive = (from: Date, to: Date) => {
    if (!isClient) return false;
    
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
      return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="w-[240px] justify-start text-left font-normal" disabled>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Carregando...
            </Button>
            {presets.map(({label}) => (
              <Button key={label} variant="outline" size="sm" className="hidden md:inline-flex" disabled>{label}</Button>
            ))}
        </div>
      )
  }

  const isCustomRangeActive = !presets.some(p => isActive(p.from, p.to));

  return (
    <div className="flex items-center gap-2">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
            <Button
                id="date"
                variant={isCustomRangeActive ? 'default' : 'outline'}
                size="sm"
                className={cn(
                'w-[260px] justify-start text-left font-normal'
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                date.to ? (
                    <>
                    {format(date.from, 'dd/MM/y', { locale: ptBR })} -{' '}
                    {format(date.to, 'dd/MM/y', { locale: ptBR })}
                    </>
                ) : (
                    format(date.from, 'dd/MM/y', { locale: ptBR })
                )
                ) : (
                <span>Selecione um período</span>
                )}
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

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

