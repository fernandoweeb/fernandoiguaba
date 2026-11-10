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
      <header className="border-b border-foreground/10 bg-background">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <a href="/" className="shrink-0 text-base font-bold tracking-tight sm:text-lg">
            Fernando Iguaba
          </a>

          <div className="flex items-center gap-3 sm:gap-6">
            <nav aria-label="Menu principal" className="flex items-center gap-3 text-sm font-medium sm:gap-6">
              <a href="/" className="rounded-md py-2 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
                Início
              </a>
              <a href="/#imoveis" className="rounded-md py-2 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
                Imóveis
              </a>
            </nav>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ativar tema diurno' : 'Ativar tema noturno'}
              aria-pressed={theme === 'dark'}
              title={theme === 'dark' ? 'Ativar tema diurno' : 'Ativar tema noturno'}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-foreground/30 bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4"
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
              <span className="hidden sm:inline">{theme === 'dark' ? 'Modo diurno' : 'Modo noturno'}</span>
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
