import React from 'react';
import { VectaMotionPlayer } from './VectaMotionPlayer';

export const HeroMotionGraphics: React.FC = () => {
  return <VectaMotionPlayer autoPlay={true} initialMuted={true} showChapters={true} />;
};

export default HeroMotionGraphics;
