'use client';

import React from 'react';

import MainContent from '@/components/main-content';
import MainContentSkeleton from '@/components/main-content-skeleton';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function BrowsePage() {
  const portfolios = useQuery(api.portfolios.getPortfolios);
  const isLoading = portfolios === undefined;

  if (isLoading) {
    return (
      <MaxWidthWrapper>
        <span className="text-4xl font-bold">Dashboard</span>
        <div className="mt-6">
          <MainContentSkeleton />
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <MaxWidthWrapper>
      <span className="text-4xl font-bold">Dashboard</span>
      <div className="py-6">
        <MainContent portfolios={portfolios} filterButtonsAlign="left" />
      </div>
    </MaxWidthWrapper>
  );
}
