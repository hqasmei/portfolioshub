'use client';

import React, { useState } from 'react';

import FilterButton from '@/components/filter-button';
import MainContent from '@/components/main-content';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import SearchBox from '@/components/search-box';
import { SendEventOnLoad } from '@/components/send-event-on-load';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { ArrowDownAZ, Heart, Search, Sparkles } from 'lucide-react';

import Hero from './_components/hero';

export default function Home() {
  const [selectedSort, setSelectedSort] = useState<string>('recentlyAdded');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const getUniqueTags = useQuery(api.portfolios.getUniqueTags);
  const uniqueTags = ['All', ...(getUniqueTags ?? [])];
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
          <div className="flex flex-col gap-4 items-start md:flex-row md:justify-between md:items-center pb-4">
            {/* Filter */}
            <div className="relative overflow-x-auto w-full justify-start flex">
              {uniqueTags.map((tag) => {
                return (
                  <FilterButton
                    key={tag}
                    label={tag}
                    isSelected={selectedFilter === tag}
                    onClick={() => {
                      setSelectedFilter(tag);
                    }}
                  />
                );
              })}
            </div>
            {/* Select  */}
            <div className="flex w-full md:w-fit justify-end items-center gap-2">
              <SearchBox
                searchValue={searchValue}
                setSearchValue={setSearchValue}
              />
              <Select
                defaultValue="recentlyAdded"
                value={selectedSort}
                onValueChange={setSelectedSort}
              >
                <SelectTrigger className="md:w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectGroup>
                    <SelectLabel>Sort by</SelectLabel>
                    <SelectItem value="recentlyAdded">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} />
                        <span>Recently Added</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="mostPopular">
                      <div className="flex items-center gap-2">
                        <Heart size={16} />
                        <span>Most Popular</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="alphabetical">
                      <div className="flex items-center gap-2">
                        <ArrowDownAZ size={16} />
                        <span>Alphabetical</span>
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
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
