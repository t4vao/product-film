import type { SceneBuilder } from '../../../core/film'
import { arrive, caretOff, cardIn, stepBack, swap, typeText } from '../../../core/motion'
import { DUR } from '../../../core/taste'
import type { PropostaBeats } from '../storyboard'
import type { ExemploRefs } from '../ui'

// CENA 2 · A proposta, com a fonte
// Parte de: documento com o trecho selecionado. Termina em: proposta aceita.
// Ordem que nao muda: a proposta chega, a FONTE aparece, so entao o humano decide.

export const proposta: SceneBuilder<ExemploRefs, PropostaBeats> = (tl, { beats: b }, { refs, cursor }) => {
  const r = refs.proposta
  stepBack(tl, refs.abertura, r, b.cardIn)
  cardIn(tl, r, b.cardIn)

  const typed = typeText(tl, r.text, r.caret, r.full, b.typeFrom)
  caretOff(tl, r.caret, typed + 0.3)
  arrive(tl, r.source, b.sourceIn)

  const p = cursor.point(r.accept)
  cursor.place(tl, { x: p.x - 160, y: p.y + 120 }, b.pointerIn - 0.3)
  cursor.show(tl, b.pointerIn)
  cursor.moveTo(tl, r.accept, b.pointerIn + 0.1, b.clickAccept - b.pointerIn - 0.2)
  cursor.click(tl, b.clickAccept, r.accept)
  swap(tl, r.accept, r.accepted, b.clickAccept + DUR.press)
  cursor.hide(tl, b.clickAccept + 0.7)
}
