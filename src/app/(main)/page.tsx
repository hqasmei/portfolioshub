'use client';

import React from 'react';

import MainContent from '@/components/main-content';
import MainContentSkeleton from '@/components/main-content-skeleton';
import { SendEventOnLoad } from '@/components/send-event-on-load';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

import Hero from './_components/hero';

export default function Home() {
  const portfolios = useQuery(api.portfolios.getPortfolios);
  const isLoading = portfolios === undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col  gap-8  pb-20 sm:container mx-auto  px-4 w-full">
        <Hero />
        <MainContentSkeleton />
      </div>
    );
  }

  return (
    <>
      <SendEventOnLoad eventKey="User hit home page" />
      <div className="flex flex-col gap-8 sm:container mx-auto  px-4 w-full">
        <Hero />
        <MainContent portfolios={portfolios} />
      </div>
    </>
  );
}
