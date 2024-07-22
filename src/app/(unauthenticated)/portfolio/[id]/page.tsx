'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import SocialIcon from '@/components/social-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useFavorites } from '@/hooks/use-favorites';
import { useSession } from '@/lib/client-auth';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { SignInButton } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { ExternalLink, Heart } from 'lucide-react';

export default function PortfolioPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const portfolioId = id as Id<'portfolios'>;

  const session = useSession();
  const favorites = useFavorites();
  const portfolio = useQuery(api.portfolios.getPortfolioFromId, {
    portfolioId: portfolioId,
  });
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
  const isFavorited = favorites && favorites.has(portfolioId);

  const handleFavoriteClick = async () => {
    if (favorites) {
      const favoriteId = favorites.get(portfolioId);
      if (favoriteId) {
        // Portfolio is favorited, so remove the favorite
        await removeFavorite({ favoriteId: favoriteId });
        await decrementPortfolioFavoriteCount({ portfolioId });
      } else {
        // Portfolio is not favorited, so add a favorite
        await addFavorite({ portfolioId });
        await incrementPortfolioFavoriteCount({ portfolioId });
      }
    }
  };

  return (
    <main className="relative flex flex-col-reverse gap-4 lg:flex-row lg:gap-8 p-4">
      {/* Center content - main scrollable area */}
      <div className="w-full lg:w-2/3">
        <div className="space-y-8">
          <Image
            src={imageUrl}
            alt={portfolio.name}
            width={1940}
            height={1340}
            priority
            className="object-cover object-top w-full rounded-lg shadow-md"
          />
          {/* Add more content here */}
        </div>
      </div>

      {/* Right sidebar - fixed */}
      <div className="lg:w-1/3  lg:sticky lg:top-0 lg:h-screen">
        <div className="lg:sticky lg:top-10 lg:-mt-12 lg:h-[calc(100vh-3.5rem)] lg:py-12">
          <div className="bg-secondary/50 p-4 rounded-lg">
            <div className="flex flex-col gap-1">
              {/* Name */}
              <h2 className="text-2xl font-bold">{portfolio.name}</h2>
              {/* Role */}
              {portfolio.titles && !portfolio.titles.includes('') && (
                <div className="flex flex-wrap gap-2">
                  {portfolio.titles.map((title, idx) => (
                    <Badge variant="secondary" key={idx}>
                      {title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {portfolio.favoritesCount !== undefined &&
              portfolio.favoritesCount !== null && (
                <div className="text-muted-foreground text-sm mt-4">
                  {portfolio.favoritesCount === 0 && '0 likes'}
                  {portfolio.favoritesCount === 1 && '1 like'}
                  {portfolio.favoritesCount > 1 &&
                    `${portfolio.favoritesCount} likes`}
                </div>
              )}

            <div className="flex flex-row justify-between items-center mt-4">
              {/* Socials */}
              {portfolio.socials && portfolio.socials.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {portfolio.socials && portfolio.socials.length > 0
                      ? portfolio.socials.map((social, idx) => (
                          <Button
                            asChild
                            size="icon"
                            variant="ghost"
                            key={idx}
                            className="h-8 w-8"
                          >
                            <SocialIcon
                              url={social}
                              className="stroke-muted-foreground"
                            />
                          </Button>
                        ))
                      : null}
                  </div>
                </div>
              )}
              {/* Like and Link */}
              <div className="flex items-center justify-end gap-2">
                <div className="flex items-center gap-2">
                  {session.isLoggedIn ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleFavoriteClick}
                      className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 h-8 w-8"
                    >
                      <Heart
                        size={18}
                        className={cn(
                          'stroke-muted-foreground group-hover:stroke-emerald-500 duration-200',
                          isFavorited && 'fill-emerald-500 stroke-emerald-500',
                        )}
                      />
                    </Button>
                  ) : (
                    <button>
                      <SignInButton mode="modal">
                        <Heart
                          size={18}
                          className={cn(
                            'stroke-muted-foreground hover:stroke-emerald-500 duration-200',
                            isFavorited &&
                              'fill-emerald-500 stroke-emerald-500',
                          )}
                        />
                      </SignInButton>
                    </button>
                  )}
                </div>

                <Button
                  asChild
                  size="icon"
                  variant="ghost"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 h-8 w-8"
                >
                  <Link href={portfolio.link} target="_blank">
                    <ExternalLink size={18} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
