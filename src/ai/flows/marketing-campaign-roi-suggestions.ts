'use server';

/**
 * @fileOverview A marketing campaign ROI suggestion AI agent.
 *
 * - getMarketingCampaignRoiSuggestions - A function that provides suggestions for adjusting marketing campaign budgets based on their ROI.
 * - MarketingCampaignRoiSuggestionsInput - The input type for the getMarketingCampaignRoiSuggestions function.
 * - MarketingCampaignRoiSuggestionsOutput - The return type for the getMarketingCampaignRoiSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketingCampaignRoiSuggestionsInputSchema = z.object({
  campaignData: z.array(z.object({
    campaignName: z.string().describe('The name of the marketing campaign.'),
    roi: z.number().describe('The return on investment (ROI) of the campaign.'),
    currentBudget: z.number().describe('The current budget allocated to the campaign.'),
  })).describe('An array of marketing campaigns with their ROI and current budget.'),
  overallMarketingBudget: z.number().describe('The total marketing budget available.'),
});

export type MarketingCampaignRoiSuggestionsInput = z.infer<typeof MarketingCampaignRoiSuggestionsInputSchema>;

const MarketingCampaignRoiSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.object({
    campaignName: z.string().describe('The name of the marketing campaign.'),
    suggestedBudget: z.number().describe('The suggested budget adjustment for the campaign.'),
    rationale: z.string().describe('The rationale behind the budget adjustment suggestion.'),
  })).describe('An array of suggestions for adjusting the marketing campaign budgets.'),
});

export type MarketingCampaignRoiSuggestionsOutput = z.infer<typeof MarketingCampaignRoiSuggestionsOutputSchema>;

export async function getMarketingCampaignRoiSuggestions(input: MarketingCampaignRoiSuggestionsInput): Promise<MarketingCampaignRoiSuggestionsOutput> {
  return marketingCampaignRoiSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketingCampaignRoiSuggestionsPrompt',
  input: {schema: MarketingCampaignRoiSuggestionsInputSchema},
  output: {schema: MarketingCampaignRoiSuggestionsOutputSchema},
  prompt: `You are an expert marketing strategist. Based on the ROI of different marketing campaigns, provide suggestions on how to adjust their budgets to optimize overall marketing spending. Consider the overall marketing budget available.

Campaign Data:
{{#each campaignData}}
- Campaign Name: {{this.campaignName}}, ROI: {{this.roi}}, Current Budget: {{this.currentBudget}}
{{/each}}

Overall Marketing Budget: {{overallMarketingBudget}}

Provide specific, actionable suggestions for each campaign, including the rationale behind each suggestion. Return the suggested budget.
`, 
});

const marketingCampaignRoiSuggestionsFlow = ai.defineFlow(
  {
    name: 'marketingCampaignRoiSuggestionsFlow',
    inputSchema: MarketingCampaignRoiSuggestionsInputSchema,
    outputSchema: MarketingCampaignRoiSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
