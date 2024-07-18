'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useFavorites } from '@/hooks/use-favorites';
import { useSession } from '@/lib/client-auth';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { SignInButton } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { ExternalLink, Heart } from 'lucide-react';

export default function PortfolioCard({
  item,
  isFavoriteCard = false,
  favoriteId,
}: {
  item: Doc<'portfolios'> | Id<'portfolios'>;
  isFavoriteCard?: boolean;
  favoriteId?: Id<'favorites'>;
}) {
  const session = useSession();
  const favorites = useFavorites();
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
    <Card className="w-full border-none bg-transparent relative shadow-none">
      <Link href={`?id=${portfolio._id}`}>
        <div>
          <div className="overflow-hidden rounded-xl">
            <Image
              src={imageUrl}
              alt={portfolio.name}
              width={400}
              height={200}
              priority
              className="object-cover h-80 object-top w-full rounded-xl"
            />
          </div>
        </div>
        <div className="py-2 text-start flex items-center gap-1.5">
          <h3 className="text-sm font-semibold text-foreground transition-all duration-200">
            {portfolio.name}
          </h3>
          <span className="text-muted-foreground">·</span>
          {portfolio.titles &&
            portfolio.titles.length > 0 &&
            portfolio.titles.map((title, idx) => (
              <React.Fragment key={idx}>
                <span className="text-muted-foreground text-sm">{title}</span>
                {portfolio.titles && idx < portfolio.titles.length - 1 && (
                  <span className="text-muted-foreground">·</span>
                )}
              </React.Fragment>
            ))}
        </div>
      </Link>

      <div className="flex flex-row items-center absolute bottom-2 right-0">
        {session.isLoggedIn ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={handleFavoriteClick}>
                <Heart
                  size={18}
                  className={cn(
                    'stroke-muted-foreground group-hover:stroke-emerald-500 duration-200',
                    isFavorited && 'fill-emerald-500 stroke-emerald-500',
                  )}
                />
              </button>
              {!isFavoriteCard &&
              portfolio.favoritesCount &&
              portfolio.favoritesCount !== 0 ? (
                <span
                  className={cn(
                    'text-muted-foreground group-hover:text-emerald-500 duration-200 text-sm',
                    isFavorited && 'text-emerald-500',
                  )}
                >
                  {portfolio.favoritesCount ?? 0}
                </span>
              ) : null}
            </div>
            <Link href={portfolio.link} target="_blank">
              <ExternalLink
                size={18}
                className={cn(
                  'stroke-muted-foreground hover:stroke-emerald-500 duration-200',
                )}
              />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button>
                <SignInButton mode="modal">
                  <Heart
                    size={18}
                    className={cn(
                      'stroke-muted-foreground hover:stroke-emerald-500 duration-200',
                      isFavorited && 'fill-emerald-500 stroke-emerald-500',
                    )}
                  />
                </SignInButton>
              </button>
              {!isFavoriteCard &&
              portfolio.favoritesCount &&
              portfolio.favoritesCount !== 0 ? (
                <span
                  className={cn(
                    'text-muted-foreground group-hover:text-emerald-500 duration-200 text-sm',
                    isFavorited && 'text-emerald-500',
                  )}
                >
                  {portfolio.favoritesCount ?? 0}
                </span>
              ) : null}
            </div>
            <Link href={portfolio.link} target="_blank">
              <ExternalLink
                size={18}
                className={cn(
                  'stroke-muted-foreground hover:stroke-emerald-500 duration-200',
                )}
              />
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
