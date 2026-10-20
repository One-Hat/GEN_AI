import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, CheckCircle2, ShieldAlert, Cpu, Lightbulb, FileText } from 'lucide-react';
import { PaperCard } from '../types';

interface WeaknessRadarProps {
  weaknesses: PaperCard['assumptions_and_weaknesses'];
}

export const WeaknessRadar: React.FC<WeaknessRadarProps> = ({ weaknesses }) => {
  const [expandedId, setExpandedId] = useState<string | null>(weaknesses[0]?.id || null);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/70 text-rose-400 border border-rose-800/60 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Critical Bottleneck
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/60 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Empirical Bound
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/70 text-blue-300 border border-blue-800/60 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Compute Tradeoff
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {weaknesses.map((item, index) => {
        const isExpanded = expandedId === item.id;
        return (
          <div
            key={item.id}
            className={`rounded-xl border transition-all ${
              isExpanded
                ? 'bg-slate-900/90 border-purple-500/40 shadow-lg shadow-purple-950/20'
                : 'bg-slate-900/40 border-white/5 hover:border-white/15'
            }`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="w-full text-left p-4 flex items-start justify-between gap-4 cursor-pointer"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    #0{index + 1}
                  </span>
                  {getSeverityBadge(item.severity)}
                  {item.verified && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Grounded
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-medium text-slate-200 leading-snug">
                  {item.statement}
                </h4>
              </div>

              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400 p-1"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            {/* Expandable Evidence Quote */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-4 pb-4 overflow-hidden"
                >
                  <div className="p-3.5 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-pink-400" />
                        Exact Paper Excerpt:
                      </span>
                      <span className="text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                        {item.section_pointer}
                      </span>
                    </div>
                    <blockquote className="italic border-l-2 border-pink-500/70 pl-3 text-slate-300">
                      "{item.evidence_quote}"
                    </blockquote>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
