import type { SceneBuilder } from '../../../core/film'
import { EASE } from '../../../core/taste'
import type { MarcaBeats } from '../storyboard'
import type { ExemploRefs } from '../ui'

// CENA 4 · Assinatura
// Parte de: qualquer cartao na tela. Termina em: marca e frase, quadro parado.
// Sem logo voando, sem revelacao: o ultimo cartao apaga, a marca acende.

export const marca: SceneBuilder<ExemploRefs, MarcaBeats> = (tl, { beats: b }, { refs }) => {
  tl.to(refs.resultado.slot, { autoAlpha: 0, duration: 0.45, ease: EASE.settle }, b.out)
  tl.to(refs.marca.root, { autoAlpha: 1, duration: 0.6, ease: EASE.enter }, b.brandIn)
  tl.to(refs.marca.line, { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE.enter }, b.brandIn + 0.3)
}
