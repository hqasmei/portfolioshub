'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import MaxWidthWrapper from '@/components/max-width-wrapper';
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
import { api } from '@/convex/_generated/api';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from 'convex/react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const editFormSchema = z.object({
  name: z.string().min(2).max(50),
  link: z.string().url(),
  tags: z.string(),
  image: z.string(),
});

const deleteFormSchema = z.object({
  submissionId: z.string(),
});

function EditForm({ setOpen, item }: { setOpen: any; item: any }) {
  const [image, setImage] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    item?.image ? getImageUrl(item?.image) : null,
  );
  // Ensure default values are never undefined
  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
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

  async function onSubmit(values: z.infer<typeof editFormSchema>) {
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

function DeleteForm({
  setOpen,
  submissionId,
}: {
  setOpen: any;
  submissionId: any;
}) {
  const form = useForm<z.infer<typeof deleteFormSchema>>({
    resolver: zodResolver(deleteFormSchema),
    defaultValues: { submissionId: submissionId },
  });
  const isLoading = form.formState.isSubmitting;
  const deleleSubmission = useMutation(api.submissions.deleteSubmission);

  const onSubmit = async () => {
    try {
      await deleleSubmission({ submissionId });
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
export default function Admin() {
  const [item, setItem] = useState<any>(null);
  const submissions = useQuery(api.submissions.getSubmissions);
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
      <MaxWidthWrapper>
        <span className="text-4xl font-bold">Submissions</span>
        {submissions?.length === 0 ? (
          <div className="flex mt-4 items-center justify-center py-16 border rounded-md">
            <span className="text-muted-foreground">
              No submissions to review
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {submissions?.map((submission, idx) => (
              <Card
                key={idx}
                className="w-full rounded-md border border-border shadow-sm p-6"
              >
                <div className="relative flex flex-col gap-2">
                  <Link
                    href={submission.link}
                    target="_blank"
                    className="flex flex-col gap-2"
                  >
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

                  <div className="flex gap-2 items-center justify-start">
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
                        onClick={() => {
                          setItem(submission);
                          setIsDeleteOpen(true);
                        }}
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
      </MaxWidthWrapper>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit submission</DialogTitle>
          </DialogHeader>
          <EditForm setOpen={setIsEditOpen} item={item} />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete submission</DialogTitle>
          </DialogHeader>
          <DeleteForm setOpen={setIsDeleteOpen} submissionId={item?._id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
