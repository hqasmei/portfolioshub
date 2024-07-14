'use client';

import React from 'react';



import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/convex/_generated/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';





const submissionFormSchema = z.object({
  name: z.string().min(2).max(50),
  link: z.string().url(),
});

export default function SubmissionForm({ setOpen }: { setOpen: any }) {
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
      'Your portfolio has been submitted! We will review it shortly. It should appear within a few hours.',
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 px-4 pb-4 md:px-0 md:pb-0"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Hosna Qasmei" {...field} autoFocus/>
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
              <FormLabel>Portfolio website</FormLabel>
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