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
        <CardDescription>Vendas por UTM Source.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Canal (UTM Source)</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.source}>
                  <TableCell className="font-medium">{item.source}</TableCell>
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
