import React from 'react';

import GithubStars from '@/components/github-stars';
import { Spotlight } from '@/components/spotlight';

import HeroText from './hero-text';

export default async function Hero() {
  return (
    <div className="flex flex-col items-center justify-center text-center pt-16">
      <div className="w-full flex flex-col gap-6 mb-8">
        <Spotlight
          className="-top-40 left-0 md:left-[300px] md:-top-20"
          fill="white"
        />
        <GithubStars />
        <HeroText />
      </div>
    </div>
  );
}
