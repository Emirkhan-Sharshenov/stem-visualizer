import React, { useState } from 'react';
import { KNOWLEDGE_GRAPH_NODES, KNOWLEDGE_GRAPH_LINKS } from '../data/concepts';
import { VisualMode } from '../types/stem';
import { Share2, ArrowRight, Sparkles, Compass } from 'lucide-react';

interface KnowledgeMapProps {
  lang: 'ru' | 'en';
  onNavigateToConcept: (viewMode: VisualMode) => void;
}

export const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ lang, onNavigateToConcept }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('orbitals');

  const selectedNode = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === selectedNodeId);

  const getTargetViewMode = (nodeId: string): VisualMode => {
    if (nodeId === 'quantum_n' || nodeId === 'orbitals' || nodeId === 'nodes') return 'orbitals';
    if (nodeId === 'hybridization' || nodeId === 'bonds' || nodeId === 'molecules' || nodeId === 'dipole') return 'deconstruction';
    if (nodeId === 'cell' || nodeId === 'mitochondria' || nodeId === 'atp') return 'biology_cell';
    return 'math_divergence';
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Interactive Constellation SVG */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {lang === 'ru' ? 'Карта знаний: Связи между уровнями' : 'Knowledge Map: Cross-Scale Connections'}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'От квантовой орбитали до клеточной турбины АТФ' : 'From quantum orbital to cellular ATP nanomotor'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Chem</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Phys</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Bio</span>
          </div>
        </div>

        {/* SVG Graph View */}
        <div className="relative w-full h-[450px] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 900 440">
            {/* Draw links */}
            {KNOWLEDGE_GRAPH_LINKS.map((link, idx) => {
              const src = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === link.source)!;
              const tgt = KNOWLEDGE_GRAPH_NODES.find((n) => n.id === link.target)!;
              const isHighlighted = selectedNodeId === link.source || selectedNodeId === link.target;
              return (
                <line
                  key={idx}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isHighlighted ? '#38bdf8' : '#34363C'}
                  strokeWidth={isHighlighted ? 2.5 : 1.2}
                  strokeDasharray={isHighlighted ? 'none' : '4 4'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Draw nodes */}
            {KNOWLEDGE_GRAPH_NODES.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const nodeColor =
                node.category === 'chemistry' ? '#06b6d4' :
                node.category === 'physics' ? '#f59e0b' :
                node.category === 'biology' ? '#10b981' : '#8b5cf6';

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedNodeId(node.id)}
                >
                  {/* Outer glow ring */}
                  {isSelected && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={24}
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth={2}
                      opacity={0.5}
                      className="animate-ping"
                    />
                  )}
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 18 : 14}
                    fill={nodeColor}
                    fillOpacity={isSelected ? 0.95 : 0.4}
                    stroke={nodeColor}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className="transition-all duration-200"
                  />
                  {/* Node label */}
                  <text
                    x={node.x}
                    y={node.y + 32}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize={11}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {node.label[lang]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Selected Node Inspector Side Panel */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-100 text-sm">
              {lang === 'ru' ? 'Инспектор концепции' : 'Concept Inspector'}
            </h3>
          </div>

          {selectedNode && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  {selectedNode.category}
                </span>
                <h4 className="text-base font-bold text-slate-100">{selectedNode.label[lang]}</h4>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {selectedNode.id === 'quantum_n' && (lang === 'ru' ? 'Квантовые числа задают энергетический уровень (n), форму облака (ℓ) и пространственную ориентацию (m).' : 'Quantum numbers define energy level, orbital shape, and spatial orientation.')}
                {selectedNode.id === 'orbitals' && (lang === 'ru' ? 'Атомные орбитали — 3D области максимальной вероятности обнаружения электронов вокруг ядра.' : '3D volumetric regions of electron probability density around atomic nucleus.')}
                {selectedNode.id === 'nodes' && (lang === 'ru' ? 'Узловые поверхности, где волновая функция ψ = 0, а вероятность нахождения электрона строго нулевая.' : 'Surfaces where wavefunction crosses zero, creating nodal silence.')}
                {selectedNode.id === 'hybridization' && (lang === 'ru' ? 'Смешивание s и p орбиталей в эквивалентные гибридные sp³ лопасти для минимизации взаимного отталкивания.' : 'Mixing of s and p atomic orbitals into equivalent directional hybrid lobes.')}
                {selectedNode.id === 'bonds' && (lang === 'ru' ? 'Осевое перекрывание орбиталей образует прочные ковалентные σ-связи, удерживающие атомы вместе.' : 'Axial orbital overlap forming strong covalent sigma bonds.')}
                {selectedNode.id === 'molecules' && (lang === 'ru' ? 'Две неподелённые пары кислорода расталкивают связи H-O-H, сжимая молекулу воды до 104.5°.' : 'Two lone pairs compress the H-O-H bond angle down to 104.5°.')}
                {selectedNode.id === 'dipole' && (lang === 'ru' ? 'Полярность воды позволяет образовывать сеть водородных связей — основу жидкой среды жизни.' : 'Net dipole moment generates cohesive hydrogen bond networks.')}
                {selectedNode.id === 'cell' && (lang === 'ru' ? 'В водной цитоплазме клетки растворены ферменты и плавают специализированные органеллы.' : 'Aqueous cytoplasm where organelles and metabolic cascades reside.')}
                {selectedNode.id === 'mitochondria' && (lang === 'ru' ? 'Двумембранная органелла со складчатыми кристами, генерирующая протонный градиент.' : 'Double-membrane powerhouse harboring the electron transport chain.')}
                {selectedNode.id === 'atp' && (lang === 'ru' ? 'Вращающаяся нано-турбина, использующая ток протонов для сборки молекул АТФ.' : 'Rotary nanomotor utilizing proton flow to synthesize cellular fuel packets.')}
                {selectedNode.id === 'vectors' && (lang === 'ru' ? 'Математический аппарат полей и дивергенции для описания физических потоков и градиентов.' : 'Mathematical vector fields describing physical flows and divergences.')}
              </div>

              {/* Direct Jump Button */}
              <button
                onClick={() => onNavigateToConcept(getTargetViewMode(selectedNode.id))}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <span>{lang === 'ru' ? 'ОТКРЫТЬ 3D МОДЕЛЬ' : 'EXPLORE 3D MODEL'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
