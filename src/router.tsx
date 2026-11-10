import { createRouter } from '@tanstack/react-router';
import { Route as rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as casaRoute } from './routes/casas.$id';
import { Route as terrenoRoute } from './routes/terrenos.$id';

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, casaRoute, terrenoRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
