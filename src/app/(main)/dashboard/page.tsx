'use client';

import React, { useState } from 'react';

import FilterAndSortBar from '@/components/filter-and-sort-bar';
import MainContent from '@/components/main-content';
import MaxWidthWrapper from '@/components/max-width-wrapper';

export default function DashboardPage() {
  const [selectedSort, setSelectedSort] = useState<string>('recentlyAdded');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchValue, setSearchValue] = useState('');

  return (
    <MaxWidthWrapper>
      <span className="text-2xl md:text-4xl font-bold">Dashboard</span>
      <div className="pb-6 relative">
        <FilterAndSortBar
          searchValue={searchValue}
          selectedSort={selectedSort}
          selectedFilter={selectedFilter}
          setSearchValue={setSearchValue}
          setSelectedSort={setSelectedSort}
          setSelectedFilter={setSelectedFilter}
        />
        <MainContent
          selectedSort={selectedSort}
          selectedFilter={selectedFilter}
          searchValue={searchValue}
        />
      </div>
    </MaxWidthWrapper>
  );
}
