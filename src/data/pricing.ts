/**
 * AI Model Pricing Data
 * Prices are in USD per million tokens
 * Auto-updated from community sources (LiteLLM)
 * Last updated: October 2025
 */

import { getCachedPricing } from './pricing-fetcher.js';

export interface ModelPricing {
  name: string;
  provider: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  contextWindow: number;
  encoding?: string;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // OpenAI GPT-4 Models
  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'OpenAI',
    inputPricePerMillion: 5.00,
    outputPricePerMillion: 15.00,
    contextWindow: 128000,
    encoding: 'cl100k_base',
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    contextWindow: 128000,
    encoding: 'cl100k_base',
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    inputPricePerMillion: 10.00,
    outputPricePerMillion: 30.00,
    contextWindow: 128000,
    encoding: 'cl100k_base',
  },
  'gpt-4': {
    name: 'GPT-4',
    provider: 'OpenAI',
    inputPricePerMillion: 30.00,
    outputPricePerMillion: 60.00,
    contextWindow: 8192,
    encoding: 'cl100k_base',
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 1.50,
    contextWindow: 16385,
    encoding: 'cl100k_base',
  },

  // Anthropic Claude Models
  'claude-opus-4': {
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    contextWindow: 200000,
  },
  'claude-sonnet-4': {
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    contextWindow: 200000,
  },
  'claude-sonnet-3-5': {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    contextWindow: 200000,
  },
  'claude-haiku-3-5': {
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    inputPricePerMillion: 1.00,
    outputPricePerMillion: 5.00,
    contextWindow: 200000,
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    contextWindow: 200000,
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    contextWindow: 200000,
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 1.25,
    contextWindow: 200000,
  },

  // Google Gemini Models
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    inputPricePerMillion: 0.00,
    outputPricePerMillion: 0.00,
    contextWindow: 1000000,
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    contextWindow: 2000000,
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    contextWindow: 1000000,
  },

  // Meta Llama (via various providers - using typical pricing)
  'llama-3.1-405b': {
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    inputPricePerMillion: 5.00,
    outputPricePerMillion: 15.00,
    contextWindow: 128000,
  },
  'llama-3.1-70b': {
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    inputPricePerMillion: 0.90,
    outputPricePerMillion: 0.90,
    contextWindow: 128000,
  },
  'llama-3.1-8b': {
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    inputPricePerMillion: 0.20,
    outputPricePerMillion: 0.20,
    contextWindow: 128000,
  },
};

/**
 * Model aliases for easier lookup
 */
export const MODEL_ALIASES: Record<string, string> = {
  // OpenAI aliases
  'gpt4o': 'gpt-4o',
  'gpt4': 'gpt-4',
  'gpt-4-0125-preview': 'gpt-4-turbo',
  'gpt-4-1106-preview': 'gpt-4-turbo',
  'gpt35': 'gpt-3.5-turbo',
  'gpt-3.5': 'gpt-3.5-turbo',

  // Claude aliases
  'opus-4': 'claude-opus-4',
  'sonnet-4': 'claude-sonnet-4',
  'haiku-3.5': 'claude-haiku-3-5',
  'opus': 'claude-3-opus',
  'sonnet': 'claude-3-sonnet',
  'haiku': 'claude-3-haiku',

  // Gemini aliases
  'gemini-pro': 'gemini-1.5-pro',
  'gemini-flash': 'gemini-1.5-flash',
  'gemini': 'gemini-1.5-pro',
};

/**
 * Runtime pricing data (initialized with fallback, updated from community)
 */
let runtimePricing: Record<string, ModelPricing> = MODEL_PRICING;
let pricingInitialized = false;

/**
 * Initialize pricing from community sources
 */
export async function initializePricing(): Promise<void> {
  if (pricingInitialized) return;

  try {
    runtimePricing = await getCachedPricing(MODEL_PRICING);
    pricingInitialized = true;
  } catch (error) {
    console.warn('Failed to fetch community pricing, using fallback:', error);
    runtimePricing = MODEL_PRICING;
  }
}

/**
 * Get model pricing by key or alias
 */
export function getModelPricing(model: string): ModelPricing | null {
  const normalizedModel = model.toLowerCase();

  // Try direct match
  if (runtimePricing[normalizedModel]) {
    return runtimePricing[normalizedModel];
  }

  // Try alias match
  const aliasedModel = MODEL_ALIASES[normalizedModel];
  if (aliasedModel && runtimePricing[aliasedModel]) {
    return runtimePricing[aliasedModel];
  }

  return null;
}

/**
 * Get all available models
 */
export function getAllModels(): ModelPricing[] {
  return Object.values(runtimePricing);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: string): ModelPricing[] {
  return getAllModels().filter(m => m.provider.toLowerCase() === provider.toLowerCase());
}
