"use client";

import type { SalesByState } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

interface GeographicSalesChartProps {
  data: SalesByState[];
}

export function GeographicSalesChart({ data }: GeographicSalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Estados por Vendas</CardTitle>
        <CardDescription>Concentração de vendas por estado.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={{
              Vendas: {
                  label: "Vendas",
                  color: "hsl(var(--chart-2))",
              }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: -10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="state" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80}/>
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="Vendas" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
