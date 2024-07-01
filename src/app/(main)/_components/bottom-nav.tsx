'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { api } from '@/convex/_generated/api';
import { useSession } from '@/lib/client-auth';
import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { Heart, House, Lock } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const session = useSession();
  const isAdmin = useQuery(api.users.isAdmin);
  return (
    <>
      {session.isLoggedIn && (
        <div className="fixed bottom-0 w-full py-4 z-10 bg-zinc-100 dark:bg-zinc-950 border-t dark:border-zinc-800 border-zinc-200 shadow-lg md:hidden">
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
                    pathname === '/admin' && 'stroke-foreground',
                  )}
                />
              </Link>
            )}
            <UserButton />
          </div>
        </div>
      )}
    </>
  );
}
