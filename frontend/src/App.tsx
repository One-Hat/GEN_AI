import React, { useState } from 'react';
import { BackgroundAurora } from './components/BackgroundAurora';
import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { DissectionView } from './components/DissectionView';
import { CitationGraphView } from './components/CitationGraphView';
import { CompareView } from './components/CompareView';
import { GroundingAuditModal } from './components/GroundingAuditModal';
import { SAMPLE_PAPERS } from './data/mockPapers';
import type { ViewMode } from './types';

export const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<ViewMode>('dissect');
  const [activePaperKey, setActivePaperKey] = useState<string>('dpo');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const activePaperData = SAMPLE_PAPERS[activePaperKey] || SAMPLE_PAPERS['dpo'];

  const handleQuerySubmit = (query: string, mode: ViewMode) => {
    setIsLoading(true);
    setLoadingStage('Connecting to arXiv & Semantic Scholar API...');

    setTimeout(() => {
      setLoadingStage('Slicing PDF into Abstract, Method, and Limitations...');
    }, 700);

    setTimeout(() => {
      setLoadingStage('Dissecting via Ollama 7B into Fixed Paper Card...');
    }, 1400);

    setTimeout(() => {
      setLoadingStage('Verifying claims against verbatim spans...');
    }, 2000);

    setTimeout(() => {
      setIsLoading(false);
      setLoadingStage('');
      if (query.toLowerCase().includes('flash') || query.includes('2307.08691')) {
        setActivePaperKey('flashattn');
      } else {
        setActivePaperKey('dpo');
      }
      setCurrentMode(mode);
    }, 2600);
  };

  const handleSelectPreset = (key: string) => {
    setActivePaperKey(key);
    setCurrentMode('dissect');
  };

  return (
    <div className="min-h-screen text-slate-100 relative selection:bg-pink-500 selection:text-white">
      {/* Polychromatic Animated Aurora Background */}
      <BackgroundAurora />

      {/* Top Navbar */}
      <Navbar onOpenAudit={() => setIsAuditModalOpen(true)} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Hero Control Panel */}
        <HeroInput
          currentMode={currentMode}
          onModeChange={setCurrentMode}
          onSubmit={handleQuerySubmit}
          onSelectPreset={handleSelectPreset}
          isLoading={isLoading}
        />

        {/* Loading Pipeline State indicator */}
        {isLoading && (
          <div className="max-w-md mx-auto my-12 p-6 rounded-2xl glass-panel text-center space-y-4 border-purple-500/30 shadow-2xl">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
              <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-pink-500 border-r-cyan-400 animate-spin" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-pink-400 block mb-1 font-semibold">
                Running Autonomous Agent
              </span>
              <p className="text-sm font-medium text-slate-200">{loadingStage}</p>
            </div>
          </div>
        )}

        {/* Views */}
        {!isLoading && (
          <div className="mt-6">
            {currentMode === 'dissect' && (
              <DissectionView card={activePaperData.card} />
            )}

            {currentMode === 'map' && (
              <CitationGraphView
                card={activePaperData.card}
                connections={activePaperData.connections}
              />
            )}

            {currentMode === 'compare' && <CompareView />}

            {currentMode === 'search' && (
              <CitationGraphView
                card={activePaperData.card}
                connections={activePaperData.connections}
              />
            )}
          </div>
        )}
      </main>

      {/* Grounding Audit Modal */}
      <GroundingAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        card={activePaperData.card}
      />

      {/* Modern Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AXIOM • 100% Free Open-Source Academic Intelligence</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Ollama + Semantic Scholar Graph API</span>
            <span>•</span>
            <a
              href="https://github.com/One-Hat/GEN_AI"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
