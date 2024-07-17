'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/convex/_generated/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const newsletterFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function Hero() {
  const portfolios = useQuery(api.portfolios.getAllPortfolios);
  const numberOfPortfolios = portfolios?.length;

  const form = useForm<z.infer<typeof newsletterFormSchema>>({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const addEmail = useMutation(api.newsletters.addEmail);

  async function onSubmit(values: z.infer<typeof newsletterFormSchema>) {
    try {
      await addEmail({
        email: values.email,
        subscriptionDate: new Date().toISOString(),
        isActive: true,
      });
      form.reset();
      toast.success('Successfully subscribed!');
    } catch (error) {
      console.error(error);
      toast.error('This email is already subscribed.');
    }
  }

  return (
    <>
      <div className="flex flex-col items-center sm:pt-8 gap-y-6 sm:gap-y-7">
        <h1 className="text-pretty text-neutral-900 dark:text-white lg:text-6xl lg:-tracking-4 lg:leading-[4rem] lg:font-extrabold text-4xl md:text-5xl -tracking-3 font-bold max-w-3xl text-center">
          Discover portfolios to inspire your creativity
        </h1>
      </div>
      <p className="text-neutral-700 dark:text-neutral-300 mx-auto block text-balance max-w-sm text-center text-base md:max-w-3xl md:text-lg xl:text-xl">
        Browse our curated collection of{' '}
        {numberOfPortfolios && (
          <span className="text-foreground font-semibold">
            {numberOfPortfolios}+
          </span>
        )}{' '}
        exceptional designs and showcase your own work.
      </p>
      <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-2 items-center relative"
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
                      className="dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:border-gray-600 h-12 pr-44 ring-0 focus:ring-0 ring-offset-0  focus-visible:ring-0 focus-visible:ring-none focus-visible:ring-offset-0"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white absolute right-1 top-1 z-10"
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

        <p className="text-sm text-gray-400 mt-2">
          Get monthly curated portfolios & career insights.
        </p>
      </div>
    </>
  );
}
