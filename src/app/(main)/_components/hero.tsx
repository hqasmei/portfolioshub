'use client';

import React from 'react';

import WordRotate from '@/components/word-rotate';

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-16">
      <div className="w-full flex flex-col gap-2">
        <div className="text-3xl sm:text-4xl flex flex-col sm:flex-row w-full justify-center font-semibold items-center gap-0 sm:gap-2">
          <span>Portfolios from</span>
          <WordRotate
            words={['Developers', 'Designers', 'YouTubers', 'Engineers']}
          />
        </div>
        <span className="text-muted-foreground text-lg">
          Find the best portfolios and showcase your work
        </span>
      </div>
    </div>
  );
}
