import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, GitCompare, Share2, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import type { ViewMode } from '../types';

interface HeroInputProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onSubmit: (query: string, mode: ViewMode) => void;
  onSelectPreset: (key: string) => void;
  isLoading: boolean;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  currentMode,
  onModeChange,
  onSubmit,
  onSelectPreset,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState('');

  const modes: Array<{ id: ViewMode; label: string; icon: any; placeholder: string }> = [
    {
      id: 'dissect',
      label: 'Dissect Paper',
      icon: FileText,
      placeholder: 'Enter arXiv ID (e.g. 2305.18290) or PDF URL...',
    },
    {
      id: 'search',
      label: 'Search Literature',
      icon: Search,
      placeholder: 'Describe your research problem, e.g. "speculative decoding for low latency"...',
    },
    {
      id: 'compare',
      label: 'Compare Papers',
      icon: GitCompare,
      placeholder: 'e.g. "DPO vs PPO" or "LoRA vs Full Fine-tuning"...',
    },
    {
      id: 'map',
      label: 'Citation Topology',
      icon: Share2,
      placeholder: 'Subfield to map (e.g. "State Space Models vs Transformers")...',
    },
  ];

  const activeModeConfig = modes.find((m) => m.id === currentMode)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim(), currentMode);
    }
  };

  return (
    <section className="relative pt-12 pb-8 px-4 max-w-5xl mx-auto text-center">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-medium text-slate-300">
            Narrow Pipeline • $0 Open-Source Inference • Ground-Truth Citations
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-4">
          Dissect Papers. Expose Bottlenecks.{' '}
          <span className="polychromatic-gradient-text block sm:inline">
            Connect the Literature.
          </span>
        </h1>

        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base mb-8">
          A zero-cost academic intelligence agent that breaks PDFs into structured sections, extracts
          author-unstated weaknesses, and anchors every claim with verbatim quotes.
        </p>
      </motion.div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center mb-6">
        <div className="flex p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-lg gap-1">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-pink-600/30 to-cyan-600/40 border border-purple-400/30 rounded-xl -z-10 shadow-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Input Box with Polychromatic Glow */}
      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-6">
        <div className="polychromatic-border p-[1.5px] rounded-2xl shadow-2xl shadow-purple-950/40">
          <div className="flex items-center bg-[#0d1322]/90 rounded-2xl px-4 py-3 gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={activeModeConfig.placeholder}
              className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Run Agent</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Instant Demo Presets */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1 text-slate-500">
          <BookOpen className="w-3.5 h-3.5" /> Instant Presets:
        </span>
        <button
          onClick={() => onSelectPreset('dpo')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer"
        >
          Direct Preference Optimization (2305.18290)
        </button>
        <button
          onClick={() => onSelectPreset('flashattn')}
          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-pink-300 hover:text-pink-200 transition-all cursor-pointer"
        >
          FlashAttention-2 (2307.08691)
        </button>
      </div>
    </section>
  );
};
