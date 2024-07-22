'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import DialogNavMenu from '@/components/dialog-nav-menu';
import FeedbackForm from '@/components/forms/feedback-form';
import SubmissionForm from '@/components/forms/submission-form';
import MainNav from '@/components/main-nav';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { api } from '@/convex/_generated/api';
import useScroll from '@/hooks/use-scroll';
import { useSession } from '@/lib/client-auth';
import { cn } from '@/lib/utils';
import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { EllipsisVertical, MessageSquareMore, Send } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const session = useSession();
  const scrolled = useScroll(70);
  const router = useRouter();

  const [isSubimtOpen, setIsSubimtOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = useQuery(api.users.isAdmin);
  const isHome = pathname === '/';

  const handleClick = (path: string) => {
    setIsOpen?.(false);
    router.push(path);
  };

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
        <nav className="w-full h-16 items-center flex sm:px-8 lg:px-24 mx-auto px-4">
          <div className="w-full items-center flex flex-row justify-between">
            <div className="flex flex-row items-center gap-8">
              <MainNav />
              <div className="hidden md:flex gap-4 items-center">
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

                <button
                  onClick={() => handleClick('/templates')}
                  className={cn(
                    'text-muted-foreground hover:text-foreground  hover:duration-200 text-sm',
                    pathname === '/templates' &&
                      'font-semibold text-foreground',
                  )}
                >
                  Templates
                </button>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFeedbackOpen(true)}
                className="hidden md:flex gap-2"
              >
                <MessageSquareMore size={16} />
                <span>Feedback</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsSubimtOpen(true)}
                className="hidden md:flex gap-2"
              >
                <Send size={16} />
                <span>Submit</span>
              </Button>

              {session.isLoggedIn ? (
                <>
                  {isHome ? (
                    <Button size="sm" onClick={() => handleClick('/dashboard')}>
                      Dashboard
                    </Button>
                  ) : (
                    <div className="flex ml-2">
                      <UserButton />
                    </div>
                  )}
                </>
              ) : (
                <Button size="sm" asChild>
                  <SignInButton mode="modal">Login</SignInButton>
                </Button>
              )}
              <button onClick={() => setIsOpen(true)} className="md:hidden">
                <EllipsisVertical
                  size={20}
                  className="text-muted-foreground hover:text-foreground hover:duration-200"
                />
              </button>
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
      <ResponsiveDialog
        open={isSubimtOpen}
        setOpen={setIsSubimtOpen}
        header="Submit a portfolio"
        description='Allow up to 24 hours for review and addition to our curated collection.'
      >
        <SubmissionForm setOpen={setIsSubimtOpen} />
      </ResponsiveDialog>

      <DialogNavMenu isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="flex flex-col gap-4 items-start">
          {/* <button
            onClick={() => handleClick('/blog')}
            className="text-muted-foreground hover:text-foreground  hover:duration-200"
          >
            Blog
          </button> */}
          {session.isLoggedIn && (
            <>
              <button
                onClick={() => handleClick('/dashboard')}
                className="text-muted-foreground hover:text-foreground  hover:duration-200"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleClick('/favorites')}
                className="text-muted-foreground hover:text-foreground  hover:duration-200"
              >
                Favorites
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleClick('/admin')}
                  className="text-muted-foreground hover:text-foreground  hover:duration-200"
                >
                  Admin
                </button>
              )}
            </>
          )}

          <button
            onClick={() => handleClick('/templates')}
            className="text-muted-foreground hover:text-foreground  hover:duration-200"
          >
            Templates
          </button>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-4 items-start w-full">
          {session.isLoggedIn ? (
            <SignOutButton>
              <span className="text-muted-foreground hover:text-foreground hover:duration-200 cursor-pointer">
                Logout
              </span>
            </SignOutButton>
          ) : (
            <SignInButton mode="modal">
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:duration-200"
              >
                Login
              </button>
            </SignInButton>
          )}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsFeedbackOpen(true);
            }}
            className="flex flex-row justify-between items-center w-full"
          >
            <span className="text-muted-foreground">Feedback</span>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              setIsSubimtOpen(true);
            }}
            className="flex flex-row justify-between items-center w-full"
          >
            <span className="text-muted-foreground">Submit</span>
          </button>

          <div className="flex flex-row justify-between items-center w-full">
            <span className="text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </DialogNavMenu>
    </>
  );
}
