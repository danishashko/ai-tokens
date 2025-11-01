#!/usr/bin/env node

/**
 * ai-tokens CLI - Real-time token counter and cost calculator
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { calculateCost, compareCosts } from '../core/cost-calculator.js';
import { formatAnalysis, formatComparison, formatWarning } from '../ui/formatter.js';
import { getAllModels, initializePricing } from '../data/pricing.js';

const program = new Command();

// Initialize pricing data from community sources
await initializePricing();

program
  .name('ai-tokens')
  .description('Real-time token counter and cost calculator for AI APIs')
  .version('1.0.0');

/**
 * Count tokens and estimate cost
 */
program
  .command('count')
  .description('Count tokens and calculate cost')
  .argument('<input>', 'Text or file path')
  .option('-m, --model <model>', 'Model name (e.g., gpt-4o, claude-sonnet-4)', 'gpt-4o')
  .option('-o, --output <tokens>', 'Estimated output tokens', '500')
  .option('--simple', 'Simple output (for piping)')
  .action(async (input: string, options: any) => {
    try {
      // Read input (file or direct text)
      let text = input;
      try {
        text = readFileSync(input, 'utf-8');
      } catch {
        // Input is direct text, not a file
      }

      const outputTokens = parseInt(options.output);
      const estimate = calculateCost(text, options.model, outputTokens);

      if (options.simple) {
        console.log(`${estimate.inputTokens} tokens | $${estimate.totalCost.toFixed(4)} | ${options.model}`);
      } else {
        console.log(formatWarning(estimate.totalCost));
        console.log(formatAnalysis(estimate));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * Compare costs across models
 */
program
  .command('compare')
  .description('Compare costs across different models')
  .argument('<input>', 'Text or file path')
  .option('-m, --model <model>', 'Current model', 'gpt-4o')
  .option('-o, --output <tokens>', 'Estimated output tokens', '500')
  .action(async (input: string, options: any) => {
    try {
      let text = input;
      try {
        text = readFileSync(input, 'utf-8');
      } catch {
        // Input is direct text
      }

      const outputTokens = parseInt(options.output);

      // Compare with popular alternatives
      const alternatives = [
        'gpt-4o-mini',
        'gpt-3.5-turbo',
        'claude-sonnet-4',
        'claude-haiku-3-5',
        'gemini-1.5-flash',
      ].filter(m => m !== options.model);

      const comparison = compareCosts(text, options.model, alternatives, outputTokens);

      console.log(formatComparison(comparison));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

/**
 * List all available models
 */
program
  .command('models')
  .description('List all available models and pricing')
  .action(() => {
    const models = getAllModels();

    console.log('\n📋 Available Models:\n');

    models.forEach((model) => {
      console.log(`${model.name} (${model.provider})`);
      console.log(`  Input:  $${model.inputPricePerMillion.toFixed(2)}/M tokens`);
      console.log(`  Output: $${model.outputPricePerMillion.toFixed(2)}/M tokens`);
      console.log(`  Context: ${(model.contextWindow / 1000).toFixed(0)}K tokens`);
      console.log('');
    });
  });

program.parse();
