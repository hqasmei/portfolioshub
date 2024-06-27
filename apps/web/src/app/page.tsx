'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { SendEventOnLoad } from '@/components/send-event-on-load';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import WordRotate from '@/components/word-rotate';
import { getImageUrl } from '@/lib/get-image-url';
import { api } from '@packages/backend/convex/_generated/api';
import { Doc } from '@packages/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { motion } from 'framer-motion';

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

function Hero() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <div className="w-full flex flex-col gap-2">
        <div className="text-3xl sm:text-4xl flex flex-col sm:flex-row w-full justify-center font-semibold items-center gap-0 sm:gap-2">
          <span>Portfolios from</span>
          <WordRotate
            words={['Developers', 'Designers', 'YouTubers', 'Engineers']}
          />
        </div>
        <span className="text-muted-foreground text-lg">
          Find the best portfolios and showcase your work
        </span>
      </div>
    </div>
  );
}

function MainContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card
            key={idx}
            className="w-full rounded-md border border-border shadow-sm relative"
          >
            <div className="px-3 pt-3">
              <div className="overflow-hidden rounded-md ">
                <Skeleton className="h-56 object-top" />
              </div>
            </div>

            <CardContent className="px-3 py-3">
              <Skeleton className="h-6 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const portfolios = useQuery(api.portfolios.getPortfolios);
  const isLoading = portfolios === undefined;
  const [selectedTag, setSelectedTag] = useState<string | null>('All');
  const uniqueTags = ['All', ...getUniqueTags(portfolios || [])];

  const filteredData =
    selectedTag === 'All' || selectedTag === null || !portfolios
      ? portfolios
      : portfolios.filter(
          (portfolio) =>
            portfolio.tags &&
            portfolio.tags.map((tag) => `${tag}s`).includes(selectedTag),
        );

  if (isLoading) {
    return (
      <div className="flex flex-col  pb-20 sm:container mx-auto  px-4 w-full">
        <Hero />
        <MainContentSkeleton />
      </div>
    );
  }

  return (
    <>
      <SendEventOnLoad eventKey="User hit home page" />{' '}
      <div className="flex flex-col  pb-20 sm:container mx-auto  px-4 w-full">
        <Hero />
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 pb-4 items-center sm:justify-center overflow-x-auto">
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
              return (
                <Link key={idx} href={item.link} target="_blank">
                  <Card className="w-full rounded-md border border-border shadow-sm relative">
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

                    <CardContent className="px-3 py-3">
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
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
