import React, { useState } from 'react';
import { PREDICTION_CHALLENGES } from '../data/concepts';
import { Sparkles, X, Check, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PredictFirstModalProps {
  challengeId: string;
  lang: 'ru' | 'en';
  onClose: () => void;
  onApplyRevealedParams: (params: Record<string, any>) => void;
  onUnlockMilestone: (id: string) => void;
}

export const PredictFirstModal: React.FC<PredictFirstModalProps> = ({
  challengeId,
  lang,
  onClose,
  onApplyRevealedParams,
  onUnlockMilestone
}) => {
  const challenge = PREDICTION_CHALLENGES.find((c) => c.id === challengeId) || PREDICTION_CHALLENGES[0];
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const selectedOpt = challenge.options.find((o) => o.id === selectedOptionId);

  const handleReveal = () => {
    if (!selectedOpt) return;
    setIsRevealed(true);
    if (selectedOpt.isCorrect) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onUnlockMilestone('predicted_correctly');
    }
  };

  const handleApplyAndClose = () => {
    onApplyRevealedParams(challenge.revealedModelParams);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(17,17,17,0.45)] animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-bold">
              {lang === 'ru' ? 'РЕЖИМ: СНАЧАЛА ПРЕДСТАВЬ' : 'MODE: PREDICT FIRST'}
            </span>
            <h3 className="text-base font-bold text-slate-100">
              {lang === 'ru' ? 'Тренировка пространственного мышления' : 'Spatial Intuition Challenge'}
            </h3>
          </div>
        </div>

        {/* Question */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-sm font-medium leading-relaxed text-slate-200">
          {challenge.question[lang]}
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-2.5">
          {challenge.options.map((opt) => (
            <button
              key={opt.id}
              disabled={isRevealed}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`p-3.5 rounded-2xl text-xs text-left font-medium transition-all border cursor-pointer flex items-center justify-between ${
                selectedOptionId === opt.id
                  ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold ring-2 ring-indigo-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <span>{opt.text[lang]}</span>
              {selectedOptionId === opt.id && <span className="w-2 h-2 rounded-full bg-indigo-400"></span>}
            </button>
          ))}
        </div>

        {/* Action Button */}
        {!isRevealed ? (
          <button
            onClick={handleReveal}
            disabled={!selectedOptionId}
            className="w-full py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'ru' ? 'РАСКРЫТЬ МОДЕЛЬ (REVEAL)' : 'REVEAL SCIENTIFIC MODEL'}</span>
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Feedback result */}
            <div className={`p-4 rounded-2xl text-xs flex flex-col gap-2 border ${
              selectedOpt?.isCorrect
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {selectedOpt?.isCorrect ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>{lang === 'ru' ? 'Отлично! Твоё пространственное представление совпало с физикой!' : 'Spot on! Your spatial intuition matches physics!'}</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-5 h-5 text-rose-400" />
                    <span>{lang === 'ru' ? 'Не совсем так! Взгляни на физическое объяснение:' : 'Not quite! Here is the physical reasoning:'}</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed text-xs">
                {selectedOpt?.explanation[lang]}
              </p>
            </div>

            <button
              onClick={handleApplyAndClose}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              <span>{lang === 'ru' ? 'ПРИМЕНИТЬ К 3D СЦЕНЕ' : 'APPLY TO 3D SCENE'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
