'use client';

export function Footer() {
  return (
    <footer className="items-center flex  justify-center gap-1 h-16 container">
      <div className="flex w-full flex-col items-center justify-between gap-5 border-t border-gray-900/5 py-8 sm:flex-row dark:border-white/5">
        <p className="text-xs text-muted-foreground ">
          © {new Date().getFullYear()} PortfoliosHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
