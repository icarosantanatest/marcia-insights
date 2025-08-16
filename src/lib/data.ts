import type { Sale, ProcessedSale } from './types';
import { parse as parseDate, isValid } from 'date-fns';
import { parse as parseCsv } from 'papaparse';

// This is a static data source. In a real application, you would fetch this from an API.
import fallbackSalesData from './sales-data.json';

const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1l8WjmPk235ijoBl3i7SPLKYNPG4N8IRdHX5YoLdqeiw/export?format=csv';

async function fetchSalesFromSheet(): Promise<Sale[]> {
  try {
    const response = await fetch(SPREADSHEET_URL, { next: { revalidate: 60 } }); // Cache for 60 seconds
    if (!response.ok) {
      console.error('Failed to fetch spreadsheet:', response.statusText);
      return fallbackSalesData as Sale[];
    }
    const csvText = await response.text();
    const parsed = parseCsv<Sale>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.error("CSV Parsing errors:", parsed.errors);
    }
    
    if (parsed.data.length === 0) {
        console.warn("CSV data is empty, using fallback data.");
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
    .map(d => {
      // Basic validation to check if the row is usable
      if (!d || typeof d !== 'object' || !d.Status || !d.Data_da_compra || !d.Valor_Venda || !d.Produto_comprado) {
        return null;
      }
      
      // Filter only approved sales
      if (d.Status.toLowerCase() !== 'aprovada') {
        return null;
      }

      try {
        const purchaseDate = parseDate(d.Data_da_compra, 'dd-MM-yyyy', new Date());
        
        // If date is invalid, skip this record
        if (!isValid(purchaseDate)) {
            // console.warn(`Invalid date format for row: ${JSON.stringify(d)}`);
            return null;
        }

        const saleValue = Number(String(d.Valor_Venda).replace(',', '.')) || 0;
        const commissionValue = d.Comissao ? Number(String(d.Comissao).replace(',', '.')) : 0;
        
        // If sale value is not a positive number, it's likely an invalid entry
        if (saleValue <= 0) return null;

        return {
          purchaseDate: purchaseDate,
          transactionId: d.transacao_prod,
          status: d.Status,
          platform: d.Plataforma,
          buyerName: d.Nome_do_Comprador,
          email: d.Email,
          productName: d.Produto_comprado.trim(),
          saleValue: saleValue,
          commission: commissionValue,
          installments: Number(d.Parcelas) || 0,
          paymentMethod: d.Forma_de_Pagamento,
          hasOrderBump: String(d.Order_bump).toUpperCase() === 'VERDADEIRO' || d.Order_bump === true || String(d.Order_bump).toUpperCase() === 'TRUE',
          state: d.Estado,
          country: d.Pais,
          utmSource: d.Utm_Source,
          utmMedium: d.Utm_Medium,
          utmCampaign: d.Utm_Campaign,
        }
      } catch (e) {
        console.error(`Error processing row: ${JSON.stringify(d)}`, e);
        return null;
      }
    })
    .filter((d): d is ProcessedSale => d !== null);
}