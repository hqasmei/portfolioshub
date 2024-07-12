'use client';

import React, { useState } from 'react';

import MainContent from '@/components/main-content';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import { SendEventOnLoad } from '@/components/send-event-on-load';

import FilterAndSortBar from '../../components/filter-and-sort-bar';
import Hero from './_components/hero';

export default function Home() {
  const [selectedSort, setSelectedSort] = useState<string>('recentlyAdded');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchValue, setSearchValue] = useState('');

  return (
    <>
      <div className="fixed left-0 top-0 -z-10 h-full w-full">
        <div
          className="absolute top-0 z-[-2] h-screen w-screen 
  bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] 
  dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(0,0,0,0))]
  light:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.3),rgba(240,240,240,0))]"
        ></div>
      </div>
      <SendEventOnLoad eventKey="User hit home page" />
      <MaxWidthWrapper>
        <Hero />
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
      </MaxWidthWrapper>
    </>
  );
}
