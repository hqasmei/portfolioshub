'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@packages/backend/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2).max(50),
  link: z.string().url(),
  tags: z.string(),
  image: z.string(),
});

function EditForm({ setOpen, item }: { setOpen: any; item: any }) {
  const [image, setImage] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    item?.image ? getImageUrl(item?.image) : null,
  );
  // Ensure default values are never undefined
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || '',
      link: item?.link || '',
      tags: item?.tags || [],
      image: item?.image || '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);

  const createPortfolio = useMutation(api.portfolios.createPortfolio);
  const updateSubmission = useMutation(api.submissions.updateSubmission);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedTages = values.tags.split(',').map((item) => item.trim());

    // Update the submission if it exists
    await updateSubmission({
      submissionId: item?._id,
      name: values.name,
      link: values.link,
      status: 'completed',
    });

    // Get Image storage id
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': image!.type },
      body: image,
    });
    const { storageId } = await result.json();
    // Add the new submission to portfolios
    await createPortfolio({
      name: values.name,
      link: values.link,
      tags: formattedTages,
      image: storageId,
    });

    // Close the dialog
    setOpen(false);

    // Show success message
    toast.success('Submitted successfully!');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="h-36  rounded-md border border-dashed items-center justify-center flex flex-col gap-2">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Uploaded"
                width={400}
                height={200}
                priority
                className="object-cover overflow-hidden object-top w-full rounded-md"
              />
            ) : (
              <>
                <ImageIcon className="stroke-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Upload image
                </span>
              </>
            )}
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </label>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-row gap-2 items-center">
              <FormLabel className="w-20">Name</FormLabel>
              <FormControl>
                <Input placeholder="Hosna Qasmei" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem className="flex flex-row gap-2 items-center">
              <FormLabel className="w-20">Website</FormLabel>
              <FormControl>
                <Input placeholder="https://www.example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex flex-row gap-2 items-center">
              <FormLabel className="w-20">Tags</FormLabel>
              <FormControl>
                <Input placeholder="Developer, Designer" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="justify-end w-full flex">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex gap-2 items-center">
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Submit</span>
              </div>
            ) : (
              <span>Submit</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function Admin() {
  const [item, setItem] = useState<any>(null);
  const submissions = useQuery(api.submissions.getSubmissions);
  const portfolios = useQuery(api.portfolios.getPortfolios);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const user = useQuery(api.users.getMyUser);

  if (user?.isAdmin !== true) {
    return (
      <div className="text-muted-foreground py-16 flex flex-col items-center justify-center">
        <span>Sorry, you can not access this page.</span>
        <span>You need to be an admin.</span>
      </div>
    );
  }

  return (
    <>
      {/* /Submissions */}
      <div className=" w-full flex flex-col container pt-16">
        <span className="font-semibold text-4xl">Submissions</span>
        {submissions?.length === 0 ? (
          <div className="flex mt-4 items-center justify-center py-16 border rounded-md">
            <span className="text-muted-foreground">
              No submissions to review
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {submissions?.map((submission, idx) => (
              <Card key={idx} className="w-full rounded-md border border-border shadow-sm p-6">
                <div className="relative">
                  <Link href={submission.link} target="_blank">
                    <div>
                      <Badge
                        className={cn(
                          'capitalize text-foreground',
                          submission.status === 'pending' &&
                            'bg-yellow-700 hover:bg-yellow-800',
                          submission.status === 'completed' &&
                            'bg-green-700 hover:bg-green-800',
                        )}
                      >
                        {submission.status}
                      </Badge>
                    </div>
                    <span className="text-xl font-bold">{submission.name}</span>
                  </Link>

                  <div className="flex gap-2 items-center justify-start absolute bottom-0 right-0">
                    {submission.status === 'pending' ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setItem(submission);
                          setIsEditOpen(true);
                        }}
                      >
                        Submit
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        // onClick={() => {
                        //   setItem(submission);
                        //   setIsEditOpen(true);
                        // }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Portfolios */}
      <div className=" w-full flex flex-col container py-16">
        <span className="font-semibold text-4xl">Portfolios</span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {portfolios?.map((portfolio, idx) => {
            const imageUrl = getImageUrl(portfolio.image);
            return (
              <Card key={idx} className="p-6 flex flex-col gap-2">
                <Image
                  src={imageUrl}
                  alt={portfolio.name}
                  width={400}
                  height={200}
                  priority
                  className="object-cover h-56 object-top w-full hover:scale-105 transition-all duration-300 rounded-md"
                />
                <span className="text-xl font-bold">{portfolio.name}</span>
                <Link href={portfolio.link} target="_blank">
                  <span className="text-sm text-muted-foreground">
                    {portfolio.link}
                  </span>
                </Link>

                <div className="flex gap-2 items-center justify-end">
                  <Button size="sm" variant="destructive">
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    // onClick={() => {
                    //   setItem(portfolio);
                    //   setIsEditOpen(true);
                    // }}
                  >
                    Edit
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit portfolio</DialogTitle>
          </DialogHeader>
          <EditForm setOpen={setIsEditOpen} item={item} />
        </DialogContent>
      </Dialog>
    </>
  );
}
