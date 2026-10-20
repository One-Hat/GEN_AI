<div align="center">

# 🧠 AXIOM: Deep Academic Research Agent

### *Zero-Cost Paper Dissection, Critical Weakness Mining & Ground-Truth Citation Graphs*

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Model Budget](https://img.shields.io/badge/API%20Cost-%240.00%20(Free)-success.svg)](https://ollama.com)
[![Data Sources](https://img.shields.io/badge/Data-arXiv%20%7C%20Semantic%20Scholar-orange.svg)](https://api.semanticscholar.org)
[![Offline Capable](https://img.shields.io/badge/Local%20Inference-Ollama%20%7C%20vLLM-purple.svg)](https://ollama.com)

<p align="center">
  <b>A specialized multi-agent pipeline designed to tear apart research papers, expose hidden bottlenecks, extract real engineering applications, and map the literature topology without spending a dime.</b>
</p>

[Quickstart](#-quickstart-in-3-steps) •
[Why Narrow Agents?](#-the-core-philosophy) •
[Architecture](#-pipeline-architecture) •
[Paper Card Schema](#-the-fixed-paper-card-schema) •
[CLI Usage](#-cli-commands) •
[Anti-Hallucination Engine](#-grounding--verification-engine)

---

</div>

## 💥 The Harsh Truth About LLMs & Research Papers

Most AI research tools dump a 30-page PDF into a massive context window and ask a generalist model to *"summarize this"*. 

**The result?**
- Vague, generic bullet points that miss technical subtleties.
- Hallucinated math, metrics, and citations.
- Complete blindness to unstated assumptions, compute requirements, or failure modes.

> **Our Axiom:** *The LLM is not your bottleneck. Retrieval quality, structured parsing, and citation graphs decide the outcome. A 7B–8B model constrained by a strict schema and clean per-section parsing beats a frontier model with raw PDFs dumped in every single time.*

---

## ⚡ The Core Philosophy

| Principle | Monolithic AI Tools | **AXIOM Pipeline** |
| :--- | :--- | :--- |
| **Model Cost** | Expensive closed APIs ($20+/mo) | **$0.00** (Local 7B/8B models via Ollama) |
| **Parsing Strategy** | Dump entire PDF into prompt | **Per-Section Slicing** (Abstract, Method, Exp, Limits) |
| **Citation Network** | LLM guesses/hallucinates links | **Hard ground-truth data** via Semantic Scholar API |
| **Citation Intents** | Unlabeled citations | Explicit categories: `methodology`, `result`, `background` |
| **Weakness Mining** | Superficial praise of paper | **Adversarial extraction** of unstated assumptions |
| **Hallucination Control** | Blind faith in generation | **Verifier Pass**: Every claim tied to verbatim quotes |
| **Reprocessing** | Repeated queries cost credits | **Aggressive local disk cache** (never process twice) |

---

## 🏗️ Pipeline Architecture

Instead of one overloaded agent, AXIOM decomposes the research workflow into **six specialized narrow nodes**:

```mermaid
flowchart TD
    User([👤 User Request]) --> Router[🧭 1. Query Router]
    
    subgraph Discovery ["Data Gathering (Zero Cost)"]
        Router -->|Natural Language Query| Retriever[📡 2. Unified Retriever]
        Retriever --> Arxiv[arXiv API]
        Retriever --> S2[Semantic Scholar API]
        Router -->|Direct arXiv ID / PDF URL| Parser[📄 3. Structural PDF Parser]
        Retriever --> Parser
    end

    subgraph Deep_Analysis ["Per-Section Dissection"]
        Parser --> Slices["Section Slices\n• Abstract & Intro\n• Proposed Method\n• Experiments & Metrics\n• Limitations & Discussion"]
        Slices --> Dissector[🔬 4. Scoped Dissector<br><i>(Ollama 7B/8B JSON Mode)</i>]
        Dissector --> Verifier{🛡️ 5. Grounding Verifier}
        Verifier -->|Supported by quote?| PaperCard[📋 Standardized Paper Card]
    end

    subgraph Interconnection ["Graph Synthesis"]
        PaperCard --> Linker[🔗 6. Literature Linker]
        S2 -.->|Hard Citation Intents| Linker
        Linker --> Embeddings[📐 Local SPECTER2 / BGE Cosine Similarity]
        Linker --> Graph[(🕸️ NetworkX Citation Graph)]
    end

    Graph --> Synthesizer[📝 7. Final Synthesizer]
    PaperCard --> Synthesizer
    Synthesizer --> Terminal([📊 Output: Markdown Card, Weakness Radar, Citation Map])

    classDef primary fill:#2563eb,stroke:#1d4ed8,color:#fff;
    classDef accent fill:#7c3aed,stroke:#6d28d9,color:#fff;
    classDef success fill:#059669,stroke:#047857,color:#fff;
    class Router,Dissector,Linker primary;
    class Verifier,Synthesizer accent;
    class PaperCard,Graph success;
```

---

## 📋 The Fixed "Paper Card" Schema

Small models fail on loose, open-ended tasks. They thrive when forced into deterministic JSON schemas. Every dissected paper is transformed into an identical, comparable artifact:

```json
{
  "paper_id": "ARXIV:2305.18290",
  "title": "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
  "core_claim": {
    "statement": "RLHF can be optimized directly via binary cross-entropy on preference pairs without fitting an explicit reward model or sampling during training.",
    "evidence_quote": "We show that the constrained minimum-KL optimization problem can be solved exactly with a simple classification loss...",
    "section_pointer": "Abstract",
    "verified": true
  },
  "method_summary": [
    "Reparameterizes the reward function using the language model's implicit policy distribution.",
    "Formulates training directly as a closed-form Bradley-Terry preference loss.",
    "Eliminates reinforcement learning loops (PPO), actor-critic networks, and policy rollout sampling."
  ],
  "novelty_vs_prior_work": {
    "statement": "Derives an analytical substitution showing reward modeling and RL fine-tuning collapse into a single stable supervised objective.",
    "evidence_quote": "Unlike existing algorithms, DPO steers language model behavior without reinforcement learning...",
    "section_pointer": "Section 3: Methodology",
    "verified": true
  },
  "assumptions_and_weaknesses": [
    {
      "statement": "Assumes the reference model policy does not diverge drastically from the target distribution.",
      "evidence_quote": "If the base reference model has near-zero probability on a preferred response, gradients can become unstable.",
      "section_pointer": "Section 6: Discussion",
      "verified": true
    }
  ],
  "datasets_and_metrics": {
    "datasets": ["Anthropic HH-RLHF", "TL;DR Summarization"],
    "metrics": ["Win rate vs. GPT-4", "KL divergence to reference model"]
  },
  "reproducibility": {
    "code_available": true,
    "code_url": "https://github.com/eric-mitchell/direct-preference-optimization"
  },
  "applications": [
    "Alignment of local open-weights LLMs without distributed RL infrastructure.",
    "Fast preference tuning on human feedback pairs on single-GPU nodes."
  ]
}
```

---

## 🛡️ Grounding & Verification Engine

Hallucinations kill researcher trust. AXIOM operates an **Anti-Hallucination Pipeline**:

```
[Candidate Claim Generated]
           │
           ▼
[Search Paper Section for Exact Span] ──> [Quote Extracted]
           │
           ▼
[Verifier Prompt: "Does this quote explicitly support this claim?"]
     ├── YES  ──> [Mark Verified: True (Included in Output)]
     └── NO   ──> [Flagged or Discarded automatically]
```

---

## 🚀 Quickstart in 3 Steps

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/One-Hat/GEN_AI.git
cd GEN_AI
pip install -r requirements.txt
```

### 2. Run Free Local LLM via Ollama
Ensure [Ollama](https://ollama.com/) is installed and pull any 7B–8B model:
```bash
ollama pull qwen2.5:7b
# or: ollama pull llama3.1:8b
```
*(No GPU? Ollama runs smoothly on standard CPUs using 4-bit quantized GGUFs).*

### 3. Launch the Interactive Polychromatic Web UI
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to experience the fluid Motion-powered academic workspace.

---

## 🎨 Interactive Polychromatic Web Workspace

The frontend is built with **React**, **Tailwind CSS**, and **Framer Motion**, featuring:
- 🌌 **Aurora Polychromatic Mesh**: Smooth, mouse-reactive ambient gradient orbs in electric violet, sky cyan, neon magenta, and emerald.
- 🔬 **Interactive Dissection Studio**: 3-line methodology timeline, one-click quote span inspection, and open artifact access.
- 🛡️ **Adversarial Weakness Radar**: Expandable cards revealing verified paper excerpts, failure modes, and compute tradeoffs.
- 🕸️ **Citation Graph Explorer**: Filterable by relationship (`Extends`, `Uses Method`, `Alternative`, `Challenges`) with Semantic Scholar context.
- 🔍 **Grounding Audit Modal**: Live audit trail confirming verbatim spans and 0% hallucination verification.

---

## 💻 CLI Commands

### 🔍 1. Dissect a Specific Paper
Extracts critical claims, 3-line methodology, grounded weaknesses, and citation connections:
```bash
# By arXiv ID
python cli.py dissect 2305.18290

# By Paper URL
python cli.py dissect https://arxiv.org/abs/2005.14165
```

### 🔎 2. Search Literature Catering to Needs
Searches arXiv and Semantic Scholar sorted by relevance and citation impact:
```bash
python cli.py search "speculative decoding for small local models"
```

### ⚖️ 3. Compare Two Competing Papers
Pits two methodologies side-by-side on claims, novelty, bottlenecks, and applications:
```bash
python cli.py compare "Direct Preference Optimization vs Proximal Policy Optimization"
```

### 🗺️ 4. Map a Subfield's Citation Topology
Computes dense embedding affinities + hard citation edges and renders a Mermaid flowchart:
```bash
python cli.py map "State Space Models for Long Context"
```

### 💬 5. Natural Language Prompt
Let the autonomous router decide whether to search, dissect, or compare:
```bash
python cli.py ask "What are the core bottlenecks of FlashAttention-2 and what papers followed up on it?"
```

---

## ⚙️ Configuration & Customization

AXIOM works out of the box with zero configuration. You can optionally customize settings in `research_agent/config.py` or via environment variables:

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `LLM_PROVIDER` | `ollama` | Choose `ollama` or `openai_compatible` (LM Studio, vLLM, Groq) |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama daemon endpoint |
| `DEFAULT_MODEL` | `qwen2.5:7b` | Local model name (`llama3.1:8b`, `mistral:7b`, etc.) |
| `EMBEDDING_MODEL_NAME` | `BAAI/bge-small-en-v1.5` | Local embedding model (`allenai/specter2` supported) |
| `S2_API_KEY` | `""` *(Optional)* | Higher rate limits for Semantic Scholar API |

---

## 🗺️ Roadmap

- [x] Free arXiv & Semantic Scholar Academic Graph client
- [x] Section-aware PDF segmentation & regex parser
- [x] Fixed JSON Paper Card extractor
- [x] Grounding Verifier pass with verbatim quotes
- [x] Interconnection linker (S2 intents + local dense embeddings)
- [x] NetworkX citation graph & Mermaid diagram exporter
- [ ] Export directly to Obsidian / Logseq academic vaults (`.md` notes with bidirectional wikilinks)
- [ ] Interactive terminal TUI using `Textual`
- [ ] Auto-sync with Zotero collections

---

## 📜 License

Distributed under the **MIT License**. Free for academic, personal, and commercial exploration.
