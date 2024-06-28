import React from 'react';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Favorites',
};

export default async function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
