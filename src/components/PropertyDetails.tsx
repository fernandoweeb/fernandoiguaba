import { Link } from '@tanstack/react-router';
import { areaLabel, imagesFor, lotTitle, priceLabel, statusLabel, useCatalog } from '../lib/catalog';
import { PropertyImage } from './PropertyImage';

export function PropertyDetails({ id, kind }: { id: string; kind: 'casa' | 'terreno' }) {
  const { catalog, loading, error, retry } = useCatalog();
  const casa = kind === 'casa' ? catalog?.casas.find((item) => item.id === id) : undefined;
  const lote = kind === 'terreno' ? catalog?.lotes.find((item) => item.id === id) : undefined;
  const loteamento = lote ? catalog?.loteamentos.find((item) => item.id === lote.loteamento_id) : undefined;
  const property = casa ?? (loteamento ? lote : undefined);
  const title = casa?.titulo ?? (lote ? lotTitle(lote) : 'Imóvel');
  const location = casa ?? loteamento;
  const images = catalog && casa
    ? imagesFor(casa.capa_url, catalog.casaFotos.filter((foto) => foto.casa_id === casa.id))
    : catalog && loteamento
      ? imagesFor(loteamento.capa_url, catalog.loteamentoFotos.filter((foto) => foto.loteamento_id === loteamento.id))
      : [];
  const details: [string, string][] = casa ? [
    ['Área construída', areaLabel(casa.area_construida)],
    ['Área do terreno', areaLabel(casa.area_terreno)],
    ['Quartos', String(casa.quartos)],
    ['Suítes', String(casa.suites)],
    ['Banheiros', String(casa.banheiros)],
    ['Vagas', String(casa.vagas)],
  ] : lote ? [
    ['Área do terreno', areaLabel(lote.metragem)],
    ['Quadra', lote.quadra || 'Não informada'],
    ['Número', lote.numero || 'Não informado'],
    ['Frente', lote.frente === null ? 'Não informada' : `${lote.frente} m`],
    ['Fundos', lote.fundos === null ? 'Não informados' : `${lote.fundos} m`],
  ] : [];

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-28 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-foreground/25 px-5 text-sm font-semibold hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">← Voltar aos imóveis</Link>
        {loading ? (
          <div role="status" className="flex min-h-96 items-center justify-center rounded-3xl bg-foreground/5 p-8 text-center">Carregando detalhes…</div>
        ) : error ? (
          <div role="alert" className="flex min-h-96 flex-col items-center justify-center gap-5 rounded-3xl border border-foreground/15 p-8 text-center">
            <h1 className="text-2xl font-bold">Não foi possível carregar os detalhes</h1>
            <button type="button" onClick={retry} className="min-h-12 rounded-full bg-foreground px-6 py-3 font-semibold text-background hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background">Tentar novamente</button>
          </div>
        ) : !property ? (
          <div className="flex min-h-96 flex-col items-center justify-center gap-3 rounded-3xl bg-foreground/5 p-8 text-center">
            <h1 className="text-3xl font-bold">Imóvel não encontrado</h1>
            <p className="text-foreground/70">Este imóvel não está publicado ou não está disponível para consulta.</p>
          </div>
        ) : (
          <article>
            <header className="mb-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground/60">{kind === 'casa' ? 'Casa' : 'Terreno'} · {statusLabel(property.status)}</p>
              <h1 className="break-words text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              {loteamento && <p className="mt-3 text-xl font-semibold">{loteamento.nome}</p>}
              <p className="mt-2 text-foreground/70">{[location?.bairro, location?.municipio].filter(Boolean).join(' · ')}</p>
              <p className="mt-5 text-2xl font-bold">{priceLabel(property.preco)}</p>
            </header>
            <div className="h-72 overflow-hidden rounded-3xl border border-foreground/15 sm:h-[30rem]">
              <PropertyImage key={`${kind}-${id}`} images={images} alt={loteamento ? `Foto do loteamento ${loteamento.nome}` : title} />
            </div>
            {loteamento && <p className="mt-3 text-sm text-foreground/60">As imagens são do loteamento correspondente ao terreno.</p>}
            <section aria-labelledby="property-features" className="mt-10">
              <h2 id="property-features" className="mb-5 text-2xl font-bold">Características</h2>
              <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {details.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-foreground/15 bg-foreground/5 p-5">
                    <dt className="text-sm text-foreground/60">{label}</dt>
                    <dd className="mt-2 break-words text-xl font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            {(casa?.descricao || loteamento?.descricao) && (
              <section className="mt-10">
                <h2 className="mb-4 text-2xl font-bold">{casa ? 'Sobre a casa' : 'Sobre o loteamento'}</h2>
                <p className="whitespace-pre-line leading-relaxed text-foreground/80">{casa?.descricao ?? loteamento?.descricao}</p>
              </section>
            )}
            {loteamento?.endereco && (
              <section className="mt-8">
                <h2 className="mb-3 text-2xl font-bold">Endereço do loteamento</h2>
                <p className="text-foreground/80">{loteamento.endereco}</p>
              </section>
            )}
            {casa && casa.lazer.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-2xl font-bold">Lazer</h2>
                <ul className="flex flex-wrap gap-3">
                  {casa.lazer.map((item, index) => <li key={`${item}-${index}`} className="rounded-full border border-foreground/20 px-4 py-2 text-sm">{item}</li>)}
                </ul>
              </section>
            )}
            {images.length > 1 && (
              <section className="mt-10">
                <h2 className="mb-5 text-2xl font-bold">{casa ? 'Fotos da casa' : 'Fotos do loteamento'}</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  {images.slice(1).map((image) => (
                    <figure key={image.url} className="overflow-hidden rounded-2xl border border-foreground/15">
                      <div className="h-64"><PropertyImage images={[image]} alt={loteamento ? `Foto do loteamento ${loteamento.nome}` : title} /></div>
                      {image.legenda && <figcaption className="p-4 text-sm text-foreground/70">{image.legenda}</figcaption>}
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </div>
    </main>
  );
}
