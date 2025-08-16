import { getProcessedSales } from '@/lib/data';
import { analyzeSalesData } from '@/lib/analysis';
import type { SearchParams, DateRange } from '@/lib/types';
import { startOfMonth, endOfMonth, parseISO, startOfDay, endOfDay } from 'date-fns';

import { KpiCard } from '@/components/kpi-card';
import { SalesTrendChart } from '@/components/sales-trend-chart';
import { ProductDistributionChart } from '@/components/product-distribution-chart';
import { DashboardFilters } from '@/components/dashboard-filters';
import { AcquisitionChannelsTable } from '@/components/acquisition-channels-table';
import { PaymentMethodsTable } from '@/components/payment-methods-table';

import { DollarSign, ShoppingCart, BadgePercent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshButton } from '@/components/refresh-button';

// This function determines the date range to be used for filtering the sales data.
// It prioritizes the dates from the URL query parameters (`from` and `to`).
// If they are not present, it defaults to the current month.
function getDateRange(searchParams: SearchParams): DateRange {
  const today = new Date();
  let from: Date, to: Date;

  if (searchParams.from && searchParams.to) {
      from = startOfDay(parseISO(searchParams.from as string));
      to = endOfDay(parseISO(searchParams.to as string));
  } else {
      from = startOfMonth(today);
      to = endOfMonth(today);
  }
  return { from, to };
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  // Set cache to 'no-store' to ensure data is fetched on every request.
  // This is important for a dashboard that needs to reflect the latest data.
  const allSales = await getProcessedSales();
  const dateRange = getDateRange(searchParams);
  
  // The analysis function processes all sales data based on the selected date range.
  const { kpis, salesByPeriod, salesByProduct, salesByAcquisition, salesByPaymentMethod } = analyzeSalesData(allSales, dateRange);

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
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <KpiCard title="Faturamento Total" value={formatCurrency(kpis.totalRevenue)} icon={DollarSign} />
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
