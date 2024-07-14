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
    <Card className="w-full rounded-xl shadow-sm hover:shadow-xl relative border-t-0 group sm:dark:hover:border-muted-foreground duration-200 transition-all">
      <div className="relative">
        <Link href={template.link} target="_blank">
          <div>
            <div className="overflow-hidden rounded-xl border-t sm:dark:group-hover:border-muted-foreground duration-200 transition-all">
              <Image
                src={imageUrl}
                alt={template.name}
                width={400}
                height={200}
                priority
                className="object-cover h-56 object-top w-full rounded-xl"
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

            <span className="text-muted-foreground text-sm">
              {template.description}
            </span>

            {template.tags && template.tags.length > 0 && (
              <div className="flex gap-2 pt-2">
                {template.tags &&
                  !template.tags.includes('') &&
                  template.tags.map((tag, idx) => (
                    <Badge variant="secondary" key={idx}>
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
    <MaxWidthWrapper>
      <span className="text-2xl md:text-4xl font-bold">Templates</span>
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
