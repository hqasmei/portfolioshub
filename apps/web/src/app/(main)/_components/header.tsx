'use client';

import React, { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import MainNav from '@/components/main-nav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useScroll from '@/hooks/use-scroll';
import { useSession } from '@/lib/client-auth';
import { cn } from '@/lib/utils';
import { SignInButton, UserButton } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const submissionFormSchema = z.object({
  name: z.string().min(2).max(50),
  link: z.string().url(),
});

function SubmissionForm({ setOpen }: { setOpen: any }) {
  const form = useForm<z.infer<typeof submissionFormSchema>>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      name: '',
      link: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const createSubmission = useMutation(api.submissions.createSubmission);

  async function onSubmit(values: z.infer<typeof submissionFormSchema>) {
    await createSubmission({
      name: values.name,
      link: values.link,
    });
    setOpen(false);
    toast.success(
      'You have successfully submitted your portfolio! We will review it soon!',
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name</FormLabel>
              <FormControl>
                <Input placeholder="Hosna Qasmei" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your website</FormLabel>
              <FormControl>
                <Input placeholder="https://www.example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="justify-end w-full flex">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function Header() {
  const pathname = usePathname();
  const session = useSession();
  const scrolled = useScroll(70);
  const [isSubimtOpen, setIsSubimtOpen] = useState(false);
  const isAdmin = useQuery(api.users.isAdmin);
  const isHome = pathname === '/';
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
            <div className="flex flex-row items-center gap-6">
              <MainNav />
              {session.isLoggedIn && pathname !== '/' && (
                <div className="flex flex-row gap-4 text-sm">
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
                variant="link"
                onClick={() => setIsSubimtOpen(true)}
              >
                Submit
              </Button>
              {session.isLoggedIn ? (
                <>
                  {isHome ? (
                    <Button size="sm" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                  ) : (
                    <UserButton />
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

      <Dialog open={isSubimtOpen} onOpenChange={setIsSubimtOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit your portfolio</DialogTitle>
          </DialogHeader>
          <SubmissionForm setOpen={setIsSubimtOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}
