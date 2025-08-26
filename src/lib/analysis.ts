import type {
  ProcessedSale,
  Kpi,
  SalesByPeriod,
  SalesByProduct,
  SalesByAcquisition,
  SalesByPaymentMethod,
  DateRange,
  AnalysisData,
} from './types';
import { format, eachDayOfInterval, isWithinInterval } from 'date-fns';

function calculateKpis(allSales: ProcessedSale[], filteredSales: ProcessedSale[]): Kpi {
  const totalRevenue = filteredSales.reduce((acc, sale) => acc + sale.saleValue, 0);
  const netRevenue = filteredSales.reduce((acc, sale) => acc + sale.commission, 0);
  const salesCount = filteredSales.length;
  
  const refundedSales = allSales.filter(sale => sale.status === 'reembolsada' && isWithinInterval(sale.purchaseDate, { start: filteredSales[0]?.purchaseDate || new Date(), end: filteredSales[filteredSales.length - 1]?.purchaseDate || new Date() }));
  
  const refundedSalesInDateRange = allSales.filter(sale => 
    sale.status === 'reembolsada' && 
    isWithinInterval(sale.purchaseDate, { start: filteredSales[0]?.purchaseDate, end: filteredSales[filteredSales.length -1]?.purchaseDate })
  );
  
  const totalRefunded = allSales
    .filter(sale => sale.status === 'reembolsada' && isWithinInterval(sale.purchaseDate, {start: filteredSales[0]?.purchaseDate, end: filteredSales[filteredSales.length - 1]?.purchaseDate}))
    .reduce((acc, sale) => acc + sale.saleValue, 0);

  const refundedCount = allSales.filter(sale => sale.status === 'reembolsada' && isWithinInterval(sale.purchaseDate, {start: filteredSales[0]?.purchaseDate, end: filteredSales[filteredSales.length - 1]?.purchaseDate})).length;


  return { totalRevenue, netRevenue, salesCount, totalRefunded, refundedCount };
}

function getSalesByPeriod(sales: ProcessedSale[], dateRange: DateRange): SalesByPeriod[] {
  if (sales.length === 0) return [];

  const salesByDate = sales.reduce((acc, sale) => {
    const dateStr = format(sale.purchaseDate, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = { revenue: 0, count: 0 };
    }
    acc[dateStr].revenue += sale.saleValue;
    acc[dateStr].count += 1;
    return acc;
  }, {} as Record<string, { revenue: number, count: number }>);

  const dateInterval = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });

  return dateInterval.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dateLabel = format(day, 'dd/MM');
    return {
      date: dateLabel,
      Vendas: salesByDate[dateStr]?.revenue || 0,
      count: salesByDate[dateStr]?.count || 0,
    };
  });
}

function getSalesByProduct(sales: ProcessedSale[]): SalesByProduct[] {
  const salesByProduct = sales.reduce((acc, sale) => {
    const productName = sale.productName || 'Produto não identificado';
    if (!acc[productName]) {
      acc[productName] = { sales: 0, revenue: 0 };
    }
    acc[productName].sales += 1;
    acc[productName].revenue += sale.saleValue;
    return acc;
  }, {} as Record<string, { sales: number; revenue: number }>);
  
  const chartColors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];

  return Object.entries(salesByProduct)
    .map(([name, data], index) => ({
      name,
      ...data,
      fill: `hsl(var(${chartColors[index % chartColors.length]}))`,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function getSalesByAcquisition(sales: ProcessedSale[]): SalesByAcquisition[] {
  const salesBySource = sales.reduce((acc, sale) => {
    const source = sale.utmSource || '-';
    const medium = sale.utmMedium || '-';
    const campaign = sale.utmCampaign || '-';
    const key = `${source}|${medium}|${campaign}`;
    
    if (!acc[key]) {
        acc[key] = { source, medium, campaign, Vendas: 0 };
    }
    acc[key].Vendas += 1;
    return acc;
  }, {} as Record<string, SalesByAcquisition>);

  return Object.values(salesBySource)
    .sort((a,b) => b.Vendas - a.Vendas);
}

function getSalesByPaymentMethod(sales: ProcessedSale[]): SalesByPaymentMethod[] {
    const salesByMethod = sales.reduce((acc, sale) => {
        const method = sale.paymentMethod || 'N/A';
        if (!acc[method]) {
            acc[method] = 0;
        }
        acc[method] += 1;
        return acc;
    }, {} as Record<string, number>);
    
    const chartColors = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'];

    return Object.entries(salesByMethod)
        .map(([name, value], index) => ({
            name,
            value,
            fill: `hsl(var(${chartColors[index % chartColors.length]}))`
        }))
        .sort((a,b) => b.value - a.value);
}

export function analyzeSalesData(allSales: ProcessedSale[], dateRange: DateRange): AnalysisData {
    const filteredSales = allSales.filter(sale => 
        sale.status === 'aprovada' &&
        isWithinInterval(sale.purchaseDate, { start: dateRange.from, end: dateRange.to })
    );

    return {
        kpis: calculateKpis(allSales, filteredSales),
        salesByPeriod: getSalesByPeriod(filteredSales, dateRange),
        salesByProduct: getSalesByProduct(filteredSales),
        salesByAcquisition: getSalesByAcquisition(filteredSales),
        salesByPaymentMethod: getSalesByPaymentMethod(filteredSales),
    };
}
