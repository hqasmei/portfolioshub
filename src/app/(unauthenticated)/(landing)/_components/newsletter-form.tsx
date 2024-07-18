'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/convex/_generated/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useReCaptcha } from 'next-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const newsletterFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function NewsletterForm() {
  const { executeRecaptcha } = useReCaptcha();

  const form = useForm<z.infer<typeof newsletterFormSchema>>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const verifyEmail = useAction(api.newsletters.verifyEmail);

  async function onSubmit(values: z.infer<typeof newsletterFormSchema>) {
    try {
      const token = await executeRecaptcha('form_submit');
      await verifyEmail({
        email: values.email,
        subscriptionDate: new Date().toISOString(),
        isActive: true,
        recaptchaToken: token,
      });
      form.reset();
      toast.success('Successfully subscribed!');
    } catch (error) {
      console.error(error);
      toast.error('This email is already subscribed.');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 items-center relative"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="dark:bg-gray-700 dark:text-white text-center sm:text-start dark:placeholder-gray-400 dark:border-gray-600 sm:h-12 sm:pr-44 ring-0 focus:ring-0 ring-offset-0  focus-visible:ring-0 focus-visible:ring-none focus-visible:ring-offset-0"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white sm:absolute sm:right-1 sm:top-1 z-10 w-full sm:w-fit"
        >
          {isSubmitting ? (
            <div className="flex gap-2 items-center">
              <Loader2 className="animate-spin h-4 w-4" />
            </div>
          ) : (
            <span>Join our newsletter</span>
          )}
        </Button>
      </form>
    </Form>
  );
}
