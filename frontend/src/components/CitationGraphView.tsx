import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, ArrowUpRight, Filter, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CitationConnection, PaperCard } from '../types';

interface CitationGraphViewProps {
  card: PaperCard;
  connections: CitationConnection[];
}

export const CitationGraphView: React.FC<CitationGraphViewProps> = ({ card, connections }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeConnection, setActiveConnection] = useState<CitationConnection | null>(
    connections[0] || null
  );

  const filterOptions = [
    { id: 'all', label: 'All Interconnections' },
    { id: 'extends', label: 'Extends' },
    { id: 'alternative_to', label: 'Alternative' },
    { id: 'contradicts', label: 'Challenges / Contradicts' },
  ];

  const filtered =
    selectedFilter === 'all'
      ? connections
      : connections.filter((c) => c.relationship_type === selectedFilter);

  const getRelationshipBadge = (type: string) => {
    switch (type) {
      case 'extends':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'contradicts':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60';
      case 'alternative_to':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'uses_method':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header and Filter */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-bold text-white tracking-tight">
              Interconnection Topology: {card.title}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Synthesized from Semantic Scholar citation intents + local SPECTER2 dense embeddings.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedFilter(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedFilter === opt.id
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: List of Related Works */}
        <div className="lg:col-span-6 space-y-3">
          {filtered.map((item) => {
            const isSelected = activeConnection?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveConnection(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getRelationshipBadge(
                      item.relationship_type
                    )}`}
                  >
                    {item.relationship_type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                      {(item.similarity_score * 100).toFixed(0)}% affinity
                    </span>
                    <span className="text-xs text-slate-400">{item.year}</span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-200 mb-1 leading-snug">
                  {item.target_title}
                </h4>
                <p className="text-xs text-slate-400">{item.authors}</p>
              </div>
            );
          })}
        </div>

        {/* Right: In-Depth Relationship Inspector */}
        <div className="lg:col-span-6">
          {activeConnection ? (
            <div className="glass-panel p-6 rounded-2xl space-y-5 sticky top-24 border-cyan-500/30">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Grounded Connection Analysis
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {activeConnection.target_id}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {activeConnection.target_title}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeConnection.authors} • {activeConnection.year}
                </p>
              </div>

              {/* Relationship Badge with Explanation */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-slate-300">Synthesis Explanation:</span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {activeConnection.explanation}
                </p>
              </div>

              {/* Semantic Scholar Citation Context */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  Semantic Scholar Citation Context & Intent:
                </span>
                <blockquote className="italic text-xs text-slate-300 bg-black/40 p-3.5 rounded-xl border border-white/5 border-l-2 border-l-purple-500">
                  "{activeConnection.citation_context}"
                </blockquote>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hard Edge Confirmed via S2 API
                </span>
                <a
                  href={`https://arxiv.org/abs/${activeConnection.target_id.replace('ARXIV:', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 font-medium"
                >
                  <span>Open Paper</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-slate-500">
              Select an interconnected paper to view synthesis breakdown.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
