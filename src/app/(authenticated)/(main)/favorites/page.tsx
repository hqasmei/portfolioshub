'use client';

import React from 'react';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import PortfolioCard from '@/components/portfolio-card';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function FavoritesPage() {
  const getAllFavorites = useQuery(api.favorites.getFavoritesForUser);

  return (
    <MaxWidthWrapper className="pt-4 md:pt-0">
      <span className="text-3xl md:text-4xl font-bold md:hidden">
        Favorites
      </span>

      {getAllFavorites && getAllFavorites.length === 0 ? (
        <div className="flex flex-col items-center gap-4 mt-6 border rounded-md h-56 justify-center text-center px-4">
          <h1 className="text-xl md:text-2xl font-bold">
            You have no favorites yet!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground text-balance">
            Start by adding some favorites to your dashboard!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-6 pb-10">
          {getAllFavorites?.map((item) => {
            return (
              <PortfolioCard
                key={item._id}
                item={item.portfolioId}
                isFavoriteCard={true}
                favoriteId={item._id}
              />
            );
          })}
        </div>
      )}
    </MaxWidthWrapper>
  );
}
