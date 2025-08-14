
"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, parseISO, startOfToday } from 'date-fns';
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
  const [date, setDate] = useState<DayPickerDateRange | undefined>({
    from: defaultDateRange.from,
    to: defaultDateRange.to,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam && toParam) {
      setDate({
        from: parseISO(fromParam),
        to: parseISO(toParam)
      })
    } else {
        setDate({
            from: defaultDateRange.from,
            to: defaultDateRange.to
        })
    }
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
    if (!date?.from || !date?.to) return false;
    return format(date.from, 'yyyy-MM-dd') === format(from, 'yyyy-MM-dd') &&
           format(date.to, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd');
  };
  
  const presets = [
    { label: 'Este Mês', from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    { label: 'Últimos 7 dias', from: subDays(new Date(), 6), to: new Date() },
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
                variant={'outline'}
                size="sm"
                className={cn(
                'w-[260px] justify-start text-left font-normal',
                 isCustomRangeActive && "border-primary text-primary"
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
          onClick={() => {
            setDate({ from, to });
            handleDateChange(from, to);
          }}
          className={cn((!isActive(from, to) && label !== 'Este Mês') && "hidden md:inline-flex")}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
