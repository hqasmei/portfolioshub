'use client';

import React from 'react';

import Image from 'next/image';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import { Badge } from '@/components/ui/badge';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { getImageUrl } from '@/lib/get-image-url';
import { useQuery } from 'convex/react';
import { Heart, Link } from 'lucide-react';

export default function PortfolioPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const portfolio = useQuery(api.portfolios.getPortfolioFromId, {
    portfolioId: id as Id<'portfolios'>,
  });

  if (!portfolio) return null;

  const imageUrl = getImageUrl(portfolio.image);

  return (
    <MaxWidthWrapper className="container">
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className='w-full md:w-2/3 h-80 md:h-[600px] overflow-y-auto rounded-xl border'>
          <Image
            src={imageUrl}
            alt={portfolio.name}
            width={600}
            height={500}
            priority
            className="object-cover object-top w-full"
          />
        </div>

        <div className="flex flex-col gap-6 h-fit p-6 rounded-xl border md:w-1/3">
          <div className="flex flex-col gap-1">
            <span className="font-light">
              Portfolio by{' '}
              <span className="font-bold text-lg text-foreground">
                {portfolio?.name}
              </span>
            </span>
            {portfolio.tags && !portfolio.tags.includes('') && (
              <div className="flex gap-2">
                {portfolio.tags.map((tag, idx) => (
                  <Badge variant="secondary" key={idx}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-6 items-center">
            <div className="flex gap-2 items-center">
              <Heart
                size={18}
                className="stroke-muted-foreground hover:stroke-foreground transition-all duration-200"
              />
              <span>{portfolio.favoritesCount}</span>
            </div>

            <Link
              size={18}
              className="stroke-muted-foreground hover:stroke-foreground transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
