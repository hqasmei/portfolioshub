'use client';

import React, { useCallback, useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/convex/_generated/api';
import { getImageUrl } from '@/lib/get-image-url';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const addPortfolioFormSchema = z.object({
  name: z.string().min(2).max(50),
  link: z.string().url(),
  tags: z.string(),
  titles: z.string(),
  socials: z.string(),
  image: z.string(),
});

export default function AddPortfolioForm({
  setOpen,
  item,
}: {
  setOpen: any;
  item: any;
}) {
  const [image, setImage] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(
    item?.image ? getImageUrl(item?.image) : null,
  );
  const joinedTags: string = item && item.tags ? item?.tags.join(', ') : '';
  const joinedTitles: string =
    item && item.titles ? item?.titles.join(', ') : '';
  const joinedSocials: string =
    item && item.socials ? item?.socials.join(', ') : '';

  // Ensure default values are never undefined
  const form = useForm<z.infer<typeof addPortfolioFormSchema>>({
    resolver: zodResolver(addPortfolioFormSchema),
    defaultValues: {
      name: item?.name || '',
      link: item?.link || '',
      tags: joinedTags || '',
      titles: joinedTitles || '',
      socials: joinedSocials || '',
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  async function onSubmit(values: z.infer<typeof addPortfolioFormSchema>) {
    const formattedTags = values.tags.split(',').map((item) => item.trim());
    const formattedTitles = values.titles.split(',').map((item) => item.trim());
    const formattedSocials = values.socials
      .split(',')
      .map((item) => item.trim());

    // Update the submission if it exists
    if (item?._id) {
      await updateSubmission({
        submissionId: item._id,
        name: values.name,
        link: values.link,
        status: 'completed',
      });
    }

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
      tags: formattedTags,
      titles: formattedTitles,
      socials: formattedSocials,
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
          <div
            {...getRootProps()}
            className={cn(
              isDragActive ? 'border-white' : '',
              'h-36  rounded-md border border-dashed items-center justify-center flex flex-col gap-2',
            )}
          >
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
              {...getInputProps()}
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
          name="titles"
          render={({ field }) => (
            <FormItem className="flex flex-row gap-2 items-center">
              <FormLabel className="w-20">Titles</FormLabel>
              <FormControl>
                <Input placeholder="Developer, Designer" {...field} />
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
                <Input placeholder="Light, Dark" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="socials"
          render={({ field }) => (
            <FormItem className="flex flex-row gap-2 items-center">
              <FormLabel className="w-20">Socials</FormLabel>
              <FormControl>
                <Textarea placeholder="https://www.example.com" {...field} />
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
