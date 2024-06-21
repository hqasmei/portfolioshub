'use client';

import Link from 'next/link';

import { CONFIG } from '@/config';

export function Footer() {
  return (
    <footer className="items-center flex  justify-center gap-1 h-16">
      Made with ❤️ by{' '}
      <Link
        href={CONFIG.twitter}
        className="font-semibold hover:underline duration-200"
        target="_blank"
      >
        Hosna Qasmei
      </Link>
    </footer>
  );
}
