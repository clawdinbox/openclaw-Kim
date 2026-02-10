# Ollama Sub-Agent Integration Guide

Complete guide for running local LLM models via Ollama in OpenClaw sub-agents.

---

## 1. How Sub-Agents Use Ollama

### Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Main Agent     │────▶│  OpenClaw       │────▶│  Ollama Server  │
│  (Session)      │     │  (Session Host) │     │  (localhost)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                ┌───────────────────────┘
                                ▼
                        ┌─────────────────┐
                        │  Local Models   │
                        │  (Downloaded)   │
                        └─────────────────┘
```

### Key Concepts

- **Sub-agents are OpenClaw sessions**, not separate Ollama instances
- **One Ollama server** serves all agents on the machine
- **Model specification** happens at spawn time via `sessions_spawn`
- **OpenClaw routes requests** to Ollama, handling the protocol

### How It Works

1. Ollama runs as a background service on your machine
2. When you spawn a sub-agent, you specify the model (e.g., `ollama/llama3.2`)
3. OpenClaw routes all LLM calls from that session to your local Ollama instance
4. The model runs on your hardware, completely offline after download

---

## 2. Model Configuration

### Installation

```bash
# macOS
brew install ollama

# Linux (one-liner)
curl -fsSL https://ollama.com/install.sh | sh

# Or download manually: https://ollama.com/download
```

### Start the Server

```bash
# Start Ollama in background
ollama serve &

# Or let it auto-start (macOS/Linux)
# Ollama runs as a system service after installation
```

### Environment Variables

```bash
# Default host (usually correct)
export OLLAMA_HOST="http://localhost:11434"

# Custom port
export OLLAMA_HOST="http://localhost:8080"

# For network access (be careful!)
export OLLAMA_HOST="0.0.0.0:11434"

# Add to your shell profile for persistence
echo 'export OLLAMA_HOST="http://localhost:11434"' >> ~/.zshrc
```

### Model Management

```bash
# List installed models
ollama list

# Pull new models
ollama pull llama3.2
ollama pull mistral
ollama pull qwen2.5:14b
ollama pull codellama:13b
ollama pull llama3.1:8b

# Remove a model
ollama rm llama3.2

# Update all models
ollama pull llama3.2 && ollama pull mistral

# Check model info
ollama show llama3.2

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

### Model Variants

| Model | Variants | Use Case |
|-------|----------|----------|
| llama3.2 | `3b`, `1b` | Lightweight, edge devices |
| llama3.1 | `8b`, `70b`, `405b` | General purpose |
| qwen2.5 | `0.5b` to `72b` | Multilingual, coding |
| mistral | `7b`, `24b` | European, analysis |
| codellama | `7b`, `13b`, `34b` | Code generation |

---

## 3. Spawn Sub-Agent with Ollama

### Basic Syntax

```javascript
// Spawn a sub-agent with Ollama model
const subagent = await sessions_spawn({
  session_name: "research-agent",
  model: "ollama/qwen2.5:14b",  // Format: ollama/<model>:<variant>
  timeout: 300000,               // 5 minutes
  context_window: 32768          // Adjust per model
});
```

### Agent Type Examples

#### Research Agent (Fast Search)

```javascript
const researchAgent = await sessions_spawn({
  session_name: "research-agent",
  model: "ollama/qwen2.5:14b",
  timeout: 180000,
  context_window: 32768,
  system_prompt: `You are a research assistant. Focus on gathering 
accurate information quickly. Use web search when needed.`
});

await sessions_message({
  to: researchAgent.session_id,
  content: "Find recent papers on transformer architectures"
});
```

#### Creative Agent (Writing/Design)

```javascript
const creativeAgent = await sessions_spawn({
  session_name: "creative-agent",
  model: "ollama/llama3.2:3b",
  timeout: 300000,
  context_window: 131072,  // Large for creative context
  system_prompt: `You are a creative assistant. Generate original 
content with flair and imagination.`
});

await sessions_message({
  to: creativeAgent.session_id,
  content: "Write a short story about AI awakening"
});
```

#### Code Agent (Development)

```javascript
const codeAgent = await sessions_spawn({
  session_name: "code-agent",
  model: "ollama/codellama:13b",
  timeout: 600000,  // Longer for complex coding
  context_window: 16384,
  system_prompt: `You are a senior software engineer. Write clean, 
documented code. Explain your reasoning.`
});

await sessions_message({
  to: codeAgent.session_id,
  content: "Refactor this Python function for better performance..."
});
```

#### Analysis Agent (Data/Logic)

```javascript
const analysisAgent = await sessions_spawn({
  session_name: "analysis-agent",
  model: "ollama/mistral:7b",
  timeout: 240000,
  context_window: 32768,
  system_prompt: `You are a data analyst. Focus on logical reasoning 
and clear explanations. Show your work.`
});

await sessions_message({
  to: analysisAgent.session_id,
  content: "Analyze this dataset and identify trends..."
});
```

#### General Purpose Agent

```javascript
const generalAgent = await sessions_spawn({
  session_name: "general-agent",
  model: "ollama/llama3.1:8b",
  timeout: 180000,
  context_window: 128000,
  system_prompt: `You are a helpful assistant. Provide balanced, 
accurate responses across various topics.`
});
```

### Configuration Reference

```javascript
{
  // Required
  session_name: string,         // Unique identifier
  model: "ollama/<model>:<variant>",

  // Recommended
  timeout: number,              // Milliseconds (default: 120000)
  context_window: number,       // Tokens (varies by model)
  
  // Optional
  system_prompt: string,        // Initial instructions
  temperature: number,          // 0.0-1.0 (creativity)
  top_p: number,                // 0.0-1.0 (nucleus sampling)
  max_tokens: number,           // Response length limit
}
```

---

## 4. Recommended Models by Agent Type

### Quick Reference Table

| Agent Type | Recommended Model | Why |
|------------|-------------------|-----|
| Research | `qwen2.5:14b` | Fast, excellent at search synthesis |
| Creative | `llama3.2:3b` | Good creative output, lightweight |
| Code | `codellama:13b` | Trained specifically for code |
| Analysis | `mistral:7b` | Strong logical reasoning |
| General | `llama3.1:8b` | Balanced across all tasks |
| Fast/Edge | `qwen2.5:0.5b` | Ultra-fast, minimal resources |

### Detailed Recommendations

#### Research: Qwen2.5

```bash
ollama pull qwen2.5:14b
```

**Best for:**
- Web search synthesis
- Information gathering
- Quick fact-checking
- Multi-document analysis

**Why:** Alibaba's Qwen2.5 excels at processing and summarizing information quickly. The 14B variant hits the sweet spot of speed vs capability.

**Alternative:** `qwen2.5:7b` for lighter workloads

#### Creative: Llama 3.2

```bash
ollama pull llama3.2:3b
```

**Best for:**
- Creative writing
- Brainstorming
- Story generation
- Marketing copy

**Why:** Meta's Llama 3.2 is surprisingly creative despite its small size. The 3B variant is fast enough for iterative creative work.

**Alternative:** `llama3.1:8b` for longer creative pieces

#### Code: CodeLlama

```bash
ollama pull codellama:13b
```

**Best for:**
- Code generation
- Code review
- Refactoring suggestions
- Debugging assistance
- Documentation generation

**Why:** Fine-tuned on code specifically. The 13B variant handles most programming tasks well without excessive resource usage.

**Alternative:** `codellama:7b` for lighter tasks, `34b` for complex architecture

#### Analysis: Mistral

```bash
ollama pull mistral:7b
```

**Best for:**
- Data analysis
- Logical reasoning
- Mathematical problems
- Structured thinking

**Why:** Mistral's architecture emphasizes reasoning and logical consistency. Great for breaking down complex problems.

**Alternative:** `mistral:24b` for deeper analysis

#### General: Llama 3.1

```bash
ollama pull llama3.1:8b
```

**Best for:**
- General Q&A
- Conversational agents
- Mixed tasks
- Default go-to

**Why:** Meta's Llama 3.1 is the most balanced open model. The 8B variant runs on most hardware while delivering solid performance.

**Alternative:** `llama3.1:70b` when you need maximum quality

---

## 5. Hardware Requirements

### RAM Requirements

| Model Size | Minimum RAM | Recommended | Notes |
|------------|-------------|-------------|-------|
| 0.5B - 3B | 4 GB | 8 GB | Runs on most laptops |
| 7B - 8B | 8 GB | 16 GB | Sweet spot for general use |
| 13B - 14B | 16 GB | 32 GB | Good for serious work |
| 24B - 34B | 32 GB | 64 GB | High-end workstations |
| 70B+ | 64 GB | 128 GB | Server-grade hardware |

### VRAM for GPU Acceleration

| Model Size | Minimum VRAM | Recommended | GPU Examples |
|------------|--------------|-------------|--------------|
| 0.5B - 3B | 2 GB | 4 GB | GTX 1650, M1 (8GB) |
| 7B - 8B | 6 GB | 8 GB | RTX 3060, M1 Pro |
| 13B - 14B | 12 GB | 16 GB | RTX 4080, M2 Pro |
| 24B - 34B | 20 GB | 24 GB | RTX 4090, M2 Ultra |
| 70B | 40 GB | 48 GB | A6000, A100 |

### Disk Space

```bash
# Approximate model sizes
qwen2.5:0.5b    →  ~400 MB
qwen2.5:7b      →  ~4.5 GB
qwen2.5:14b     →  ~9 GB
llama3.2:3b     →  ~2 GB
llama3.1:8b     →  ~4.7 GB
llama3.1:70b    →  ~40 GB
codellama:7b    →  ~3.8 GB
codellama:13b   →  ~7.5 GB
codellama:34b   →  ~19 GB
mistral:7b      →  ~4.1 GB

# Check current disk usage
ollama list | awk '{print $3}' | tail -n +2

# Find models directory
du -sh ~/.ollama/models
```

### Check Your Hardware

```bash
# macOS
system_profiler SPHardwareDataType | grep Memory
system_profiler SPDisplaysDataType | grep VRAM

# Linux
free -h
glances --stdout cpu,mem,gpu
nvidia-smi  # For NVIDIA GPUs

# Check Ollama GPU detection
ollama ps
```

---

## 6. Performance Optimization

### Context Window Management

```javascript
// Optimize context per model
const config = {
  // Small models - shorter context, faster
  "qwen2.5:0.5b": { context_window: 8192, max_tokens: 1024 },
  "llama3.2:3b": { context_window: 131072, max_tokens: 4096 },
  
  // Medium models - balanced
  "llama3.1:8b": { context_window: 128000, max_tokens: 4096 },
  "mistral:7b": { context_window: 32768, max_tokens: 4096 },
  
  // Large models - full context
  "llama3.1:70b": { context_window: 128000, max_tokens: 8192 },
};

// Use appropriate context for your task
const researchTask = await sessions_spawn({
  session_name: "research",
  model: "ollama/qwen2.5:14b",
  context_window: 16384,  // Don't use full 128k if not needed
});
```

### Batch Processing

```javascript
// Process multiple items efficiently
const batchProcess = async (items, model) => {
  const agent = await sessions_spawn({
    session_name: "batch-processor",
    model: `ollama/${model}`,
    timeout: 300000,
  });

  const results = [];
  for (const item of items) {
    const result = await sessions_message({
      to: agent.session_id,
      content: `Process: ${item}`,
    });
    results.push(result);
  }

  return results;
};

// Or parallel processing (if memory allows)
const parallelProcess = async (items, model, concurrency = 3) => {
  const chunks = chunk(items, concurrency);
  const results = [];

  for (const chunk of chunks) {
    const chunkPromises = chunk.map(item => 
      sessions_spawn({
        session_name: `worker-${item.id}`,
        model: `ollama/${model}`,
      }).then(agent => 
        sessions_message({
          to: agent.session_id,
          content: item.prompt,
        })
      )
    );
    
    results.push(...await Promise.all(chunkPromises));
  }

  return results;
};
```

### Model Switching Strategies

```javascript
// Tiered approach: Start small, escalate if needed
const tieredQuery = async (prompt) => {
  // Try fast model first
  const fastAgent = await sessions_spawn({
    session_name: "fast-check",
    model: "ollama/qwen2.5:7b",
    timeout: 30000,
  });

  const fastResult = await sessions_message({
    to: fastAgent.session_id,
    content: prompt,
  });

  // Check confidence (you'd implement this logic)
  if (needsBetterModel(fastResult)) {
    const qualityAgent = await sessions_spawn({
      session_name: "quality-check",
      model: "ollama/llama3.1:70b",
      timeout: 120000,
    });

    return await sessions_message({
      to: qualityAgent.session_id,
      content: prompt,
    });
  }

  return fastResult;
};

// Task-based routing
const routeByTask = async (task, prompt) => {
  const routers = {
    code: "ollama/codellama:13b",
    research: "ollama/qwen2.5:14b",
    creative: "ollama/llama3.2:3b",
    analysis: "ollama/mistral:7b",
    default: "ollama/llama3.1:8b",
  };

  const agent = await sessions_spawn({
    session_name: `${task}-agent`,
    model: routers[task] || routers.default,
  });

  return await sessions_message({
    to: agent.session_id,
    content: prompt,
  });
};
```

### Keep Models Warm

```bash
# Preload models to avoid cold start
ollama run llama3.2:3b "" &
ollama run qwen2.5:14b "" &

# Or via API
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "hello"
}'
```

---

## 7. Cost Comparison

### Local vs API Pricing

| Provider | Model | Price per 1M Tokens | Notes |
|----------|-------|---------------------|-------|
| **Local (Ollama)** | Any | **$0** | After hardware cost |
| OpenAI | GPT-4o | $2.50 / $10.00 | Input/Output |
| OpenAI | GPT-4o-mini | $0.15 / $0.60 | Budget option |
| Anthropic | Claude 3.5 Sonnet | $3.00 / $15.00 | High quality |
| Anthropic | Claude 3.5 Haiku | $0.25 / $1.25 | Fast |
| Google | Gemini 1.5 Pro | $1.25 / $5.00 | Long context |
| Google | Gemini 1.5 Flash | $0.075 / $0.30 | Fast, cheap |

### Hardware Investment Break-Even

```
Scenario: 10M tokens/month usage

API Costs (Claude 3.5 Sonnet):
  Input:  5M × $3  = $15,000
  Output: 5M × $15 = $75,000
  Monthly: $90,000
  Annual: $1,080,000

Local Setup (High-End):
  RTX 4090 + 64GB RAM workstation: ~$4,000
  Electricity (300W × 24h × 365): ~$400/year
  
  Break-even: 1.2 months
```

```
Scenario: 1M tokens/month usage

API Costs (GPT-4o):
  Mixed usage: ~$5,000/month
  Annual: $60,000

Local Setup (Mid-Range):
  RTX 3060 + 32GB RAM: ~$1,500
  Electricity: ~$200/year
  
  Break-even: 1 month
```

```
Scenario: 100K tokens/month usage

API Costs (GPT-4o-mini):
  ~$200/month
  Annual: $2,400

Local Setup (Entry-Level):
  M1 Mac Mini (16GB): ~$600
  Electricity: ~$50/year
  
  Break-even: 3 months
```

### When to Use Which

**Use Local (Ollama) when:**
- Privacy is critical (healthcare, legal, finance)
- You need 100% uptime without rate limits
- You process >500K tokens/month
- You work offline frequently
- You want predictable costs
- You need custom fine-tuned models

**Use API when:**
- You need the absolute best quality (GPT-4o, Claude 3.5 Opus)
- Your usage is sporadic (<100K tokens/month)
- You can't invest in hardware upfront
- You need multimodal (vision) capabilities
- You want zero maintenance

**Hybrid Approach:**
```javascript
const smartRoute = async (prompt, complexity) => {
  if (complexity === "high" || needsVision(prompt)) {
    // Use API for best quality
    return await callOpenAI(prompt);
  }
  if (complexity === "medium") {
    // Use local 70B model
    return await spawnLocal("llama3.1:70b", prompt);
  }
  // Use local small model for simple tasks
  return await spawnLocal("qwen2.5:7b", prompt);
};
```

---

## 8. Troubleshooting

### Common Errors

#### "Connection refused" / "Ollama not running"

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If failed, start Ollama
ollama serve &

# Or check system service
sudo systemctl status ollama  # Linux
brew services start ollama     # macOS
```

#### "Model not found"

```bash
# Pull the model first
ollama pull llama3.2

# Verify it's available
ollama list

# Check exact model name
ollama list | grep llama
```

#### "Out of memory"

```bash
# Check current memory usage
free -h  # Linux
vm_stat  # macOS

# Reduce context window in agent config
{
  model: "ollama/llama3.1:8b",
  context_window: 4096,  // Reduce from 128000
}

# Use a smaller model variant
ollama pull llama3.1:8b  # Instead of 70b
ollama pull qwen2.5:7b   # Instead of 14b

# Close other applications
# Restart Ollama to clear memory
ollama stop && ollama serve &
```

### Timeout Fixes

```javascript
// Increase timeout for slow hardware
const agent = await sessions_spawn({
  session_name: "patient-agent",
  model: "ollama/llama3.1:70b",
  timeout: 600000,  // 10 minutes for large models
});

// Stream responses for long generations
const agent = await sessions_spawn({
  session_name: "streaming-agent",
  model: "ollama/llama3.2:3b",
  streaming: true,  // Get tokens as they're generated
});
```

### Memory Issues

```bash
# Check Ollama memory usage
ps aux | grep ollama
ollama ps

# Clear unused models from memory
ollama stop llama3.1:70b  # Stop specific model
ollama stop  # Stop all models

# Limit concurrent agents
# Don't spawn more agents than your RAM can handle
# Rule of thumb: 1 × 7B model per 8GB RAM
```

### Performance Debugging

```bash
# Check GPU utilization
nvidia-smi -l 1  # Update every second

# Monitor Ollama logs
ollama serve 2>&1 | tee ollama.log

# Benchmark a model
ollama run llama3.2:3b "Explain quantum computing in detail"

# Compare inference speeds
time ollama run llama3.2:3b "Hello"
time ollama run llama3.1:8b "Hello"
```

### Model Quality Issues

```javascript
// Adjust generation parameters
const agent = await sessions_spawn({
  session_name: "better-agent",
  model: "ollama/llama3.1:8b",
  temperature: 0.7,    // Increase for creativity
  top_p: 0.9,          // Nucleus sampling
  repeat_penalty: 1.1, // Reduce repetition
});
```

### Network Issues

```bash
# Test Ollama connectivity
curl -v http://localhost:11434/api/tags

# Check firewall (Linux)
sudo ufw status
sudo ufw allow 11434/tcp

# Verify port is not in use
lsof -i :11434

# Change port if needed
export OLLAMA_HOST="http://localhost:8080"
ollama serve
```

### Getting Help

```bash
# Ollama version
ollama --version

# System info
ollama info

# Verbose logging
OLLAMA_DEBUG=1 ollama serve

# Community support
# GitHub: https://github.com/ollama/ollama/issues
# Discord: https://discord.gg/ollama
```

---

## Quick Reference Card

```bash
# === START OLLAMA ===
ollama serve &

# === LIST MODELS ===
ollama list

# === PULL MODELS ===
ollama pull llama3.1:8b
ollama pull qwen2.5:14b
ollama pull codellama:13b

# === SPAWN AGENT ===
# Research:    ollama/qwen2.5:14b
# Creative:    ollama/llama3.2:3b
# Code:        ollama/codellama:13b
# Analysis:    ollama/mistral:7b
# General:     ollama/llama3.1:8b

# === CHECK MEMORY ===
ollama ps
free -h

# === STOP MODELS ===
ollama stop <model>
```

---

## Further Reading

- [Ollama Documentation](https://github.com/ollama/ollama)
- [OpenClaw Sessions API](../api/sessions.md)
- [Model Comparison Guide](https://ollama.com/library)
- [Hardware Requirements Deep Dive](https://github.com/ollama/ollama/blob/main/docs/gpu.md)
