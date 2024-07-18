'use client';

import { useEffect, useState } from 'react';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<
    Map<Id<'portfolios'>, Id<'favorites'>>
  >(new Map());
  const getFavoritesForUser = useQuery(api.favorites.getFavoritesForUser);

  useEffect(() => {
    if (getFavoritesForUser) {
      const favoriteMap = new Map(
        getFavoritesForUser.map((fav) => [fav.portfolioId, fav._id]),
      );
      setFavorites(favoriteMap);
    }
  }, [getFavoritesForUser]);

  return favorites;
}
