import React from 'react';
import { Composition } from 'remotion';
import { Reel } from './Reel';
import { Clip, CLIPS, clipLength } from './Clips';

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={945} fps={30} width={1080} height={1920} />
    {CLIPS.map((c) => (
      <Composition key={c.id} id={c.id} component={Clip} defaultProps={{ id: c.id }} durationInFrames={clipLength(c)} fps={30} width={1080} height={1920} />
    ))}
  </>
);
