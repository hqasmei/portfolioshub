import React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MainContentSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="w-full relative">
            <div>
              <div className="overflow-hidden border-b rounded-t-lg">
                <Skeleton className="h-80 object-top rounded-none" />
              </div>
            </div>

            <CardContent className="py-3 flex px-4">
              <Skeleton className="h-6 w-36 " />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
