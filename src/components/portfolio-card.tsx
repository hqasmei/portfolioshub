'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useSession } from '@/lib/client-auth';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { SignInButton } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { Heart } from 'lucide-react';

export default function PortfolioCard({
  item,
  favorites,
  isFavoriteCard = false,
  favoriteId,
}: {
  item: Doc<'portfolios'> | Id<'portfolios'>;
  favorites?: Map<string, string>;
  isFavoriteCard?: boolean;
  favoriteId?: Id<'favorites'>;
}) {
  const session = useSession();
  const portfolioId = typeof item === 'object' ? item._id : item;

  const queryResult = useQuery(api.portfolios.getPortfolioFromId, {
    portfolioId,
  });

  const portfolio = isFavoriteCard
    ? queryResult
    : typeof item === 'object'
      ? item
      : null;

  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const incrementPortfolioFavoriteCount = useMutation(
    api.portfolios.incrementPortfolioFavoriteCount,
  );
  const decrementPortfolioFavoriteCount = useMutation(
    api.portfolios.decrementPortfolioFavoriteCount,
  );

  if (!portfolio) return null;

  const imageUrl = getImageUrl(portfolio.image);
  const isFavorited =
    isFavoriteCard || (favorites && favorites.has(portfolioId));

  const handleFavoriteClick = async () => {
    if (isFavoriteCard) {
      await removeFavorite({ favoriteId: favoriteId as Id<'favorites'> });
    } else if (favorites) {
      if (isFavorited) {
        const favId = favorites.get(portfolioId);
        await removeFavorite({ favoriteId: favId as Id<'favorites'> });
        await decrementPortfolioFavoriteCount({ portfolioId });
      } else {
        await addFavorite({ portfolioId });
        await incrementPortfolioFavoriteCount({ portfolioId });
      }
    }
  };

  return (
    <Card className="w-full rounded-xl shadow-sm hover:shadow-xl relative border-t-0 group dark:hover:border-muted-foreground duration-200 transition-all">
      <div className="relative">
        <Link href={portfolio.link} target="_blank">
          <div>
            <div className="overflow-hidden rounded-xl border-t dark:group-hover:border-muted-foreground duration-200 transition-all">
              <Image
                src={imageUrl}
                alt={portfolio.name}
                width={400}
                height={200}
                priority
                className="object-cover h-56 object-top w-full rounded-xl"
              />
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-bold">{portfolio.name}</h3>

            {portfolio.tags && !portfolio.tags.includes('') && (
              <div className="flex gap-2 pt-2">
                {portfolio.tags.map((tag, idx) => (
                  <Badge variant="secondary" key={idx}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-row items-center absolute bottom-2 right-4">
          {session.isLoggedIn ? (
            <div className="flex items-center gap-1 group">
              <Button
                onClick={handleFavoriteClick}
                className="px-1.5 py-0 h-8"
                variant="ghost"
              >
                <Heart
                  size={18}
                  className={cn(
                    'stroke-muted-foreground group-hover:stroke-rose-500 duration-200',
                    isFavorited && 'fill-rose-500 stroke-rose-500',
                  )}
                />
              </Button>
              {!isFavoriteCard && (
                <span
                  className={cn(
                    'text-muted-foreground group-hover:text-rose-500 duration-200',
                    isFavorited && 'text-rose-500',
                  )}
                >
                  {portfolio.favoritesCount ?? 0}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 group">
              <Button variant="ghost" className="px-1.5 py-0 h-8">
                <SignInButton mode="modal">
                  <Heart
                    size={18}
                    className={cn(
                      'stroke-muted-foreground group-hover:stroke-rose-500 duration-200',
                      isFavorited && 'fill-rose-500 stroke-rose-500',
                    )}
                  />
                </SignInButton>
              </Button>
              {!isFavoriteCard && (
                <span
                  className={cn(
                    'text-muted-foreground group-hover:text-rose-500 duration-200',
                    isFavorited && 'text-rose-500',
                  )}
                >
                  {portfolio.favoritesCount ?? 0}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
