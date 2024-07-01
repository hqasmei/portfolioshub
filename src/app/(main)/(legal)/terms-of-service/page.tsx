import React from 'react';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CustomMDX } from '@/components/mdx';
import { getLegal } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'All the info you need to know about using our product and services.',
};
export default function TermsOfServicePage() {
  const post = getLegal().find((post) => post.slug === 'terms-of-service');

  if (!post) {
    notFound();
  }

  return (
    <div className="pt-12 flex justify-center w-full">
      <article className="prose max-w-2xl pb-10 w-full">
        <CustomMDX source={post.content} />
      </article>
    </div>
  );
}
