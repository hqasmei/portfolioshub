'use client';

import React, { useEffect, useState } from 'react';

import { ChevronUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Toggle visibility based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 md:bottom-12 md:right-12 z-50 bg-foreground text-background font-medium h-10 w-10  items-center justify-center flex rounded-full shadow transition ease-in-out duration-300"
    >
      <ChevronUp className='stroke-[2.25px] mb-0.5' size={24} />
    </button>
  );
}
