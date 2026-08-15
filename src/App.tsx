import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TabBalance } from './components/TabBalance';
import { TabRealMass } from './components/TabRealMass';
import { TabMoleGenerator } from './components/TabMoleGenerator';
import { QuizModal } from './components/QuizModal';
import { LabNotesModal } from './components/LabNotesModal';
import { DiscoveredRatio, UserLabData } from './types';
import { soundFx } from './lib/sound';
import { auth, loginWithGoogle, logoutUser, onAuthStateChanged, saveUserProgress, loadUserProgress, User } from './lib/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<number>(1);
  const [discoveredRatios, setDiscoveredRatios] = useState<DiscoveredRatio[]>(() => {
    try {
      const local = localStorage.getItem('chem_discovered_ratios');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [tabProgress, setTabProgress] = useState<{
    tab1Completed: boolean;
    tab2Completed: boolean;
    tab3Completed: boolean;
  }>(() => {
    try {
      const local = localStorage.getItem('chem_tab_progress');
      return local ? JSON.parse(local) : { tab1Completed: false, tab2Completed: false, tab3Completed: false };
    } catch {
      return { tab1Completed: false, tab2Completed: false, tab3Completed: false };
    }
  });

  const [exploredElements, setExploredElements] = useState<string[]>(() => {
    try {
      const local = localStorage.getItem('chem_explored_elements');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);

  // Sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const cloudData = await loadUserProgress(currentUser.uid);
        if (cloudData) {
          if (cloudData.discoveredRatios?.length) {
            setDiscoveredRatios(cloudData.discoveredRatios);
          }
          if (cloudData.tabProgress) {
            setTabProgress(cloudData.tabProgress);
          }
          if (cloudData.moleExploredElements?.length) {
            setExploredElements(cloudData.moleExploredElements);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Save to local storage and sync to Firebase whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem('chem_discovered_ratios', JSON.stringify(discoveredRatios));
      localStorage.setItem('chem_tab_progress', JSON.stringify(tabProgress));
      localStorage.setItem('chem_explored_elements', JSON.stringify(exploredElements));
    } catch {
      // ignore
    }

    if (user) {
      saveUserProgress(user.uid, {
        discoveredRatios,
        tabProgress,
        moleExploredElements: exploredElements
      });
    }
  }, [discoveredRatios, tabProgress, exploredElements, user]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFx.setMuted(next);
    if (!next) soundFx.playClick();
  };

  const handleAddDiscoveredRatio = (ratio: DiscoveredRatio) => {
    setDiscoveredRatios((prev) => {
      // Check if duplicate ratio already exists
      const exists = prev.some(r => r.ratioString === ratio.ratioString);
      if (exists) return prev;
      return [ratio, ...prev];
    });
  };

  const handleTabComplete = (tabNum: 1 | 2 | 3) => {
    setTabProgress((prev) => ({
      ...prev,
      [`tab${tabNum}Completed`]: true
    }));
  };

  const handleExploreElement = (symbol: string) => {
    setExploredElements((prev) => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
  };

  const handleSaveQuizScore = (score: number) => {
    if (user) {
      saveUserProgress(user.uid, { quizScore: score });
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* App Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        tabProgress={tabProgress}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenNotes={() => setIsNotesOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        discoveredCount={discoveredRatios.length}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {currentTab === 1 && (
          <TabBalance
            discoveredRatios={discoveredRatios}
            onAddDiscoveredRatio={handleAddDiscoveredRatio}
            onTabComplete={() => handleTabComplete(1)}
          />
        )}

        {currentTab === 2 && (
          <TabRealMass
            onTabComplete={() => handleTabComplete(2)}
            onGoToTab3={() => {
              setCurrentTab(3);
              handleTabComplete(2);
            }}
          />
        )}

        {currentTab === 3 && (
          <TabMoleGenerator
            onTabComplete={() => handleTabComplete(3)}
            onExploreElement={handleExploreElement}
            exploredElements={exploredElements}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="flex-none h-12 bg-slate-900 border-t border-slate-800 px-4 sm:px-8 flex items-center justify-between">
        <div className="text-[10px] text-slate-500 font-mono tracking-widest">
          SIMULATION v1.2 // CHEMICAL_01_MOLE
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-semibold">
            STATUS: STABLE
          </span>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            © 2024 CHEMISTRY EXPLORER · ¹²C = 12.00 기준 · NA = 6.022 × 10²³
          </span>
        </div>
      </footer>

      {/* Modals */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSaveScore={handleSaveQuizScore}
      />

      <LabNotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        discoveredRatios={discoveredRatios}
        exploredElements={exploredElements}
      />
    </div>
  );
}
