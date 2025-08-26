"use client";

import type { SalesByPeriod } from '@/lib/types';
import { CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Line, LineChart, YAxis } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

interface SalesTrendChartProps {
  data: SalesByPeriod[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <ChartContainer config={{
        Vendas: {
            label: "Vendas",
            color: "hsl(var(--primary))",
        }
    }}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="date" 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis 
            tick={false}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            cursor={false} 
            content={
              <ChartTooltipContent
                indicator="line"
                formatter={(value, name, props) => {
                  const { payload } = props;
                  const salesCount = payload.count;
                  return (
                    <div className="flex flex-col gap-1">
                       <span className="font-bold text-lg">{payload.date}</span>
                       <span className="text-sm">Faturamento: {formatCurrency(value as number)}</span>
                       <span className="text-sm">Vendas: {salesCount}</span>
                    </div>
                  )
                }}
              />
            }
          />
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
