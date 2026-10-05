import React from 'react';
import { ProcessSim } from './ProcessSim';
import { SIMS, SimId } from './registry';
import type { Lang } from './kit';

/** Entry point for lazy loading: the registry with every engine lives in this chunk */
const SimById: React.FC<{ lang: Lang; id: SimId; mode?: string; autoplay?: boolean; initialParams?: Record<string, number>; locked?: boolean }> = ({ id, ...rest }) => (
  <ProcessSim sim={SIMS[id]} {...rest} />
);

export default SimById;
