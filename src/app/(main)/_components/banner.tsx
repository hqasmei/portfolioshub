'use client';

import React from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Banner() {
  return (
    <div className="flex flex-col px-4 sm:flex-row gap-4 items-center justify-center w-full py-4  tracking-tight text-white font-medium bg-emerald-600 duration-200 transition-all  text-center group  text-lg">
      🚀
      <span className='font-light'>
        <span className="font-bold">Simple Project Management</span> for side
        projects and freelancers
      </span>
      <Button size="sm" asChild className="w-full sm:w-fit">
        <Link href="https://projectplannerai.com/" target="_blank">
          Try Now
        </Link>
      </Button>
    </div>
  );
}
