import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Play, RotateCcw, CheckCircle2, ArrowRight, Layers, Award, Info, HelpCircle } from 'lucide-react';
import { ELEMENTS, AVOGADRO_CONSTANT, AVOGADRO_DISPLAY } from '../data/elements';
import { soundFx } from '../lib/sound';

interface TabMoleGeneratorProps {
  onTabComplete: () => void;
  onExploreElement: (symbol: string) => void;
  exploredElements: string[];
}

export const TabMoleGenerator: React.FC<TabMoleGeneratorProps> = ({
  onTabComplete,
  onExploreElement,
  exploredElements
}) => {
  const [selectedElement, setSelectedElement] = useState<string>('C');
  const [moleFraction, setMoleFraction] = useState<number>(0); // 0.0 to 1.0 (or up to 2.0)
  const [isAutoPouring, setIsAutoPouring] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);

  const el = ELEMENTS[selectedElement];
  const targetMassG = el.relativeMass; // 12 for C, 1 for H, 14 for N, 16 for O
  const currentMassG = moleFraction * targetMassG;
  const currentAtomCount = moleFraction * AVOGADRO_CONSTANT;

  // Auto pouring interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPouring) {
      interval = setInterval(() => {
        setMoleFraction((prev) => {
          if (prev >= 1.0) {
            setIsAutoPouring(false);
            return 1.0;
          }
          const next = Math.min(1.0, prev + 0.04);
          soundFx.playPop(prev * 300 + 400);
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAutoPouring]);

  // Check 1.0 mole milestone
  useEffect(() => {
    if (moleFraction >= 0.999 && !hasCelebrated) {
      setHasCelebrated(true);
      soundFx.playSuccessFanfare();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.55 }
      });
      onTabComplete();
      onExploreElement(selectedElement);
    } else if (moleFraction < 0.99) {
      setHasCelebrated(false);
    }
  }, [moleFraction, hasCelebrated, selectedElement, onTabComplete, onExploreElement]);

  const handleElementChange = (symbol: string) => {
    soundFx.playClick();
    setSelectedElement(symbol);
    setHasCelebrated(false);
    onExploreElement(symbol);
  };

  const handleSetExactOneMole = () => {
    soundFx.playClick();
    setMoleFraction(1.0);
  };

  const handleReset = () => {
    soundFx.playClick();
    setIsAutoPouring(false);
    setMoleFraction(0);
    setHasCelebrated(false);
  };

  const formatCountDisplay = (count: number) => {
    if (count === 0) return '0 개';
    if (count < 1e6) return `${Math.round(count).toLocaleString()} 개`;
    if (count >= AVOGADRO_CONSTANT * 0.999 && count <= AVOGADRO_CONSTANT * 1.001) {
      return AVOGADRO_DISPLAY + ' 개 (정확히 1 mol)';
    }
    const exponent = Math.floor(Math.log10(count));
    const mantissa = (count / Math.pow(10, exponent)).toFixed(3);
    return `${mantissa} × 10${getSuperscript(exponent)} 개`;
  };

  const getSuperscript = (num: number) => {
    const map: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return num.toString().split('').map(d => map[d] || d).join('');
  };

  // Gas Particles Physics Simulation Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    pulse: number;
  }>>([]);

  // Maintain particles count matching moleFraction
  useEffect(() => {
    const targetCount = Math.round(moleFraction * 50); // up to 50 active particles
    const currentParticles = particlesRef.current;

    const width = 240;
    const height = 280;

    if (currentParticles.length < targetCount) {
      // Spawn new particles randomly distributed across the entire chamber
      const needed = targetCount - currentParticles.length;
      for (let i = 0; i < needed; i++) {
        const speed = 1.2 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        currentParticles.push({
          x: 15 + Math.random() * (width - 30),
          y: 15 + Math.random() * (height - 30),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: selectedElement === 'H' ? 7 : 8.5,
          pulse: Math.random() * Math.PI * 2
        });
      }
    } else if (currentParticles.length > targetCount) {
      currentParticles.length = targetCount;
    }
  }, [moleFraction, selectedElement]);

  // Canvas render and physics animation loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 240;
    const height = 280;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Element color palette
      let sphereFill = '#ffffff';
      let sphereBorder = '#94a3b8';
      let glowColor = 'rgba(255, 255, 255, 0.08)';
      let textFill = '#0f172a';

      if (selectedElement === 'C') {
        sphereFill = '#334155';
        sphereBorder = '#94a3b8';
        glowColor = 'rgba(148, 163, 184, 0.08)';
        textFill = '#ffffff';
      } else if (selectedElement === 'N') {
        sphereFill = '#2563eb';
        sphereBorder = '#60a5fa';
        glowColor = 'rgba(37, 99, 235, 0.12)';
        textFill = '#ffffff';
      } else if (selectedElement === 'O') {
        sphereFill = '#e11d48';
        sphereBorder = '#fb7185';
        glowColor = 'rgba(225, 29, 72, 0.12)';
        textFill = '#ffffff';
      }

      // Background gas density aura (proportional to moleFraction)
      if (moleFraction > 0.01) {
        const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width);
        grad.addColorStop(0, glowColor.replace(/0\.\d+\)/, `${(moleFraction * 0.35).toFixed(3)})`));
        grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Update & render each particle
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.04;

        // Bounce on walls with margin
        const pad = p.radius + 2;
        if (p.x < pad) {
          p.x = pad;
          p.vx = Math.abs(p.vx);
        } else if (p.x > width - pad) {
          p.x = width - pad;
          p.vx = -Math.abs(p.vx);
        }
        if (p.y < pad + 6) {
          p.y = pad + 6;
          p.vy = Math.abs(p.vy);
        } else if (p.y > height - pad - 6) {
          p.y = height - pad - 6;
          p.vy = -Math.abs(p.vy);
        }

        // Draw particle shadow
        ctx.shadowColor = sphereBorder;
        ctx.shadowBlur = 6;

        // Draw particle sphere
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = sphereFill;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = sphereBorder;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Highlight spot for 3D sphere look
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // Symbol label
        ctx.fillStyle = textFill;
        ctx.font = `bold ${p.radius > 8 ? 8 : 7}px ui-sans-serif, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectedElement, p.x, p.y + 0.5);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedElement, moleFraction]);

  return (
    <div className="space-y-6 flex-1 flex flex-col">
      {/* Top Mission Instruction */}
      <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-5 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              탐구 3단계 // 마법의 묶음, 1몰(mol) 생성기
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            아보가드로수(NA = 6.022 × 10²³)와 거시 질량(g)의 연결
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            실린더에 <strong>{el.nameKo}({el.symbol})</strong> 원자를 주입하여 정확히 <strong>{targetMassG}g</strong>이 될 때까지 채워보세요.
            기체 입자들이 용기 전체에 균일하게 퍼져 운동하며, 1몰의 놀라운 화학 법칙을 직접 체험할 수 있습니다.
          </p>
        </div>

        {/* Quick 1 Mol Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAutoPouring(!isAutoPouring)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
              isAutoPouring
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {isAutoPouring ? '원자 주입 일시정지' : '원자 연속 주입하기'}
          </button>
          <button
            onClick={handleSetExactOneMole}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-indigo-600 text-white border border-slate-600 transition shadow-md"
          >
            정확히 1몰 채우기
          </button>
          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="실린더 비우기"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Element Switcher Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.values(ELEMENTS).map((item) => {
          const isSelected = selectedElement === item.symbol;
          const isExplored = exploredElements.includes(item.symbol);
          const isC = item.symbol === 'C';
          const isH = item.symbol === 'H';
          const isN = item.symbol === 'N';
          const isO = item.symbol === 'O';
          return (
            <button
              key={item.symbol}
              onClick={() => handleElementChange(item.symbol)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between shadow-sm ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/30 text-white shadow-lg'
                  : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
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
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-1">
                    {item.nameKo} <span className="text-slate-400 font-mono text-xs">({item.symbol})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    1몰 목표: <strong className="text-indigo-400">{item.relativeMass}g</strong>
                  </div>
                </div>
              </div>
              {isExplored && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" title="1몰 탐구 완료" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Beaker & Scale Simulation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left: Interactive Beaker & Scale Stage */}
        <div className="lg:col-span-6 bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-25 pointer-events-none bg-dot-grid" />

          {/* Beaker Container */}
          <div className="relative z-10 w-full flex flex-col items-center my-2">
            {/* Visual Glass Cylinder / Gas Chamber */}
            <div className="relative w-56 sm:w-64 h-72 border-4 border-slate-500/70 rounded-3xl bg-slate-950/70 backdrop-blur-md flex flex-col items-center justify-between p-0 overflow-hidden shadow-2xl">
              {/* Chamber Top Valve / Seal Cap */}
              <div className="w-full bg-slate-800 border-b border-slate-600/80 py-1 px-3 flex items-center justify-between z-30 shadow">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[10px] font-mono font-bold text-slate-300">밀폐 가스 실린더 (1.0 mol 규격)</span>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 bg-slate-900/90 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  {moleFraction === 0 ? '진공 (0.0 mol)' : `밀도 ${(moleFraction * 100).toFixed(0)}%`}
                </span>
              </div>

              {/* Exact Graduated Lines Overlay (Across the whole height) */}
              <div className="absolute inset-0 pointer-events-none z-20 pt-7 pb-2">
                {/* 1.0 mol line at ~88% top */}
                <div className="absolute left-0 right-0 top-[14%] flex items-center justify-between px-2.5 border-b-2 border-indigo-400/90 shadow-sm">
                  <span className="text-[9px] font-mono font-bold text-indigo-300 bg-slate-950/90 px-1.5 py-0.5 rounded shadow">
                    1.0 mol 용량 ({targetMassG}g)
                  </span>
                  <span className="text-[9px] font-mono font-bold text-indigo-400 bg-slate-950/90 px-1 rounded">1.0 mol</span>
                </div>

                {/* 0.75 mol line at ~38% */}
                <div className="absolute left-0 right-0 top-[38%] flex items-center justify-between px-2.5 border-b border-slate-500/50 border-dashed">
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-950/80 px-1 rounded">
                    0.75 mol ({(targetMassG * 0.75).toFixed(1)}g)
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">0.75</span>
                </div>

                {/* 0.50 mol line at ~62% */}
                <div className="absolute left-0 right-0 top-[62%] flex items-center justify-between px-2.5 border-b-2 border-cyan-400/70">
                  <span className="text-[9px] font-mono font-bold text-cyan-300 bg-slate-950/90 px-1.5 py-0.5 rounded shadow">
                    0.5 mol 기준 ({(targetMassG * 0.5).toFixed(1)}g)
                  </span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-slate-950/90 px-1 rounded">0.5 mol</span>
                </div>

                {/* 0.25 mol line at ~82% */}
                <div className="absolute left-0 right-0 top-[82%] flex items-center justify-between px-2.5 border-b border-slate-500/50 border-dashed">
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-950/80 px-1 rounded">
                    0.25 mol ({(targetMassG * 0.25).toFixed(1)}g)
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">0.25</span>
                </div>
              </div>

              {/* Real-time Dynamic Gas Particle Canvas (Particles uniformly flying through the ENTIRE space) */}
              <div className="relative w-full h-full flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={280}
                  className="w-full h-full block"
                />

                {/* Empty State Overlay */}
                {moleFraction === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 pointer-events-none">
                    <span className="text-slate-500 text-xs font-mono mb-1">실린더가 비어 있습니다</span>
                    <span className="text-slate-600 text-[10px]">아래 슬라이더를 올려 원자를 주입하세요</span>
                  </div>
                )}
              </div>

              {/* Bottom Chamber Floor */}
              <div className="w-full bg-slate-800/80 border-t border-slate-700 py-1 px-2 text-center text-[9px] font-mono text-slate-400 z-30">
                기체 입자 운동 중 (전체 공간 균일 분산)
              </div>
            </div>

            {/* Scale Hardware underneath the Cylinder */}
            <div className="w-64 sm:w-72 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 mt-2 shadow-2xl">
              {/* Stainless Scale top plate */}
              <div className="w-full h-3 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-t-lg shadow-sm mb-2"></div>
              {/* LCD Display */}
              <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-3 text-center shadow-inner">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  ELECTRONIC BALANCE DISPLAY
                </div>
                <div className="font-mono text-3xl sm:text-4xl font-extrabold text-indigo-400 tracking-wider">
                  {currentMassG.toFixed(2)} <span className="text-lg text-slate-500">g</span>
                </div>
              </div>
            </div>

            {/* Micro-learning Note on Gas Distribution */}
            <div className="w-full max-w-sm mt-2 text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-start gap-2">
              <span className="text-cyan-400 font-bold shrink-0">💡 원리:</span>
              <span>
                기체는 <strong className="text-slate-200">0.5몰이든 1.0몰이든 용기 전체 공간에 균일하게 퍼져 끊임없이 운동</strong>합니다.
                몰 수(mol)가 증가하면 실린더 내 <strong className="text-indigo-300">입자 밀도(개수)와 총 질량이 비례</strong>하여 증가합니다.
              </span>
            </div>
          </div>

          {/* Slider Controller */}
          <div className="relative z-10 w-full space-y-2.5 mt-2 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400 font-mono">원자 주입 슬라이더:</span>
              <span className="text-indigo-400 font-mono font-bold">
                {moleFraction.toFixed(2)} mol ({currentMassG.toFixed(2)} g)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.01"
              value={moleFraction}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setMoleFraction(val);
                soundFx.playPop(val * 300 + 400);
              }}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>0.0 mol (0g)</span>
              <span className="text-cyan-400 font-semibold">0.5 mol ({(targetMassG * 0.5).toFixed(1)}g)</span>
              <span className="text-indigo-400 font-bold">1.0 mol ({targetMassG}g) [1몰 완성]</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              {[
                { label: '0.0 mol', val: 0.0 },
                { label: '0.25 mol', val: 0.25 },
                { label: '0.5 mol (반)', val: 0.5 },
                { label: '0.75 mol', val: 0.75 },
                { label: '1.0 mol (1몰)', val: 1.0 }
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => {
                    soundFx.playClick();
                    setMoleFraction(btn.val);
                  }}
                  className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold transition border ${
                    Math.abs(moleFraction - btn.val) < 0.01
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Particle Count-Up & Chemical Law Highlight */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-6">
          {/* Real-time Particle Count Card */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-tight">
                <Layers className="w-4 h-4 text-indigo-400" /> 실린더 속 원자 개수 실시간 집계
              </h3>
              <span className="text-[10px] font-mono text-slate-500">REALTIME</span>
            </div>

            {/* Big Exponential Counter */}
            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 text-center shadow-inner">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">현재 실린더에 들어있는 {el.nameKo} 원자 수</span>
              <div className="font-mono text-xl sm:text-2xl font-black text-indigo-300 tracking-tight break-all">
                {formatCountDisplay(currentAtomCount)}
              </div>
            </div>

            {/* Current Mole Fraction Status */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block text-[10px]">측정된 질량</span>
                <span className="text-base font-bold text-white">{currentMassG.toFixed(2)} g</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block text-[10px]">환산 몰(mol) 수</span>
                <span className="text-base font-bold text-indigo-400">{moleFraction.toFixed(2)} mol</span>
              </div>
            </div>

            {/* 1 Mol Goal Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-mono">1몰 도달률 ({targetMassG}g 기준)</span>
                <span className="font-bold text-indigo-400 font-mono">{Math.min(100, Math.round(moleFraction * 100))}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-200"
                  style={{ width: `${Math.min(100, moleFraction * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* 1 MOLE HIGHLIGHT BOX (When >= 1.0 mol reached) */}
          <div
            className={`rounded-2xl border p-5 transition-all shadow-xl ${
              moleFraction >= 0.99
                ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border-indigo-400 shadow-indigo-950/50'
                : 'bg-slate-800/40 border-slate-700 opacity-80'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">
                {moleFraction >= 0.99 ? '🎉 1몰(mol)의 기적 완성!' : '1몰(mol) 핵심 법칙 미리보기'}
              </h3>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 my-2 space-y-2">
              <div className="text-center font-mono font-bold text-base sm:text-lg text-indigo-300">
                1 mol = 6.022 × 10²³ 개 (아보가드로수, N<sub className="text-xs">A</sub>)
              </div>
              <div className="text-xs text-slate-300 leading-relaxed text-center">
                {el.nameKo}({el.symbol}) 원자 <strong>6.022 × 10²³개</strong>의 무게는 정확히 <strong>{targetMassG}g</strong>입니다.
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              <strong>💡 화학 I 핵심 법칙:</strong> 다른 원소(H, N, O) 탭을 눌러보세요.
              질량은 각각 1g, 14g, 16g으로 다르지만, <strong>1몰에 들어있는 원자의 개수는 모두 6.022 × 10²³개로 정확히 동일합니다!</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 4-Element 1-Mole Comparison Matrix (The Core Chemistry 1 Insight) */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              한눈에 비교하는 4대 원소의 1몰(mol) 매트릭스
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">모든 원소의 1몰 속 입자 수는 동일 ($N_A$)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(ELEMENTS).map((item) => {
            const isCurrentlySelected = selectedElement === item.symbol;
            return (
              <div
                key={item.symbol}
                onClick={() => handleElementChange(item.symbol)}
                className={`cursor-pointer rounded-xl p-4 border transition-all ${
                  isCurrentlySelected
                    ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30 shadow-md'
                    : 'bg-slate-900/70 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.nameKo} ({item.symbol})</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    1 mol
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">1몰 질량(몰질량):</span>
                    <span className="font-bold text-indigo-300 font-mono">{item.relativeMass} g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">1몰 속 원자 수:</span>
                    <span className="font-bold text-emerald-400 font-mono">6.022 × 10²³ 개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">상대적 질량비:</span>
                    <span className="font-semibold text-slate-200 font-mono">{item.relativeMass} : 12(탄소)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
