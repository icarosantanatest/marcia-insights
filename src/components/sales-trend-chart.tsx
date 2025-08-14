"use client";

import type { SalesByPeriod } from '@/lib/types';
import { CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Line, LineChart, YAxis } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

interface SalesTrendChartProps {
  data: SalesByPeriod[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <ChartContainer config={{
        Vendas: {
            label: "Vendas",
            color: "hsl(var(--primary))",
        }
    }}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 5)}
          />
          <YAxis 
            tick={false}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={false} content={<ChartTooltipContent indicator="line" formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)} />} />
          <Line
            dataKey="Vendas"
            type="monotone"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
