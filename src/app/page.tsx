import {
  getSalesData,
  calculateKpis,
  getSalesByPeriod,
  getSalesByProduct,
  getSalesByAcquisition,
  getSalesByPaymentMethod,
} from '@/lib/data';
import type { SearchParams } from '@/lib/types';
import { KpiCard } from '@/components/kpi-card';
import { SalesTrendChart } from '@/components/sales-trend-chart';
import { ProductDistributionChart } from '@/components/product-distribution-chart';
import { DashboardFilters } from '@/components/dashboard-filters';
import { AcquisitionChannelsTable } from '@/components/acquisition-channels-table';
import { PaymentMethodsTable } from '@/components/payment-methods-table';

import { DollarSign, ShoppingCart, Wallet, BadgePercent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshButton } from '@/components/refresh-button';

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { filteredSales, dateRange } = await getSalesData(searchParams);

  const kpis = calculateKpis(filteredSales);
  const salesByPeriod = getSalesByPeriod(filteredSales);
  const salesByProduct = getSalesByProduct(filteredSales);
  const salesByAcquisition = getSalesByAcquisition(filteredSales);
  const salesByPaymentMethod = getSalesByPaymentMethod(filteredSales);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <h1 className="text-2xl font-headline font-semibold">Márcia Insights</h1>
        <div className="ml-auto flex items-center gap-2">
          <DashboardFilters defaultDateRange={dateRange} />
          <RefreshButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <KpiCard title="Faturamento Total" value={formatCurrency(kpis.totalRevenue)} icon={DollarSign} />
          <KpiCard title="Faturamento Líquido" value={formatCurrency(kpis.netCommission)} icon={Wallet} />
          <KpiCard title="Vendas" value={kpis.salesCount.toString()} icon={ShoppingCart} />
          <KpiCard title="Ticket Médio" value={formatCurrency(kpis.averageTicket)} icon={BadgePercent} />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Vendas por Período</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesTrendChart data={salesByPeriod} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Distribuição por Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductDistributionChart data={salesByProduct} />
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
            <AcquisitionChannelsTable data={salesByAcquisition} />
            <PaymentMethodsTable data={salesByPaymentMethod} />
        </div>
      </main>
    </div>
  );
}
