import React from 'react';
import { Composition } from 'remotion';
import { Reel } from './Reel';
import { Clip, CLIPS, clipLength } from './Clips';
import { Intro, INTRO_LEN } from './Intro';
import { Reel2, REEL_IDS, reelLength } from './Reels2';

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={945} fps={30} width={1080} height={1920} />
    {CLIPS.map((c) => (
      <Composition key={c.id} id={c.id} component={Clip} defaultProps={{ id: c.id }} durationInFrames={clipLength(c)} fps={30} width={1080} height={1920} />
    ))}
    {REEL_IDS.map((id) => (
      <Composition key={id} id={`Reel${id}`} component={Reel2} defaultProps={{ id }} durationInFrames={reelLength(id)} fps={30} width={1080} height={1920} />
    ))}
    <Composition id="IntroVertical" component={Intro} durationInFrames={INTRO_LEN} fps={30} width={1080} height={1920} />
    <Composition id="IntroSquare" component={Intro} durationInFrames={INTRO_LEN} fps={30} width={1080} height={1080} />
    <Composition id="IntroWide" component={Intro} durationInFrames={INTRO_LEN} fps={30} width={1920} height={1080} />
  </>
);
