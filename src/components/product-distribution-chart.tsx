"use client";

import type { SalesByProduct } from '@/lib/types';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

interface ProductDistributionChartProps {
  data: SalesByProduct[];
}

export function ProductDistributionChart({ data }: ProductDistributionChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const topProducts = data.slice(0, 5).reverse(); // Reverse to show top product at the top

  const chartConfig = topProducts.reduce((acc, product) => {
    acc[product.name] = {
      label: product.name,
      color: product.fill,
    };
    return acc;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height={250}>
            <BarChart 
                layout="vertical" 
                data={topProducts}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    width={150}
                    />
                <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent 
                        formatter={(value, name, props) => {
                            const { payload } = props;
                            const salesCount = payload.sales;
                            return (
                               <div className="flex flex-col gap-1">
                                    <span className="font-bold">{payload.name}</span>
                                    <span>Faturamento: {formatCurrency(value as number)}</span>
                                    <span>Vendas: {salesCount}</span>
                                </div>
                            )
                        }}
                        hideLabel 
                    />}
                />
                <Bar dataKey="revenue" layout="vertical" radius={4} barSize={30}>
                    {topProducts.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}
