import { useEffect, useState } from 'react';
import { getSupabase } from './supabase';

export type Casa = {
  id: string;
  titulo: string;
  descricao: string;
  municipio: string;
  bairro: string;
  area_construida: number;
  area_terreno: number;
  quartos: number;
  suites: number;
  banheiros: number;
  vagas: number;
  lazer: string[];
  preco: number | null;
  capa_url: string | null;
  status: string;
};

export type Loteamento = {
  id: string;
  nome: string;
  municipio: string;
  bairro: string;
  endereco: string;
  descricao: string;
  capa_url: string | null;
};

export type Lote = {
  id: string;
  loteamento_id: string;
  quadra: string;
  numero: string;
  metragem: number;
  frente: number | null;
  fundos: number | null;
  preco: number | null;
  status: string;
};

export type Foto = { url: string; legenda: string };
type CasaFoto = Foto & { casa_id: string };
type LoteamentoFoto = Foto & { loteamento_id: string };

export type Catalog = {
  casas: Casa[];
  loteamentos: Loteamento[];
  lotes: Lote[];
  casaFotos: CasaFoto[];
  loteamentoFotos: LoteamentoFoto[];
};

async function loadCatalog(): Promise<Catalog> {
  const supabase = getSupabase();
  const [casasResult, loteamentosResult] = await Promise.all([
    supabase.from('casas')
      .select('id,titulo,descricao,municipio,bairro,area_construida,area_terreno,quartos,suites,banheiros,vagas,lazer,preco,capa_url,status')
      .eq('publicado', true).order('created_at', { ascending: false }),
    supabase.from('loteamentos')
      .select('id,nome,municipio,bairro,endereco,descricao,capa_url')
      .eq('publicado', true).order('created_at', { ascending: false }),
  ]);

  if (casasResult.error) throw casasResult.error;
  if (loteamentosResult.error) throw loteamentosResult.error;

  const casas = (casasResult.data ?? []) as Casa[];
  const loteamentos = (loteamentosResult.data ?? []) as Loteamento[];
  const casaIds = casas.map((casa) => casa.id);
  const loteamentoIds = loteamentos.map((loteamento) => loteamento.id);

  const [fotosResult, loteFotosResult, lotesResult] = await Promise.all([
    casaIds.length
      ? supabase.from('casa_fotos').select('casa_id,url,legenda')
          .in('casa_id', casaIds).order('created_at', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    loteamentoIds.length
      ? supabase.from('loteamento_fotos').select('loteamento_id,url,legenda')
          .in('loteamento_id', loteamentoIds).order('created_at', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    loteamentoIds.length
      ? supabase.from('lotes')
          .select('id,loteamento_id,quadra,numero,metragem,frente,fundos,preco,status')
          .in('loteamento_id', loteamentoIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (fotosResult.error) throw fotosResult.error;
  if (loteFotosResult.error) throw loteFotosResult.error;
  if (lotesResult.error) throw lotesResult.error;

  return {
    casas,
    loteamentos,
    lotes: (lotesResult.data ?? []) as Lote[],
    casaFotos: (fotosResult.data ?? []) as CasaFoto[],
    loteamentoFotos: (loteFotosResult.data ?? []) as LoteamentoFoto[],
  };
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    loadCatalog()
      .then((data) => { if (active) setCatalog(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);

  return { catalog, loading, error, retry: () => setAttempt((value) => value + 1) };
}

export function imagesFor(capa: string | null, fotos: Foto[]): Foto[] {
  const images = capa?.trim() ? [{ url: capa, legenda: '' }, ...fotos] : fotos;
  return images.filter((foto, index) =>
    foto.url.trim() && images.findIndex((item) => item.url === foto.url) === index,
  );
}

export function priceLabel(preco: number | null) {
  return preco === null ? 'Preço sob consulta' : new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  }).format(preco);
}

export function areaLabel(area: number) {
  return `${new Intl.NumberFormat('pt-BR').format(area)} m²`;
}

export function lotTitle(lote: Lote) {
  return [lote.numero ? `Terreno ${lote.numero}` : 'Terreno', lote.quadra ? `Quadra ${lote.quadra}` : '']
    .filter(Boolean).join(' · ');
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    disponivel: 'Disponível', reservado: 'Reservado', vendido: 'Vendido',
  };
  return labels[status] ?? status;
}
