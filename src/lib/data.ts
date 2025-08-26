import type { Sale, ProcessedSale } from './types';
import { parse as parseDate, isValid } from 'date-fns';
import { parse as parseCsv } from 'papaparse';

import fallbackSalesData from './sales-data.json';

const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1l8WjmPk235ijoBl3i7SPLKYNPG4N8IRdHX5YoLdqeiw/export?format=csv';

async function fetchSalesFromSheet(): Promise<any[]> {
  try {
    const response = await fetch(SPREADSHEET_URL, { next: { revalidate: 60 } });
    if (!response.ok) {
      console.error('Failed to fetch spreadsheet:', response.statusText);
      return fallbackSalesData;
    }
    const csvText = await response.text();
    const parsed = parseCsv(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),
    });

    if (parsed.errors.length > 0) {
      console.error("CSV Parsing errors:", parsed.errors);
    }
    
    if (!parsed.data || parsed.data.length === 0) {
        console.warn("CSV data is empty or parsing failed, using fallback data.");
        return fallbackSalesData;
    }

    return parsed.data;
  } catch (error) {
    console.error('Error fetching or parsing spreadsheet data:', error);
    return fallbackSalesData;
  }
}

export async function getProcessedSales(): Promise<ProcessedSale[]> {
  const rawData = await fetchSalesFromSheet();
  
  return rawData
    .map((d: any): ProcessedSale | null => {
      if (!d || !d.Status || !d['Data da compra'] || !d['Valor Venda'] || !d['Produto comprado']) {
        return null;
      }
      
      const validStatus = ['aprovada', 'reembolsada'];
      if (!validStatus.includes(d.Status.toLowerCase())) {
        return null;
      }

      try {
        const purchaseDate = parseDate(d['Data da compra'], 'dd-MM-yyyy', new Date());
        
        if (!isValid(purchaseDate)) {
            console.warn(`Invalid date format for row: ${d['Data da compra']}`);
            return null;
        }

        const saleValue = Number(String(d['Valor Venda']).replace(',', '.')) || 0;
        const commissionValue = d['Comissão'] ? Number(String(d['Comissão']).replace(',', '.')) : 0;
        
        if (saleValue <= 0) return null;

        return {
          purchaseDate: purchaseDate,
          transactionId: d.transacao_prod,
          status: d.Status.toLowerCase(),
          platform: d.Plataforma,
          buyerName: d['Nome do Comprador'],
          email: d.Email,
          productName: String(d['Produto comprado']).trim(),
          saleValue: saleValue,
          commission: commissionValue,
          installments: Number(d.Parcelas) || 0,
          paymentMethod: d['Forma de Pagamento'],
          hasOrderBump: String(d['Order bump']).toUpperCase() === 'VERDADEIRO' || d['Order bump'] === true || String(d['Order bump']).toUpperCase() === 'TRUE',
          state: d.Estado || 'N/A',
          country: d.País || 'N/A',
          utmSource: d['Utm Source'] || 'N/A',
          utmMedium: d['Utm Medium'] || 'N/A',
          utmCampaign: d['Utm Campaign'] || 'N/A',
        }
      } catch (e) {
        console.error(`Error processing row: ${JSON.stringify(d)}`, e);
        return null;
      }
    })
    .filter((d): d is ProcessedSale => d !== null);
}