import React from 'react';

import MaxWidthWrapper from '@/components/max-width-wrapper';
import { SendEventOnLoad } from '@/components/send-event-on-load';

import Content from './_components/content';
import Hero from './_components/hero';

export default function Home() {
  return (
    <>
      <div className="fixed left-0 top-0 -z-10 h-full w-full">
        <div
          className="absolute top-0 z-[-2] h-screen w-screen 
  bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] 
  dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(0,0,0,0))]
  light:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.3),rgba(240,240,240,0))]"
        ></div>
      </div>
      <SendEventOnLoad eventKey="User hit home page" />
      <MaxWidthWrapper>
        <>
          <div className="flex flex-col items-center justify-center text-center pt-6 sm:pt-0">
            <div className="w-full flex flex-col gap-6 mb-8">
              <div className="absolute inset-0 -z-10 h-full w-full bg-[size:6rem_4rem]">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(ellipse_600px_500px_at_50%_200px,rgba(200,200,220,0.3),transparent)] dark:bg-[radial-gradient(ellipse_600px_500px_at_50%_200px,rgba(43,43,59,0.8),transparent)]"></div>
              </div>
              <Hero />
              <Content />
            </div>
          </div>
        </>
      </MaxWidthWrapper>
    </>
  );
}
