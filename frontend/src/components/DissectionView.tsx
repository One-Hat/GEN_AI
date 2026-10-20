import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  ExternalLink,
  AlertOctagon,
  Wrench,
  Terminal,
  Layers,
  Sparkles,
  Database,
  Quote,
} from 'lucide-react';
import type { PaperCard } from '../types';
import { WeaknessRadar } from './WeaknessRadar';

interface DissectionViewProps {
  card: PaperCard;
}

export const DissectionView: React.FC<DissectionViewProps> = ({ card }) => {
  const [showClaimQuote, setShowClaimQuote] = useState(false);
  const [showNoveltyQuote, setShowNoveltyQuote] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Paper Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/60">
            {card.paper_id}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
            Year {card.year}
          </span>
          {card.citation_count && (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              {card.citation_count.toLocaleString()} Citations
            </span>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          {card.title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          <strong className="text-slate-300">Authors:</strong> {card.authors.join(', ')}
        </p>

        {card.pdf_url && (
          <div className="flex flex-wrap gap-3">
            <a
              href={card.pdf_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs sm:text-sm font-medium text-white border border-white/10 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-pink-400" />
              <span>Read Original PDF</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {card.reproducibility.code_url && (
              <a
                href={card.reproducibility.code_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-xs sm:text-sm font-medium text-purple-200 border border-purple-500/30 shadow-sm transition-all"
              >
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>Open Source Repository</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Claims, Method, Applications) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Core Claim & Novelty */}
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                1. Core Thesis & Grounded Novelty
              </h3>
            </div>

            {/* Core Claim */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Primary Claim
                </span>
                <button
                  onClick={() => setShowClaimQuote(!showClaimQuote)}
                  className="flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 font-medium cursor-pointer"
                >
                  <Quote className="w-3 h-3" />
                  <span>{showClaimQuote ? 'Hide Quote' : 'View Quote Span'}</span>
                </button>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
                {card.core_claim.statement}
              </p>
              {showClaimQuote && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-pink-950/30 border border-pink-800/40 text-xs text-pink-200 italic"
                >
                  <span className="font-mono text-[10px] text-pink-400 block not-italic mb-1">
                    {card.core_claim.section_pointer}
                  </span>
                  "{card.core_claim.evidence_quote}"
                </motion.div>
              )}
            </div>

            {/* Novelty vs Prior Work */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Delta vs. Prior Literature
                </span>
                <button
                  onClick={() => setShowNoveltyQuote(!showNoveltyQuote)}
                  className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer"
                >
                  <Quote className="w-3 h-3" />
                  <span>{showNoveltyQuote ? 'Hide Quote' : 'View Quote Span'}</span>
                </button>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
                {card.novelty_vs_prior_work.statement}
              </p>
              {showNoveltyQuote && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 italic"
                >
                  <span className="font-mono text-[10px] text-purple-400 block not-italic mb-1">
                    {card.novelty_vs_prior_work.section_pointer}
                  </span>
                  "{card.novelty_vs_prior_work.evidence_quote}"
                </motion.div>
              )}
            </div>
          </div>

          {/* 2. 3-Line Methodology Timeline */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                2. Methodology in 3 Crisp Steps
              </h3>
            </div>

            <div className="relative border-l-2 border-cyan-500/30 ml-4 space-y-6 py-2">
              {card.method_summary.map((step, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[17px] top-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-300 text-xs font-mono font-bold">
                    0{idx + 1}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Real-World Applications */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Wrench className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                3. Downstream Practical Applications
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {card.applications.map((app, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">{app.title}</h4>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                      {app.domain}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{app.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Weaknesses & Reproducibility) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Critical Weaknesses & Assumptions (The core differentiator!) */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border-rose-500/20">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Critical Bottlenecks
                </h3>
              </div>
              <span className="text-[11px] font-mono text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                Adversarial Mining
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Unstated assumptions, theoretical failure modes, and hardware bounds extracted from the
              limitations and experiments sections:
            </p>

            <WeaknessRadar weaknesses={card.assumptions_and_weaknesses} />
          </div>

          {/* Datasets, Benchmarks & Compute Cost */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Datasets & Reproducibility
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Evaluated On:</span>
                <div className="flex flex-wrap gap-1.5">
                  {card.datasets_and_metrics.datasets.map((d, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md bg-white/5 text-slate-300 border border-white/5"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Metrics:</span>
                <div className="flex flex-wrap gap-1.5">
                  {card.datasets_and_metrics.metrics.map((m, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md bg-white/5 text-cyan-300 border border-white/5"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {card.reproducibility.estimated_compute && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-slate-400 block mb-1 font-semibold">Compute Budget:</span>
                  <p className="text-slate-300 font-mono text-[11px]">
                    {card.reproducibility.estimated_compute}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
