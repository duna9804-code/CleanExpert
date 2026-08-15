import React, { useState } from 'react';
import { X, BookOpen, Copy, Check, Scale, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { DiscoveredRatio } from '../types';
import { ELEMENTS, AVOGADRO_DISPLAY } from '../data/elements';
import { soundFx } from '../lib/sound';

interface LabNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredRatios: DiscoveredRatio[];
  exploredElements: string[];
}

export const LabNotesModal: React.FC<LabNotesModalProps> = ({
  isOpen,
  onClose,
  discoveredRatios,
  exploredElements
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateReportText = () => {
    let text = `[화학 I 원자량과 몰(Mole) 탐구 실험 보고서]\n`;
    text += `작성일시: ${new Date().toLocaleString()}\n\n`;
    text += `1. 발견한 상대 질량비:\n`;
    if (discoveredRatios.length === 0) {
      text += `  - 아직 발견된 질량비가 없습니다.\n`;
    } else {
      discoveredRatios.forEach((r, idx) => {
        text += `  ${idx + 1}) ${r.ratioString}\n`;
      });
    }
    text += `\n2. 주요 원소의 원자량 및 1몰 질량:\n`;
    Object.values(ELEMENTS).forEach(el => {
      text += `  - ${el.nameKo}(${el.symbol}): 원자량 ${el.relativeMass} -> 1몰 질량 ${el.relativeMass}g (${AVOGADRO_DISPLAY}개)\n`;
    });
    text += `\n3. 핵심 정리:\n`;
    text += `  - 원자량의 기준: ¹²C = 12.00\n`;
    text += `  - 1몰(mol) 속 입자 수 = 6.022 × 10²³개 (아보가드로수, NA)\n`;
    text += `  - 물질의 몰수(n) = 물질의 질량(w) / 화학식량(M)\n`;
    return text;
  };

  const handleCopy = () => {
    soundFx.playClick();
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">나의 탐구 일지 & 실험 보고서</h2>
              <p className="text-xs text-slate-400 font-mono">양팔저울로 발견한 질량비 및 1몰 개념 요약</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {/* Section 1: Discovered Ratios */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-tight font-mono">
                1. 가상 양팔저울로 발견한 원자 질량비 ({discoveredRatios.length}개)
              </h3>
            </div>

            {discoveredRatios.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/60 text-slate-400 text-xs text-center font-mono">
                1단계 가상 양팔저울에서 원자를 올려 평형을 맞춰보세요!
              </div>
            ) : (
              <div className="space-y-2">
                {discoveredRatios.map((ratio) => (
                  <div
                    key={ratio.id}
                    className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white font-mono">{ratio.ratioString}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(ratio.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: 1-Mole Summary Cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-tight font-mono">
                2. 원자량과 1몰(mol) 핵심 요약
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(ELEMENTS).map((el) => {
                const isExplored = exploredElements.includes(el.symbol);
                return (
                  <div key={el.symbol} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white font-sans">{el.nameKo}({el.symbol})</span>
                      {isExplored && <span className="text-[10px] text-emerald-400 font-bold font-sans">1몰 탐구됨</span>}
                    </div>
                    <div className="text-slate-400 text-[11px]">원자량: <strong className="text-indigo-400">{el.relativeMass}</strong></div>
                    <div className="text-slate-400 text-[11px]">1몰 질량: <strong className="text-indigo-300">{el.relativeMass}g</strong></div>
                    <div className="text-[10px] text-slate-500 mt-1">입자수: 6.022×10²³개</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Essential Chemical Formulas */}
          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <h4 className="font-bold text-indigo-400 flex items-center gap-1.5 font-mono">
              <FileText className="w-4 h-4" /> 화학 I 핵심 공식 정리
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 pt-1 font-mono">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5 font-semibold text-[11px] font-sans">몰수(n) 계산 공식:</span>
                <span className="text-indigo-300 font-bold">몰수(mol) = 질량(g) ÷ 화학식량(g/mol)</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5 font-semibold text-[11px] font-sans">입자 수(N) 계산 공식:</span>
                <span className="text-cyan-400 font-bold">입자 수 = 몰수(mol) × (6.022 × 10²³)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
            <span>{copied ? '보고서가 복사되었습니다!' : '보고서 텍스트 복사'}</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
