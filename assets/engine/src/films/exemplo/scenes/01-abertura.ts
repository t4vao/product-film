import type { SceneBuilder } from '../../../core/film'
import { cardIn, highlight } from '../../../core/motion'
import type { AberturaBeats } from '../storyboard'
import type { ExemploRefs } from '../ui'

// CENA 1 · Documento
// Parte de: quadro vazio. Termina em: documento com o trecho selecionado.
// Um gesto so: o ponteiro arrasta a selecao sobre o trecho.

export const abertura: SceneBuilder<ExemploRefs, AberturaBeats> = (tl, { beats: b }, { refs, cursor }) => {
  const r = refs.abertura
  cardIn(tl, r, b.cardIn)

  const start = cursor.point(r.markStart)
  cursor.place(tl, { x: start.x + 40, y: start.y + 70 }, 0)
  cursor.show(tl, b.pointerIn)
  cursor.moveTo(tl, r.markStart, b.pointerIn, b.selectFrom - b.pointerIn - 0.1)
  cursor.drag(tl, r.markEnd, b.selectFrom, b.selectFor)
  highlight(tl, r.trecho, b.selectFrom, b.selectFor)
  cursor.hide(tl, b.selectFrom + b.selectFor + 0.4)
}
