'use client';

import React from 'react';

import MainNav from '@/components/main-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';

export function Header() {
  const scrolled = useScroll(70);

  return (
    <>
      <header
        className={cn(
          `inset-x-0 top-0 z-30 w-full transition-all duration-300 sticky`,
          {
            'border-b border-accent bg-background/75 backdrop-blur-lg sticky':
              scrolled,
          },
        )}
      >
        <nav className="w-full h-16 items-center flex sm:container mx-auto  px-4">
          <div className="w-full items-center flex flex-row justify-between">
            <div className="flex flex-row items-center">
              <MainNav />
            </div>
            <div className="flex flex-row items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
