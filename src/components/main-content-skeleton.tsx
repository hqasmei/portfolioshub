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
            className="w-full border-none shadow-sm relative bg-transparent"
          >
            <div>
              <div className="overflow-hidden rounded-xl">
                <Skeleton className="h-80 object-top" />
              </div>
            </div>

            <CardContent className="py-3 flex px-0">
              <Skeleton className="h-6 w-36 rounded-xl" /> 
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
