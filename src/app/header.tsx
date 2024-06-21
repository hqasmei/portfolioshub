'use client';

import React, { useState } from 'react';

import MainNav from '@/components/main-nav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { api } from '@/convex/_generated/api';
import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2).max(50),
  link: z.string().url(),
});

function SubmissionForm({ setOpen }: { setOpen: any }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      link: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const createSubmission = useMutation(api.submissions.createSubmission);

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
                <Input placeholder="John Doe" {...field} />
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
  const scrolled = useScroll(70);
  const [open, setOpen] = useState(false);

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
        <nav className="w-full h-16 items-center flex container">
          <div className="w-full items-center flex flex-row justify-between">
            <div className="flex flex-row items-center">
              <MainNav />
            </div>
            <Button
              size="sm"
              className="gap-1 flex text-sm"
              onClick={() => setOpen(true)}
            >
              <span>Submit</span>
            </Button>
          </div>
        </nav>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit your portfolio</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <SubmissionForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
}
