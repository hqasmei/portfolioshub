'use client';

import React, { Dispatch, SetStateAction } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import SocialIcon from '@/components/social-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useFavorites } from '@/hooks/use-favorites';
import useMediaQuery from '@/hooks/use-media-query';
import { useSession } from '@/lib/client-auth';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { SignInButton } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { ExternalLink, Heart } from 'lucide-react';

export default function PortfolioDetails({
  showModal,
  setShowModal,
  className,
  onClose,
  preventDefaultClose,
  portfolioId,
}: {
  showModal?: boolean;
  setShowModal?: Dispatch<SetStateAction<boolean>>;
  className?: string;
  onClose?: () => void;
  preventDefaultClose?: boolean;
  portfolioId: Id<'portfolios'>;
}) {
  const router = useRouter();
  const { isMobile } = useMediaQuery();

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

  const closeModal = ({ dragged }: { dragged?: boolean } = {}) => {
    if (preventDefaultClose && !dragged) {
      return;
    }
    // fire onClose event if provided
    onClose && onClose();

    // if setShowModal is defined, use it to close modal
    if (setShowModal) {
      setShowModal(false);
      // else, this is intercepting route @modal
    } else {
      router.back();
    }
  };

  return (
    <Dialog
      open={setShowModal ? showModal : true}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <DialogContent className="w-full max-w-5xl top-4 translate-y-4 lg:top-[50%] lg:translate-y-[-50%] ">
        <div>
          <div className="flex flex-col gap-4">
            {/* Portfolio Description */}
            <div className="flex flex-col justify-between pt-4">
              <div className="space-y-4">
                <div>
                  <h2 className="text-md font-medium text-gray-600 dark:text-gray-300">
                    Portfolio by{' '}
                  </h2>
                  <h3 className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    {portfolio?.name}
                  </h3>
                </div>

                {portfolio.titles && !portfolio.titles.includes('') && (
                  <div className="flex flex-wrap gap-2">
                    {portfolio.titles.map((title, idx) => (
                      <Badge
                        variant="secondary"
                        key={idx}
                        className="bg-gray-200 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs"
                      >
                        {title}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
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

                  <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center gap-2">
                      {session.isLoggedIn ? (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleFavoriteClick}
                          className="  h-8 w-8"
                        >
                          <Heart
                            size={18}
                            className={cn(
                              'stroke-muted-foreground group-hover:stroke-emerald-500 duration-200',
                              isFavorited &&
                                'fill-emerald-500 stroke-emerald-500',
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

                      {portfolio.favoritesCount &&
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

                    <Button
                      asChild
                      size="icon"
                      variant="ghost"
                      className=" h-8 w-8"
                    >
                      <Link href={portfolio.link} target="_blank">
                        <ExternalLink
                          size={18}
                          className="stroke-muted-foreground"
                        />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Image */}
            <div className="lg:col-span-3 h-[400px] lg:h-[600px] overflow-hidden">
              {isMobile ? (
                <Image
                  src={imageUrl}
                  alt={portfolio.name}
                  width={1940}
                  height={1340}
                  priority
                  className="object-cover object-top w-full md:h-full h-[400px] border rounded-md"
                />
              ) : (
                <iframe
                  src={portfolio.link}
                  className="w-full h-full aspect-auto rounded-md border"
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
