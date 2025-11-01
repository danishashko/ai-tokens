/**
 * Cost calculation engine
 */

import { getModelPricing, type ModelPricing } from '../data/pricing.js';
import { countTokens } from './tokenizer.js';

export interface CostEstimate {
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  costPerToken: number;
  pricing: ModelPricing;
}

export interface CostComparison {
  current: CostEstimate;
  alternatives: Array<{
    model: string;
    estimate: CostEstimate;
    savings: number;
    savingsPercent: number;
  }>;
}

/**
 * Calculate cost for a given model and token counts
 */
export function calculateCost(
  inputText: string,
  model: string,
  estimatedOutputTokens: number = 500
): CostEstimate {
  const pricing = getModelPricing(model);

  if (!pricing) {
    throw new Error(`Unknown model: ${model}`);
  }

  const tokenCount = countTokens(inputText, model);
  const inputTokens = tokenCount.tokens;
  const outputTokens = estimatedOutputTokens;

  // Calculate costs (pricing is per million tokens)
  const inputCost = (inputTokens / 1_000_000) * pricing.inputPricePerMillion;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPricePerMillion;
  const totalCost = inputCost + outputCost;
  const costPerToken = totalCost / (inputTokens + outputTokens);

  return {
    model,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost,
    costPerToken,
    pricing,
  };
}

/**
 * Compare costs across multiple models
 */
export function compareCosts(
  inputText: string,
  currentModel: string,
  alternativeModels: string[],
  estimatedOutputTokens: number = 500
): CostComparison {
  const current = calculateCost(inputText, currentModel, estimatedOutputTokens);

  const alternatives = alternativeModels
    .map((model) => {
      try {
        const estimate = calculateCost(inputText, model, estimatedOutputTokens);
        const savings = current.totalCost - estimate.totalCost;
        const savingsPercent = (savings / current.totalCost) * 100;

        return {
          model,
          estimate,
          savings,
          savingsPercent,
        };
      } catch {
        return null;
      }
    })
    .filter((alt) => alt !== null)
    .sort((a, b) => b!.savings - a!.savings);

  return {
    current,
    alternatives: alternatives as any,
  };
}

/**
 * Get cost optimization suggestions
 */
export function getCostOptimizations(
  estimate: CostEstimate
): Array<{ suggestion: string; potentialSavings: string }> {
  const optimizations: Array<{ suggestion: string; potentialSavings: string }> = [];

  // Suggest cheaper models from same provider
  if (estimate.model.includes('gpt-4o') && !estimate.model.includes('mini')) {
    const miniEstimate = calculateCost(
      '', // We don't have the text here, so estimate based on tokens
      'gpt-4o-mini',
      estimate.outputTokens
    );
    const savings = estimate.totalCost - (estimate.inputTokens / 1_000_000) * 0.15 - (estimate.outputTokens / 1_000_000) * 0.60;
    optimizations.push({
      suggestion: 'Switch to gpt-4o-mini',
      potentialSavings: `Save ~${((savings / estimate.totalCost) * 100).toFixed(0)}% ($${savings.toFixed(4)})`,
    });
  }

  if (estimate.model.includes('claude-opus')) {
    optimizations.push({
      suggestion: 'Switch to claude-sonnet-4',
      potentialSavings: 'Save ~80% on most tasks',
    });
  }

  if (estimate.model.includes('gpt-4-turbo') || estimate.model === 'gpt-4') {
    optimizations.push({
      suggestion: 'Switch to gpt-4o',
      potentialSavings: 'Save 50%+ with better performance',
    });
  }

  // Suggest context reduction
  if (estimate.inputTokens > 1000) {
    const reduction = Math.min(1000, estimate.inputTokens * 0.3);
    const potentialSaving = (reduction / 1_000_000) * estimate.pricing.inputPricePerMillion;
    optimizations.push({
      suggestion: `Reduce context by ${Math.round(reduction)} tokens`,
      potentialSavings: `Save $${potentialSaving.toFixed(4)}`,
    });
  }

  // Suggest output reduction
  if (estimate.outputTokens > 1000) {
    const reduction = Math.min(500, estimate.outputTokens * 0.2);
    const potentialSaving = (reduction / 1_000_000) * estimate.pricing.outputPricePerMillion;
    optimizations.push({
      suggestion: `Request shorter responses (reduce by ${Math.round(reduction)} tokens)`,
      potentialSavings: `Save $${potentialSaving.toFixed(4)}`,
    });
  }

  return optimizations;
}

/**
 * Format cost as human-readable string
 */
export function formatCost(cost: number): string {
  if (cost < 0.001) {
    return `$${(cost * 1000).toFixed(4)}m`; // Show in milli-dollars for very small costs
  }
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  if (cost < 1) {
    return `$${cost.toFixed(3)}`;
  }
  return `$${cost.toFixed(2)}`;
}

/**
 * Calculate cost for multiple API calls
 */
export function calculateBatchCost(
  calls: Array<{ inputText: string; model: string; estimatedOutput?: number }>
): {
  totalCost: number;
  costByModel: Record<string, number>;
  calls: CostEstimate[];
} {
  const estimates = calls.map((call) =>
    calculateCost(call.inputText, call.model, call.estimatedOutput)
  );

  const totalCost = estimates.reduce((sum, est) => sum + est.totalCost, 0);

  const costByModel: Record<string, number> = {};
  estimates.forEach((est) => {
    if (!costByModel[est.model]) {
      costByModel[est.model] = 0;
    }
    costByModel[est.model] += est.totalCost;
  });

  return {
    totalCost,
    costByModel,
    calls: estimates,
  };
}
