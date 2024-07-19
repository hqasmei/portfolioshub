'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const deletePortfolioFormSchema = z.object({
  portfolioId: z.string(),
});

export default function DeletePortfolioForm({
  setOpen,
  portfolioId,
  portfolioImageId,
}: {
  setOpen: any;
  portfolioId: Id<'portfolios'>;
  portfolioImageId: Id<'_storage'>;
}) {
  const form = useForm<z.infer<typeof deletePortfolioFormSchema>>({
    resolver: zodResolver(deletePortfolioFormSchema),
    defaultValues: { portfolioId: portfolioId },
  });
  const isLoading = form.formState.isSubmitting;
  const delelePortfolio = useMutation(api.portfolios.delelePortfolio);

  const onSubmit = async () => {
    try {
      await delelePortfolio({ portfolioId, portfolioImageId });
      setOpen(false);
      toast.success('Deleted successfully!');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-full flex justify-center space-x-6">
          <Button
            size="lg"
            variant="outline"
            disabled={isLoading}
            className="w-full"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting
              </>
            ) : (
              <span>Delete</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
