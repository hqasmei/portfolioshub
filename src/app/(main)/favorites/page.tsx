'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useSession } from '@/lib/client-auth';
import { getImageUrl } from '@/lib/get-image-url';
import { SignInButton } from '@clerk/nextjs';
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
    <Card className="w-full rounded-xl shadow-sm hover:shadow-xl relative border-t-0 group dark:hover:border-muted-foreground duration-200 transition-all">
      <div className="relative">
        <Link href={portfolio.link} target="_blank">
          <div>
            <div className="overflow-hidden rounded-xl border-t  dark:group-hover:border-muted-foreground duration-200 transition-all">
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
    <MaxWidthWrapper>
      <span className="text-2xl md:text-4xl font-bold">Favorites</span>

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
    </MaxWidthWrapper>
  );
}
