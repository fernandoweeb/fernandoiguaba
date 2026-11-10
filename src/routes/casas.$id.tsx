import { createRoute } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { PropertyDetails } from '../components/PropertyDetails';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/casas/$id',
  component: CasaPage,
});

function CasaPage() {
  const { id } = Route.useParams();
  return <PropertyDetails id={id} kind="casa" />;
}
