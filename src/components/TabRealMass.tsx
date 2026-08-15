import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Eye, EyeOff, Sparkles, Scale, Info, Layers, RefreshCw } from 'lucide-react';
import { ELEMENTS } from '../data/elements';
import { soundFx } from '../lib/sound';

interface TabRealMassProps {
  onTabComplete: () => void;
  onGoToTab3: () => void;
}

export const TabRealMass: React.FC<TabRealMassProps> = ({
  onTabComplete,
  onGoToTab3
}) => {
  const [showFullZeros, setShowFullZeros] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<string>('C');
  const [placedCountTier, setPlacedCountTier] = useState<number>(1); // 1, 1000, 10^9, 10^18, 6.022*10^23
  const [scalePrecision, setScalePrecision] = useState<'standard' | 'analytical'>('standard'); // standard (0.01g), analytical (0.0001g)

  const el = ELEMENTS[selectedElement];

  // Helper to format full decimal representation
  const getFullDecimalString = (massG: number) => {
    if (massG < 1e-23) {
      // e.g. H: 1.674e-24 -> 0. (23 zeros) 1674 g
      const digits = Math.round(massG * 1e27).toString();
      return `0.00000000000000000000000${digits} g`;
    } else {
      // e.g. C, N, O: ~2e-23 -> 0. (22 zeros) 1993 g
      const digits = Math.round(massG * 1e26).toString();
      return `0.0000000000000000000000${digits} g`;
    }
  };

  const getScientificString = (massG: number) => {
    if (massG >= 1e-23) {
      const val = (massG * 1e23).toFixed(3);
      return `${val} × 10⁻²³ g`;
    }
    const val = (massG * 1e24).toFixed(3);
    return `${val} × 10⁻²⁴ g`;
  };

  // Calculate measured mass on balance
  const atomCount = placedCountTier;
  const currentTotalExactMass = el.exactMassG * atomCount;

  // Formatting balance display
  let displayedMass = "0.00";
  let isMeasurable = false;

  if (scalePrecision === 'standard') {
    // 0.01g resolution
    const val = Math.round(currentTotalExactMass * 100) / 100;
    displayedMass = val.toFixed(2);
    isMeasurable = val >= 0.01;
  } else {
    // 0.0001g resolution (화학 분석용 정밀 저울)
    const val = Math.round(currentTotalExactMass * 10000) / 10000;
    displayedMass = val.toFixed(4);
    isMeasurable = val >= 0.0001;
  }

  const handleSelectCount = (count: number) => {
    soundFx.playClick();
    setPlacedCountTier(count);
    onTabComplete();
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Top Header & Overview */}
      <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              탐구 2단계 // 실제 질량의 충격 (Micro to Macro)
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            원자 1개의 실제 질량과 실험실 전자저울의 한계
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            상대 질량비(1, 12, 14, 16) 뒤에 숨겨진 <strong>원자 1개의 극미세 실제 질량</strong>을 확인하고,
            일반 저울의 눈금을 움직이기 위해 얼마나 많은 원자가 필요한지 직접 검증해보세요.
          </p>
        </div>

        {/* Scientific / Full Zeros Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/80 self-start md:self-auto shrink-0 shadow-sm">
          <button
            onClick={() => {
              soundFx.playClick();
              setShowFullZeros(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !showFullZeros
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            지수 표기 (Scientific)
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setShowFullZeros(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              showFullZeros
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> 소수점 아래 0 모두 펼치기
          </button>
        </div>
      </div>

      {/* 4 Element Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(ELEMENTS).map((item) => {
          const isSelected = selectedElement === item.symbol;
          const isC = item.symbol === 'C';
          const isH = item.symbol === 'H';
          const isN = item.symbol === 'N';
          const isO = item.symbol === 'O';
          return (
            <div
              key={item.symbol}
              onClick={() => {
                soundFx.playPop(item.relativeMass * 30 + 300);
                setSelectedElement(item.symbol);
              }}
              className={`cursor-pointer rounded-2xl border transition-all p-4 relative shadow-md ${
                isSelected
                  ? 'bg-slate-800/80 border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-950/40'
                  : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-transform ${
                      isH
                        ? 'bg-white text-slate-900 shadow-slate-900/40'
                        : isC
                        ? 'bg-slate-400 text-slate-900 shadow-slate-900/50'
                        : isN
                        ? 'bg-blue-500 text-white shadow-blue-500/30'
                        : 'bg-red-500 text-white shadow-red-500/30'
                    }`}
                  >
                    {item.symbol}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.nameKo}</h3>
                    <span className="text-[11px] font-mono text-slate-400">{item.nameEn}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  상대값 {item.relativeMass}
                </span>
              </div>

              {/* Mass Info Block */}
              <div className="space-y-2 mt-3 pt-3 border-t border-slate-700/60">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">상대적 원자량:</span>
                  <span className="font-bold text-white font-mono">{item.relativeMass}</span>
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block mb-1">실제 질량 (1개):</span>
                  {showFullZeros ? (
                    <div className="font-mono text-[10px] font-bold text-indigo-300 bg-slate-900/90 p-2 rounded-xl break-all border border-indigo-950/80 leading-relaxed">
                      {getFullDecimalString(item.exactMassG)}
                    </div>
                  ) : (
                    <div className="font-mono text-xs font-bold text-indigo-300 bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-700/80">
                      {getScientificString(item.exactMassG)}
                    </div>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-bold text-indigo-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 저울 측정 중
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Interactive Scale Testing Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left: Atom Loading Tier Controls */}
        <div className="lg:col-span-5 bg-slate-800/50 rounded-2xl border border-slate-700 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                {el.nameKo}({el.symbol}) 원자 개수별 저울 측정 시험
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              원자의 개수를 점진적으로 늘려보세요. 얼마나 모아야 우리가 사용하는 저울 눈금이 마침내 반응할까요?
            </p>

            {/* Quantity Selector Buttons */}
            <div className="space-y-2.5">
              {[
                { label: '원자 1개', count: 1, desc: '미시 세계의 최소 단위' },
                { label: '원자 1,000개 (1천 개)', count: 1000, desc: '1.0 × 10³ 개' },
                { label: '원자 1,000,000,000개 (10억 개)', count: 1e9, desc: '1.0 × 10⁹ 개' },
                { label: '원자 100경 개 (1,000,000,000,000,000,000)', count: 1e18, desc: '1.0 × 10¹⁸ 개 (1조의 100만배)' },
                { label: '1몰 (아보가드로수: 6.022 × 10²³개)', count: 6.02214076e23, desc: '거시 세계로의 마법의 다리!' }
              ].map((tier) => {
                const isSelected = placedCountTier === tier.count;
                return (
                  <button
                    key={tier.count}
                    onClick={() => handleSelectCount(tier.count)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                        {tier.label}
                        {tier.count > 1e20 && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{tier.desc}</div>
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scale Precision Mode Toggle */}
          <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">SCALE RESOLUTION:</span>
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setScalePrecision('standard')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  scalePrecision === 'standard' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                일반 저울 (0.01g)
              </button>
              <button
                onClick={() => setScalePrecision('analytical')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  scalePrecision === 'analytical' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                분석 저울 (0.0001g)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Immersive Digital Laboratory Scale Simulator */}
        <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-25 pointer-events-none bg-dot-grid" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
                DIGITAL BALANCE SIMULATION // PRECISION RIG
              </span>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                SENSITIVITY: {scalePrecision === 'standard' ? '±0.01 g' : '±0.0001 g'}
              </span>
            </div>

            {/* DIGITAL SCALE HARDWARE VISUAL */}
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl relative max-w-md mx-auto my-3">
              {/* Stainless Steel Weighing Pan */}
              <div className="w-48 h-10 mx-auto rounded-xl bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border border-slate-300 shadow-inner flex flex-col items-center justify-center relative">
                {/* Visual atom particles on pan */}
                <div className="absolute -top-3 flex items-center justify-center">
                  {placedCountTier === 1 && (
                    <div
                      className={`w-3 h-3 rounded-full animate-bounce shadow-md ${
                        el.symbol === 'H' ? 'bg-white' : el.symbol === 'C' ? 'bg-slate-400' : el.symbol === 'N' ? 'bg-blue-500' : 'bg-red-500'
                      }`}
                    />
                  )}
                  {placedCountTier > 1 && placedCountTier < 1e20 && (
                    <div className="flex gap-0.5">
                      <div className="w-2 h-2 rounded-full bg-slate-400 opacity-80" />
                      <div className="w-2 h-2 rounded-full bg-slate-400 opacity-60" />
                      <div className="w-2 h-2 rounded-full bg-slate-400 opacity-90" />
                    </div>
                  )}
                  {placedCountTier > 1e20 && (
                    <div className="w-16 h-4 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full blur-[1px] shadow-lg animate-pulse" />
                  )}
                </div>
                <div className="w-full h-1 bg-slate-400/50 rounded-full mt-auto mb-1"></div>
              </div>

              {/* Pedestal Column */}
              <div className="w-16 h-3 mx-auto bg-slate-700"></div>

              {/* Digital LCD Segment Display Box */}
              <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 my-4 shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>STATUS: {isMeasurable ? 'MEASURED' : 'BELOW DETECTION LIMIT'}</span>
                  <span>g (grams)</span>
                </div>
                <div className="text-center font-mono text-4xl sm:text-5xl font-extrabold text-indigo-400 tracking-wider">
                  {displayedMass} <span className="text-xl text-slate-500">g</span>
                </div>
              </div>

              {/* Measurable or Underflow Status Message */}
              {!isMeasurable ? (
                <div className="bg-rose-950/40 border border-rose-600/30 rounded-xl p-3 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-rose-200 block">
                      측정 불가 (0.00g) // 저울 감도 한계 초과
                    </strong>
                    {el.nameKo} {placedCountTier >= 1e9 ? '수억~수경 개' : `${placedCountTier}개`}를 올려도
                    실제 질량({getScientificString(currentTotalExactMass)})이 너무나 미세하여 일반 전자저울 바늘이 전혀 움직이지 않습니다!
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 text-emerald-200 text-xs flex items-start gap-2.5 shadow-md">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-emerald-100 block">
                      저울 눈금 측정 성공! ({displayedMass} g)
                    </strong>
                    {el.nameKo} 원자를 <strong>1몰(6.022 × 10²³개)</strong> 모으니,
                    우리가 손으로 만질 수 있는 거시 세계 질량 <strong>{el.relativeMass}g</strong>이 되었습니다!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Micro to Macro Conclusion / Next Step Navigation */}
          <div className="relative z-10 mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span className="text-slate-200 font-semibold block mb-0.5">💡 화학자들의 깨달음</span>
              원자 1개는 잴 수 없지만, <span className="text-indigo-400 font-bold">6.022 × 10²³개</span>를 한 묶음으로 모으면
              <strong>원자량 숫자 그대로 g 단위</strong>가 됩니다!
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                onGoToTab3();
              }}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 shrink-0"
            >
              <span>3단계: 1몰(mol) 생성기로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
