import React from 'react';
import { Sparkles, Cpu, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenAudit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAudit }) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-6 py-3.5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[1.5px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight polychromatic-gradient-text">
                AXIOM
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-semibold">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Deep Academic Research Agent</p>
          </div>
        </div>

        {/* Center Pill: $0.00 Budget Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-mono shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300">Local LLM:</span>
          <span className="text-purple-300 font-semibold flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5" /> Ollama Qwen2.5 7B
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
            $0.00 Spent
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-200 border border-white/10 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Grounding Pass</span>
          </button>
          
          <a
            href="https://github.com/One-Hat/GEN_AI"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-xs font-medium text-white border border-purple-500/30 shadow-sm transition-all"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
