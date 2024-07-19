import React from 'react';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import {
  Github,
  Instagram,
  Linkedin,
  Link as LinkIcon,
  Twitch,
  Twitter,
  Youtube,
} from 'lucide-react';

interface SocialIconProps {
  url: string;
  className?: string;
}

export default function SocialIcon({ url, className }: SocialIconProps) {
  if (!url) return null;
  const baseClass = 'stroke-muted-foreground';

  const getIcon = () => {
    const iconProps = { size: 18, strokeWidth: 2 };
    if (url.includes('x.com') || url.includes('twitter.com'))
      return <Twitter {...iconProps} />;
    if (url.includes('github.com')) return <Github {...iconProps} />;
    if (url.includes('instagram.com')) return <Instagram {...iconProps} />;
    if (url.includes('linkedin.com')) return <Linkedin {...iconProps} />;
    if (url.includes('twitch.tv')) return <Twitch {...iconProps} />;
    if (url.includes('youtube.com')) return <Youtube {...iconProps} />;
    // Default to a generic link icon if no specific match is found
    return <LinkIcon {...iconProps} />;
  };

  const icon = getIcon();

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(baseClass, className)}
    >
      {icon}
    </Link>
  );
}
