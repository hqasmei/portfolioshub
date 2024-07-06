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
import { useMutation } from 'convex/react';
import { Heart } from 'lucide-react';

export default function PortfolioCard({
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
    <Card className="w-full rounded-2xl border shadow-sm relative">
      <div className="relative">
        <Link href={item.link} target="_blank">
          <div className="px-3 pt-3">
            <div className="overflow-hidden rounded-xl border">
              <Image
                src={imageUrl}
                alt={item.name}
                width={400}
                height={200}
                priority
                className="object-cover h-56 object-top w-full hover:scale-105 transition-all duration-300 rounded-xl"
              />
            </div>
          </div>
          <div className="p-4">
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

        <div className="flex flex-row items-center absolute bottom-2 right-4">
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
