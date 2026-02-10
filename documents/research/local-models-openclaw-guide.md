# OpenClaw Local Models: Comprehensive Guide

> **Research Date:** February 10, 2026  
> **Focus:** Local LLM integration with OpenClaw using Ollama and other local providers

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [YouTube Video Resources](#youtube-video-resources)
3. [Recommended Model Tiers](#recommended-model-tiers)
4. [Step-by-Step Ollama Setup](#step-by-step-ollama-setup)
5. [OpenClaw Configuration](#openclaw-configuration)
6. [Hardware Requirements](#hardware-requirements)
7. [Performance Benchmarks](#performance-benchmarks)
8. [Cost/Benefit Analysis](#costbenefit-analysis)
9. [Real-World Use Cases](#real-world-use-cases)
10. [Setup Pitfalls & Solutions](#setup-pitfalls--solutions)

---

## Executive Summary

OpenClaw (formerly Clawdbot/Moltbot) is an open-source, self-hosted AI agent framework that enables users to run AI coding agents locally with complete privacy. By integrating with Ollama, users can achieve a fully offline setup with zero API costs while maintaining data sovereignty.

**Key Benefits of Local Models:**
- 💰 **Zero ongoing API costs** after initial hardware investment
- 🔒 **100% data privacy** - code and conversations never leave your machine
- 🌐 **Offline capability** - works without internet connection
- ⚡ **No rate limits** - use as much as your hardware allows
- 🛠️ **Full control** over model selection and configuration

---

## YouTube Video Resources

### Primary Tutorial Videos

| Title | URL | Channel | Duration | Key Topics |
|-------|-----|---------|----------|------------|
| **OpenClaw with Local Ollama Models - Complete Easy Setup Guide** | https://www.youtube.com/watch?v=egofv8c7oEk | Unknown | ~20 min | Step-by-step Ollama setup with Telegram integration |
| **OpenClaw Skills Tutorial - Build Local AI Agent Skills + MoltBook Integration** | https://www.youtube.com/watch?v=CENnPXxVUAc | Unknown | ~25 min | Creating custom skills with Ollama and Moltbook |
| **Let's Run Qwen3-Coder-Next - ULTRA FAST Local AI that Beats Claude & OpenClaw? REVIEW** | https://www.youtube.com/watch?v=yvnHbtA7P8w | Unknown | ~15 min | Qwen3-Coder-Next performance review |
| **OpenClaw Full Tutorial for Beginners** (freeCodeCamp) | https://www.freecodecamp.org/news/openclaw-full-tutorial-for-beginners/ | freeCodeCamp | ~45 min | Comprehensive introduction covering local installation |

### Video Content Summary

**"OpenClaw with Local Ollama Models" (Most Popular)**
- **Local models covered:** Qwen2.5-Coder, Llama3.3, DeepSeek-R1
- **Setup instructions:** Installing Ollama, pulling models, configuring Telegram bot
- **Hardware focus:** Consumer GPUs (RTX 3060/4060) and Apple Silicon Macs
- **Performance notes:** 8B models at 20-40 tokens/sec on mid-range hardware
- **Use cases:** Personal AI assistant, coding help, file management

**Key Takeaways from Video Reviews:**
1. `ollama launch openclaw` is the fastest setup method (5-10 minutes)
2. Qwen models excel at tool calling and coding tasks
3. Context length requirements are critical (minimum 64K recommended)
4. GPU offloading significantly improves response times

---

## Recommended Model Tiers

### Tier 1: Small/Budget (3B-8B Parameters)

**Best for:** Testing, simple tasks, older hardware, budget GPUs (4-8GB VRAM)

| Model | Size | VRAM Required | Best Use Case | Tool Calling |
|-------|------|---------------|---------------|--------------|
| **Llama 3.2 3B** | 3B | 3.5-4GB | Basic Q&A, simple scripting | Limited |
| **Qwen 3 4B** | 4B | 4-5GB | Multilingual tasks, coding | Moderate |
| **Llama 3.1 8B** | 8B | 6-7GB | General purpose, faster responses | Moderate |
| **Qwen 3 8B** | 8B | 6-8GB | Coding, tool calling | Good |

**Performance:** 15-40 tokens/sec on entry-level hardware

**Limitations:** May hallucinate with complex tool calling; shorter context handling

---

### Tier 2: Medium/Recommended (14B-20B Parameters)

**Best for:** Daily use, serious coding, reliable tool calling, mid-range GPUs (8-16GB VRAM)

| Model | Size | VRAM Required | Best Use Case | Tool Calling |
|-------|------|---------------|---------------|--------------|
| **Qwen3 14B** | 14B | 10-12GB | Coding assistant, file operations | Excellent |
| **DeepSeek-R1-Distill-Qwen-14B** | 14B | 11-12.5GB | Reasoning tasks, math | Good |
| **Phi-4 14B** | 14B | 11GB | General assistant tasks | Good |
| **GPT OSS 20B** | 20B | 11-12GB | Balanced performance | Good |
| **Gemma 3 12B** | 12B | 12-13GB | General purpose, Google ecosystem | Moderate |

**Performance:** 10-30 tokens/sec on mid-range hardware

**Why this tier:** Sweet spot between capability and hardware requirements. Most reliable for OpenClaw's agentic workflows.

---

### Tier 3: Large/Professional (32B+ Parameters)

**Best for:** Complex coding tasks, large context processing, high-end GPUs (16GB+ VRAM)

| Model | Size | VRAM Required | Best Use Case | Tool Calling |
|-------|------|---------------|---------------|--------------|
| **Qwen 3 32B** | 32B | 18-22GB | Professional coding, architecture | Excellent |
| **Qwen2.5-Coder 32B** | 32B | 20-24GB | Code generation, refactoring | Excellent |
| **DeepSeek-R1 32B** | 32B | 18-22GB | Complex reasoning, debugging | Excellent |
| **Gemma 3 27B** | 27B | 19-22GB | General purpose, long context | Good |

**Performance:** 5-15 tokens/sec on high-end consumer hardware

**Note:** These models approach Claude Sonnet 4.5 quality for many tasks

---

### Tier 4: Ultra/Workstation (70B+ Parameters)

**Best for:** Maximum capability, research, enterprise use, multi-GPU setups (48GB+ VRAM)

| Model | Size | VRAM Required | Best Use Case |
|-------|------|---------------|---------------|
| **Llama 3.3 70B** | 70B | 37-45GB | Frontier-level reasoning |
| **Qwen 2.5 72B** | 72B | 40-50GB | Professional development |
| **Qwen3-Coder-Next** | 80B (3B active) | 46GB | Best local coding model (70.6% SWE-Bench) |

**Hardware:** Requires dual RTX 4090, Mac Studio M3 Ultra, or 64GB+ unified memory

**Performance:** 5-12 tokens/sec on workstation hardware

---

### Special Mention: Qwen3-Coder-Next (The Game Changer)

Released February 2026, this MoE (Mixture of Experts) model achieves **70.6% on SWE-Bench Verified** with only 3B active parameters:

- **Total parameters:** 80B
- **Active per token:** 3B (massive efficiency)
- **VRAM required:** ~46GB (Q4 quantization)
- **Performance:** 87% of Claude Opus 4.5 (80.9%)
- **Throughput:** 10x higher than dense models

**Verdict:** First local model to approach frontier performance. Breaks even vs API costs in 8-12 months.

---

## Step-by-Step Ollama Setup

### Prerequisites

- **OS:** macOS, Linux, or Windows (WSL2)
- **RAM:** Minimum 16GB (32GB+ recommended)
- **Storage:** 10-50GB per model
- **GPU:** Optional but strongly recommended (NVIDIA, AMD, or Apple Silicon)

### Method 1: One-Command Setup (Recommended)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a recommended model (choose one)
ollama pull qwen3-coder:14b          # Best balance
ollama pull qwen2.5-coder:32b        # Better quality, more VRAM
ollama pull llama3.3:70b             # Maximum capability

# Launch OpenClaw with Ollama
ollama launch openclaw
```

The `ollama launch openclaw` command:
1. Installs OpenClaw (if not present)
2. Starts the onboarding wizard
3. Auto-configures Ollama as the backend
4. Sets up messaging channels (optional)
5. Runs gateway on default port 18789

### Method 2: Manual Installation (Advanced)

```bash
# Step 1: Install Node.js (v22+ recommended)
# Download from nodejs.org or use nvm

# Step 2: Install OpenClaw
npm install -g openclaw@latest

# Step 3: Run onboarding
openclaw onboard --install-daemon

# Step 4: Select Ollama during wizard
# Choose: Quick Start → Skip Cloud → Select Ollama
```

### Method 3: Docker Setup

```bash
# Clone repository
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Start services
docker-compose up -d
```

---

## OpenClaw Configuration

### Basic Ollama Configuration

Edit `~/.openclaw/openclaw.json`:

```json
{
  "models": {
    "providers": {
      "ollama": {
        "baseUrl": "http://127.0.0.1:11434/v1",
        "apiKey": "ollama",
        "auth": "api-key"
      }
    },
    "default": "qwen3-coder:14b-instruct"
  }
}
```

### Hybrid Configuration (Local + Cloud Fallback)

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/qwen3-coder:14b",
        "fallbacks": ["anthropic/claude-sonnet-4-5", "anthropic/claude-opus-4-6"]
      },
      "models": {
        "ollama/qwen3-coder:14b": { "alias": "Local Qwen" },
        "anthropic/claude-sonnet-4-5": { "alias": "Sonnet" },
        "anthropic/claude-opus-4-6": { "alias": "Opus" }
      }
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "ollama": {
        "baseUrl": "http://127.0.0.1:11434/v1",
        "apiKey": "ollama",
        "models": [
          {
            "id": "qwen3-coder:14b",
            "name": "Qwen3 Coder 14B",
            "contextWindow": 128000,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

### LM Studio Integration (Alternative)

```json
{
  "agents": {
    "defaults": {
      "model": { "primary": "lmstudio/minimax-m2.1-gs32" }
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "lmstudio": {
        "baseUrl": "http://127.0.0.1:1234/v1",
        "apiKey": "lmstudio",
        "api": "openai-responses",
        "models": [
          {
            "id": "minimax-m2.1-gs32",
            "name": "MiniMax M2.1 GS32",
            "contextWindow": 196608,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

### vLLM Configuration (Advanced)

```json
{
  "models": {
    "providers": {
      "vllm": {
        "baseUrl": "http://localhost:8000/v1",
        "apiKey": "sk-local",
        "api": "openai-responses"
      }
    }
  }
}
```

---

## Hardware Requirements

### VRAM Requirements by Model Size

| Model Size | Q4_KM VRAM | Q5_KM VRAM | Q6_K VRAM | Hardware Tier |
|------------|------------|------------|-----------|---------------|
| 3B | 3-4GB | 4-5GB | 5-6GB | Entry GPU |
| 7-8B | 6-7GB | 7-8GB | 8-10GB | Mid GPU |
| 14B | 10-12GB | 12-14GB | 14-16GB | High GPU |
| 20B | 12-13GB | 14-15GB | 16-18GB | High GPU |
| 32B | 18-22GB | 22-26GB | 26-30GB | Workstation |
| 70B+ | 37-45GB | 45-55GB | 55-65GB | Multi-GPU |

### Recommended Hardware Configurations

#### Budget Setup ($500-800)
- **CPU:** Modern 6-core (Intel 12th gen / AMD Ryzen 5000+)
- **RAM:** 16-32GB DDR4
- **GPU:** GTX 1070 Ti 8GB / RTX 3060 8GB / Used RX 6600
- **Storage:** 512GB SSD
- **Capable of:** 3B-8B models, 10-30 tokens/sec

#### Recommended Setup ($1,500-2,500)
- **CPU:** 8-core modern processor
- **RAM:** 32-64GB DDR4/DDR5
- **GPU:** RTX 4070 12GB / RTX 3090 24GB / RX 7900 XTX 24GB
- **Storage:** 1TB NVMe SSD
- **Capable of:** 14B-32B models, 15-40 tokens/sec

#### Apple Silicon Setup ($1,600-4,000)
- **Mac Mini M4 Pro 64GB** (~$2,000): 32B models at 10-15 tok/sec
- **Mac Studio M3 Ultra** (~$4,000+): 70B models, dual-encoder video
- **Mac Mini M4 24GB** (~$800): 14B models with offload

#### Workstation Setup ($5,000+)
- **GPU:** Dual RTX 4090 24GB or RTX 6000 Ada 48GB
- **RAM:** 128GB DDR5
- **Storage:** 2TB NVMe
- **Capable of:** 70B+ models, 32B at full speed

### Context Length Impact on VRAM

KV Cache grows **linearly** with context length:

| Model | 4K Context | 8K Context | 32K Context |
|-------|------------|------------|-------------|
| 8B Q4 | 6.2GB | 7.5GB | 11GB |
| 14B Q4 | 10.7GB | 12.5GB | 18GB |
| 32B Q4 | 22GB | 26GB | 38GB |

**Recommendation:** Use `contextWindow` of 64K minimum for OpenClaw tasks

---

## Performance Benchmarks

### Token Generation Speeds (tokens/second)

| Hardware | 8B Model | 14B Model | 32B Model | 70B Model |
|----------|----------|-----------|-----------|-----------|
| RTX 4060 8GB | 25-35 | 10-15 | N/A | N/A |
| RTX 4070 12GB | 35-45 | 20-30 | 8-12 | N/A |
| RTX 4090 24GB | 50-60 | 35-45 | 18-25 | 8-12 |
| RX 7900 XTX | 40-50 | 25-35 | 12-18 | 6-10 |
| Mac Mini M4 Pro | 30-40 | 15-20 | 10-15 | N/A |
| Mac Studio Ultra | 50-60 | 35-45 | 25-35 | 10-15 |
| CPU-only (i7) | 3-6 | 2-4 | 1-2 | <1 |

### Coding Benchmarks (SWE-Bench Verified)

| Model | Score | Hardware Required |
|-------|-------|-------------------|
| Claude Opus 4.5 | 80.9% | Cloud API |
| GLM-4.7 | 74.2% | 48GB+ VRAM |
| **Qwen3-Coder-Next** | **70.6%** | **46GB VRAM** |
| DeepSeek-V3.2 | 70.2% | Cloud API |
| GPT OSS 20B | ~60% | 12GB VRAM |
| Qwen3 32B | ~55% | 22GB VRAM |

**Key insight:** Qwen3-Coder-Next achieves 87% of Opus 4.5 performance locally

### Quality vs Speed Trade-offs

| Model Size | Quality | Speed | Best For |
|------------|---------|-------|----------|
| 3-8B | ⭐⭐ | ⭐⭐⭐⭐⭐ | Quick responses, simple tasks |
| 14-20B | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Daily driver, good balance |
| 32B | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Complex tasks, coding |
| 70B+ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Maximum quality, research |

---

## Cost/Benefit Analysis

### Cloud API Costs (Monthly)

| Usage Level | Claude Opus | Claude Sonnet | GPT-4o | Total |
|-------------|-------------|---------------|--------|-------|
| Light (hobby) | $20-30 | $10-20 | $10-15 | $40-65 |
| Moderate (dev) | $70-100 | $30-50 | $30-40 | $130-190 |
| Heavy (pro) | $150-250 | $70-120 | $60-100 | $280-470 |

### Local Setup Costs

| Component | Budget | Recommended | Workstation |
|-----------|--------|-------------|-------------|
| **Hardware** | $800 | $2,000 | $5,000+ |
| **Electricity** | ~$5/mo | ~$10/mo | ~$20/mo |
| **Maintenance** | None | None | None |

### Break-Even Analysis

| Setup | Cost | Break-Even (vs Cloud) | 3-Year Savings |
|-------|------|----------------------|----------------|
| Budget (8B models) | $800 | 12-18 months | $500-1,500 |
| Recommended (32B) | $2,000 | 8-12 months | $2,500-5,000 |
| Workstation (70B) | $5,000 | 12-18 months | $5,000-12,000 |

### Intangible Benefits

✅ **Privacy:** Code never leaves your machine  
✅ **Reliability:** No API outages or rate limits  
✅ **Customization:** Fine-tune for your codebase  
✅ **Offline:** Work anywhere without internet  
✅ **No vendor lock-in:** Switch models anytime  

---

## Real-World Use Cases

### Use Case 1: Privacy-First Development
**Scenario:** Healthcare/fintech developer working with sensitive code  
**Setup:** Mac Mini M4 Pro 64GB + Qwen3-Coder-Next  
**Benefit:** HIPAA/SOC2 compliance without cloud exposure

### Use Case 2: Offline Coding Assistant
**Scenario:** Frequent traveler, spotty internet  
**Setup:** Laptop with RTX 4070 + Qwen3 14B  
**Benefit:** Full capability on planes, trains, remote locations

### Use Case 3: Cost-Conscious Startup
**Scenario:** Small team, high API bills  
**Setup:** Shared workstation with RTX 4090  
**Benefit:** $200+/month savings, scales with team

### Use Case 4: Proactive System Monitor
**Scenario:** DevOps engineer using OpenClaw 24/7  
**Setup:** Local OpenClaw + Ollama on home server  
**Benefit:** Persistent memory, scheduled automations, no API quotas

### Use Case 5: Learning & Experimentation
**Scenario:** AI researcher testing different models  
**Setup:** Multi-GPU rig with Ollama + vLLM  
**Benefit:** Test any model, compare benchmarks, no per-call costs

---

## Setup Pitfalls & Solutions

### Pitfall 1: Model Lacks Tool Calling
**Symptom:** Agent returns text instead of executing commands  
**Solution:** Use models with verified tool calling: Qwen3, DeepSeek-R1, Llama3.3  
**Avoid:** Generic instruction-tuned models without function calling training

### Pitfall 2: Insufficient Context Length
**Symptom:** Agent forgets previous steps mid-task  
**Solution:** Configure minimum 64K context; 128K+ recommended  
```json
"contextWindow": 128000
```

### Pitfall 3: Context Truncation Errors
**Symptom:** "Context too long" errors during complex tasks  
**Solution:** Enable compaction; reduce contextWindow; use smaller prompts

### Pitfall 4: Slow Response Times
**Symptom:** 5+ seconds between responses  
**Solutions:**
- Ensure model fully loaded in VRAM (check `ollama ps`)
- Reduce model size or use quantization
- Enable GPU offloading for all layers
- Check for CPU throttling/thermal issues

### Pitfall 5: WebSocket Connection Issues
**Symptom:** Cannot connect to Ollama from remote machine  
**Solution:** OpenClaw uses WebSockets requiring HTTPS for non-localhost  
**Fix:** Use Tailscale VPN or reverse proxy with HTTPS

### Pitfall 6: Cold Start Delays
**Symptom:** First request after idle is very slow  
**Solution:** Keep model loaded; use `ollama serve` with `--keepalive` flag

### Pitfall 7: Excessive VRAM Usage
**Symptom:** System freezes, out-of-memory errors  
**Solutions:**
- Reduce contextWindow
- Use lower quantization (Q4 instead of Q6)
- Enable CPU offloading for some layers
- Close other GPU applications

### Pitfall 8: Model Hallucinations
**Symptom:** Agent invents non-existent tools or commands  
**Solution:** Use larger models (14B+); verify tool calling capability; use system prompts

### Pitfall 9: Security Risks with OpenClaw
**Symptom:** Concerned about giving AI system access  **Mitigations:**
- Run in Docker sandbox (default)
- Whitelist only necessary tools
- Never expose gateway to public internet
- Use isolated hardware/network
- Review skills before installing from ClawHub

### Pitfall 10: Telegram Bot Not Responding
**Symptom:** No response from bot after setup  **Checklist:**
1. Is OpenClaw running? (`docker-compose ps`)
2. Is Ollama running? (`ollama ps`)
3. Is token correct? (re-run onboarding)
4. Is user ID whitelisted? (`TELEGRAM_ALLOWED_USERS`)
5. Check logs: `docker-compose logs -f`

---

## Quick Reference

### Recommended Starting Point

```bash
# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Pull recommended model
ollama pull qwen3-coder:14b

# 3. Launch OpenClaw
ollama launch openclaw

# 4. Follow wizard prompts
# 5. Start chatting!
```

### Essential Commands

```bash
ollama list                    # Show installed models
ollama ps                      # Show running models
ollama pull <model>           # Download model
ollama rm <model>             # Remove model
ollama run <model>            # Interactive chat
ollama serve                  # Start API server
openclaw onboard              # Re-run setup wizard
openclaw logs                 # View gateway logs
```

### Model Quick-Select

| Hardware | Recommended Model |
|----------|-------------------|
| 4-6GB VRAM | qwen3:4b, llama3.2:3b |
| 8-12GB VRAM | qwen3:14b, llama3.1:8b |
| 16-24GB VRAM | qwen2.5-coder:32b, qwen3:32b |
| 48GB+ VRAM | llama3.3:70b, qwen3-coder-next |

---

## Conclusion

Local models for OpenClaw have evolved from experimental to genuinely practical. With Qwen3-Coder-Next achieving 70% of Claude Opus performance, the gap between local and cloud is narrowing rapidly.

**For most users:** Start with Qwen3 14B on existing hardware. Upgrade if you hit limitations.

**For serious use:** The recommended setup (RTX 4070/4090 or Mac Mini M4 Pro) pays for itself in 8-12 months while providing complete privacy.

**Key Takeaway:** Local deployment isn't about matching cloud performance exactly—it's about getting 80-90% of the capability with 100% privacy and zero ongoing costs.

---

*Last Updated: February 10, 2026*  
*Sources: Ollama docs, OpenClaw docs, Reddit r/LocalLLaMA, YouTube tutorials, Qwen research papers*
