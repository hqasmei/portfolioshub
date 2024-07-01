'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSession } from '@/lib/client-auth';
import { getImageUrl } from '@/lib/get-image-url';
import { SignInButton } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { Heart } from 'lucide-react';

function FavoriteCard({
  portfolioId,
  favoriteId,
}: {
  portfolioId: Id<'portfolios'>;
  favoriteId: Id<'favorites'>;
}) {
  const session = useSession();
  const removeFavorite = useMutation(api.favorites.removeFavorite);

  const portfolio = useQuery(api.portfolios.getPortfolioFromId, {
    portfolioId: portfolioId,
  });

  if (!portfolio) return null;

  const imageUrl = getImageUrl(portfolio.image);

  const handleFavoriteClick = async () => {
    console.log(favoriteId);
    await removeFavorite({ favoriteId: favoriteId as Id<'favorites'> });
  };

  return (
    <Card className="w-full rounded-md border border-border shadow-sm relative">
      <div className="relative">
        <Link href={portfolio.link} target="_blank">
          <div className="px-3 pt-3">
            <div className="overflow-hidden rounded-md ">
              <Image
                src={imageUrl}
                alt={portfolio.name}
                width={400}
                height={200}
                priority
                className="object-cover h-56 object-top w-full hover:scale-105 transition-all duration-300 rounded-md"
              />
            </div>
          </div>
          <div className="px-3 py-3">
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

        <div className="flex flex-row items-center absolute bottom-2 right-2">
          {session.isLoggedIn ? (
            <Button
              onClick={handleFavoriteClick}
              size="icon"
              variant="ghost"
              className="p-0"
            >
              <Heart size={20} className="stroke-rose-500 fill-rose-500" />
            </Button>
          ) : (
            <Button size="icon" variant="ghost" className="p-0">
              <SignInButton mode="modal">
                <Heart size={20} className="stroke-rose-500 fill-rose-500" />
              </SignInButton>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function FavoritesPage() {
  const getAllFavorites = useQuery(api.favorites.getFavoritesForUser);

  return (
    <div className="w-full container mx-auto pt-6">
      <span className="text-4xl font-bold">Favorites</span>

      {getAllFavorites && getAllFavorites.length === 0 ? (
        <div className="flex flex-col items-center gap-4 mt-6 border rounded-md h-56 justify-center">
          <h1 className="text-2xl font-bold">You have no favorites yet!</h1>
          <p className="text-muted-foreground">
            Start by adding some favorites to your dashboard!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-6">
          {getAllFavorites?.map((item, idx) => {
            return (
              <FavoriteCard
                key={idx}
                portfolioId={item.portfolioId}
                favoriteId={item._id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
