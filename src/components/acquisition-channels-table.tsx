"use client";

import type { SalesByAcquisition } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AcquisitionChannelsTableProps {
  data: SalesByAcquisition[];
}

export function AcquisitionChannelsTable({ data }: AcquisitionChannelsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canais de Aquisição</CardTitle>
        <CardDescription>Vendas por canais de aquisição (UTM).</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Medium</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.source}</TableCell>
                  <TableCell>{item.medium}</TableCell>
                  <TableCell>{item.campaign}</TableCell>
                  <TableCell className="text-right">{item.Vendas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
