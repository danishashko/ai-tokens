/**
 * Token counting for various AI models
 */

import { Tiktoken, encoding_for_model } from 'tiktoken';
import { getModelPricing } from '../data/pricing.js';

export interface TokenCount {
  tokens: number;
  characters: number;
  model: string;
}

/**
 * Count tokens for OpenAI models using tiktoken
 */
export function countOpenAITokens(text: string, model: string = 'gpt-4o'): TokenCount {
  const pricing = getModelPricing(model);
  const encoding = pricing?.encoding || 'cl100k_base';

  let enc: Tiktoken;
  try {
    // Try to get encoding for specific model
    enc = encoding_for_model(model as any);
  } catch {
    // Fallback to encoding name
    enc = encoding_for_model(encoding as any);
  }

  const tokens = enc.encode(text);
  enc.free();

  return {
    tokens: tokens.length,
    characters: text.length,
    model,
  };
}

/**
 * Count tokens for Claude models
 * Claude uses approximately 1 token per 4 characters (rough estimate)
 * For more accuracy, you'd need Anthropic's official tokenizer
 */
export function countClaudeTokens(text: string, model: string = 'claude-sonnet-4'): TokenCount {
  // Rough estimation: ~1 token per 4 characters for English text
  // This is an approximation until Anthropic provides official tokenizer
  const estimatedTokens = Math.ceil(text.length / 4);

  return {
    tokens: estimatedTokens,
    characters: text.length,
    model,
  };
}

/**
 * Count tokens for Gemini models
 * Similar estimation to Claude
 */
export function countGeminiTokens(text: string, model: string = 'gemini-1.5-pro'): TokenCount {
  const estimatedTokens = Math.ceil(text.length / 4);

  return {
    tokens: estimatedTokens,
    characters: text.length,
    model,
  };
}

/**
 * Count tokens for Llama models
 * Uses similar tokenization to GPT models
 */
export function countLlamaTokens(text: string, model: string = 'llama-3.1-70b'): TokenCount {
  // Use cl100k_base encoding as approximation
  const enc = encoding_for_model('cl100k_base' as any);
  const tokens = enc.encode(text);
  enc.free();

  return {
    tokens: tokens.length,
    characters: text.length,
    model,
  };
}

/**
 * Universal token counter - automatically detects model type
 */
export function countTokens(text: string, model: string): TokenCount {
  const normalizedModel = model.toLowerCase();

  // OpenAI models
  if (normalizedModel.includes('gpt')) {
    return countOpenAITokens(text, model);
  }

  // Claude models
  if (normalizedModel.includes('claude')) {
    return countClaudeTokens(text, model);
  }

  // Gemini models
  if (normalizedModel.includes('gemini')) {
    return countGeminiTokens(text, model);
  }

  // Llama models
  if (normalizedModel.includes('llama')) {
    return countLlamaTokens(text, model);
  }

  // Default to OpenAI tokenization
  return countOpenAITokens(text, model);
}
