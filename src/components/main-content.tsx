'use client';

import React, { useEffect, useState } from 'react';



import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';



import MainContentSkeleton from './main-content-skeleton';
import PortfolioCard from './portfolio-card';
import { Button } from './ui/button';


export default function MainContent({
  selectedSort,
  selectedFilter,
  searchValue,
}: {
  selectedSort: string;
  selectedFilter: string | null;
  searchValue: string;
}) {
  const [favorites, setFavorites] = useState<Map<string, string>>(new Map());

  const [visibleCount, setVisibleCount] = useState(6);
  const portfolios = useQuery(api.portfolios.getPortfolios, {
    sortType: selectedSort || 'recentlyAdded',
  });

  const isLoading = portfolios === undefined || portfolios.length === 0;

  const getFavoritesForUser = useQuery(api.favorites.getFavoritesForUser);

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
      ? portfolios &&
        portfolios.filter((portfolio) =>
          portfolio.name.toLowerCase().includes(searchValue.toLowerCase()),
        )
      : portfolios
          .filter(
            (portfolio) =>
              portfolio.tags &&
              portfolio.tags.map((tag) => `${tag}s`).includes(selectedFilter),
          )
          .filter((portfolio) =>
            portfolio.name.toLowerCase().includes(searchValue.toLowerCase()),
          );
 
  if (isLoading) {
    return <MainContentSkeleton />;
  }

  return (
    <div className="flex flex-col gap-2 pb-4 md:pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredData?.slice(0, visibleCount).map((item, idx) => {
          return <PortfolioCard key={idx} item={item} favorites={favorites} />;
        })}
      </div>

      {filteredData && visibleCount < filteredData.length && (
        <div className="flex justify-center pt-4">
          <Button onClick={handleLoadMore}>Load More</Button>
        </div>
      )}
    </div>
  );
}