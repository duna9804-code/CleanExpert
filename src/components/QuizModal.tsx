import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, HelpCircle, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CHEMISTRY_QUIZ } from '../data/elements';
import { soundFx } from '../lib/sound';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveScore?: (score: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onSaveScore
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (isSubmitted) return;
    soundFx.playClick();
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    CHEMISTRY_QUIZ.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    soundFx.playClick();
    setIsSubmitted(true);
    const score = calculateScore();
    if (score === CHEMISTRY_QUIZ.length) {
      soundFx.playSuccessFanfare();
      confetti({ particleCount: 50, spread: 70 });
    }
    if (onSaveScore) {
      onSaveScore(score);
    }
  };

  const handleReset = () => {
    soundFx.playClick();
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const score = calculateScore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">화학 I 개념 확인 퀴즈</h2>
              <p className="text-xs text-slate-400 font-mono">원자량, 아보가드로수, 1몰의 개념을 점검해보세요</p>
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

        {/* Modal Body: Quiz Questions */}
        <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin">
          {isSubmitted && (
            <div className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
              score === CHEMISTRY_QUIZ.length
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-indigo-950/60 border-indigo-500/40 text-indigo-200'
            }`}>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-400" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 font-mono">QUIZ RESULT</div>
                  <div className="text-base sm:text-lg font-bold text-white">
                    총 {CHEMISTRY_QUIZ.length}문제 중 <span className="text-indigo-400 font-mono">{score}개</span> 정답!
                  </div>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 다시 풀기
              </button>
            </div>
          )}

          {CHEMISTRY_QUIZ.map((q, idx) => {
            const isUserAnswered = selectedAnswers[q.id] !== undefined;
            const isCorrect = selectedAnswers[q.id] === q.correctIndex;
            return (
              <div
                key={q.id}
                className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                    Q{idx + 1}
                  </span>
                  <h3 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                    {q.question}
                  </h3>
                </div>

                <div className="space-y-2 mt-3">
                  {q.options.map((opt, optIdx) => {
                    const isOptionSelected = selectedAnswers[q.id] === optIdx;
                    let optionStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700';

                    if (isOptionSelected && !isSubmitted) {
                      optionStyle = 'bg-indigo-950/80 border-indigo-500 text-white ring-2 ring-indigo-500/30';
                    } else if (isSubmitted) {
                      if (optIdx === q.correctIndex) {
                        optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30 font-semibold';
                      } else if (isOptionSelected && !isCorrect) {
                        optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-300 line-through';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between shadow-sm ${optionStyle}`}
                      >
                        <span>{opt}</span>
                        {isSubmitted && optIdx === q.correctIndex && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                        {isSubmitted && isOptionSelected && !isCorrect && (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl">
                    <strong className="text-indigo-400 block mb-1">📖 해설:</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            {Object.keys(selectedAnswers).length} / {CHEMISTRY_QUIZ.length} 문항 선택됨
          </span>
          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition"
              >
                정답 확인하기
              </button>
            ) : (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm transition border border-slate-700"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
