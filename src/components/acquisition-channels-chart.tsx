"use client";

import type { SalesByAcquisition } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

interface AcquisitionChannelsChartProps {
  data: SalesByAcquisition[];
}

export function AcquisitionChannelsChart({ data }: AcquisitionChannelsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canais de Aquisição</CardTitle>
        <CardDescription>Performance de vendas por origem de tráfego.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={{
              Vendas: {
                  label: "Vendas",
                  color: "hsl(var(--chart-3))",
              }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: -10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="source" type="category" tickLine={false} axisLine={false} tickMargin={8} width={80} />
                <Tooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="Vendas" fill="hsl(var(--chart-3))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
