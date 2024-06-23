import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const ratingFormSchema = z.object({
  newRating: z.number().min(1).max(5),
});

function convertToPortfolioId(id: string): Id<'portfolios'> {
  return id as Id<'portfolios'>;
}

function StarRating({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (rating: number) => void;
}) {
  const handleStarClick = (value: number) => {
    setRating(value);
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((value) => (
        <svg
          key={value}
          className={`w-6 h-6 cursor-pointer ${value <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
          fill={value <= rating ? '#EFCE4A' : 'none'}
          stroke={value <= rating ? '#EFCE4A' : '#999999'}
          strokeWidth={1}
          onClick={() => handleStarClick(value)}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l2.9 6.59L22 10.68l-5.09 4.68L18.18 22 12 18.9 5.82 22 7.09 15.36 2 10.68l7.1-1.09L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function RatingForm({ setOpen, _id }: { setOpen: any; _id: string }) {
  const [rating, setRating] = useState(0);

  const form = useForm<z.infer<typeof ratingFormSchema>>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      newRating: 0,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const giveRating = useMutation(api.portfolios.giveRating);

  async function onSubmit(data: { newRating: number }) {
    const ipAddress = await fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => data.ip);

    try {
      await giveRating({
        portfolioId: convertToPortfolioId(_id),
        newRating: data.newRating.toString(),
        ipAddress: ipAddress,
      });

      setOpen(false);
      toast.success('You have successfully submitted your rating!');
    } catch (error: any) {
      toast.error('You have already given a rating.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="newRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <StarRating rating={rating} setRating={(value) => {
                setRating(value);
                field.onChange(value);
              }} />
            </FormItem>
          )}
        />
        <div className="justify-end w-full flex">
          <Button type="submit" disabled={isSubmitting || rating === 0}>
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

export default function RatingDialog({
  ID,
  avgRating,
  outOfRating,
}: {
  ID: string;
  avgRating: any;
  outOfRating: any;
}) {
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  return (
    <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
      <DialogTrigger className="flex justify-center items-center">
        <svg
          className="w-5 h-5 pr-1"
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 53.867 53.867"
          xmlSpace="preserve"
          fill="#000000"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth={0} />
          <g
            id="SVGRepo_tracerCarrier"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g id="SVGRepo_iconCarrier">
            <polygon
              style={{ fill: '#EFCE4A' }}
              points="26.934,1.318 35.256,18.182 53.867,20.887 40.4,34.013 43.579,52.549 26.934,43.798 10.288,52.549 13.467,34.013 0,20.887 18.611,18.182 "
            />
          </g>
        </svg>
        {avgRating}
        <span className="pl-1 text-xs">({outOfRating})</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit your rating</DialogTitle>
        </DialogHeader>
        <RatingForm setOpen={setIsSubmitOpen} _id={ID} />
      </DialogContent>
    </Dialog>
  );
}
