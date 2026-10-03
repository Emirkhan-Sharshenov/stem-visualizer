import React from 'react';
import { Milestone } from '../types/stem';
import { Award, X, Check, Lock, Sparkles } from 'lucide-react';

interface MilestonesModalProps {
  milestones: Milestone[];
  lang: 'ru' | 'en';
  onClose: () => void;
}

export const MilestonesModal: React.FC<MilestonesModalProps> = ({ milestones, lang, onClose }) => {
  const unlockedCount = milestones.filter((m) => m.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{lang === 'ru' ? 'Пространственные открытия' : 'Spatial Discoveries & Milestones'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {unlockedCount} / {milestones.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ru'
                ? 'Формирование ментальных моделей и пространственной интуиции'
                : 'Building tactile mental models and spatial intuition'}
            </p>
          </div>
        </div>

        {/* Milestones Grid */}
        <div className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                m.unlocked
                  ? 'bg-slate-950/80 border-slate-700/80 text-slate-100'
                  : 'bg-slate-950/30 border-slate-800/40 text-slate-500 opacity-60'
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  m.unlocked ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-600'
                }`}
              >
                {m.unlocked ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold ${m.unlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                    {m.title[lang]}
                  </h4>
                  {m.unlocked && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      {lang === 'ru' ? 'ОТКРЫТО' : 'DISCOVERED'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {m.description[lang]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
