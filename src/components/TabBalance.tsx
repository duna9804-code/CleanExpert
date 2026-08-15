import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Minus, RotateCcw, Sparkles, ArrowRight, Lightbulb, CheckCircle2, BookmarkPlus, Layers, HelpCircle, Eye, EyeOff, Hand } from 'lucide-react';
import { ELEMENTS } from '../data/elements';
import { DiscoveredRatio } from '../types';
import { soundFx } from '../lib/sound';

interface TabBalanceProps {
  discoveredRatios: DiscoveredRatio[];
  onAddDiscoveredRatio: (ratio: DiscoveredRatio) => void;
  onTabComplete: () => void;
}

export const TabBalance: React.FC<TabBalanceProps> = ({
  discoveredRatios,
  onAddDiscoveredRatio,
  onTabComplete
}) => {
  // Pan counts: { H: number, C: number, N: number, O: number }
  const [leftPan, setLeftPan] = useState<{ [key: string]: number }>({ H: 0, C: 1, N: 0, O: 0 });
  const [rightPan, setRightPan] = useState<{ [key: string]: number }>({ H: 0, C: 0, N: 0, O: 0 });
  
  // Selected atom for click-to-place cursor mode (default to Carbon or Hydrogen)
  const [selectedPaletteAtom, setSelectedPaletteAtom] = useState<string>('H');
  const [activeDragElement, setActiveDragElement] = useState<string | null>(null);
  const [isDragOverLeft, setIsDragOverLeft] = useState<boolean>(false);
  const [isDragOverRight, setIsDragOverRight] = useState<boolean>(false);
  
  // Mystery / Discovery mode: Hide secret mass numbers by default
  const [showMassNumbers, setShowMassNumbers] = useState<boolean>(false);
  const [lastBalancedKey, setLastBalancedKey] = useState<string | null>(null);
  const [justBalanced, setJustBalanced] = useState<boolean>(false);

  // Calculate total masses internally for physics simulation
  const calculateMass = (pan: { [key: string]: number }) => {
    return Object.entries(pan).reduce((total, [symbol, count]) => {
      return total + (ELEMENTS[symbol]?.relativeMass || 0) * count;
    }, 0);
  };

  const leftMass = calculateMass(leftPan);
  const rightMass = calculateMass(rightPan);
  const massDiff = leftMass - rightMass;

  // Calculate total atom counts
  const totalLeftCount = Object.values(leftPan).reduce<number>((a, b) => a + Number(b), 0);
  const totalRightCount = Object.values(rightPan).reduce<number>((a, b) => a + Number(b), 0);

  // Calculate beam tilt angle: max ±16 degrees for smooth mechanical look
  const tiltAngle = Math.max(-16, Math.min(16, (rightMass - leftMass) * 1.5));
  const isBalanced = leftMass > 0 && rightMass > 0 && leftMass === rightMass;

  // Trigger balance effect when balanced
  useEffect(() => {
    if (isBalanced) {
      const balanceKey = `${JSON.stringify(leftPan)}-${JSON.stringify(rightPan)}`;
      if (lastBalancedKey !== balanceKey) {
        setLastBalancedKey(balanceKey);
        setJustBalanced(true);
        soundFx.playBalanceChime();
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.6 }
        });
        onTabComplete();

        // Create ratio description
        const leftParts = Object.entries(leftPan)
          .filter(([, count]) => Number(count) > 0)
          .map(([sym, count]) => `${ELEMENTS[sym].nameKo}(${sym}) ${count}개`);
        const rightParts = Object.entries(rightPan)
          .filter(([, count]) => Number(count) > 0)
          .map(([sym, count]) => `${ELEMENTS[sym].nameKo}(${sym}) ${count}개`);

        const ratioString = `${leftParts.join(' + ')} ⚖️ ${rightParts.join(' + ')}`;

        const dominantLeft = Object.entries(leftPan).filter(([, c]) => Number(c) > 0)[0] || ['C', 1];
        const dominantRight = Object.entries(rightPan).filter(([, c]) => Number(c) > 0)[0] || ['H', 12];

        const newRatio: DiscoveredRatio = {
          id: `ratio-${Date.now()}`,
          leftElement: dominantLeft[0],
          leftCount: Number(dominantLeft[1]),
          rightElement: dominantRight[0],
          rightCount: Number(dominantRight[1]),
          totalMass: leftMass,
          ratioString,
          timestamp: Date.now()
        };

        onAddDiscoveredRatio(newRatio);
      }
    } else {
      setJustBalanced(false);
    }
  }, [leftMass, rightMass, isBalanced, leftPan, rightPan, lastBalancedKey, onAddDiscoveredRatio, onTabComplete]);

  // Modifiers
  const addAtom = (panSide: 'left' | 'right', symbol: string, count: number = 1) => {
    soundFx.playPop((ELEMENTS[symbol]?.relativeMass || 1) * 30 + 300);
    if (panSide === 'left') {
      setLeftPan(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) + count }));
    } else {
      setRightPan(prev => ({ ...prev, [symbol]: (prev[symbol] || 0) + count }));
    }
  };

  const removeAtom = (panSide: 'left' | 'right', symbol: string, count: number = 1) => {
    soundFx.playPop(250);
    if (panSide === 'left') {
      setLeftPan(prev => ({ ...prev, [symbol]: Math.max(0, (prev[symbol] || 0) - count) }));
    } else {
      setRightPan(prev => ({ ...prev, [symbol]: Math.max(0, (prev[symbol] || 0) - count) }));
    }
  };

  const clearPan = (panSide: 'left' | 'right' | 'all') => {
    soundFx.playClick();
    if (panSide === 'left' || panSide === 'all') {
      setLeftPan({ H: 0, C: 0, N: 0, O: 0 });
    }
    if (panSide === 'right' || panSide === 'all') {
      setRightPan({ H: 0, C: 0, N: 0, O: 0 });
    }
  };

  // Presets
  const setPreset = (presetType: 'C_vs_H' | 'C_vs_O' | 'N_vs_O') => {
    soundFx.playClick();
    if (presetType === 'C_vs_H') {
      setLeftPan({ H: 0, C: 1, N: 0, O: 0 });
      setRightPan({ H: 10, C: 0, N: 0, O: 0 }); // 2개 부족한 상태
    } else if (presetType === 'C_vs_O') {
      setLeftPan({ H: 0, C: 4, N: 0, O: 0 }); // 4 탄소
      setRightPan({ H: 0, C: 0, N: 0, O: 2 }); // 2 산소 (1개 더 필요)
    } else if (presetType === 'N_vs_O') {
      setLeftPan({ H: 0, C: 0, N: 8, O: 0 }); // 8 질소
      setRightPan({ H: 0, C: 0, N: 0, O: 6 }); // 6 산소 (1개 더 필요)
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, symbol: string) => {
    e.dataTransfer.setData('text/plain', symbol);
    e.dataTransfer.effectAllowed = 'copy';
    setActiveDragElement(symbol);
    setSelectedPaletteAtom(symbol);
  };

  const handleDragOver = (e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (side === 'left') setIsDragOverLeft(true);
    if (side === 'right') setIsDragOverRight(true);
  };

  const handleDragLeave = (side: 'left' | 'right') => {
    if (side === 'left') setIsDragOverLeft(false);
    if (side === 'right') setIsDragOverRight(false);
  };

  const handleDrop = (e: React.DragEvent, panSide: 'left' | 'right') => {
    e.preventDefault();
    setIsDragOverLeft(false);
    setIsDragOverRight(false);
    const sym = e.dataTransfer.getData('text/plain') || activeDragElement || selectedPaletteAtom;
    if (sym && ELEMENTS[sym]) {
      addAtom(panSide, sym, 1);
    }
    setActiveDragElement(null);
  };

  // Format list of atoms in pan for readable summary
  const formatPanSummary = (pan: { [key: string]: number }) => {
    const items = Object.entries(pan).filter(([, count]) => Number(count) > 0);
    if (items.length === 0) return '원자 없음';
    return items.map(([sym, count]) => `${ELEMENTS[sym].nameKo} ${count}개`).join(', ');
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
      {/* Top Header / Context bar */}
      <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
              탐구 1단계 // 상대 질량비 탐구
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            가상 양팔저울로 원자들의 상대 질량비 발견하기
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            원자는 눈으로 볼 수 없을 정도로 작습니다. 양팔저울의 <strong>양쪽 접시에 원자를 올려 평형</strong>을 이루는 개수 비율을 직접 찾아보세요!
          </p>
        </div>

        {/* Exploration Mission Presets */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-slate-400">탐구 미션:</span>
          <button
            onClick={() => setPreset('C_vs_H')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-700/80 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-600 transition shadow-sm"
          >
            탄소(C) 1개 ⚖️ 수소(H) ?개
          </button>
          <button
            onClick={() => setPreset('C_vs_O')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-700/80 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-600 transition shadow-sm"
          >
            탄소(C) 4개 ⚖️ 산소(O) ?개
          </button>
          <button
            onClick={() => setPreset('N_vs_O')}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-700/80 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-600 transition shadow-sm"
          >
            질소(N) 8개 ⚖️ 산소(O) ?개
          </button>
        </div>
      </div>

      {/* CENTERED HERO: Full-Width Balance Scale Simulation Canvas */}
      <section className="w-full bg-slate-950 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col shadow-2xl justify-between min-h-[580px]">
        {/* Subtle Radial Dot Grid background */}
        <div className="absolute inset-0 opacity-25 pointer-events-none bg-dot-grid" />

        {/* Top Status & Scale Indicator Banner */}
        <div className="relative z-20 pt-6 px-4 sm:px-8 flex flex-col items-center">
          {/* Real-time Status Badge */}
          <div className="bg-slate-900/95 px-5 sm:px-8 py-3.5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row items-center gap-4 sm:gap-6 shadow-2xl backdrop-blur-md max-w-3xl w-full justify-between">
            {/* Left Summary with Element Badges */}
            <div className="text-center md:text-left flex-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-1">
                ⬅️ 왼쪽 접시 내용물 ({totalLeftCount}개)
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 min-h-[26px]">
                {totalLeftCount === 0 ? (
                  <span className="text-xs text-slate-500 italic">원자 없음</span>
                ) : (
                  Object.entries(leftPan)
                    .filter(([, count]) => Number(count) > 0)
                    .map(([sym, count]) => (
                      <span
                        key={`left-badge-${sym}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border shadow-sm ${
                          sym === 'H'
                            ? 'bg-slate-200 text-slate-900 border-slate-300'
                            : sym === 'C'
                            ? 'bg-slate-700 text-slate-100 border-slate-500'
                            : sym === 'N'
                            ? 'bg-blue-600/90 text-white border-blue-400'
                            : 'bg-rose-600/90 text-white border-rose-400'
                        }`}
                      >
                        <span>{ELEMENTS[sym].nameKo}({sym})</span>
                        <span className="bg-black/30 px-1.5 py-0.2 rounded-full font-mono text-[11px]">{count}개</span>
                      </span>
                    ))
                )}
              </div>
            </div>

            {/* Equilibrium Center Pill */}
            <div
              className={`px-4 sm:px-5 py-2 rounded-full flex items-center gap-2 font-bold text-xs sm:text-sm border transition-all shadow-lg shrink-0 ${
                isBalanced
                  ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300 shadow-emerald-500/30 animate-pulse ring-2 ring-emerald-500/40'
                  : totalLeftCount === 0 && totalRightCount === 0
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : leftMass > rightMass
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-amber-500/20'
                  : 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300 shadow-indigo-500/20'
              }`}
            >
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 완벽한 평형 (질량 일치!)
                </>
              ) : totalLeftCount === 0 && totalRightCount === 0 ? (
                '저울 비어있음'
              ) : leftMass > rightMass ? (
                '⬅️ 왼쪽이 더 무거움'
              ) : (
                '오른쪽이 더 무거움 ➡️'
              )}
            </div>

            {/* Right Summary with Element Badges */}
            <div className="text-center md:text-right flex-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-1">
                오른쪽 접시 내용물 ({totalRightCount}개) ➡️
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 min-h-[26px]">
                {totalRightCount === 0 ? (
                  <span className="text-xs text-slate-500 italic">원자 없음</span>
                ) : (
                  Object.entries(rightPan)
                    .filter(([, count]) => Number(count) > 0)
                    .map(([sym, count]) => (
                      <span
                        key={`right-badge-${sym}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border shadow-sm ${
                          sym === 'H'
                            ? 'bg-slate-200 text-slate-900 border-slate-300'
                            : sym === 'C'
                            ? 'bg-slate-700 text-slate-100 border-slate-500'
                            : sym === 'N'
                            ? 'bg-blue-600/90 text-white border-blue-400'
                            : 'bg-rose-600/90 text-white border-rose-400'
                        }`}
                      >
                        <span>{ELEMENTS[sym].nameKo}({sym})</span>
                        <span className="bg-black/30 px-1.5 py-0.2 rounded-full font-mono text-[11px]">{count}개</span>
                      </span>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Guiding Feedback Text */}
          <div className="mt-3 flex items-center justify-between w-full max-w-3xl px-2">
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {isBalanced
                ? '🎉 축하합니다! 양쪽 접시의 질량이 완벽하게 일치하여 수평을 이루었습니다.'
                : totalLeftCount === 0 && totalRightCount === 0
                ? '원자를 접시에 담아 양쪽의 무게를 비교해보세요.'
                : leftMass > rightMass
                ? '왼쪽으로 기울어졌습니다. 오른쪽 접시에 원자를 더 넣어보세요.'
                : '오른쪽으로 기울어졌습니다. 왼쪽 접시에 원자를 더 넣어보세요.'}
            </p>

            {/* Optional Secret Mass Peek Toggle */}
            <button
              onClick={() => setShowMassNumbers(!showMassNumbers)}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 font-mono shrink-0 ml-2 transition"
              title="상대질량 수치 힌트 표시 전환"
            >
              {showMassNumbers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showMassNumbers ? '수치 숨기기' : '수치 힌트'}
            </button>
          </div>

          {/* Optional Hint Numbers (Only if user toggles on) */}
          {showMassNumbers && (
            <div className="mt-2 text-xs font-mono text-indigo-300 bg-indigo-950/70 px-4 py-1.5 rounded-lg border border-indigo-500/40">
              [힌트 수치] 왼쪽 상대질량: {leftMass} | 오른쪽 상대질량: {rightMass}
            </div>
          )}
        </div>

        {/* BALANCE SCALE STAGE & MECHANICAL LEVER (CENTERED WITH AMPLE PADDING) */}
        <div className="relative flex-grow flex items-center justify-center my-8 select-none px-6 sm:px-14 md:px-20 overflow-visible">
          <div className="w-full max-w-3xl relative pt-28 pb-12 flex flex-col items-center">
            {/* Fulcrum Triangle Stand (Stationary Base) */}
            <div className="w-20 h-60 sm:h-68 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900 clip-triangle shadow-2xl relative flex items-center justify-center">
              {/* Scale Center Protractor / Angle Gauge Arc */}
              <div className="absolute top-10 w-32 h-16 border-t-2 border-slate-500 rounded-t-full flex justify-between px-2 pt-1 opacity-75">
                <span className="text-[9px] font-mono text-slate-400">-15°</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">0°</span>
                <span className="text-[9px] font-mono text-slate-400">+15°</span>
              </div>
            </div>

            {/* Tilting Lever Beam (Symmetrically Centered) */}
            <div
              className="absolute top-[160px] sm:top-[176px] left-1/2 w-[320px] sm:w-[500px] md:w-[620px] lg:w-[700px] h-3.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-full transition-transform duration-700 shadow-2xl"
              style={{
                transform: `translate(-50%, -50%) rotate(${tiltAngle}deg)`,
                transformOrigin: 'center center'
              }}
            >
              {/* Center Pivot Axis */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-900 border-2 border-indigo-400 shadow-inner flex items-center justify-center z-30">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
              </div>

              {/* Vertical Needle Indicator */}
              <div
                className="absolute left-1/2 bottom-1/2 -translate-x-1/2 w-1.5 h-20 bg-gradient-to-t from-red-500 to-red-400 rounded-t-full shadow-md pointer-events-none z-20 origin-bottom"
                title="저울 지침"
              ></div>

              {/* LEFT HANGING TRAY ASSEMBLY (Positioned at left tip) */}
              <div
                className="absolute -top-10 left-0 -translate-x-1/2 w-40 sm:w-52 md:w-60 flex flex-col items-center transition-transform duration-700"
                style={{
                  transform: `translateX(-50%) rotate(${-tiltAngle}deg)`,
                  transformOrigin: 'top center'
                }}
                onDragOver={(e) => handleDragOver(e, 'left')}
                onDragLeave={() => handleDragLeave('left')}
                onDrop={(e) => handleDrop(e, 'left')}
                onClick={() => {
                  if (selectedPaletteAtom) {
                    addAtom('left', selectedPaletteAtom);
                  }
                }}
              >
                {/* Hanging Strings/Chains */}
                <div className="w-32 sm:w-44 h-12 border-l-2 border-r-2 border-slate-400/80 -mb-1"></div>

                {/* Left Tray Pan Container */}
                <div
                  className={`w-40 sm:w-52 md:w-60 h-28 sm:h-32 border-2 rounded-b-3xl backdrop-blur-md relative transition-all shadow-2xl p-2.5 flex flex-col justify-between cursor-pointer ${
                    isBalanced
                      ? 'bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-950/60'
                      : isDragOverLeft
                      ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-400 scale-105'
                      : 'bg-slate-900/90 border-slate-600 hover:border-indigo-400 hover:bg-slate-850'
                  }`}
                >
                  {/* Tray Title & Atom Types Sub-Bar */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-1">
                    <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span> 왼쪽 접시
                    </span>
                    <span className="text-[11px] font-mono text-indigo-300 font-bold">{totalLeftCount}개</span>
                  </div>

                  {/* Atom types summary chips in Left Tray */}
                  {totalLeftCount > 0 && (
                    <div className="flex flex-wrap gap-1 py-0.5 justify-center">
                      {Object.entries(leftPan)
                        .filter(([, count]) => Number(count) > 0)
                        .map(([sym, count]) => (
                          <span
                            key={`tray-l-${sym}`}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/90 border border-slate-700 text-slate-300"
                          >
                            {ELEMENTS[sym].nameKo} {count}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Atoms rendered inside tray */}
                  <div className="flex-1 flex flex-wrap gap-1.5 content-end justify-center overflow-y-auto max-h-16 scrollbar-none py-1">
                    {totalLeftCount === 0 ? (
                      <span className="text-[11px] text-slate-500 self-center">원자를 넣으세요</span>
                    ) : (
                      Object.entries(leftPan).flatMap(([sym, count]) =>
                        Array.from({ length: Number(count) }).map((_, i) => {
                          const isC = sym === 'C';
                          const isH = sym === 'H';
                          const isN = sym === 'N';
                          return (
                            <button
                              key={`l-${sym}-${i}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAtom('left', sym, 1);
                              }}
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[9px] font-bold flex items-center justify-center shadow-md transition hover:scale-125 active:scale-95 cursor-pointer ${
                                isH
                                  ? 'bg-white text-slate-900 border border-slate-300'
                                  : isC
                                  ? 'bg-slate-400 text-slate-900 border border-slate-500'
                                  : isN
                                  ? 'bg-blue-500 text-white border border-blue-400'
                                  : 'bg-rose-500 text-white border border-rose-400'
                              }`}
                              title={`${ELEMENTS[sym].nameKo} 제거 (-1)`}
                            >
                              {sym}
                            </button>
                          );
                        })
                      )
                    )}
                  </div>
                </div>

                {/* Left Quick Add Sub-Bar */}
                <div className="flex items-center gap-1 mt-2 bg-slate-900/95 p-1 rounded-xl border border-slate-700/80 shadow-lg">
                  {['H', 'C', 'N', 'O'].map((sym) => (
                    <button
                      key={`left-btn-${sym}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addAtom('left', sym);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-[11px] font-bold font-mono transition border border-slate-700"
                      title={`왼쪽에 ${ELEMENTS[sym].nameKo}(${sym}) 추가`}
                    >
                      +{sym}
                    </button>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPan('left');
                    }}
                    className="px-2 h-7 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white text-[10px] font-bold transition border border-slate-700"
                    title="왼쪽 접시 비우기"
                  >
                    비움
                  </button>
                </div>
              </div>

              {/* RIGHT HANGING TRAY ASSEMBLY (Positioned at right tip) */}
              <div
                className="absolute -top-10 right-0 translate-x-1/2 w-40 sm:w-52 md:w-60 flex flex-col items-center transition-transform duration-700"
                style={{
                  transform: `translateX(50%) rotate(${-tiltAngle}deg)`,
                  transformOrigin: 'top center'
                }}
                onDragOver={(e) => handleDragOver(e, 'right')}
                onDragLeave={() => handleDragLeave('right')}
                onDrop={(e) => handleDrop(e, 'right')}
                onClick={() => {
                  if (selectedPaletteAtom) {
                    addAtom('right', selectedPaletteAtom);
                  }
                }}
              >
                {/* Hanging Strings/Chains */}
                <div className="w-32 sm:w-44 h-12 border-l-2 border-r-2 border-slate-400/80 -mb-1"></div>

                {/* Right Tray Pan Container */}
                <div
                  className={`w-40 sm:w-52 md:w-60 h-28 sm:h-32 border-2 rounded-b-3xl backdrop-blur-md relative transition-all shadow-2xl p-2.5 flex flex-col justify-between cursor-pointer ${
                    isBalanced
                      ? 'bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-950/60'
                      : isDragOverRight
                      ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-400 scale-105'
                      : 'bg-slate-900/90 border-slate-600 hover:border-indigo-400 hover:bg-slate-850'
                  }`}
                >
                  {/* Tray Title & Atom Types Sub-Bar */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-1">
                    <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 오른쪽 접시
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">{totalRightCount}개</span>
                  </div>

                  {/* Atom types summary chips in Right Tray */}
                  {totalRightCount > 0 && (
                    <div className="flex flex-wrap gap-1 py-0.5 justify-center">
                      {Object.entries(rightPan)
                        .filter(([, count]) => Number(count) > 0)
                        .map(([sym, count]) => (
                          <span
                            key={`tray-r-${sym}`}
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/90 border border-slate-700 text-slate-300"
                          >
                            {ELEMENTS[sym].nameKo} {count}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Atoms rendered inside tray */}
                  <div className="flex-1 flex flex-wrap gap-1.5 content-end justify-center overflow-y-auto max-h-16 scrollbar-none py-1">
                    {totalRightCount === 0 ? (
                      <span className="text-[11px] text-slate-500 self-center">원자를 넣으세요</span>
                    ) : (
                      Object.entries(rightPan).flatMap(([sym, count]) =>
                        Array.from({ length: Number(count) }).map((_, i) => {
                          const isC = sym === 'C';
                          const isH = sym === 'H';
                          const isN = sym === 'N';
                          return (
                            <button
                              key={`r-${sym}-${i}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAtom('right', sym, 1);
                              }}
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[9px] font-bold flex items-center justify-center shadow-md transition hover:scale-125 active:scale-95 cursor-pointer ${
                                isH
                                  ? 'bg-white text-slate-900 border border-slate-300'
                                  : isC
                                  ? 'bg-slate-400 text-slate-900 border border-slate-500'
                                  : isN
                                  ? 'bg-blue-500 text-white border border-blue-400'
                                  : 'bg-rose-500 text-white border border-rose-400'
                              }`}
                              title={`${ELEMENTS[sym].nameKo} 제거 (-1)`}
                            >
                              {sym}
                            </button>
                          );
                        })
                      )
                    )}
                  </div>
                </div>

                {/* Right Quick Add Sub-Bar */}
                <div className="flex items-center gap-1 mt-2 bg-slate-900/95 p-1 rounded-xl border border-slate-700/80 shadow-lg">
                  {['H', 'C', 'N', 'O'].map((sym) => (
                    <button
                      key={`right-btn-${sym}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addAtom('right', sym);
                      }}
                      className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-[11px] font-bold font-mono transition border border-slate-700"
                      title={`오른쪽에 ${ELEMENTS[sym].nameKo}(${sym}) 추가`}
                    >
                      +{sym}
                    </button>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearPan('right');
                    }}
                    className="px-2 h-7 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white text-[10px] font-bold transition border border-slate-700"
                    title="오른쪽 접시 비우기"
                  >
                    비움
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tray Global Adjustments & Reset Controls */}
        <div className="bg-slate-900/95 border-t border-slate-800 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">💡 조작 안내:</span>
            <span className="text-xs sm:text-sm text-slate-300">
              아래 <strong>원자 보관함</strong>에서 원자를 선택하거나, 저울 접시의 <strong>+버튼</strong>을 눌러 원자를 담을 수 있습니다.
            </span>
          </div>

          {/* Reset Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => clearPan('all')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 border border-slate-700 transition flex items-center gap-2 shadow-md hover:border-slate-500 active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>양쪽 모두 비우기</span>
            </button>
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION: Element Palette & Discovered Logs in Clean Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column: Element Palette Cards */}
        <div className="lg:col-span-8 bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> 원자 보관함 (원자 선택 및 투입)
            </h3>
            <span className="text-xs text-indigo-400 font-mono flex items-center gap-1">
              <Hand className="w-3.5 h-3.5" /> 클릭하여 접시에 추가
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {Object.values(ELEMENTS).map((el) => {
              const isC = el.symbol === 'C';
              const isH = el.symbol === 'H';
              const isN = el.symbol === 'N';
              const isSelected = selectedPaletteAtom === el.symbol;

              return (
                <div
                  key={el.symbol}
                  draggable
                  onDragStart={(e) => handleDragStart(e, el.symbol)}
                  onClick={() => {
                    setSelectedPaletteAtom(el.symbol);
                    soundFx.playPop(350);
                  }}
                  className={`flex flex-col items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none shadow-sm ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-950/50 shadow-md'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/70'
                  }`}
                >
                  {/* Atom Ball Graphic */}
                  <div
                    className={`w-14 h-14 rounded-full shadow-lg mb-2.5 flex items-center justify-center font-bold text-lg transition-transform hover:scale-110 active:scale-95 ${
                      isH
                        ? 'bg-white text-slate-900 shadow-slate-900/40 ring-2 ring-slate-300'
                        : isC
                        ? 'bg-slate-400 text-slate-900 shadow-slate-900/50 ring-2 ring-slate-500'
                        : isN
                        ? 'bg-blue-500 text-white shadow-blue-500/40 ring-2 ring-blue-400'
                        : 'bg-rose-500 text-white shadow-rose-500/40 ring-2 ring-rose-400'
                    }`}
                  >
                    {el.symbol}
                  </div>

                  <div className="text-center mb-3">
                    <div className="text-sm font-bold text-slate-100">
                      {el.nameKo} <span className="font-mono text-xs text-slate-400">({el.symbol})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      원자번호 {el.atomicNumber}번
                    </div>
                  </div>

                  {/* Prominent Quick Placement Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-1.5 w-full pt-2 border-t border-slate-700/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addAtom('left', el.symbol);
                      }}
                      className="flex-1 py-1.5 px-2 text-xs font-bold rounded-lg bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-200 border border-slate-600 transition flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      title={`${el.nameKo} 왼쪽 접시에 추가`}
                    >
                      + 왼쪽
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addAtom('right', el.symbol);
                      }}
                      className="flex-1 py-1.5 px-2 text-xs font-bold rounded-lg bg-slate-700 hover:bg-cyan-600 hover:text-white text-slate-200 border border-slate-600 transition flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      title={`${el.nameKo} 오른쪽 접시에 추가`}
                    >
                      + 오른쪽
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Discovered Ratios Log */}
        <div className="lg:col-span-4 bg-slate-800/50 rounded-2xl p-5 sm:p-6 border border-slate-700/80 flex flex-col shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 발견된 질량비 기록 ({discoveredRatios.length})
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">LOGS</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-64 scrollbar-thin flex-1">
            {discoveredRatios.length === 0 ? (
              <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-700/60 flex flex-col items-center justify-center text-center opacity-75 h-full">
                <Layers className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs text-slate-300 font-medium">아직 발견된 평형이 없습니다.</span>
                <span className="text-[11px] text-slate-400 mt-1">양팔저울의 균형을 맞춰 새로운 질량비를 찾아보세요!</span>
              </div>
            ) : (
              discoveredRatios.map((ratio) => (
                <div
                  key={ratio.id}
                  className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/40 flex items-center justify-between transition hover:border-emerald-500/70 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold shadow-sm ${
                        ratio.leftElement === 'H'
                          ? 'bg-white text-slate-900'
                          : ratio.leftElement === 'C'
                          ? 'bg-slate-400 text-slate-900'
                          : ratio.leftElement === 'N'
                          ? 'bg-blue-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {ratio.leftElement}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {ELEMENTS[ratio.leftElement]?.nameKo} {ratio.leftCount}개
                    </span>
                  </div>
                  <span className="text-emerald-400 font-black text-sm font-mono px-2">⚖️ =</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold shadow-sm ${
                        ratio.rightElement === 'H'
                          ? 'bg-white text-slate-900'
                          : ratio.rightElement === 'C'
                          ? 'bg-slate-400 text-slate-900'
                          : ratio.rightElement === 'N'
                          ? 'bg-blue-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {ratio.rightElement}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {ELEMENTS[ratio.rightElement]?.nameKo} {ratio.rightCount}개
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

