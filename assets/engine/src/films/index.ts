import type { FilmModule } from '../core/master'

// Registro de filmes. Um filme novo e uma pasta em src/films/<id> com um index.ts
// que exporta `film` e `camera`, mais uma linha aqui.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FILMS: Record<string, () => Promise<FilmModule<any>>> = {
  exemplo: () => import('./exemplo'),
}

/** Filme que abre quando a URL nao tem ?film=. */
export const DEFAULT_FILM = 'exemplo'
