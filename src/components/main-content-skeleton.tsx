import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MainContentSkeleton() {
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
