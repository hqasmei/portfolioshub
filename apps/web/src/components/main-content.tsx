'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/client-auth';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { SignInButton } from '@clerk/nextjs';
import { api } from '@packages/backend/convex/_generated/api';
import { Doc, Id } from '@packages/backend/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

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

function getUniqueTags(data: Doc<'portfolios'>[]) {
  const allTags = data.reduce<string[]>((acc, curr) => {
    if (curr.tags) {
      return [...acc, ...curr.tags];
    }
    return acc;
  }, []);

  const filteredTags = allTags.filter((tag) => tag.trim() !== '');
  const uniqueTags = Array.from(new Set(filteredTags));
  return uniqueTags.map((tag) => `${tag}s`); // Append "s" to each tag
}

export default function MainContent({
  portfolios,
  filterButtonsAlign = 'center',
}: {
  filterButtonsAlign?: 'center' | 'left';
  portfolios: Doc<'portfolios'>[];
}) {
  const session = useSession();
  const [selectedTag, setSelectedTag] = useState<string | null>('All');
  const uniqueTags = ['All', ...getUniqueTags(portfolios || [])];
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const getAllFavorites = useQuery(api.favorites.getFavoritesForUser);

  const [favorites, setFavorites] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (getAllFavorites) {
      const favoriteMap = new Map(
        getAllFavorites.map((fav) => [fav.portfolioId, fav._id]),
      );
      setFavorites(favoriteMap);
    }
  }, [getAllFavorites]);

  const filteredData =
    selectedTag === 'All' || selectedTag === null || !portfolios
      ? portfolios
      : portfolios.filter(
          (portfolio) =>
            portfolio.tags &&
            portfolio.tags.map((tag) => `${tag}s`).includes(selectedTag),
        );

  const handleFavoriteClick = async (portfolioId: Id<'portfolios'>) => {
    if (favorites.has(portfolioId)) {
      const favoriteId = favorites.get(portfolioId);
      await removeFavorite({ favoriteId: favoriteId as Id<'favorites'> });
      setFavorites((prev) => {
        const newFavorites = new Map(prev);
        newFavorites.delete(portfolioId);
        return newFavorites;
      });
    } else {
      await addFavorite({ portfolioId: portfolioId as Id<'portfolios'> });
      setFavorites((prev) => {
        const newFavorites = new Map(prev);
        // Assume the backend will eventually update this with the real ID
        newFavorites.set(portfolioId, 'temporary-id');
        return newFavorites;
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          filterButtonsAlign === 'center' && 'sm:justify-center',
          'flex gap-2 pb-4 items-center overflow-x-auto',
        )}
      >
        {uniqueTags.map((tag) => (
          <FilterButton
            key={tag}
            label={tag}
            isSelected={selectedTag === tag}
            onClick={() => setSelectedTag(tag)}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredData?.map((item, idx) => {
          const imageUrl = getImageUrl(item.image);
          const isFavorited = favorites.has(item._id);

          return (
            <Card
              key={idx}
              className="w-full rounded-md border border-border shadow-sm relative"
            >
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
                    <Button
                      onClick={() => handleFavoriteClick(item._id)}
                      size="icon"
                      variant="ghost"
                      className="p-0"
                    >
                      <Heart
                        size={20}
                        className={cn(
                          'stroke-muted-foreground',
                          isFavorited && 'fill-muted-foreground',
                        )}
                      />
                    </Button>
                  ) : (
                    <Button size="icon" variant="ghost" className="p-0">
                      <SignInButton mode="modal">
                        <Heart
                          size={20}
                          className={cn(
                            'stroke-muted-foreground',
                            isFavorited && 'fill-muted-foreground',
                          )}
                        />
                      </SignInButton>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
