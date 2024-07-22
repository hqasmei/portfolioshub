'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { getImageUrl } from '@/lib/get-image-url';
import { useQuery } from 'convex/react';

function TemplateCard({ template }: { template: Doc<'templates'> }) {
  const imageUrl = getImageUrl(template.image);

  return (
    <Card className="w-full rounded-xl shadow-sm hover:shadow-xl relative border-t-0">
      <div className="relative">
        <Link href={template.link} target="_blank">
          <div>
            <div className="overflow-hidden rounded-t-xl border-t ">
              <Image
                src={imageUrl}
                alt={template.name}
                width={400}
                height={200}
                priority
                className="object-cover h-80 object-top w-full border-b"
              />
            </div>
          </div>
          <div className="p-4 text-start">
            <div className="flex flex-row justify-between items-center">
              <h3 className="text-xl font-bold">{template.name}</h3>
              {template.isPaid ? (
                <Badge className="text-foreground dark:bg-yellow-700 dark:border-yellow-300">
                  Paid
                </Badge>
              ) : (
                <Badge className="text-foreground dark:bg-green-700 dark:border-green-300">
                  Free
                </Badge>
              )}
            </div>

            <span className="text-muted-foreground text-sm line-clamp-2">
              {template.description}
            </span>

            {template.technology && template.technology.length > 0 && (
              <div className="flex gap-2 pt-2 flex-wrap">
                {template.technology &&
                  !template.technology.includes('') &&
                  template.technology.map((tag, idx) => (
                    <Badge
                      variant="secondary"
                      key={idx}
                      className="whitespace-nowrap"
                    >
                      {tag}
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        </Link>
      </div>
    </Card>
  );
}

export default function TemplatesPage() {
  const getAllTemplates = useQuery(api.templates.getAllTemplates);
  return (
    <MaxWidthWrapper className="pt-4">
      <div className='flex gap-2 flex-col'>
        <h1 className="text-3xl md:text-4xl font-bold">Portfolio Templates</h1>
        <p className='text-muted-foreground'>Here are some templates that you can use to get started, both paid and free.</p>
      </div>
      <div className="pb-6 pt-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {getAllTemplates?.map((template) => (
            <TemplateCard key={template._id} template={template} />
          ))}
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
