'use client';

import React, { useState } from 'react';

import FilterAndSortBar from '@/components/filter-and-sort-bar';
import MainContent from '@/components/main-content';

export default function Content() {
  const [selectedSort, setSelectedSort] = useState<string>('recentlyAdded');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchValue, setSearchValue] = useState('');

  return (
    <div className="py-6 ">
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
  );
}
