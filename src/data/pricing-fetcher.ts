/**
 * Fetch pricing data from community sources
 */

import { ModelPricing } from './pricing.js';

const LITELLM_PRICING_URL = 'https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json';

/**
 * LiteLLM pricing format
 */
interface LiteLLMModel {
  input_cost_per_token?: number;
  output_cost_per_token?: number;
  max_input_tokens?: number;
  max_output_tokens?: number;
  litellm_provider?: string;
  mode?: string;
  supports_vision?: boolean;
  supports_function_calling?: boolean;
}

/**
 * Fetch latest pricing from LiteLLM (community-maintained)
 */
export async function fetchCommunityPricing(): Promise<Record<string, ModelPricing>> {
  try {
    const response = await fetch(LITELLM_PRICING_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch pricing: ${response.statusText}`);
    }

    const data = await response.json() as Record<string, LiteLLMModel>;
    return convertLiteLLMPricing(data);
  } catch (error) {
    console.warn('Failed to fetch community pricing, using fallback:', error);
    return {};
  }
}

/**
 * Convert LiteLLM format to our format
 */
function convertLiteLLMPricing(litellmData: Record<string, LiteLLMModel>): Record<string, ModelPricing> {
  const pricing: Record<string, ModelPricing> = {};

  // Map of LiteLLM model keys to our simplified keys
  const modelMappings: Record<string, { key: string; name: string; provider: string }> = {
    // OpenAI models
    'gpt-5': { key: 'gpt-5', name: 'GPT-5', provider: 'OpenAI' },
    'gpt-5-mini': { key: 'gpt-5-mini', name: 'GPT-5 Mini', provider: 'OpenAI' },
    'gpt-5-nano': { key: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'OpenAI' },
    'gpt-5-pro': { key: 'gpt-5-pro', name: 'GPT-5 Pro', provider: 'OpenAI' },
    'gpt-4o': { key: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
    'gpt-4o-mini': { key: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    'gpt-4-turbo': { key: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
    'gpt-4': { key: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    'gpt-3.5-turbo': { key: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
    'o1-preview': { key: 'o1-preview', name: 'O1 Preview', provider: 'OpenAI' },
    'o1-mini': { key: 'o1-mini', name: 'O1 Mini', provider: 'OpenAI' },

    // Claude models (Anthropic direct)
    'claude-sonnet-4-5': { key: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'Anthropic' },
    'claude-sonnet-4-5-20250929': { key: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'Anthropic' },
    'claude-opus-4-20250514': { key: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic' },
    'claude-sonnet-4-20250514': { key: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic' },
    'claude-3-5-sonnet-20241022': { key: 'claude-sonnet-3-5', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    'claude-3-5-haiku-20241022': { key: 'claude-haiku-3-5', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
    'claude-3-opus-20240229': { key: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
    'claude-3-sonnet-20240229': { key: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
    'claude-3-haiku-20240307': { key: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },

    // Gemini models
    'gemini-2.0-flash-exp': { key: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
    'gemini-1.5-pro': { key: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
    'gemini-1.5-flash': { key: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },

    // Meta Llama
    'meta-llama/llama-3.1-405b-instruct': { key: 'llama-3.1-405b', name: 'Llama 3.1 405B', provider: 'Meta' },
    'meta-llama/llama-3.1-70b-instruct': { key: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Meta' },
    'meta-llama/llama-3.1-8b-instruct': { key: 'llama-3.1-8b', name: 'Llama 3.1 8B', provider: 'Meta' },

    // DeepSeek
    'deepseek-chat': { key: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' },
    'deepseek-reasoner': { key: 'deepseek-reasoner', name: 'DeepSeek Reasoner', provider: 'DeepSeek' },
  };

  for (const [litellmKey, model] of Object.entries(litellmData)) {
    // Skip if no pricing data
    if (!model.input_cost_per_token || !model.output_cost_per_token) continue;

    const mapping = modelMappings[litellmKey];
    if (!mapping) continue;

    pricing[mapping.key] = {
      name: mapping.name,
      provider: mapping.provider,
      inputPricePerMillion: model.input_cost_per_token * 1_000_000,
      outputPricePerMillion: model.output_cost_per_token * 1_000_000,
      contextWindow: model.max_input_tokens || 128000,
      encoding: mapping.provider === 'OpenAI' ? 'cl100k_base' : undefined,
    };
  }

  return pricing;
}

/**
 * Merge community pricing with fallback pricing
 */
export function mergePricing(
  communityPricing: Record<string, ModelPricing>,
  fallbackPricing: Record<string, ModelPricing>
): Record<string, ModelPricing> {
  // Community pricing takes precedence (more up-to-date)
  return {
    ...fallbackPricing,
    ...communityPricing,
  };
}

/**
 * Cache pricing data to avoid repeated fetches
 */
let cachedPricing: Record<string, ModelPricing> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedPricing(
  fallbackPricing: Record<string, ModelPricing>
): Promise<Record<string, ModelPricing>> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedPricing && now - cacheTimestamp < CACHE_DURATION) {
    return cachedPricing;
  }

  // Fetch fresh data
  try {
    const communityPricing = await fetchCommunityPricing();
    cachedPricing = mergePricing(communityPricing, fallbackPricing);
    cacheTimestamp = now;
    return cachedPricing;
  } catch {
    // Return fallback on error
    return fallbackPricing;
  }
}
