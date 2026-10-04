import React from 'react';
import { ProcessSim } from './ProcessSim';
import { SIMS, SimId } from './registry';
import type { Lang } from './kit';

/** Entry point for lazy loading: the registry with every engine lives in this chunk */
const SimById: React.FC<{ lang: Lang; id: SimId; mode?: string }> = ({ lang, id, mode }) => <ProcessSim lang={lang} sim={SIMS[id]} mode={mode} />;

export default SimById;
