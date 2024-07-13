'use client';

import React from 'react';

import Counter from '@/components/counter';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function HeroText() {
  const portfolios = useQuery(api.portfolios.getAllPortfolios);
  const numberOfPortfolios = portfolios?.length;
  return (
    <>
      <div className="flex flex-col items-center gap-y-6 sm:gap-y-7">
        <h1 className="text-pretty text-neutral-900 dark:text-white lg:text-6xl lg:-tracking-4 lg:leading-[4rem] lg:font-extrabold text-4xl md:text-5xl -tracking-3 font-bold max-w-3xl text-center">
          Discover portfolios to inspire your creativity
        </h1>
      </div>
      <p className="text-neutral-700 dark:text-neutral-300 mx-auto block text-balance max-w-sm text-center text-base md:max-w-3xl md:text-lg xl:text-xl">
        Browse our curated collection of{' '}
        {numberOfPortfolios ? (
          <span className="text-foreground font-semibold">
            <Counter
              value={numberOfPortfolios}
              className="text-foreground font-semibold"
            />
            +
          </span>
        ) : (
          <span className="text-foreground font-semibold">
            <Counter value={0} className="text-foreground font-semibold" />+
          </span>
        )}
        exceptional designs and showcase your own work.
      </p>
    </>
  );
}
