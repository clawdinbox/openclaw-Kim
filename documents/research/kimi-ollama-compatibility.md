# Kimi K2.5 with Ollama: Compatibility Research Report

**Date:** February 10, 2026  
**Researcher:** OpenClaw Subagent  
**Requester:** Marcel

---

## Executive Summary

**Can Kimi K2.5 work with Ollama?** 

**Answer: Yes, but with important caveats.**

There are **three distinct ways** to use Kimi K2.5 with Ollama:

1. **Ollama Cloud (Easiest)** - Use `kimi-k2.5:cloud` tag for API-based access
2. **Local GGUF via llama.cpp (Complex, Hardware-intensive)** - Run quantized models locally  
3. **API Proxy Solutions (Intermediate)** - Bridge Ollama API to Moonshot's API

**⚠️ Important:** True "local" deployment requires **extreme hardware** (240GB+ RAM/VRAM minimum, ideally 512GB+).

---

## 1. Is Kimi K2.5 Available as Open Weights?

**YES** - Kimi K2.5 is officially released as an **open-weight model** under a Modified MIT License.

### Official Sources:
- **HuggingFace:** https://huggingface.co/moonshotai/Kimi-K2.5
- **GitHub:** https://github.com/moonshotai/Kimi-K2.5
- **Size:** 595 GB (original INT4 weights)
- **Parameters:** 1 trillion total / 32 billion active (MoE architecture)

### Key Model Specifications:
| Attribute | Value |
|-----------|-------|
| Architecture | Mixture-of-Experts (MoE) |
| Total Parameters | 1T |
| Activated Parameters | 32B |
| Context Length | 256K tokens |
| Native Quantization | INT4 |
| Vision Encoder | MoonViT (400M params) |

---

## 2. Unofficial Ports and GGUF Files

### Available GGUF Quantizations:

| Source | Quant Type | Size | Notes |
|--------|------------|------|-------|
| **unsloth/Kimi-K2.5-GGUF** | UD-TQ1_0 (1.8-bit) | ~240GB | Smallest usable quant |
| **unsloth/Kimi-K2.5-GGUF** | UD-Q2_K_XL | ~375GB | Recommended balance |
| **AesSedai/Kimi-K2.5-GGUF** | Q4_X | ~544GB | Best quality GGUF |
| **mlx-community/Kimi-K2.5** | MLX format | varies | For Apple Silicon |

### Where to Download:
- **Unsloth GGUFs:** https://huggingface.co/unsloth/Kimi-K2.5-GGUF
- **MLX Community:** https://huggingface.co/mlx-community/Kimi-K2.5
- **AesSedai quants:** https://huggingface.co/AesSedai/Kimi-K2.5-GGUF

### Running GGUF with llama.cpp:

```bash
# Install llama.cpp with CUDA support (or without for CPU)
git clone https://github.com/ggml-org/llama.cpp
cmake llama.cpp -B llama.cpp/build -DBUILD_SHARED_LIBS=OFF -DGGML_CUDA=ON
cmake --build llama.cpp/build --config Release -j

# Run with Unsloth 1.8-bit quant
LLAMA_SET_ROWS=1 ./llama.cpp/llama-cli \
  --model Kimi-K2.5-UD-TQ1_0-00001-of-00005.gguf \
  --temp 1.0 --min_p 0.01 --top-p 0.95 \
  --ctx-size 16384 --fit on --jinja
```

---

## 3. Ollama Cloud Integration

### What is `kimi-k2.5:cloud`?

Ollama provides a **cloud-only** tag that proxies requests to Moonshot's API:

```bash
# Run via Ollama Cloud (API-based, NOT local)
ollama run kimi-k2.5:cloud
```

### How It Works:
- Ollama's cloud service forwards your requests to Moonshot's API
- Requires internet connection
- You pay for API usage (or use free tier if available)
- **NOT** running locally on your hardware

### Usage Example:
```bash
curl http://localhost:11434/api/chat \
  -d '{
    "model": "kimi-k2.5:cloud",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Verified Availability:
- ✅ Listed on Ollama's official library: https://ollama.com/library/kimi-k2.5
- ✅ Works with `kimi-k2.5:cloud` tag
- ✅ Compatible with Claude Code, Codex, OpenCode via `ollama launch`

---

## 4. Community Projects: Bridging Kimi + Ollama

### Option A: ollama-api-proxy (Recommended)

**GitHub:** https://github.com/xrip/ollama-api-proxy

A Node.js/Docker proxy that creates an Ollama-compatible server and forwards requests to Moonshot's API.

**Features:**
- Runs on port 11434 (same as Ollama)
- Supports OpenRouter, OpenAI, and Gemini
- Can be configured for Kimi K2/K2.5
- Works with JetBrains AI Assistant and other Ollama-compatible tools

**Setup:**
```bash
# Using npx
npx ollama-api-proxy

# Or with Docker
docker run -p 11434:11434 --env-file .env ollama-proxy
```

### Option B: Fake Ollama

**GitHub:** https://github.com/spoonnotfound/fake-ollama

Python-based proxy specifically designed for VSCode Copilot integration.

**Setup:**
```bash
git clone https://github.com/spoonnotfound/fake-ollama.git
cd fake-ollama
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_BASE=https://openrouter.ai/api/v1" > .env
echo "OPENAI_API_KEY=your_key" >> .env
echo "MODEL_NAME=moonshotai/kimi-k2" >> .env

python main.py
```

### Option C: LiteLLM Proxy

**Docs:** https://docs.litellm.ai/docs/proxy_server

More advanced proxy for teams, supports multiple providers with unified API.

---

## 5. Official Stance from Moonshot on Local Deployment

### Officially Supported Inference Engines:
Moonshot officially recommends these for local deployment:

1. **vLLM** - Fastest for batched inference
2. **SGLang** - Good for structured outputs
3. **KTransformers** - Optimized for MoE models

### Minimum Requirements (from Moonshot docs):
- **Minimum:** 240GB unified memory (RAM + VRAM)
- **Recommended:** 380GB+ for 2-bit quants
- **Full precision:** 600GB+ (typically requires 4× H200 GPUs)

### Hardware Examples from Community:

| Setup | Performance | Cost Estimate |
|-------|-------------|---------------|
| 2× Mac Studio M3 Ultra (512GB each) | ~20-24 tokens/sec | ~$16,000 |
| 1× Mac Studio M3 Ultra (512GB) | ~19.8 tokens/sec | ~$8,000 |
| 4× H200 GPUs | >40 tokens/sec | ~$100,000+ |
| 256GB RAM + 16GB VRAM (offloaded) | ~5 tokens/sec | ~$2,000-3,000 |

### Official API:
Moonshot provides OpenAI-compatible API at https://platform.moonshot.ai

---

## 6. Alternative Approaches Summary

### Comparison Table:

| Method | Local? | Hardware Required | Difficulty | Speed | Cost |
|--------|--------|-------------------|------------|-------|------|
| Ollama Cloud (`:cloud`) | ❌ No | Any | Easy | Fast | API pricing |
| API Proxy | ❌ No | Any | Medium | Fast | API pricing |
| llama.cpp + GGUF | ✅ Yes | 240GB+ RAM | Hard | Slow | Hardware cost |
| MLX (Apple Silicon) | ✅ Yes | 512GB Mac | Hard | Medium | $8,000+ |
| vLLM/SGLang | ✅ Yes | Multi-GPU | Expert | Fast | $50,000+ |

---

## 7. Final Verdict for Marcel's Setup

### Can You Run Kimi K2.5 Locally with Ollama?

**❌ No** - Ollama does not currently support loading custom GGUF files for Kimi K2.5 directly.

**✅ Yes, with workarounds:**

### Recommended Options:

#### Option 1: Use Ollama Cloud (Easiest)
```bash
ollama run kimi-k2.5:cloud
```
- Works immediately
- Requires API key from Moonshot or OpenRouter
- Not truly local (uses API)

#### Option 2: Use llama.cpp Directly (True Local)
- Download GGUF from unsloth or AesSedai
- Run with llama.cpp or llama-server
- Provides OpenAI-compatible API endpoint
- **Requires 240GB+ RAM minimum**

#### Option 3: API Proxy (Best of Both Worlds)
- Use `ollama-api-proxy` or `fake-ollama`
- Get Ollama-compatible API that forwards to Moonshot
- Good for tools that expect Ollama endpoint

### Hardware Reality Check:

**For Marcel's likely setup (Mac mini or similar):**

| Your RAM | Can Run? | Expected Performance |
|----------|----------|---------------------|
| 16-32GB | ❌ No | N/A |
| 64-128GB | ❌ No | N/A |
| 256GB | ⚠️ Maybe (offloaded) | 5-10 tokens/sec |
| 512GB+ | ✅ Yes | 15-25 tokens/sec |

**Conclusion:** Unless you have 512GB unified memory (M3 Ultra Mac Studio or equivalent), true local inference of Kimi K2.5 is **not practical**. The API-based solutions (Ollama Cloud or proxy) are the realistic options.

---

## 8. Quick Start Commands

### For API-based access (recommended for most users):
```bash
# Option A: Ollama Cloud
ollama run kimi-k2.5:cloud

# Option B: With ollama-api-proxy
git clone https://github.com/xrip/ollama-api-proxy
cd ollama-api-proxy
npm install
echo "OPENROUTER_API_KEY=your_key" > .env
npm start
# Then use http://localhost:11434 as Ollama endpoint
```

### For true local (hardware permitting):
```bash
# Download GGUF
pip install huggingface_hub hf_transfer
huggingface-cli download unsloth/Kimi-K2.5-GGUF \
  --include "*UD-TQ1_0*" \
  --local-dir ./kimi-k2.5

# Run with llama.cpp
./llama-server \
  --model ./kimi-k2.5/Kimi-K2.5-UD-TQ1_0-00001-of-00005.gguf \
  --port 8001 --fit on --jinja
```

---

## References

1. **Official Model:** https://huggingface.co/moonshotai/Kimi-K2.5
2. **Ollama Library:** https://ollama.com/library/kimi-k2.5
3. **Unsloth GGUF Guide:** https://unsloth.ai/docs/models/kimi-k2.5
4. **ollama-api-proxy:** https://github.com/xrip/ollama-api-proxy
5. **Fake Ollama:** https://github.com/spoonnotfound/fake-ollama
6. **Reddit r/LocalLLaMA:** https://www.reddit.com/r/LocalLLaMA/comments/1qpfse6/run_kimi_k25_locally/
7. **Moonshot Platform:** https://platform.moonshot.ai

---

*Report generated on February 10, 2026*
