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
        'flex flex-col pt-4 pb-8 sm:px-8 lg:px-24 mx-auto px-4 w-full',
        className,
      )}
    >
      {children}
    </div>
  );
}
