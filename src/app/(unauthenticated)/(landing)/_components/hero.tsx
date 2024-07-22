'use client';

import React from 'react';

import Link from 'next/link';

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';

export default function Hero() {
  const portfolios = useQuery(api.portfolios.getAllPortfolios);
  const numberOfPortfolios = portfolios?.length;

  return (
    <>
      <div className="flex w-full items-center justify-center sm:mt-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-emerald-600 rounded-full blur-sm group-hover:blur transition-all duration-300"></div>
          <Link
            href="/templates"
            className="relative px-4 py-1 bg-white dark:bg-black border border-emerald-500 rounded-full inline-flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-200"
          >
            <span className="text-sm font-medium">
              Introducing Portfolio Templates
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-6 sm:gap-y-7">
        <h1 className="text-pretty text-neutral-900 dark:text-white lg:text-6xl lg:-tracking-4 lg:leading-[4rem] lg:font-extrabold text-4xl md:text-5xl -tracking-3 font-bold max-w-3xl text-center">
          Discover{' '}
          <span className="relative inline-block">
            portfolios
            <svg
              className="absolute -bottom-1 w-full h-3 left-0"
              viewBox="0 0 200 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 7.5C31 3.5 61 3.5 91 3.5C121 3.5 151 3.5 181 7.5"
                stroke="url(#paint0_linear)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear"
                  x1="1"
                  y1="5"
                  x2="181"
                  y2="5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#34d399" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </span>{' '}
          to inspire your creativity
        </h1>
      </div>
      <p className="text-neutral-700 dark:text-neutral-300 mx-auto block text-balance max-w-sm text-center text-base md:max-w-3xl md:text-lg xl:text-xl">
        Browse our curated collection of{' '}
        {numberOfPortfolios && (
          <span className="text-foreground font-semibold">
            {numberOfPortfolios}+
          </span>
        )}{' '}
        exceptional designs to help you create your best portfolio yet.
      </p>
    </>
  );
}
