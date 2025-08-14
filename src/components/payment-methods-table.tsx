"use client";

import type { SalesByPaymentMethod } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from './ui/scroll-area';


interface PaymentMethodsTableProps {
  data: SalesByPaymentMethod[];
}

export function PaymentMethodsTable({ data }: PaymentMethodsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formas de Pagamento</CardTitle>
        <CardDescription>Distribuição de vendas por método.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((item) => (
                <TableRow key={item.name}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
