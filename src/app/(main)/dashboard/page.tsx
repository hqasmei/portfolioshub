'use client';

import React from 'react';

import MainContent from '@/components/main-content'; 
import MaxWidthWrapper from '@/components/max-width-wrapper';

export default function BrowsePage() {
  return (
    <MaxWidthWrapper>
      <span className="text-4xl font-bold">Dashboard</span>
      <div className="py-6">
        <MainContent />
      </div>
    </MaxWidthWrapper>
  );
}
