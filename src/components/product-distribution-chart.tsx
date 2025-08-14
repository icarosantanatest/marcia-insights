"use client";

import type { SalesByProduct } from '@/lib/types';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

interface ProductDistributionChartProps {
  data: SalesByProduct[];
}

export function ProductDistributionChart({ data }: ProductDistributionChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const topProducts = data.slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="h-[180px]">
        <ChartContainer config={{}}>
          <ResponsiveContainer width="100%" height="100%">
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
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="flex items-center">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Faturamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => (
              <TableRow key={product.name}>
                <TableCell className="font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: product.fill }} />
                  {product.name}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
