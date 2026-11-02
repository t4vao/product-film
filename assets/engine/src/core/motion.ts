import { DUR, EASE, STAGGER } from './taste'

// Kit de micro-interacoes. Cada funcao e um gesto reconhecivel de uso real, com os
// tempos e curvas do gosto padrao. Cenas chamam estas funcoes em vez de escrever
// tweens soltos: e assim que dois filmes diferentes se mexem do mesmo jeito.
//
// Todas escrevem `.to()` na timeline recebida e supoem que o estado inicial foi
// aplicado no mount (ver `initial` em cada uma).

/** Um momento do filme: um cartao e, opcionalmente, a legenda embaixo dele. */
export interface Slot { slot: HTMLElement; card: HTMLElement; caption: HTMLElement | null }

/** Estado inicial de um slot: invisivel, cartao 28px abaixo. Chame no mount. */
export const slotInitial = { slot: { autoAlpha: 0 }, card: { y: 28 } }

/** Cartao chega: sobe 28px e acende (750ms power3.out). A legenda vem 250ms depois. */
export function cardIn(tl: gsap.core.Timeline, s: Slot, at: number): void {
  tl.to(s.slot, { autoAlpha: 1, duration: 0.45, ease: EASE.settle }, at)
  tl.to(s.card, { y: 0, duration: 0.75, ease: EASE.enter }, at)
  if (s.caption) tl.fromTo(s.caption, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: DUR.caption, ease: EASE.enter, immediateRender: false }, at + 0.25)
}

/**
 * Pilha: o cartao atual vai para tras do proximo. Sobe ate ficar 22px acima do
 * topo do proximo, estreita para 96,5% e escurece; some quando o proximo assentou.
 * Sem slide lateral, sem giro: um passo empurra o anterior.
 */
export function stepBack(tl: gsap.core.Timeline, s: Slot, next: Slot | null, at: number): void {
  const dy = next ? next.slot.offsetTop - s.slot.offsetTop - 22 : -22
  if (s.caption) tl.to(s.caption, { autoAlpha: 0, duration: 0.25, ease: EASE.settle }, at)
  tl.to(s.card, { y: dy, scale: 0.965, filter: 'brightness(0.52)', transformOrigin: '50% 0', duration: 0.75, ease: EASE.enter }, at)
  tl.to(s.slot, { autoAlpha: 0, duration: 0.4, ease: EASE.settle }, at + (next ? 0.9 : 0.35))
}

/** Caracteres por segundo de quem digita bem. Abaixo de 30 parece lento; acima de 55, robo. */
export const TYPE_CPS = 40

/**
 * Texto digitado. `el` comeca vazio (textContent = '') e `caret` invisivel. Devolve
 * o instante em que termina. Depois, esconda o caret com `caretOff`.
 */
export function typeText(tl: gsap.core.Timeline, el: HTMLElement, caret: HTMLElement | null, text: string, at: number, cps = TYPE_CPS): number {
  const duration = text.length / cps
  if (caret) tl.to(caret, { autoAlpha: 1, duration: 0.01 }, at - 0.15)
  tl.to(el, { text: { value: text }, duration, ease: EASE.linear }, at)
  return at + duration
}

export function caretOff(tl: gsap.core.Timeline, caret: HTMLElement, at: number): void {
  tl.to(caret, { autoAlpha: 0, duration: 0.01 }, at)
}

/**
 * Destaque que sobe: o fundo de um trecho cresce de 0 a 100%, linha por linha, na
 * velocidade de quem arrasta (selecao) ou de quem marca (proposta). O elemento
 * precisa de `background-image: linear-gradient(cor, cor); background-repeat:
 * no-repeat; background-size: 0% 100%` no CSS.
 */
export function highlight(tl: gsap.core.Timeline, el: HTMLElement, at: number, duration = 0.9): void {
  tl.to(el, { backgroundSize: '100% 100%', duration, ease: EASE.drag }, at)
}

/**
 * Lavado de "acabou de entrar": acende rapido e desbota devagar. Diz ao olho o que
 * mudou sem precisar de seta. Estado inicial: fundo transparente.
 */
export function wash(tl: gsap.core.Timeline, el: HTMLElement, color: string, at: number, hold = 1.2): void {
  const clear = color.replace(/[\d.]+\)$/, '0)')
  tl.to(el, { backgroundColor: color, boxShadow: `0 0 0 3px ${color}`, duration: 0.3, ease: EASE.settle }, at)
  tl.to(el, { backgroundColor: clear, boxShadow: `0 0 0 3px ${clear}`, duration: 1.6, ease: EASE.settle }, at + 0.3 + hold)
}

/**
 * Entrada com precisao (fonte, citacao, linha de resultado): aparece 6px abaixo e
 * assenta em 420ms. Para varios, passe uma lista: eles chegam em sequencia.
 * Estado inicial: { autoAlpha: 0, y: 6 }.
 */
export function arrive(tl: gsap.core.Timeline, els: HTMLElement | HTMLElement[], at: number): number {
  const list = Array.isArray(els) ? els : [els]
  tl.to(list, { autoAlpha: 1, y: 0, duration: DUR.enter, ease: EASE.enter, stagger: STAGGER }, at)
  return at + DUR.enter + STAGGER * (list.length - 1)
}

/**
 * Troca de estado de um controle (ex.: "Aplicar" -> "Aplicado"): o antigo apaga em
 * 120ms, o novo acende logo depois. Os dois ocupam a mesma celula de grid.
 */
export function swap(tl: gsap.core.Timeline, from: HTMLElement, to: HTMLElement, at: number): void {
  tl.to(from, { autoAlpha: 0, duration: 0.12, ease: EASE.settle }, at)
  tl.to(to, { autoAlpha: 1, duration: 0.24, ease: EASE.enter }, at + 0.06)
}
