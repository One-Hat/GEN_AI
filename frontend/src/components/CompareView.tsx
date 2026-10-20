import React from 'react';
import { motion } from 'framer-motion';
import { GitCompare, ShieldAlert, Wrench } from 'lucide-react';
import { SAMPLE_PAPERS } from '../data/mockPapers';

export const CompareView: React.FC = () => {
  const paperA = SAMPLE_PAPERS['dpo'].card;
  const paperB = SAMPLE_PAPERS['flashattn'].card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">
            Comparative Literature Dissection
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Comparing core architectural assumptions, empirical trade-offs, and practical constraints.
        </p>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paper A */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-purple-950/70 text-purple-300 border border-purple-800/40">
              Candidate A
            </span>
            <span className="text-xs text-slate-400 font-mono">{paperA.arxiv_id}</span>
          </div>

          <h4 className="text-lg font-bold text-white leading-snug">{paperA.title}</h4>
          <p className="text-xs text-slate-400">{paperA.authors.slice(0, 3).join(', ')} et al.</p>

          <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Core Claim:</span>
              <p className="text-slate-200 bg-slate-900/50 p-3 rounded-lg border border-white/5">
                {paperA.core_claim.statement}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Top Bottleneck:
              </span>
              <p className="text-rose-200 bg-rose-950/30 p-3 rounded-lg border border-rose-900/40">
                {paperA.assumptions_and_weaknesses[0]?.statement}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" /> Key Application:
              </span>
              <p className="text-emerald-200 bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/40">
                {paperA.applications[0]?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Paper B */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/40">
              Candidate B
            </span>
            <span className="text-xs text-slate-400 font-mono">{paperB.arxiv_id}</span>
          </div>

          <h4 className="text-lg font-bold text-white leading-snug">{paperB.title}</h4>
          <p className="text-xs text-slate-400">{paperB.authors.slice(0, 3).join(', ')} et al.</p>

          <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Core Claim:</span>
              <p className="text-slate-200 bg-slate-900/50 p-3 rounded-lg border border-white/5">
                {paperB.core_claim.statement}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Top Bottleneck:
              </span>
              <p className="text-rose-200 bg-rose-950/30 p-3 rounded-lg border border-rose-900/40">
                {paperB.assumptions_and_weaknesses[0]?.statement}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" /> Key Application:
              </span>
              <p className="text-emerald-200 bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/40">
                {paperB.applications[0]?.title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
