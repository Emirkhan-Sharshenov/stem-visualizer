import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Lang } from '../i18n/landing';

const SOURCES: { name: string; what: { ru: string; en: string }; license: string; url: string }[] = [
  {
    name: 'BodyParts3D, © The Database Center for Life Science',
    what: { ru: 'Скелет, сердце, мозг и внутренние органы человека', en: 'Human skeleton, heart, brain and internal organs' },
    license: 'CC BY 4.0',
    url: 'https://lifesciencedb.jp/bp3d/',
  },
  {
    name: 'Barramundi Fish — Khronos glTF Sample Assets',
    what: { ru: '3D-модель рыбы', en: '3D fish model' },
    license: 'CC0',
    url: 'https://github.com/KhronosGroup/glTF-Sample-Assets',
  },
  {
    name: 'Fox: model PixelMannen; rig & animation tomkranis; glTF conversion AsoboStudio & scurest',
    what: { ru: 'Анимированная модель лисы', en: 'Animated fox model' },
    license: 'CC0 / CC BY 4.0',
    url: 'https://github.com/KhronosGroup/glTF-Sample-Assets',
  },
  {
    name: 'PubChem, National Library of Medicine',
    what: { ru: '3D-структуры молекул', en: '3D molecular structures' },
    license: 'Public domain',
    url: 'https://pubchem.ncbi.nlm.nih.gov',
  },
  {
    name: 'three.js, KaTeX, lucide',
    what: { ru: '3D-движок, формулы, иконки', en: '3D engine, formulas, icons' },
    license: 'MIT / ISC',
    url: 'https://threejs.org',
  },
];

/** Attribution for open models and data used in the labs */
export const Credits: React.FC<{ lang: Lang; onBack: () => void }> = ({ lang, onBack }) => (
  <div className="min-h-screen bg-paper text-ink">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink cursor-pointer">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        {lang === 'ru' ? 'Назад' : 'Back'}
      </button>
      <h1 className="mt-6 font-serif text-4xl">{lang === 'ru' ? 'О проекте и источники' : 'About and sources'}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-ink-2">
        {lang === 'ru'
          ? 'STEM Visualizer — бесплатный интерактивный учебник по физике, химии и биологии для 5–11 классов. Все симуляции можно ставить на паузу, перематывать и исследовать. Ниже — открытые модели и данные, которые мы используем, с благодарностью авторам.'
          : 'STEM Visualizer is a free interactive textbook of physics, chemistry and biology for grades 5–11. Every simulation can be paused, rewound and explored. Below are the open models and data we use, with thanks to their authors.'}
      </p>
      <ul className="mt-8 flex flex-col gap-3">
        {SOURCES.map((s) => (
          <li key={s.name} className="bg-surface border border-line rounded-xl p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-ink hover:text-accent">
                {s.name}
              </a>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-ink-2">{s.license}</span>
            </div>
            <p className="mt-1 text-sm text-ink-2">{s.what[lang]}</p>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
