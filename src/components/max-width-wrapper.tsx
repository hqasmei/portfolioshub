import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export default function MaxWidthWrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col pt-4 pb-20 sm:container mx-auto px-4 w-full',
        className,
      )}
    >
      {children}
    </div>
  );
}
