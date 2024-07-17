import React from 'react';

import {
  Github,
  Instagram,
  Linkedin,
  Twitch,
  Twitter,
  Youtube,
} from 'lucide-react';

export default function SocialIcon({ url }: { url: string }) {
  if (url.includes('x.com') || url.includes('twitter.com'))
    return <Twitter size={20} />;
  if (url.includes('github.com')) return <Github size={20} />;
  if (url.includes('instagram.com')) return <Instagram size={20} />;
  if (url.includes('linkedin.com')) return <Linkedin size={20} />;
  if (url.includes('twitch.tv')) return <Twitch size={20} />;
  if (url.includes('youtube.com')) return <Youtube size={20} />;
  return null;
}
