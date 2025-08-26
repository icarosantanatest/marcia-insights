import type { Sale, ProcessedSale } from './types';
import { parse as parseDate, isValid } from 'date-fns';
import { parse as parseCsv } from 'papaparse';

import fallbackSalesData from './sales-data.json';

const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1l8WjmPk235ijoBl3i7SPLKYNPG4N8IRdHX5YoLdqeiw/export?format=csv';

async function fetchSalesFromSheet(): Promise<Sale[]> {
  try {
    const response = await fetch(SPREADSHEET_URL, { next: { revalidate: 60 } });
    if (!response.ok) {
      console.error('Failed to fetch spreadsheet:', response.statusText);
      return fallbackSalesData as Sale[];
    }
    const csvText = await response.text();
    const parsed = parseCsv<Sale>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().replace(/ /g, '_'),
    });

    if (parsed.errors.length > 0) {
      console.error("CSV Parsing errors:", parsed.errors);
    }
    
    if (!parsed.data || parsed.data.length === 0) {
        console.warn("CSV data is empty or parsing failed, using fallback data.");
        return fallbackSalesData as Sale[];
    }

    return parsed.data;
  } catch (error) {
    console.error('Error fetching or parsing spreadsheet data:', error);
    return fallbackSalesData as Sale[];
  }
}

export async function getProcessedSales(): Promise<ProcessedSale[]> {
  const rawData = await fetchSalesFromSheet();
  
  return rawData
    .map((d: any) => {
      // Normalize headers by replacing spaces with underscores for consistent access
      const sale: Sale = {
        Data_da_compra: d['Data_da_compra'],
        transacao_prod: d.transacao_prod,
        Status: d.Status,
        Plataforma: d.Plataforma,
        Nome_do_Comprador: d['Nome_do_Comprador'],
        Email: d.Email,
        Produto_comprado: d['Produto_comprado'],
        Valor_Venda: d['Valor_Venda'],
        Comissao: d.Comissao,
        Parcelas: d.Parcelas,
        Forma_de_Pagamento: d['Forma_de_Pagamento'],
        Order_bump: d['Order_bump'],
        Estado: d.Estado,
        Pais: d.País,
        Utm_Source: d['Utm_Source'],
        Utm_Medium: d['Utm_Medium'],
        Utm_Campaign: d['Utm_Campaign'],
      };

      if (!sale || typeof sale !== 'object' || !sale.Status || !sale.Data_da_compra || !sale.Valor_Venda || !sale.Produto_comprado) {
        return null;
      }
      
      const validStatus = ['aprovada', 'reembolsada'];
      if (!validStatus.includes(sale.Status.toLowerCase())) {
        return null;
      }

      try {
        const purchaseDate = parseDate(sale.Data_da_compra, 'dd-MM-yyyy', new Date());
        
        if (!isValid(purchaseDate)) {
            console.warn(`Invalid date format for row: ${sale.Data_da_compra}`);
            return null;
        }

        const saleValue = Number(String(sale.Valor_Venda).replace(',', '.')) || 0;
        const commissionValue = sale.Comissao ? Number(String(sale.Comissao).replace(',', '.')) : 0;
        
        if (saleValue <= 0) return null;

        return {
          purchaseDate: purchaseDate,
          transactionId: sale.transacao_prod,
          status: sale.Status.toLowerCase(),
          platform: sale.Plataforma,
          buyerName: sale.Nome_do_Comprador,
          email: sale.Email,
          productName: String(sale.Produto_comprado).trim(),
          saleValue: saleValue,
          commission: commissionValue,
          installments: Number(sale.Parcelas) || 0,
          paymentMethod: sale.Forma_de_Pagamento,
          hasOrderBump: String(sale.Order_bump).toUpperCase() === 'VERDADEIRO' || sale.Order_bump === true || String(sale.Order_bump).toUpperCase() === 'TRUE',
          state: sale.Estado || 'N/A',
          country: sale.Pais || 'N/A',
          utmSource: sale.Utm_Source || 'N/A',
          utmMedium: sale.Utm_Medium || 'N/A',
          utmCampaign: sale.Utm_Campaign || 'N/A',
        }
      } catch (e) {
        console.error(`Error processing row: ${JSON.stringify(d)}`, e);
        return null;
      }
    })
    .filter((d): d is ProcessedSale => d !== null);
}
