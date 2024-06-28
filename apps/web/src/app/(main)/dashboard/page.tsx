'use client';

import React from 'react';

import MainContent from '@/components/main-content';
import MainContentSkeleton from '@/components/main-content-skeleton';
import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function BrowsePage() {
  const portfolios = useQuery(api.portfolios.getPortfolios);
  const isLoading = portfolios === undefined;

  if (isLoading) {
    return (
      <div className="w-full container mx-auto mt-6">
        <span className="text-4xl font-bold">Dashboard</span>
        <div className="mt-6">
          <MainContentSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full container mx-auto pt-6">
      <span className="text-4xl font-bold">Dashboard</span>
      <div className="mt-6">
        <MainContent portfolios={portfolios} filterButtonsAlign='left' />
      </div>
    </div>
  );
}
