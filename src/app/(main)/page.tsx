'use client';

import React from 'react';

import MainContent from '@/components/main-content'; 
import MaxWidthWrapper from '@/components/max-width-wrapper';
import { SendEventOnLoad } from '@/components/send-event-on-load'; 
import Hero from './_components/hero';

export default function Home() {
  return (
    <>
      <SendEventOnLoad eventKey="User hit home page" />
      <MaxWidthWrapper>
        <Hero />
        <MainContent  />
      </MaxWidthWrapper>
    </>
  );
}
