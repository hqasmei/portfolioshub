'use client';

import React, { useState } from 'react';

import MainNav from '@/components/main-nav';
import { ThemeToggle } from '@/components/theme-toggle';
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
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import useScroll from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Loader2, MessageSquareMore, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const feedbackFormSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  feedback: z.string().min(2).max(500),
});

const submissionFormSchema = z.object({
  name: z.string().min(2).max(50),
  link: z.string().url(),
});

function FeedbackForm({ setOpen }: { setOpen: any }) {
  const form = useForm<z.infer<typeof feedbackFormSchema>>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: '',
      email: '',
      feedback: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: z.infer<typeof feedbackFormSchema>) {
    await fetch('https://projectplannerai.com/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: process.env.NEXT_PUBLIC_PROJECT_PLANNER_AI_ID,
        feedback: values.feedback,
        name: values.name,
        email: values.email,
      }),
    });
    setOpen(false);
    toast.success('Feedback successfully submitted! ');
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
                <Input placeholder="Hosna Qasmei" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your email</FormLabel>
              <FormControl>
                <Input placeholder="test@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Can you please add light mode"
                  {...field}
                />
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
  const scrolled = useScroll(70);
  const [isSubimtOpen, setIsSubimtOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFeedbackOpen(true)}
                className="flex gap-2"
              >
                <MessageSquareMore size={16} />
                <span className="hidden sm:inline">Feedback</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsSubimtOpen(true)}
                className="flex gap-2"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Submit</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
          </DialogHeader>
          <FeedbackForm setOpen={setIsFeedbackOpen} />
        </DialogContent>
      </Dialog>

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
