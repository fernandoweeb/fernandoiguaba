import { useEffect, useState } from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    setTheme(nextTheme);
    try {
      localStorage.setItem('site-theme', nextTheme);
    } catch {
      // Mantém a alternância funcionando quando o armazenamento está bloqueado.
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Modo noturno"
        aria-pressed={theme === 'dark'}
        title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo noturno'}
        className="fixed right-4 top-4 z-50 flex min-h-11 items-center justify-center gap-2 rounded-full border border-foreground/30 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-6 sm:top-6"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 shrink-0"
        >
          {theme === 'dark' ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </>
          ) : (
            <path d="M20.9 13.1A9 9 0 0 1 10.9 3.1a9 9 0 1 0 10 10Z" />
          )}
        </svg>
        {theme === 'dark' ? 'Modo claro' : 'Modo noturno'}
      </button>
      <Outlet />
    </div>
  );
}
