'use client';

import React from 'react';

import { usePathname } from 'next/navigation';

import MainNav from '@/components/main-nav';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import { ThemeToggle } from '@/components/theme-toggle';
import { CONFIG } from '@/config';

const FooterLinkSection = ({
  title,
  links,
}: {
  title: string;
  links: Array<{
    href: string;
    label: string;
    isMailto?: boolean;
    feedbackTrigger?: boolean;
  }>;
}) => (
  <div>
    <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
      {title}
    </h3>
    <div className="mt-4 space-y-4 flex flex-col">
      {links.map((link, index) => (
        <a
          key={index}
          className="text-sm text-neutral-500 hover:text-neutral-900 duration-200 dark:text-neutral-400 dark:hover:text-neutral-200"
          href={link.isMailto ? `mailto:${link.href}` : link.href}
        >
          {link.label}
        </a>
      ))}
    </div>
  </div>
);

export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const linkSections = [
    {
      title: 'Product',
      links: [
        {
          href: 'https://portfolioshub.com/changelog',
          label: 'Changelog',
        },
        {
          href: 'https://portfolioshub.com/roadmap',
          label: 'Roadmap',
        },
      ],
    },
    {
      title: 'Legal',
      links: [
        { href: '/terms-of-service', label: 'Terms of Service' },
        { href: '/privacy-policy', label: 'Privacy Policy' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: 'https://projectplannerai.com/', label: 'ProjectPlannerAI' },
        { href: 'https://techstackfinder.com/', label: 'TechStackFinder' },
        { href: 'https://icongeneratorai.com/', label: 'IconGeneratorAI' },
      ],
    },
  ];

  return (
    <>
      {isHome && (
        <footer className="z-10 border-t border-neutral-200 bg-white/50 dark:bg-transparent dark:border-neutral-800 py-8 backdrop-blur-lg w-full flex flex-1 flex-col relative">
          <MaxWidthWrapper>
            <div className="mx-auto w-full">
              <div className="xl:grid xl:grid-cols-5 xl:gap-8">
                <div className="space-y-8 xl:col-span-2">
                  <div className="flex">
                    <MainNav />
                  </div>

                  <p className="max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
                    {CONFIG.description}
                  </p>
                </div>
                <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 xl:col-span-3 xl:mt-0">
                  {linkSections.map((section, index) => (
                    <FooterLinkSection key={index} {...section} />
                  ))}
                </div>
              </div>
              <div className="mt-16 flex flex-col-reverse md:flex-row md:justify-between items-center border-t border-neutral-900/10 dark:border-neutral-800 pt-4 md:pt-8 sm:mt-20 lg:mt-24">
                <p className="text-sm leading-5 text-neutral-500 dark:text-neutral-400 w-full text-left mt-4 md:mt-0">
                  Copyright @ 2024 {CONFIG.name}. All Rights Reserved.
                </p>
                <div className="w-full justify-start flex md:justify-end">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </MaxWidthWrapper>
        </footer>
      )}
    </>
  );
}
