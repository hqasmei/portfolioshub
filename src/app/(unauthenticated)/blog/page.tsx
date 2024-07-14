'use client';

import React from 'react';

import MaxWidthWrapper from '@/components/max-width-wrapper';

export default function BlogPage() {
  return (
    <MaxWidthWrapper>
      <span className="text-2xl md:text-4xl font-bold">Blog</span>
      <div className="pb-6 pt-2 relative"></div>
    </MaxWidthWrapper>
  );
}
