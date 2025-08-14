import type {
  Sale,
  ProcessedSale,
  Kpi,
  SalesByPeriod,
  SalesByProduct,
  SalesByState,
  SalesByAcquisition,
  SalesByPaymentMethod,
  SearchParams,
  DateRange,
} from './types';
import { subDays, startOfMonth, endOfMonth, format, parse, eachDayOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// This is a static data source. In a real application, you would fetch this from an API.
import salesDataJson from './sales-data.json';

const rawSalesData: Sale[] = salesDataJson;

function processRawSalesData(rawData: Sale[]): ProcessedSale[] {
  return rawData
    .filter(d => d.Status === 'aprovada' && d.Valor_Venda > 0)
    .map(d => ({
      purchaseDate: parse(d.Data_da_compra, 'dd-MM-yyyy', new Date()),
      transactionId: d.transacao_prod,
      status: d.Status,
      platform: d.Plataforma,
      buyerName: d.Nome_do_Comprador,
      email: d.Email,
      productName: d.Produto_comprado.trim(),
      saleValue: Number(String(d.Valor_Venda).replace(',', '.')) || 0,
      commission: Number(String(d.Comissao).replace(',', '.')) || 0,
      installments: d.Parcelas,
      paymentMethod: d.Forma_de_Pagamento,
      hasOrderBump: d.Order_bump === 'VERDADEIRO' || d.Order_bump === true || d.Order_bump === 'TRUE',
      state: d.Estado,
      country: d.Pais,
      utmSource: d.Utm_Source,
      utmCampaign: d.Utm_Campaign,
    }));
}

const allSales = processRawSalesData(rawSalesData);

function getDateRange(searchParams: SearchParams): DateRange {
  const today = new Date();
  const from = searchParams.from ? parseISO(searchParams.from as string) : startOfMonth(today);
  const to = searchParams.to ? parseISO(searchParams.to as string) : endOfMonth(today);
  return { from, to };
}

export async function getSalesData(searchParams: SearchParams) {
  const dateRange = getDateRange(searchParams);
  const filteredSales = allSales.filter(sale => {
    return sale.purchaseDate >= dateRange.from && sale.purchaseDate <= dateRange.to;
  });

  return { allSales, filteredSales, dateRange };
}

export function calculateKpis(sales: ProcessedSale[]): Kpi {
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.saleValue, 0);
  const netCommission = sales.reduce((acc, sale) => acc + sale.commission, 0);
  const salesCount = sales.length;
  const averageTicket = salesCount > 0 ? totalRevenue / salesCount : 0;

  return { totalRevenue, netCommission, salesCount, averageTicket };
}

export function getSalesByPeriod(sales: ProcessedSale[]): SalesByPeriod[] {
  if (sales.length === 0) return [];

  const salesByDate = sales.reduce((acc, sale) => {
    const dateStr = format(sale.purchaseDate, 'yyyy-MM-dd');
    if (!acc[dateStr]) {
      acc[dateStr] = 0;
    }
    acc[dateStr] += sale.saleValue;
    return acc;
  }, {} as Record<string, number>);
  
  const dateRange = sales.reduce((acc, sale) => {
      return {
          min: sale.purchaseDate < acc.min ? sale.purchaseDate : acc.min,
          max: sale.purchaseDate > acc.max ? sale.purchaseDate : acc.max
      }
  }, {min: new Date(), max: new Date(0)});
  
  if (dateRange.min > dateRange.max) return [];

  const dateInterval = eachDayOfInterval({ start: dateRange.min, end: dateRange.max });

  return dateInterval.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dateLabel = format(day, 'dd/MM');
    return {
      date: dateLabel,
      Vendas: salesByDate[dateStr] || 0,
    };
  });
}

export function getSalesByProduct(sales: ProcessedSale[]): SalesByProduct[] {
  const salesByProduct = sales.reduce((acc, sale) => {
    if (!acc[sale.productName]) {
      acc[sale.productName] = { sales: 0, revenue: 0 };
    }
    acc[sale.productName].sales += 1;
    acc[sale.productName].revenue += sale.saleValue;
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

export function getSalesByState(sales: ProcessedSale[]): SalesByState[] {
  const salesByState = sales.reduce((acc, sale) => {
    const state = sale.state || 'N/A';
    if (!acc[state]) {
      acc[state] = 0;
    }
    acc[state] += 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(salesByState)
    .map(([state, sales]) => ({ state, Vendas: sales }))
    .sort((a, b) => b.Vendas - a.Vendas)
    .slice(0, 10);
}

export function getSalesByAcquisition(sales: ProcessedSale[]): SalesByAcquisition[] {
  const salesBySource = sales.reduce((acc, sale) => {
    let source = sale.utmSource || 'Direto/Outros';
    if (!acc[source]) {
        acc[source] = 0;
    }
    acc[source] += 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(salesBySource)
    .map(([source, sales]) => ({ source, Vendas: sales }))
    .sort((a,b) => b.Vendas - a.Vendas);
}

export function getSalesByPaymentMethod(sales: ProcessedSale[]): SalesByPaymentMethod[] {
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
