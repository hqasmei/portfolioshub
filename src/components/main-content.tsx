'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useSession } from '@/lib/client-auth';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { SignInButton } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { ArrowDownAZ, Heart, Loader2, Sparkles } from 'lucide-react';

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

function PortfolioCard({
  item,
  favorites,
}: {
  item: Doc<'portfolios'>;
  favorites: Map<string, string>;
}) {
  const session = useSession();
  const portfolioId = item._id as Id<'portfolios'>;
  const imageUrl = getImageUrl(item.image);
  const isFavorited = favorites.has(portfolioId);
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const incrementPortfolioFavoriteCount = useMutation(
    api.portfolios.incrementPortfolioFavoriteCount,
  );
  const decrementPortfolioFavoriteCount = useMutation(
    api.portfolios.decrementPortfolioFavoriteCount,
  );

  const handleFavoriteClick = async (portfolioId: Id<'portfolios'>) => {
    if (favorites.has(portfolioId)) {
      const favoriteId = favorites.get(portfolioId);
      await removeFavorite({ favoriteId: favoriteId as Id<'favorites'> });
      await decrementPortfolioFavoriteCount({
        portfolioId: portfolioId as Id<'portfolios'>,
      });
    } else {
      await addFavorite({ portfolioId: portfolioId as Id<'portfolios'> });
      await incrementPortfolioFavoriteCount({
        portfolioId: portfolioId as Id<'portfolios'>,
      });
    }
  };

  return (
    <Card className="w-full rounded-md border border-border shadow-sm relative">
      <div className="relative">
        <Link href={item.link} target="_blank">
          <div className="px-3 pt-3">
            <div className="overflow-hidden rounded-md ">
              <Image
                src={imageUrl}
                alt={item.name}
                width={400}
                height={200}
                priority
                className="object-cover h-56 object-top w-full hover:scale-105 transition-all duration-300 rounded-md"
              />
            </div>
          </div>
          <div className="px-3 py-3">
            <h3 className="text-xl font-bold">{item.name}</h3>

            {item.tags && !item.tags.includes('') && (
              <div className="flex gap-2 pt-2">
                {item.tags.map((tag, idx) => (
                  <Badge variant="secondary" key={idx}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-row items-center absolute bottom-2 right-2">
          {session.isLoggedIn ? (
            <div className="flex items-center gap-1 group">
              <Button
                onClick={() => handleFavoriteClick(item._id)}
                className="px-1.5 py-0 h-8"
                variant="ghost"
              >
                <Heart
                  size={18}
                  className={cn(
                    'stroke-muted-foreground group-hover:stroke-rose-500  duration-200',
                    isFavorited && 'fill-rose-500 stroke-rose-500',
                  )}
                />
              </Button>
              <span
                className={cn(
                  'text-muted-foreground group-hover:text-rose-500 duration-200',
                  isFavorited && 'text-rose-500',
                )}
              >
                {item.favoritesCount === undefined ? (
                  <>0</>
                ) : (
                  <>{item.favoritesCount}</>
                )}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 group">
              <Button variant="ghost" className="px-1.5 py-0 h-8">
                <SignInButton mode="modal">
                  <Heart
                    size={18}
                    className={cn(
                      'stroke-muted-foreground group-hover:stroke-rose-500  duration-200',
                      isFavorited && 'fill-rose-500 stroke-rose-500',
                    )}
                  />
                </SignInButton>
              </Button>
              <span
                className={cn(
                  'text-muted-foreground group-hover:text-rose-500 duration-200',
                  isFavorited && 'text-rose-500',
                )}
              >
                {item.favoritesCount === undefined ? (
                  <>0</>
                ) : (
                  <>{item.favoritesCount}</>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function MainContent({
  portfolios,
  filterButtonsAlign = 'center',
  loadMore,
  status,
}: {
  filterButtonsAlign?: 'center' | 'left';
  portfolios: Doc<'portfolios'>[];
  loadMore?: (numItems: number) => void;
  status?: 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted';
}) {
  const [selectedTag, setSelectedTag] = useState<string | null>('All');
  const [selectedSort, setSelectedSort] = useState<string>('recentlyAdded');
  const getUniqueTags = useQuery(api.portfolios.getUniqueTags);
  const uniqueTags = ['All', ...(getUniqueTags ?? [])];

  const getAllFavorites = useQuery(api.favorites.getFavoritesForUser);

  const [favorites, setFavorites] = useState<Map<string, string>>(new Map());

  const sortPortfolios = (
    portfolios: Doc<'portfolios'>[],
    sortOption: string,
  ) => {
    switch (sortOption) {
      case 'recentlyAdded':
        return portfolios.sort(
          (a, b) =>
            new Date(a._creationTime).getTime() -
            new Date(b._creationTime).getTime(),
        );
      case 'mostPopular':
        return portfolios.sort((a, b) => {
          const aCount = a.favoritesCount ?? 0;
          const bCount = b.favoritesCount ?? 0;
          return bCount - aCount;
        });
      case 'alphabetical':
        return portfolios.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return portfolios.sort(
          (a, b) =>
            new Date(a._creationTime).getTime() -
            new Date(b._creationTime).getTime(),
        );
    }
  };

  const filteredData =
    selectedTag === 'All' || selectedTag === null || !portfolios
      ? portfolios
      : portfolios.filter(
          (portfolio) =>
            portfolio.tags &&
            portfolio.tags.map((tag) => `${tag}s`).includes(selectedTag),
        );

  const sortedData = sortPortfolios(filteredData, selectedSort);

  useEffect(() => {
    if (getAllFavorites) {
      const favoriteMap = new Map(
        getAllFavorites.map((fav) => [fav.portfolioId, fav._id]),
      );
      setFavorites(favoriteMap);
    }
  }, [getAllFavorites]);

  const triggerRef = useCallback(
    (node: any) => {
      if (!node) return;

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && status === 'CanLoadMore') {
            loadMore?.(3);
            observer.disconnect();
          }
        });
      });

      observer.observe(node);
    },
    [loadMore, status],
  );

  return (
    <div className="flex flex-col gap-2 pb-16 md:pb-4">
      <div className="flex flex-col gap-4 items-start md:flex-row md:justify-between md:items-center pb-4">
        <div className="relative overflow-x-auto w-full justify-start flex">
          <div
            className={cn(
              filterButtonsAlign === 'center' && 'sm:justify-center',
              'flex gap-2  items-center',
            )}
          >
            {uniqueTags.map((tag) => {
              return (
                <FilterButton
                  key={tag}
                  label={tag}
                  isSelected={selectedTag === tag}
                  onClick={() => {
                    setSelectedTag(tag);
                  }}
                />
              );
            })}
          </div>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {sortedData?.map((item, idx) => {
          return <PortfolioCard key={idx} item={item} favorites={favorites} />;
        })}
      </div>
      {status === 'CanLoadMore' && (
        <div ref={triggerRef} className="h-1 w-1 bg-red-400"></div>
      )}
      {status === 'LoadingMore' && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
}
