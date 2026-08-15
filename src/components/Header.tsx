import React from 'react';
import { Volume2, VolumeX, LogIn, LogOut, BookOpen, HelpCircle, CheckCircle2, FlaskConical, Scale, Sparkles } from 'lucide-react';
import { soundFx } from '../lib/sound';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentTab: number;
  onSelectTab: (tabIndex: number) => void;
  tabProgress: {
    tab1Completed: boolean;
    tab2Completed: boolean;
    tab3Completed: boolean;
  };
  isMuted: boolean;
  onToggleMute: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenNotes: () => void;
  onOpenQuiz: () => void;
  discoveredCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  tabProgress,
  isMuted,
  onToggleMute,
  user,
  onLogin,
  onLogout,
  onOpenNotes,
  onOpenQuiz,
  discoveredCount
}) => {
  const tabs = [
    {
      id: 1,
      name: "상대 질량비",
      fullName: "1. 가상 양팔저울",
      subtitle: "상대 질량비 발견",
      icon: Scale,
      completed: tabProgress.tab1Completed
    },
    {
      id: 2,
      name: "실제 질량",
      fullName: "2. 실제 질량의 충격",
      subtitle: "Micro to Macro",
      icon: FlaskConical,
      completed: tabProgress.tab2Completed
    },
    {
      id: 3,
      name: "마법의 묶음",
      fullName: "3. 1몰(mol) 생성기",
      subtitle: "1몰(mol) 생성기",
      icon: Sparkles,
      completed: tabProgress.tab3Completed
    }
  ];

  return (
    <header className="flex-none border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      {/* Main Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* App Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 text-white">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-50">
              원자량 탐구 실험실 <span className="text-indigo-400 font-medium">: 미시에서 거시로</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono font-medium text-slate-400">
                CHEMISTRY EXPLORER // MOLE SIMULATOR
              </span>
              {discoveredCount > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> {discoveredCount}개 질량비 기록됨
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step Indicator in Center/Right (Desktop view) */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center">
            {tabs.map((tab, idx) => {
              const isActive = currentTab === tab.id;
              const isDone = tab.completed;
              return (
                <React.Fragment key={tab.id}>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectTab(tab.id);
                    }}
                    className={`group relative flex items-center justify-center transition-all ${
                      isActive
                        ? 'w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm border-4 border-slate-900 shadow-md shadow-indigo-500/30'
                        : isDone
                        ? 'w-8 h-8 rounded-full bg-emerald-600/80 text-white font-bold text-sm border-4 border-slate-900'
                        : 'w-8 h-8 rounded-full bg-slate-800 text-slate-500 font-bold text-sm border-4 border-slate-900 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                    title={tab.fullName}
                  >
                    {isDone && !isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : tab.id}
                  </button>
                  {idx < tabs.length - 1 && (
                    <div
                      className={`w-12 h-1 transition-colors ${
                        currentTab > tab.id || isDone ? 'bg-indigo-600' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <span className="ml-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            탐구 {currentTab}단계: {tabs[currentTab - 1].name}
          </span>
        </div>

        {/* Right Tools & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notes Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenNotes();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            title="나의 탐구 일지"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">탐구 일지</span>
            {discoveredCount > 0 && (
              <span className="bg-indigo-500 text-white font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                {discoveredCount}
              </span>
            )}
          </button>

          {/* Quiz Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenQuiz();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition shadow-sm"
            title="개념 확인 퀴즈"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">개념 퀴즈</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isMuted ? "소리 켜기" : "소리 끄기"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-7 h-7 rounded-full border border-slate-600"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-slate-300 hidden md:inline max-w-[80px] truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>

      {/* Subnav 3 Tabs for mobile/desktop selection */}
      <div className="border-t border-slate-800/60 bg-slate-900/40 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-2 sm:gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  onSelectTab(tab.id);
                }}
                className={`flex items-center justify-center sm:justify-start gap-2.5 px-3 py-2 rounded-xl border transition-all text-left ${
                  isActive
                    ? 'bg-slate-800 border-indigo-500/80 text-white shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : tab.completed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {tab.completed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <div className="text-xs font-semibold leading-tight text-slate-200">
                    {tab.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {tab.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
