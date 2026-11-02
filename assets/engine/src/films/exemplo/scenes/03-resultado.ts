import type { SceneBuilder } from '../../../core/film'
import { cardIn, stepBack, wash } from '../../../core/motion'
import type { ResultadoBeats } from '../storyboard'
import type { ExemploRefs } from '../ui'

// CENA 3 · Resultado
// Parte de: proposta aceita. Termina em: documento com o trecho novo e a fonte no pe.
// O lavado mostra o que entrou e desbota; a fonte continua visivel.

export const resultado: SceneBuilder<ExemploRefs, ResultadoBeats> = (tl, { beats: b }, { refs }) => {
  const r = refs.resultado
  stepBack(tl, refs.proposta, r, b.cardIn)
  cardIn(tl, r, b.cardIn)
  wash(tl, r.washed, 'rgba(47, 91, 211, 0.18)', b.wash)
}
