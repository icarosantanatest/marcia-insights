"use client";

import { useState, useMemo } from 'react';
import type { ProcessedSale } from '@/lib/types';
import { getMarketingCampaignRoiSuggestions } from '@/actions/roi';
import type { MarketingCampaignRoiSuggestionsOutput } from '@/ai/flows/marketing-campaign-roi-suggestions';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Lightbulb, TrendingUp } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ROISuggestionsProps {
  sales: ProcessedSale[];
}

const formSchema = z.object({
  overallMarketingBudget: z.coerce.number().min(1, 'Orçamento total é obrigatório.'),
  campaignData: z.array(z.object({
    campaignName: z.string(),
    roi: z.number(),
    currentBudget: z.coerce.number().min(0, 'Orçamento deve ser zero ou maior.'),
  }))
});

type FormData = z.infer<typeof formSchema>;

export function ROISuggestions({ sales }: ROISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<MarketingCampaignRoiSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const campaignMetrics = useMemo(() => {
    const campaigns: Record<string, { revenue: number; commission: number }> = {};
    sales.forEach(sale => {
      const campaignName = sale.utmCampaign || 'N/A';
      if (!campaigns[campaignName]) {
        campaigns[campaignName] = { revenue: 0, commission: 0 };
      }
      campaigns[campaignName].revenue += sale.saleValue;
      campaigns[campaignName].commission += sale.commission;
    });

    return Object.entries(campaigns).map(([name, data]) => {
      const investment = data.revenue > data.commission ? data.revenue - data.commission : 0;
      const roi = investment > 0 ? (data.commission / investment) * 100 : (data.commission > 0 ? Infinity : 0);
      return {
        campaignName: name,
        roi: parseFloat(roi.toFixed(2)),
        currentBudget: 0,
      };
    }).filter(c => c.campaignName !== 'N/A' && c.campaignName !== '');
  }, [sales]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      overallMarketingBudget: 10000,
      campaignData: campaignMetrics,
    },
  });
  
  const { fields } = useFieldArray({
    control: form.control,
    name: "campaignData",
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await getMarketingCampaignRoiSuggestions(data);
      if (result) {
        setSuggestions(result);
      } else {
        setError('Não foi possível obter sugestões. Tente novamente.');
      }
    } catch (e) {
      setError('Ocorreu um erro ao comunicar com o serviço de IA.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure os Orçamentos</h3>
        <p className="text-muted-foreground mb-4">
          Informe o orçamento atual de cada campanha e o orçamento total disponível para receber sugestões de otimização.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="overallMarketingBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento Total de Marketing (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 10000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`campaignData.${index}.currentBudget`}
                  render={({ field: fieldProps }) => (
                    <FormItem className="rounded-md border p-4">
                       <FormLabel className="flex justify-between items-center">
                          <span>{field.campaignName}</span>
                          <span className="text-xs font-normal text-muted-foreground">ROI: {form.getValues(`campaignData.${index}.roi`)}%</span>
                       </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Orçamento atual (R$)" {...fieldProps} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Obter Sugestões
            </Button>
          </form>
        </Form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Recomendações</h3>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : suggestions ? (
          <div className="space-y-4">
            {suggestions.suggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {suggestion.campaignName}
                  </CardTitle>
                  <CardDescription>Orçamento sugerido: <span className="font-bold text-foreground">{formatCurrency(suggestion.suggestedBudget)}</span></CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Aguardando análise</AlertTitle>
            <AlertDescription>
              Preencha os orçamentos e clique em "Obter Sugestões" para que a IA analise suas campanhas.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
