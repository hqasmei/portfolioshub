'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import useScrollingEffect from '@/hooks/use-scroll-effect';
import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Heart, House, Lock } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const scrollDirection = useScrollingEffect(); // Use the custom hook
  const navClass = scrollDirection === 'up' ? '' : 'opacity-25 duration-500';
  const isAdmin = useQuery(api.users.isAdmin);
  return (
    <div
      className={cn(
        navClass,
        'fixed bottom-0 w-full py-4 z-10 bg-zinc-100 dark:bg-zinc-950 border-t dark:border-zinc-800 border-zinc-200 shadow-lg md:hidden ',
      )}
    >
      <div className="flex flex-row justify-around items-center bg-transparent w-full">
        <Link href="/dashboard" className="cursor-pointer">
          <House
            className={cn(
              'stroke-muted-foreground hover:stroke-foreground duration-200',
              pathname === '/dashboard' && 'stroke-foreground',
            )}
          />
        </Link>
        <Link href="/favorites" className="cursor-pointer">
          <Heart
            className={cn(
              'stroke-muted-foreground hover:stroke-foreground duration-200',
              pathname === '/favorites' && 'stroke-foreground',
            )}
          />
        </Link>
        {isAdmin && (
          <Link href="/admin" className="cursor-pointer">
            <Lock
              className={cn(
                'stroke-muted-foreground hover:stroke-foreground duration-200',
                pathname === '/favorites' && 'stroke-foreground',
              )}
            />
          </Link>
        )}
        <UserButton />
      </div>
    </div>
  );
}
