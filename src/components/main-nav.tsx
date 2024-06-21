'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

export default function MainNav() {
  return (
    <Link href="/" className="font-semibold text-lg gap-2 flex items-center">
      <Image
        src={'/logo-white.png'}
        alt="PortfoliosHub"
        width={32}
        height={32}
      />
      <span className="flex flex-row leading-[18px]">
        <span>
          Portfolios<span className="text-emerald-500">Hub</span>
        </span>
      </span>
    </Link>
  );
}
