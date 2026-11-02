import gsap from 'gsap'
import { Check } from 'lucide'
import { h, icon } from '../../core/dom'
import type { Stage } from '../../core/film'
import { slotInitial, type Slot } from '../../core/motion'
import { checkCaption } from '../../core/taste'
import { BRAND, DOC, NOTES, PROPOSAL } from './content'
import './film.css'

// Cenario: tudo que o filme mostra, montado uma vez e escondido. As cenas so animam.
// Ordem obrigatoria: montar o DOM -> medir o layout -> aplicar estados iniciais.
// Medir antes dos estados iniciais garante que nenhum transform de entrada entre
// nas contas.
//
// Num filme real, monte aqui a UI do produto com os tokens e rotulos dele. Se o
// produto ja tiver um mock fiel (demo da landing, fixture de design system), copie
// a estrutura e os valores de la e cite o arquivo no topo.

export interface ExemploRefs {
  abertura: Slot & { trecho: HTMLElement; markStart: HTMLElement; markEnd: HTMLElement }
  proposta: Slot & { text: HTMLElement; caret: HTMLElement; full: string; source: HTMLElement; accept: HTMLElement; accepted: HTMLElement }
  resultado: Slot & { washed: HTMLElement }
  marca: { root: HTMLElement; line: HTMLElement }
}

const header = (left: string, right: string) => h('div.fx-cabeca', null, h('span', null, left), h('span', null, right))

function slot(card: HTMLElement, note?: { label: string; note: string }): Slot {
  if (note) checkCaption(note.note, `legenda "${note.label}"`)
  const caption = note ? h('p.fx-legenda', null, h('strong', null, note.label), h('span', null, note.note)) : null
  return { slot: h('div.fx-slot', null, card, caption), card, caption }
}

export function mountExemplo(stage: Stage): ExemploRefs {
  const root = h('div.fx')
  stage.world.append(root)

  // Abertura: o documento, com o trecho que vai ser selecionado.
  const markStart = h('span.fx-marcador')
  const markEnd = h('span.fx-marcador')
  const trecho = h('span.fx-trecho', null, DOC.before)
  const abertura = {
    ...slot(h('div.fx-cartao', null,
      header(DOC.header, DOC.meta),
      h('p.fx-secao', null, DOC.section),
      h('p.fx-paragrafo', null, markStart, trecho, markEnd, ' ', DOC.tail),
    ), NOTES.abertura),
    trecho, markStart, markEnd,
  }

  // Proposta: texto digitado, fonte que entra, e a decisao.
  const text = h('span')
  const caret = h('span.fx-caret')
  const source = h('div.fx-fonte', null,
    h('span.fx-rotulo', null, PROPOSAL.source.label),
    h('strong', null, PROPOSAL.source.title),
    h('small', null, PROPOSAL.source.host))
  const accept = h('span.fx-botao.is-primario', null, PROPOSAL.accept)
  const accepted = h('span.fx-aceito', null, icon(Check, 22, 2.2), PROPOSAL.accepted)
  const proposta = {
    ...slot(h('div.fx-cartao', null,
      header(PROPOSAL.header, PROPOSAL.meta),
      h('p.fx-titulo', null, PROPOSAL.title),
      h('p.fx-proposta', null, text, caret),
      source,
      h('div.fx-acoes', null, h('span.fx-botao', null, PROPOSAL.discard), h('span.fx-troca', null, accept, accepted)),
    ), NOTES.proposta),
    text, caret, full: PROPOSAL.text, source, accept, accepted,
  }

  // Resultado: o documento com o trecho novo e a fonte no pe.
  const washed = h('span.fx-lavado', null, `${DOC.after} ${DOC.afterRef}`)
  const resultado = {
    ...slot(h('div.fx-cartao', null,
      header(DOC.header, PROPOSAL.accepted),
      h('p.fx-secao', null, DOC.section),
      h('p.fx-paragrafo', null, washed, ' ', DOC.tail),
      h('div.fx-meta', null, h('span.fx-rotulo', null, PROPOSAL.source.label), h('span', null, h('span.fx-quad'), PROPOSAL.source.title)),
    ), NOTES.resultado),
    washed,
  }

  const line = h('p', null, BRAND.line)
  const marcaRoot = h('div.fx-marca', null, h('strong', null, BRAND.wordmark), line)
  checkCaption(BRAND.line, 'linha da marca')

  root.append(abertura.slot, proposta.slot, resultado.slot, marcaRoot)

  // ---------- Medidas ----------
  for (const s of [abertura, proposta, resultado]) s.slot.style.top = `${Math.round((1080 - s.slot.offsetHeight) / 2)}px`

  // ---------- Estados iniciais ----------
  for (const s of [abertura, proposta, resultado]) {
    gsap.set(s.slot, slotInitial.slot)
    gsap.set(s.card, slotInitial.card)
  }
  gsap.set(caret, { autoAlpha: 0 })
  gsap.set(source, { autoAlpha: 0, y: 6 })
  gsap.set(accepted, { autoAlpha: 0 })
  gsap.set(washed, { backgroundColor: 'rgba(47, 91, 211, 0)', boxShadow: '0 0 0 3px rgba(47, 91, 211, 0)' })
  gsap.set(marcaRoot, { autoAlpha: 0 })
  gsap.set(line, { autoAlpha: 0, y: 8 })

  return { abertura, proposta, resultado, marca: { root: marcaRoot, line } }
}
