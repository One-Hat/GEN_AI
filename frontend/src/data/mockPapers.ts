import type { PaperCard, CitationConnection } from '../types';

export const SAMPLE_PAPERS: Record<string, { card: PaperCard; connections: CitationConnection[] }> = {
  'dpo': {
    card: {
      paper_id: 'ARXIV:2305.18290',
      arxiv_id: '2305.18290',
      title: 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model',
      authors: ['Rafael Rafailov', 'Archit Sharma', 'Eric Mitchell', 'Stefano Ermon', 'Christopher D. Manning', 'Chelsea Finn'],
      year: 2023,
      citation_count: 2480,
      pdf_url: 'https://arxiv.org/pdf/2305.18290.pdf',
      core_claim: {
        statement: 'RLHF can be solved directly by optimizing a simple binary cross-entropy loss over preference pairs, completely eliminating the need to train a separate reward model or perform online reinforcement learning rollouts.',
        evidence_quote: 'We show that the constrained minimum-KL optimization problem can be solved exactly with a simple classification loss, bypassing reward modeling and policy sampling altogether.',
        section_pointer: 'Abstract, Page 1',
        verified: true,
      },
      method_summary: [
        'Analytically derives the closed-form optimal policy under the Bradley-Terry preference model as an implicit function of language model logits.',
        'Substitutes the optimal policy equation directly into the standard maximum likelihood preference objective.',
        'Trains the target model by increasing likelihood on preferred completions while penalizing dispreferred ones weighted by reference model KL divergence.'
      ],
      novelty_vs_prior_work: {
        statement: 'First mathematical proof and empirical demonstration that reinforcement learning with human feedback collapses into supervised preference fine-tuning without policy drift instability.',
        evidence_quote: 'Unlike existing algorithms like PPO that require training a separate reward model and sampling rollouts during training, DPO is lightweight, stable, and computationally efficient.',
        section_pointer: 'Section 3: Direct Preference Optimization',
        verified: true,
      },
      assumptions_and_weaknesses: [
        {
          id: 'w1',
          category: 'theoretical',
          severity: 'critical',
          statement: 'Drastic degradation when reference model probability on chosen answers is extremely low (distribution shift vulnerability).',
          evidence_quote: 'If the reference model assigns near-zero probability to the preferred response, the log-ratio can diverge and cause severe gradient explosions.',
          section_pointer: 'Section 6.2: Failure Modes & Out-of-Distribution Data',
          verified: true,
        },
        {
          id: 'w2',
          category: 'empirical_scope',
          severity: 'moderate',
          statement: 'Vulnerability to deterministic length-bias: model often equates longer answers with higher reward unless explicit length regularization is applied.',
          evidence_quote: 'We observe that DPO models can exhibit verbosity bias where average token length increases without a proportional gain in factual precision.',
          section_pointer: 'Section 5.3: Qualitative Analysis',
          verified: true,
        },
        {
          id: 'w3',
          category: 'compute',
          severity: 'minor',
          statement: 'Requires holding two model copies (active policy and frozen reference policy) in GPU memory simultaneously.',
          evidence_quote: 'DPO requires querying the reference policy logits in each step, increasing VRAM footprint unless reference logits are precomputed.',
          section_pointer: 'Section 4: Implementation Details',
          verified: true,
        }
      ],
      datasets_and_metrics: {
        datasets: ['Anthropic Helpful & Harmless (HH-RLHF)', 'TL;DR Summarization', 'Stanford Human Preferences (SHP)'],
        metrics: ['GPT-4 Win Rate', 'Perplexity', 'KL Divergence to Reference Policy', 'Inference Latency'],
      },
      reproducibility: {
        code_available: true,
        code_url: 'https://github.com/eric-mitchell/direct-preference-optimization',
        weights_available: true,
        estimated_compute: '8x A100 80GB for 12 hours (Llama-7B)',
      },
      applications: [
        {
          title: 'Consumer LLM Alignment on Single GPUs',
          description: 'Enables open-source developers to align 7B/13B models with custom feedback datasets without running complex PPO distributed infrastructure.',
          domain: 'Open Source Model Fine-Tuning'
        },
        {
          title: 'Safety & Hallucination Mitigation',
          description: 'Directly penalizes unsafe or hallucinated model answers by pairing verified factual answers as positive preferences.',
          domain: 'Enterprise Trust & Safety'
        },
        {
          title: 'Specialized Agent Persona Tuning',
          description: 'Refining code-generation agents to favor concise idiomatic syntax over verbose boilerplate.',
          domain: 'Developer Tools'
        }
      ]
    },
    connections: [
      {
        id: 'c1',
        target_id: 'ARXIV:2009.01325',
        target_title: 'Learning to summarize from human feedback (PPO Baseline)',
        year: 2020,
        authors: 'Stiennon et al.',
        relationship_type: 'alternative_to',
        citation_intent: 'methodology',
        citation_context: 'We benchmark directly against the PPO algorithm introduced by Stiennon et al. on the TL;DR dataset.',
        similarity_score: 0.88,
        explanation: 'DPO was engineered as a direct mathematical replacement for the multi-stage RLHF PPO pipeline pioneered in this paper.'
      },
      {
        id: 'c2',
        target_id: 'ARXIV:2310.12036',
        target_title: 'Zephyr: Direct Distillation of LM Alignment',
        year: 2023,
        authors: 'Tunstall et al.',
        relationship_type: 'extends',
        citation_intent: 'methodology',
        citation_context: 'Building upon DPO (Rafailov et al., 2023), we apply distilled Direct Preference Optimization to Mistral-7B.',
        similarity_score: 0.92,
        explanation: 'Extends DPO using synthetic AI feedback (dDPO), proving a 7B model can beat 70B models on MT-Bench without human annotators.'
      },
      {
        id: 'c3',
        target_id: 'ARXIV:2402.01306',
        target_title: 'KTO: Model Alignment as Prospect Theory Optimization',
        year: 2024,
        authors: 'Ethayarajh et al.',
        relationship_type: 'contradicts',
        citation_intent: 'result',
        citation_context: 'While DPO requires paired preferences, KTO demonstrates that per-example binary rewards achieve competitive alignment.',
        similarity_score: 0.81,
        explanation: 'Challenges DPOs strict requirement for pairwise (chosen vs rejected) preferences, demonstrating that unpaired thumbs-up/down data suffices.'
      },
      {
        id: 'c4',
        target_id: 'ARXIV:2312.09244',
        target_title: 'ORPO: Monolithic Preference Optimization without Reference Model',
        year: 2024,
        authors: 'Hong et al.',
        relationship_type: 'extends',
        citation_intent: 'methodology',
        citation_context: 'ORPO removes the reference model requirement of DPO by introducing an odds ratio loss directly into SFT.',
        similarity_score: 0.89,
        explanation: 'Eliminates DPOs dual-model VRAM memory bottleneck by embedding the preference penalty directly into supervised fine-tuning.'
      }
    ]
  },
  'flashattn': {
    card: {
      paper_id: 'ARXIV:2307.08691',
      arxiv_id: '2307.08691',
      title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning',
      authors: ['Tri Dao'],
      year: 2023,
      citation_count: 1840,
      pdf_url: 'https://arxiv.org/pdf/2307.08691.pdf',
      core_claim: {
        statement: 'By optimizing thread block work partitioning, reducing non-matmul FLOPs, and parallelizing across the sequence dimension, FlashAttention-2 yields a 2x speedup over FlashAttention-1, achieving up to 73% of theoretical GPU FLOPS.',
        evidence_quote: 'FlashAttention-2 is 2x faster than FlashAttention, reaching up to 230 TFLOPs/s per A100 GPU (50-73% theoretical maximum).',
        section_pointer: 'Abstract',
        verified: true,
      },
      method_summary: [
        'Tweaks online softmax scaling to postpone division until the very final step, drastically reducing shared memory synchronization.',
        'Parallelizes computation not just across batch and attention heads, but across sequence length chunks via split-KV kernels.',
        'Distributes outer loop operations across warp groups to saturate NVIDIA Tensor Core throughput.'
      ],
      novelty_vs_prior_work: {
        statement: 'Eliminates redundant GPU shared-memory read/write bottlenecks in attention by rescheduling the inner loop around tensor core register tiles.',
        evidence_quote: 'We show that reorganizing the online softmax loop reduces non-matmul floating point operations by over 40% compared to FlashAttention-1.',
        section_pointer: 'Section 2: FlashAttention-2 Design',
        verified: true,
      },
      assumptions_and_weaknesses: [
        {
          id: 'fa_w1',
          category: 'compute',
          severity: 'critical',
          statement: 'Tied intimately to modern NVIDIA GPU microarchitectures (Ampere, Hopper); requires bespoke kernel rewrites for other hardware accelerators.',
          evidence_quote: 'Kernel scheduling rules and warp configurations are strictly calibrated to NVIDIA Ampere/Hopper Tensor Core register layouts.',
          section_pointer: 'Section 4: Hardware Limitations',
          verified: true,
        },
        {
          id: 'fa_w2',
          category: 'empirical_scope',
          severity: 'moderate',
          statement: 'Speedup diminishes on very short sequence lengths (< 512 tokens) where memory bandwidth is not the primary bottleneck.',
          evidence_quote: 'For sequence lengths below 512, standard cuBLAS GEMM implementations exhibit comparable latency because kernel launch overhead dominates.',
          section_pointer: 'Section 3.1: Benchmark Observations',
          verified: true,
        }
      ],
      datasets_and_metrics: {
        datasets: ['GPT-3 pretraining sequences', 'Llama-2 fine-tuning runs'],
        metrics: ['TFLOPs/s', 'GPU Memory Footprint', 'Time per forward/backward pass'],
      },
      reproducibility: {
        code_available: true,
        code_url: 'https://github.com/Dao-AILab/flash-attention',
        weights_available: true,
        estimated_compute: 'Standard benchmarks on A100 / H100 SXM5',
      },
      applications: [
        {
          title: '32k–1M Token Context Scaling',
          description: 'Standard backbone powering long-context training in modern frontier architectures without OOM exceptions.',
          domain: 'Foundation Model Infrastructure'
        },
        {
          title: 'Low-Latency Serving & Inference',
          description: 'Dramatic acceleration of key-value cache decode and prefill stages in production vLLM/TGI servers.',
          domain: 'Cloud Infrastructure'
        }
      ]
    },
    connections: [
      {
        id: 'fa_c1',
        target_id: 'ARXIV:2205.14135',
        target_title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
        year: 2022,
        authors: 'Dao et al.',
        relationship_type: 'extends',
        citation_intent: 'methodology',
        citation_context: 'FlashAttention-2 builds directly upon the IO-aware tiling framework formulated in Dao et al. (2022).',
        similarity_score: 0.96,
        explanation: 'FlashAttention-2 refactors FlashAttention-1 to fix warp synchronization latency and parallelize across sequence length.'
      }
    ]
  }
};
