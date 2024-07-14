import React from 'react';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CustomMDX } from '@/components/mdx';
import { getLegal } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how we handle, store, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  const post = getLegal().find((post) => post.slug === 'privacy-policy');

  if (!post) {
    notFound();
  }

  return (
    <div className="pt-12 flex justify-center">
      <article className="prose max-w-2xl pb-10 w-full">
        <CustomMDX source={post.content} />
      </article>
    </div>
  );
}
