'use client';

import React from 'react';

import SearchBox from '@/components/search-box';
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
import { ArrowDownAZ, Heart,  Sparkles } from 'lucide-react';

import FilterButton from './filter-button';

export default function FilterAndSortBar({
  searchValue,
  selectedSort,
  selectedFilter,
  setSearchValue,
  setSelectedSort,
  setSelectedFilter,
}: {
  searchValue: string;
  selectedSort: string;
  selectedFilter: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setSelectedSort: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFilter: React.Dispatch<React.SetStateAction<string>>;
}) {
  const getUniqueTitles = useQuery(api.portfolios.getUniqueTitles);

  if (!getUniqueTitles || getUniqueTitles.length === 0) return null;

  const uniqueTags = ['All', ...getUniqueTitles];

  return (
    <div className="flex flex-col gap-4 items-start md:flex-row md:justify-between md:items-center pb-4">
      {/* Filter */}
      <div
        className="relative overflow-x-auto w-full justify-start flex pr-8"
        style={{
          maskImage: 'linear-gradient(to left, transparent 0%, black 20%)',
        }}
      >
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
        <SearchBox searchValue={searchValue} setSearchValue={setSearchValue} />
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
  );
}
