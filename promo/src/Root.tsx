import React from 'react';
import { Composition } from 'remotion';
import { Reel } from './Reel';
import { Clip, CLIPS, clipLength } from './Clips';
import { Intro, INTRO_LEN } from './Intro';
import { Motion, MOTION_IDS, motionLength } from './Motion';
import { Reel2, REEL_IDS, reelLength } from './Reels2';
import { ReelPhoto, REEL_PHOTO_LEN } from './reel/ReelPhoto';
import { DailyReel, dailyLength, DAILY_COUNT } from './reel/daily/DailyReel';

export const Root: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={945} fps={30} width={1080} height={1920} />
    {CLIPS.map((c) => (
      <Composition key={c.id} id={c.id} component={Clip} defaultProps={{ id: c.id }} durationInFrames={clipLength(c)} fps={30} width={1080} height={1920} />
    ))}
    {REEL_IDS.map((id) => (
      <Composition key={id} id={`Reel${id}`} component={Reel2} defaultProps={{ id }} durationInFrames={reelLength(id)} fps={30} width={1080} height={1920} />
    ))}
    {MOTION_IDS.map((id) => (
      <Composition key={id} id={`Motion${id}`} component={Motion} defaultProps={{ id }} durationInFrames={motionLength(id)} fps={30} width={id === 'Trailer' ? 1920 : 1080} height={id === 'Trailer' ? 1080 : 1920} />
    ))}
    <Composition id="MotionTrailerVertical" component={Motion} defaultProps={{ id: 'Trailer' }} durationInFrames={motionLength('Trailer')} fps={30} width={1080} height={1920} />
    <Composition id="ReelPhoto" component={ReelPhoto} durationInFrames={REEL_PHOTO_LEN} fps={30} width={1080} height={1920} />
      {Array.from({ length: DAILY_COUNT }, (_, i) => (
        <Composition key={i} id={`Daily${String(i + 1).padStart(2, '0')}`} component={DailyReel} defaultProps={{ n: i + 1 }} durationInFrames={dailyLength(i + 1)} fps={30} width={1080} height={1920} />
      ))}
    <Composition id="IntroVertical" component={Intro} durationInFrames={INTRO_LEN} fps={30} width={1080} height={1920} />
    <Composition id="IntroSquare" component={Intro} durationInFrames={INTRO_LEN} fps={30} width={1080} height={1080} />
    <Composition id="IntroWide" component={Intro} durationInFrames={INTRO_LEN} fps={30} width={1920} height={1080} />
  </>
);
