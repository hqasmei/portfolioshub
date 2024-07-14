'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import FeedbackForm from '@/components/forms/feedback-form';
import MainNav from '@/components/main-nav';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import useScroll from '@/hooks/use-scroll';
import { useSession } from '@/lib/client-auth';
import { cn } from '@/lib/utils';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { MessageSquareMore } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const session = useSession();
  const scrolled = useScroll(70);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const isAdmin = useQuery(api.users.isAdmin);
  const isHome = pathname === '/';
  return (
    <>
      <header
        className={cn(
          `inset-x-0 top-0 z-30 w-full transition-all duration-300 sticky`,
          {
            'border-b border-accent bg-background/50 backdrop-blur-lg sticky':
              scrolled,
          },
        )}
      >
        <nav className="w-full h-16 items-center flex sm:container mx-auto  px-4">
          <div className="w-full items-center flex flex-row justify-between">
            <div className="flex flex-row items-center gap-6">
              <MainNav />
              {session.isLoggedIn && pathname !== '/' && (
                <div className="hidden md:flex flex-row gap-4 text-sm">
                  <Link
                    href="/dashboard"
                    className={cn(
                      'text-muted-foreground hover:text-foreground  hover:duration-200',
                      pathname === '/dashboard' &&
                        'font-semibold text-foreground',
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/favorites"
                    className={cn(
                      'text-muted-foreground hover:text-foreground hover:duration-200',
                      pathname === '/favorites' &&
                        'font-semibold text-foreground',
                    )}
                  >
                    Favorites
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className={cn(
                        'text-muted-foreground hover:text-foreground hover:duration-200',
                        pathname === '/admin' &&
                          'font-semibold text-foreground',
                      )}
                    >
                      Admin
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-row items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFeedbackOpen(true)}
                className="flex gap-2"
              >
                <MessageSquareMore size={16} className="hidden md:block" />
                <span>Feedback</span>
              </Button>
              {session.isLoggedIn ? (
                <>
                  {isHome ? (
                    <Button size="sm" asChild className="hidden md:flex">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  ) : (
                    <div className="hidden md:flex md:ml-2">
                      <UserButton />
                    </div>
                  )}
                </>
              ) : (
                <Button size="sm" asChild>
                  <SignInButton mode="modal">Login</SignInButton>
                </Button>
              )}
            </div>
          </div>
        </nav>
      </header>
      <ResponsiveDialog
        open={isFeedbackOpen}
        setOpen={setIsFeedbackOpen}
        header="Feedback"
      >
        <FeedbackForm setOpen={setIsFeedbackOpen} />
      </ResponsiveDialog>
    </>
  );
}
