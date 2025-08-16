"use client";

import type { SalesByProduct } from '@/lib/types';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface ProductDistributionChartProps {
  data: SalesByProduct[];
}

export function ProductDistributionChart({ data }: ProductDistributionChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const topProducts = data.slice(0, 5);

  const chartConfig = topProducts.reduce((acc, product) => {
    acc[product.name] = {
      label: product.name,
      color: product.fill,
    };
    return acc;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel formatter={(value, name, item) => {
                        const payload = item.payload as SalesByProduct;
                        return (
                            <div className="flex flex-col">
                                <span className="font-bold">{payload.name}</span>
                                <span>{formatCurrency(payload.revenue)} ({payload.sales} vendas)</span>
                            </div>
                        )
                    }} />}
                />
                <Pie data={topProducts} dataKey="revenue" nameKey="name" innerRadius="60%" cy="50%">
                    {topProducts.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                </Pie>
                 <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: 20 }}
                />
            </PieChart>
        </ResponsiveContainer>
    </ChartContainer>
  );
}
