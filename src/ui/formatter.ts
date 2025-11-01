/**
 * Beautiful CLI output formatting
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import type { CostEstimate, CostComparison } from '../core/cost-calculator.js';
import { formatCost, getCostOptimizations } from '../core/cost-calculator.js';

/**
 * Format token count and cost analysis
 */
export function formatAnalysis(estimate: CostEstimate): string {
  const lines: string[] = [];

  // Header
  lines.push('');
  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push(chalk.bold.cyan('           TOKEN ANALYSIS           '));
  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push('');

  // Model info
  lines.push(chalk.bold(`Model: ${chalk.cyan(estimate.pricing.name)}`));
  lines.push(chalk.gray(`Provider: ${estimate.pricing.provider}`));
  lines.push('');

  // Token counts
  lines.push(chalk.bold('Input Tokens:    ') + chalk.yellow(`${estimate.inputTokens.toLocaleString()} tokens`));
  lines.push(chalk.gray('Est. Cost:       ') + chalk.green(formatCost(estimate.inputCost)));
  lines.push('');

  lines.push(chalk.bold('Output (est):    ') + chalk.yellow(`${estimate.outputTokens.toLocaleString()} tokens`));
  lines.push(chalk.gray('Est. Cost:       ') + chalk.green(formatCost(estimate.outputCost)));
  lines.push('');

  // Total cost with visual emphasis
  const costColor = estimate.totalCost > 1 ? chalk.red : estimate.totalCost > 0.1 ? chalk.yellow : chalk.green;
  lines.push(chalk.bold('Total Cost:      ') + costColor.bold(formatCost(estimate.totalCost)));
  lines.push('');

  // Cost optimizations
  const optimizations = getCostOptimizations(estimate);
  if (optimizations.length > 0) {
    lines.push(chalk.bold.cyan('💡 Cost Optimization:'));
    optimizations.forEach((opt) => {
      lines.push(chalk.gray('  • ') + opt.suggestion + chalk.green(` → ${opt.potentialSavings}`));
    });
    lines.push('');
  }

  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push('');

  return lines.join('\n');
}

/**
 * Format model comparison table
 */
export function formatComparison(comparison: CostComparison): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push(chalk.bold.cyan('           MODEL COST COMPARISON           '));
  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push('');

  // Current model
  lines.push(chalk.bold(`Current Model: ${chalk.cyan(comparison.current.pricing.name)}`));
  lines.push(chalk.bold(`Total Cost: ${chalk.yellow(formatCost(comparison.current.totalCost))}`));
  lines.push('');

  // Comparison table
  const table = new Table({
    head: [
      chalk.bold('Model'),
      chalk.bold('Cost'),
      chalk.bold('Savings'),
      chalk.bold('%'),
    ],
    style: {
      head: [],
      border: ['gray'],
    },
  });

  comparison.alternatives.forEach((alt) => {
    const savingsColor = alt.savings > 0 ? chalk.green : chalk.red;
    const costColor = alt.estimate.totalCost < comparison.current.totalCost ? chalk.green : chalk.yellow;

    table.push([
      alt.estimate.pricing.name,
      costColor(formatCost(alt.estimate.totalCost)),
      savingsColor(alt.savings > 0 ? `+${formatCost(alt.savings)}` : formatCost(alt.savings)),
      savingsColor(alt.savingsPercent > 0 ? `${alt.savingsPercent.toFixed(0)}%` : `-${Math.abs(alt.savingsPercent).toFixed(0)}%`),
    ]);
  });

  lines.push(table.toString());
  lines.push('');

  // Best option
  if (comparison.alternatives.length > 0 && comparison.alternatives[0].savings > 0) {
    const best = comparison.alternatives[0];
    lines.push(chalk.bold.green(`🎯 Best Alternative: ${best.model}`));
    lines.push(chalk.green(`   Save ${formatCost(best.savings)} (${best.savingsPercent.toFixed(0)}%)`));
    lines.push('');
  }

  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push('');

  return lines.join('\n');
}

/**
 * Format fun cost comparisons
 */
export function formatFunComparison(cost: number): string {
  const comparisons = [];

  if (cost < 0.01) {
    comparisons.push(`☕ Less than a coffee stirrer`);
  } else if (cost < 0.10) {
    comparisons.push(`🍬 About the price of a piece of candy`);
  } else if (cost < 1.00) {
    comparisons.push(`🍪 Less than a cookie`);
  } else if (cost < 5.00) {
    comparisons.push(`☕ More than a coffee`);
  } else if (cost < 20.00) {
    comparisons.push(`🍕 Pizza money!`);
  } else {
    comparisons.push(`💸 Ouch! That's expensive!`);
  }

  return chalk.gray(comparisons[0]);
}

/**
 * Format warning for expensive prompts
 */
export function formatWarning(cost: number, threshold: number = 1.00): string {
  if (cost < threshold) return '';

  const lines: string[] = [];
  lines.push('');
  lines.push(chalk.bold.red('⚠️  WARNING: HIGH COST DETECTED'));
  lines.push(chalk.yellow(`This prompt will cost ${formatCost(cost)}`));
  lines.push(chalk.gray('Consider:'));
  lines.push(chalk.gray('  • Using a cheaper model'));
  lines.push(chalk.gray('  • Reducing input context'));
  lines.push(chalk.gray('  • Limiting output length'));
  lines.push('');

  return lines.join('\n');
}

/**
 * Format simple token count (for piping)
 */
export function formatSimple(tokenCount: number, cost: number, model: string): string {
  return `${tokenCount} tokens | ${formatCost(cost)} | ${model}`;
}

/**
 * Format progress bar
 */
export function formatProgress(current: number, max: number, label: string = ''): string {
  const percentage = Math.min(100, (current / max) * 100);
  const filled = Math.floor(percentage / 5); // 20 segments
  const empty = 20 - filled;

  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  return `${label} ${bar} ${percentage.toFixed(0)}%`;
}

/**
 * Format budget status
 */
export function formatBudgetStatus(spent: number, limit: number): string {
  const lines: string[] = [];
  const percentage = (spent / limit) * 100;

  lines.push('');
  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push(chalk.bold.cyan('           BUDGET STATUS           '));
  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push('');

  lines.push(formatProgress(spent, limit, 'Budget:'));
  lines.push('');

  lines.push(chalk.bold('Spent:      ') + chalk.yellow(formatCost(spent)));
  lines.push(chalk.bold('Limit:      ') + chalk.gray(formatCost(limit)));
  lines.push(chalk.bold('Remaining:  ') + chalk.green(formatCost(limit - spent)));
  lines.push('');

  if (percentage > 90) {
    lines.push(chalk.bold.red('🚨 WARNING: Budget almost exhausted!'));
  } else if (percentage > 75) {
    lines.push(chalk.bold.yellow('⚠️  Approaching budget limit'));
  }

  lines.push(chalk.cyan('━'.repeat(70)));
  lines.push('');

  return lines.join('\n');
}
