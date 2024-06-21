'use client';

import React, { useMemo } from 'react';

import { Dialog, DialogNavMenuContent } from '@/components/ui/dialog';
import useMediaQuery from '@/hooks/use-media-query';

export default function DialogNavMenu({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const { isMobile } = useMediaQuery();

  useMemo(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile, setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogNavMenuContent>{children}</DialogNavMenuContent>
    </Dialog>
  );
}
