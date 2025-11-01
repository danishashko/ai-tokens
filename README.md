# ai-tokens 💰

**Stop guessing. Know exactly what your AI API calls cost—before you make them.**

Real-time token counter and cost calculator for GPT-5, Claude 4.5, Gemini 2.5, DeepSeek, and 20+ AI models. Built for developers who are tired of surprise API bills.

[![npm version](https://img.shields.io/npm/v/ai-tokens.svg)](https://www.npmjs.com/package/ai-tokens)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 😱 The Problem

```bash
# You write a prompt...
$ cat my-prompt.txt | your-ai-tool

# Later that month...
💸 Your OpenAI Bill: $347.23
```

**What happened?** You had no idea that your 100-line context was costing $2.50 per call.

## ✨ The Solution

```bash
# Check BEFORE you send
$ ai-tokens count my-prompt.txt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           TOKEN ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model: GPT-4o

Input Tokens:    2,847 tokens
Est. Cost:       $0.01424

Output (est):    500 tokens
Est. Cost:       $0.00750

Total Cost:      $0.02174

💡 Cost Optimization:
  • Switch to gpt-4o-mini → Save 96% ($0.0004)
  • Reduce context by 1k tokens → Save $0.005

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Now you know.** $0.02 per call. Make an informed decision.

## 🚀 Quick Start

```bash
# No install required
npx ai-tokens count "Your prompt here"

# Or install globally
npm install -g ai-tokens
```

## 💡 Features

### ✅ Accurate Token Counting
Uses official tokenizers (tiktoken for OpenAI, estimations for others)

### ✅ Real-Time Cost Estimates
Up-to-date pricing for GPT-5, Claude 4.5, Gemini 2.5, DeepSeek, and 20+ models

### ✅ Model Comparisons
See exactly how much you'd save with cheaper alternatives

### ✅ Works with Files
```bash
ai-tokens count ./prompts/analyze-code.txt
```

### ✅ Works with Pipes
```bash
cat large-context.md | ai-tokens count -m claude-opus-4
```

### ✅ Beautiful Output
Color-coded warnings, optimization tips, comparison tables

## 📖 Usage Examples

### Count tokens in a file
```bash
ai-tokens count prompt.txt
# Shows: tokens, cost, optimizations
```

### Specify model
```bash
ai-tokens count prompt.txt --model claude-sonnet-4
ai-tokens count prompt.txt -m gpt-4o-mini
```

### Set expected output length
```bash
ai-tokens count prompt.txt --output 1000
# Estimates cost for 1000 token response
```

### Compare across models
```bash
ai-tokens compare prompt.txt

# Output:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       MODEL COST COMPARISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current: GPT-4o ($0.0097)

┌──────────────────┬──────────┬────────┬─────┐
│ Model            │ Cost     │ Savings│ %   │
├──────────────────┼──────────┼────────┼─────┤
│ Gemini Flash     │ $0.0002  │ +$0.01 │ 98% │
│ GPT-4o Mini      │ $0.0004  │ +$0.01 │ 96% │
│ Claude Haiku     │ $0.0030  │ +$0.01 │ 70% │
└──────────────────┴──────────┴────────┴─────┘

🎯 Best Alternative: gemini-1.5-flash
   Save $0.0095 (98%)
```

### List all models
```bash
ai-tokens models

# Shows pricing for all supported models:
# - GPT-4o, GPT-4, GPT-3.5
# - Claude Opus, Sonnet, Haiku
# - Gemini Pro, Flash
# - Llama 3.1 (405B, 70B, 8B)
```

### Simple output (for scripts)
```bash
ai-tokens count prompt.txt --simple
# Output: 2847 tokens | $0.0217 | gpt-4o
```

## 🎯 Real-World Examples

### Example 1: Code Review Prompt
```bash
$ ai-tokens count code-review-prompt.txt

Input Tokens: 3,245 tokens
Total Cost:   $0.0487

💡 This costs more than a coffee ☕
   Consider using gpt-4o-mini to save 95%
```

### Example 2: Documentation Generation
```bash
$ ai-tokens compare docs-prompt.txt -m gpt-4

Current Model: GPT-4
Cost: $0.157

🎯 Switch to GPT-4o → Save $0.141 (90%)
```

### Example 3: Bulk Processing
```bash
$ for file in prompts/*.txt; do
    ai-tokens count "$file" -m claude-sonnet-4 --simple
  done

# Quick cost estimate for all prompts
```

## 🔥 Why This Tool Exists

**Stop getting surprised by your AI bill.**

- ✅ Know costs BEFORE calling the API
- ✅ Compare models instantly
- ✅ Optimize prompts for cost
- ✅ Track spending across projects
- ✅ No more "$500?! WTF?!" moments

## 📊 Supported Models

### Latest Models (2025)
| Model | Input Price | Output Price |
|-------|-------------|--------------|
| **GPT-5** | $1.25/M | $5.00/M |
| **GPT-5 Mini** | $0.15/M | $0.60/M |
| **Claude Sonnet 4.5** | $3.00/M | $15.00/M |
| **Gemini 2.5 Pro** | $1.25/M | $5.00/M |
| **Gemini 2.5 Flash** | $0.30/M | $1.20/M |
| **DeepSeek R1** | $0.14/M | $0.28/M |

### Popular Models
| Model | Input Price | Output Price |
|-------|-------------|--------------|
| GPT-4o | $2.50/M | $10.00/M |
| GPT-4o Mini | $0.15/M | $0.60/M |
| Claude Opus 4 | $15.00/M | $75.00/M |
| Claude Sonnet 4 | $3.00/M | $15.00/M |
| Claude Haiku 3.5 | $1.00/M | $5.00/M |
| Gemini 2.0 Flash | FREE | FREE |
| Gemini 1.5 Pro | $1.25/M | $5.00/M |
| DeepSeek Chat | $0.14/M | $0.28/M |

**20+ models supported** - Pricing auto-updated from [LiteLLM](https://github.com/BerriAI/litellm) community data

*Prices as of January 2025*

## 🛠️ How It Works

1. **Tokenization**: Uses `tiktoken` (OpenAI's official tokenizer) for GPT models
2. **Estimation**: Smart approximations for Claude, Gemini, Llama
3. **Pricing**: Real-time pricing data for all major providers
4. **Display**: Beautiful, color-coded CLI output

## 📦 Installation

```bash
# Global install
npm install -g ai-tokens

# Or use directly
npx ai-tokens count "your prompt"

# Or add to project
npm install ai-tokens
```

## 🎨 CLI Output Features

- 🎨 **Color-coded costs** - Green = cheap, Yellow = moderate, Red = expensive
- 📊 **Comparison tables** - Side-by-side model pricing
- 💡 **Smart suggestions** - Automatic optimization tips
- ⚠️ **Cost warnings** - Alerts for expensive prompts
- 🎯 **Best alternatives** - Instant cheaper model recommendations

## 🔮 Coming Soon

- [ ] Budget tracking (`ai-tokens budget set 50`)
- [ ] Interactive mode (`ai-tokens interactive`)
- [ ] Markdown reports (`ai-tokens report`)
- [ ] Git hooks (block expensive commits)
- [ ] VS Code extension
- [ ] Browser extension (for ChatGPT UI)

## 🤝 Contributing

Pull requests welcome! Especially for:
- Additional model support
- Improved token estimations
- More cost optimization suggestions

## 📄 License

MIT © [Daniel Shashko](https://github.com/danishashko)

## 👤 Author

**Daniel Shashko**
- GitHub: [@danishashko](https://github.com/danishashko)
- LinkedIn: [daniel-shashko](https://linkedin.com/in/daniel-shashko)

---

## 💬 Share Your Savings

Found this useful? **[Tweet your cost savings!](https://twitter.com/intent/tweet?text=Just%20saved%20%24X%20on%20AI%20API%20costs%20using%20ai-tokens!%20%F0%9F%92%B0%0A%0Anpx%20ai-tokens%20count%20prompt.txt%0A%0A&url=https://github.com/danishashko/ai-tokens)**

---

**Stop guessing. Start knowing.** 💰
