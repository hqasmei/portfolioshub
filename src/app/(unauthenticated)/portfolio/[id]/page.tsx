'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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
    <main className="relative flex flex-col gap-4 lg:flex-row lg:gap-8 sm:px-8 lg:px-24 pt-4 pb-8  mx-auto px-4 w-full">
      {/* Left sidebar - fixed */}
      <div className="lg:w-1/6  lg:sticky lg:top-0 lg:h-screen">
        <div className="lg:sticky lg:top-10 lg:-mt-12 lg:h-[calc(100vh-3.5rem)] lg:py-12">
          <button
            onClick={() => {
              router.back();
            }}
            className="flex items-center group gap-1 text-sm text-muted-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 rotate-180 fill-muted-foreground group-hover:fill-foreground group-hover:-translate-x-0.5 transition-colors duration-200"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="group-hover:text-foreground transition-colors duration-200">
              Back
            </span>
          </button>
        </div>
      </div>

      {/* Center content - main scrollable area */}
      <div className="w-full lg:w-3/6">
        {imageUrl ? (
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
        ) : (
          <span>loading...</span>
        )}
      </div>

      {/* Right sidebar - fixed */}
      <div className="lg:w-2/6  lg:sticky lg:top-0 lg:h-screen">
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
