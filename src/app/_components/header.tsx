'use client';

import React, { useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import DialogNavMenu from '@/components/dialog-nav-menu';
import FeedbackForm from '@/components/forms/feedback-form';
import MainNav from '@/components/main-nav';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useScroll from '@/hooks/use-scroll';
import { useSession } from '@/lib/client-auth';
import { cn } from '@/lib/utils';
import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import { EllipsisVertical, MessageSquareMore } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const session = useSession();
  const scrolled = useScroll(70);
  const router = useRouter();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
        <nav className="w-full h-16 items-center flex sm:container mx-auto px-4">
          <div className="w-full items-center flex flex-row justify-between">
            <div className="flex flex-row items-center gap-8">
              <MainNav />

              <div className="hidden md:flex gap-4 items-center">
                <button
                  onClick={() => handleClick('/templates')}
                  className="text-muted-foreground hover:text-foreground hover:duration-200"
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
                className="flex gap-2"
              >
                <MessageSquareMore size={16} className="hidden md:block" />
                <span>Feedback</span>
              </Button>
              {session.isLoggedIn ? (
                <>
                  {isHome ? (
                    <Button
                      size="sm"
                      onClick={() => handleClick('/dashboard')}
                      className="hidden md:flex"
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <div className="hidden md:flex md:ml-2">
                      <UserButton />
                    </div>
                  )}
                </>
              ) : (
                <Button size="sm" asChild className="hidden md:flex">
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
      <DialogNavMenu isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="flex flex-col gap-4 items-start">
          {/* <button
            onClick={() => handleClick('/blog')}
            className="text-muted-foreground hover:text-foreground  hover:duration-200"
          >
            Blog
          </button> */}
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
          <div className="flex flex-row justify-between items-center w-full">
            <span className="text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </DialogNavMenu>
    </>
  );
}
