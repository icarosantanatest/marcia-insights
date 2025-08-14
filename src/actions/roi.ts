"use server";

import { getMarketingCampaignRoiSuggestions as genkitGetMarketingCampaignRoiSuggestions } from '@/ai/flows/marketing-campaign-roi-suggestions';
import type { MarketingCampaignRoiSuggestionsInput, MarketingCampaignRoiSuggestionsOutput } from '@/ai/flows/marketing-campaign-roi-suggestions';

export async function getMarketingCampaignRoiSuggestions(input: MarketingCampaignRoiSuggestionsInput): Promise<MarketingCampaignRoiSuggestionsOutput> {
  try {
    const suggestions = await genkitGetMarketingCampaignRoiSuggestions(input);
    return suggestions;
  } catch (error) {
    console.error("Error getting ROI suggestions:", error);
    throw new Error("Failed to get ROI suggestions from AI service.");
  }
}
