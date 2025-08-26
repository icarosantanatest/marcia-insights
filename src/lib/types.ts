export type Sale = {
  Data_da_compra: string;
  transacao_prod: string;
  Status: string;
  Plataforma: string;
  Nome_do_Comprador: string;
  Email: string;
  Celular?: string;
  Produto_comprado: string;
  Codigo_do_Produto?: string;
  Valor_Venda: number | string;
  Moeda?: string;
  Comissao: number | string;
  Parcelas?: number | string;
  Forma_de_Pagamento: string;
  Order_bump?: boolean | string;
  Estado?: string;
  Pais?: string;
  Utm_Source?: string;
  Utm_Medium?: string;
  Utm_Campaign?: string;
  Utm_Term?: string;
  Utm_Content?: string;
};

export type ProcessedSale = {
  purchaseDate: Date;
  transactionId: string;
  status: string;
  platform: string;
  buyerName: string;
  email: string;
  productName: string;
  saleValue: number;
  commission: number;
  installments: number;
  paymentMethod: string;
  hasOrderBump: boolean;
  state: string;
  country: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

export type Kpi = {
  totalRevenue: number;
  netRevenue: number;
  salesCount: number;
  totalRefunded: number;
  refundedCount: number;
};

export type SalesByPeriod = {
  date: string;
  Vendas: number;
  count: number;
};

export type SalesByProduct = {
  name: string;
  sales: number;
  revenue: number;
  fill: string;
};

export type SalesByAcquisition = {
  source: string;
  medium: string;
  campaign: string;
  Vendas: number;
};

export type SalesByPaymentMethod = {
  name: string;
  value: number;
  fill: string;
};

export type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export type DateRange = {
  from: Date;
  to: Date;
};

export type AnalysisData = {
    kpis: Kpi;
    salesByPeriod: SalesByPeriod[];
    salesByProduct: SalesByProduct[];
    salesByAcquisition: SalesByAcquisition[];
    salesByPaymentMethod: SalesByPaymentMethod[];
}
