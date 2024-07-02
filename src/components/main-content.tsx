'use client';

import React, { useCallback, useEffect, useState } from 'react';

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
import { Doc } from '@/convex/_generated/dataModel';
import { usePaginatedQuery, useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { ArrowDownAZ, Heart, Loader2, Sparkles } from 'lucide-react';

import MainContentSkeleton from './main-content-skeleton';
import PortfolioCard from './portfolio-card';
import { Button } from './ui/button';

function FilterButton({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`${
        isSelected
          ? 'text-foreground'
          : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
      } relative rounded-md px-2 py-1 text-sm font-medium transition-colors`}
    >
      <span className="relative z-10">{label}</span>
      {isSelected && (
        <motion.span
          layoutId="tab"
          transition={{ type: 'spring', duration: 0.4 }}
          className="absolute inset-0 z-0 rounded-md bg-muted"
        ></motion.span>
      )}
    </button>
  );
}

export default function MainContent() {
  const [selectedSort, setSelectedSort] = useState<string>('recentlyAdded');
  const [selectedFilter, setSelectedFilter] = useState<string | null>('All');
  const [favorites, setFavorites] = useState<Map<string, string>>(new Map());
  const [visibleCount, setVisibleCount] = useState(6);
  const portfolios = useQuery(api.portfolios.getPortfolios, {
    sortType: selectedSort || 'recentlyAdded',
  });

  const isLoading = portfolios === undefined || portfolios.length === 0;

  const getFavoritesForUser = useQuery(api.favorites.getFavoritesForUser);
  const getUniqueTags = useQuery(api.portfolios.getUniqueTags);
  const uniqueTags = ['All', ...(getUniqueTags ?? [])];
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };
  useEffect(() => {
    if (getFavoritesForUser) {
      const favoriteMap = new Map(
        getFavoritesForUser.map((fav) => [fav.portfolioId, fav._id]),
      );
      setFavorites(favoriteMap);
    }
  }, [getFavoritesForUser]);

  const filteredData =
    selectedFilter === 'All' || selectedFilter === null || !portfolios
      ? portfolios
      : portfolios.filter(
          (portfolio) =>
            portfolio.tags &&
            portfolio.tags.map((tag) => `${tag}s`).includes(selectedFilter),
        );

  if (isLoading) {
    return <MainContentSkeleton />;
  }

  return (
    <div className="flex flex-col gap-2 pb-4 md:pb-4">
      <div className="flex flex-col gap-4 items-start md:flex-row md:justify-between md:items-center pb-4">
        {/* Filter */}
        <div className="relative overflow-x-auto w-full justify-start flex">
          <div className="">
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
        </div>
        {/* Select  */}
        <div className="flex w-full md:w-fit justify-end">
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

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredData?.slice(0, visibleCount).map((item, idx) => {
          return <PortfolioCard key={idx} item={item} favorites={favorites} />;
        })}
      </div>

      {filteredData && visibleCount < filteredData.length && (
        <div className='flex justify-center pt-4'>
          <Button onClick={handleLoadMore}>Load More</Button>
        </div>
      )}
    </div>
  );
}
