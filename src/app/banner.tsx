import React from 'react';

import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

export default function Banner() {
  return (
    <Link
      target="_blank"
      href="https://projectplannerai.com/"
      className="flex flex-row items-center justify-center w-full h-12 tracking-tight text-white font-medium bg-emerald-600  text-center group text-balance text-sm sm:text-base"
    >
      🚀 Introducing ProjectPlannerAI - Simplify your project management and
      finally finish your projects{' '}
      <ChevronRight
        size={18}
        className="hidden md:block ml-1 group-hover:translate-x-1 transition-all duration-300"
      />
    </Link>
  );
}
