'use client';

import React from 'react';

import MainContent from '@/components/main-content';
import MainContentSkeleton from '@/components/main-content-skeleton';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import { SendEventOnLoad } from '@/components/send-event-on-load';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

import Hero from './_components/hero';

export default function Home() {
  const portfolios = useQuery(api.portfolios.getPortfolios);
  const isLoading = portfolios === undefined;

  if (isLoading) {
    return (
      <MaxWidthWrapper>
        <Hero />
        <MainContentSkeleton />
      </MaxWidthWrapper>
    );
  }

  return (
    <>
      <SendEventOnLoad eventKey="User hit home page" />
      <MaxWidthWrapper>
        <Hero />
        <MainContent portfolios={portfolios} />
      </MaxWidthWrapper>
    </>
  );
}
