import { useState } from 'react';
import { createRoute, Link } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { areaLabel, imagesFor, lotTitle, priceLabel, statusLabel, useCatalog, type Foto } from '../lib/catalog';
import { PropertyImage } from '../components/PropertyImage';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

type Slide = {
  id: string;
  kind: 'casa' | 'terreno';
  title: string;
  location: string;
  subtitle: string;
  price: number | null;
  status: string;
  images: Foto[];
};

const buttonClass = 'inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function Home() {
  const { catalog, loading, error, retry } = useCatalog();
  const [index, setIndex] = useState(0);
  const slides: Slide[] = [];

  if (catalog) {
    for (const casa of catalog.casas) {
      slides.push({
        id: casa.id,
        kind: 'casa',
        title: casa.titulo,
        location: [casa.bairro, casa.municipio].filter(Boolean).join(' · '),
        subtitle: `${areaLabel(casa.area_construida)} construídos · ${casa.quartos} quartos · ${casa.vagas} vagas`,
        price: casa.preco,
        status: casa.status,
        images: imagesFor(casa.capa_url, catalog.casaFotos.filter((foto) => foto.casa_id === casa.id)),
      });
    }
    for (const lote of catalog.lotes) {
      const loteamento = catalog.loteamentos.find((item) => item.id === lote.loteamento_id);
      if (!loteamento) continue;
      slides.push({
        id: lote.id,
        kind: 'terreno',
        title: lotTitle(lote),
        location: [loteamento.nome, loteamento.bairro, loteamento.municipio].filter(Boolean).join(' · '),
        subtitle: `${areaLabel(lote.metragem)} de terreno`,
        price: lote.preco,
        status: lote.status,
        images: imagesFor(loteamento.capa_url, catalog.loteamentoFotos.filter((foto) => foto.loteamento_id === loteamento.id)),
      });
    }
  }

  const currentIndex = slides.length ? index % slides.length : 0;
  const slide = slides[currentIndex];

  function move(direction: number) {
    if (slides.length > 1) {
      setIndex((current) => (current + direction + slides.length) % slides.length);
    }
  }

  return (
    <main id="imoveis" className="min-h-screen bg-background px-4 pb-12 pt-10 text-foreground sm:px-8 sm:pt-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60">Casas e terrenos</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Encontre seu próximo endereço</h1>
          <p className="mt-4 text-lg text-foreground/70">Explore os imóveis cadastrados e conheça cada detalhe.</p>
        </header>

        {loading ? (
          <div role="status" className="flex min-h-96 items-center justify-center rounded-3xl border border-foreground/15 bg-foreground/5 p-8 text-center">
            Carregando imóveis…
          </div>
        ) : error ? (
          <div role="alert" className="flex min-h-96 flex-col items-center justify-center gap-5 rounded-3xl border border-foreground/15 p-8 text-center">
            <h2 className="text-2xl font-bold">Não foi possível carregar os imóveis</h2>
            <p className="text-foreground/70">Tente novamente para consultar os imóveis cadastrados.</p>
            <button type="button" onClick={retry} className={buttonClass}>Tentar novamente</button>
          </div>
        ) : !slide ? (
          <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-3xl border border-foreground/15 bg-foreground/5 p-8 text-center">
            <h2 className="text-2xl font-bold">Novidades em breve</h2>
            <p className="text-foreground/70">Ainda não há casas ou terrenos publicados para exibir.</p>
          </div>
        ) : (
          <section
            aria-label="Imóveis em destaque"
            aria-roledescription="carrossel"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                move(event.key === 'ArrowLeft' ? -1 : 1);
              }
            }}
            className="rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <article
              aria-roledescription="slide"
              aria-label={`${currentIndex + 1} de ${slides.length}`}
              className="grid overflow-hidden rounded-3xl border border-foreground/15 bg-background shadow-sm lg:grid-cols-[1.3fr_1fr]"
            >
              <div className="relative h-72 sm:h-96 lg:h-[32rem]">
                <PropertyImage key={`${slide.kind}-${slide.id}`} images={slide.images} alt={slide.kind === 'terreno' ? `Loteamento de ${slide.title}: ${slide.location}` : slide.title} />
                <span className="absolute left-5 top-5 rounded-full bg-background px-4 py-2 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm">
                  {slide.kind === 'casa' ? 'Casa' : 'Terreno'}
                </span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10" aria-live="polite" aria-atomic="true">
                <p className="mb-4 text-sm font-semibold text-foreground/60">{statusLabel(slide.status)}</p>
                <h2 className="break-words text-3xl font-bold tracking-tight sm:text-4xl">{slide.title}</h2>
                {slide.location && <p className="mt-3 text-base text-foreground/70">{slide.location}</p>}
                <p className="mt-6 border-t border-foreground/15 pt-6 text-sm text-foreground/80">{slide.subtitle}</p>
                <p className="mb-7 mt-4 text-2xl font-bold">{priceLabel(slide.price)}</p>
                <div>
                  {slide.kind === 'casa' ? (
                    <Link to="/casas/$id" params={{ id: slide.id }} className={buttonClass}>Ver detalhes da casa <span aria-hidden="true" className="ml-3">→</span></Link>
                  ) : (
                    <Link to="/terrenos/$id" params={{ id: slide.id }} className={buttonClass}>Ver detalhes do terreno <span aria-hidden="true" className="ml-3">→</span></Link>
                  )}
                </div>
              </div>
            </article>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm text-foreground/70">{currentIndex + 1} de {slides.length} imóveis</p>
              <div className="flex gap-3">
                <button type="button" aria-label="Imóvel anterior" onClick={() => move(-1)} disabled={slides.length < 2} className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/30 text-xl transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:opacity-30">←</button>
                <button type="button" aria-label="Próximo imóvel" onClick={() => move(1)} disabled={slides.length < 2} className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/30 text-xl transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:cursor-not-allowed disabled:opacity-30">→</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
