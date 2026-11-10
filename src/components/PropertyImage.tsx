import { useEffect, useState } from 'react';
import type { Foto } from '../lib/catalog';

export function PropertyImage({ images, alt }: { images: Foto[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const source = images.map((image) => image.url).join('|');

  useEffect(() => { setIndex(0); }, [source]);

  const image = images[index];
  return (
    <div className="flex h-full min-h-64 w-full items-center justify-center bg-foreground/5 text-foreground/60">
      {image ? (
        <img
          src={image.url}
          alt={image.legenda || alt}
          onError={() => setIndex((current) => current + 1)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="px-6 text-center text-sm">Foto indisponível</span>
      )}
    </div>
  );
}
