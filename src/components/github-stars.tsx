import React from 'react';

import Link from 'next/link';

import AnimatedGradientText from '@/components/animated-gradient-text';
import { CONFIG } from '@/config';
import { ChevronRight, Star } from 'lucide-react';

async function getGitHubStars() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/hqasmei/portfolioshub',
      {
        next: {
          revalidate: 60,
        },
      },
    );
    if (!response?.ok) {
      return null;
    }
    const json = await response.json();
    const stars = parseInt(json.stargazers_count).toLocaleString();
    return stars;
  } catch {
    return null;
  }
}

export default async function GithubStars() {
  const stars = await getGitHubStars();

  return (
    <Link href={CONFIG.github} target="_blank" className="group">
      <AnimatedGradientText>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-foreground" />
            <span>{stars}</span>
          </div>
          <div className="shrink-0 bg-border w-px h-4"></div>
          <span>Star us on Github</span>
          <ChevronRight
            size={18}
            className="group-hover:translate-x-1 duration-200 transition-all"
          />
        </div>
      </AnimatedGradientText>
    </Link>
  );
}
