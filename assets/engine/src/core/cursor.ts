import gsap from 'gsap'
import { h, svg, worldRect } from './dom'
import { DUR, EASE, PRESS_SCALE } from './taste'

// Ponteiro de sistema neutro. Se o produto tiver um ponteiro proprio em demos, troque
// o SVG abaixo. Vive dentro do mundo,
// entao cresce com o zoom, como numa gravacao de tela ampliada.
const POINTER = `<svg viewBox="-2 -2 28 29" width="20" height="21" aria-hidden="true">
  <path d="M0 0 L21.98 7.68 L8.72 10.75 L3.68 23.03 Z" fill="#1a1a1a" stroke="#fff" stroke-width="1.9"
    stroke-linejoin="round" stroke-linecap="round" paint-order="stroke"/></svg>`

export interface Point { x: number; y: number }
type Target = Element | Point

export class Cursor {
  readonly el: HTMLElement
  readonly body: HTMLElement
  private readonly world: HTMLElement

  constructor(world: HTMLElement) {
    this.world = world
    this.body = h('span.film-cursor-body')
    this.body.append(svg(POINTER))
    this.el = h('span.film-cursor', null, this.body)
    world.append(this.el)
    gsap.set(this.el, { x: 0, y: 0, autoAlpha: 0 })
    gsap.set(this.body, { transformOrigin: '2px 2px', scale: 1 })
  }

  /**
   * Onde a ponta pousa num alvo. Botoes: no miolo, um pouco abaixo do centro, onde
   * a mao para. Marcadores de largura zero (inicio e fim de um trecho): na linha.
   */
  point(target: Target): Point {
    if (!(target instanceof Element)) return target
    const r = worldRect(target, this.world)
    if (r.w < 2) return { x: r.x, y: r.y + r.h * 0.55 }
    return { x: r.x + Math.min(r.w / 2, 40), y: r.y + r.h * 0.58 }
  }

  place(tl: gsap.core.Timeline, target: Target, at: number): void {
    const p = this.point(target)
    tl.set(this.el, { x: p.x, y: p.y }, at)
  }

  show(tl: gsap.core.Timeline, at: number): void {
    tl.to(this.el, { autoAlpha: 1, duration: 0.3, ease: EASE.settle }, at)
  }

  hide(tl: gsap.core.Timeline, at: number): void {
    tl.to(this.el, { autoAlpha: 0, duration: 0.3, ease: EASE.settle }, at)
  }

  /**
   * Leva o ponteiro ate o alvo. Sem duracao explicita, o tempo cresce com a
   * distancia, como uma mao de verdade: perto e rapido, longe e um pouco mais lento.
   * Devolve o instante em que ele chega.
   */
  moveTo(tl: gsap.core.Timeline, target: Target, at: number, duration?: number, from?: Point): number {
    const p = this.point(target)
    const d = duration ?? (from ? travelTime(from, p) : 0.75)
    tl.to(this.el, { x: p.x, y: p.y, duration: d, ease: EASE.travel }, at)
    return at + d
  }

  /** Arrasta de um ponto a outro com o botao apertado (selecao de texto). */
  drag(tl: gsap.core.Timeline, target: Target, at: number, duration: number): void {
    const p = this.point(target)
    tl.to(this.body, { scale: 0.88, duration: 0.08, ease: EASE.settle }, at - 0.08)
    tl.to(this.el, { x: p.x, y: p.y, duration, ease: EASE.drag }, at)
    tl.to(this.body, { scale: 1, duration: 0.12, ease: EASE.settle }, at + duration)
  }

  /**
   * Clique: o ponteiro afunda e o alvo responde com o press do produto (scale .985,
   * 120ms). A consequencia do clique deve comecar em `at + DUR.press` ou depois.
   */
  click(tl: gsap.core.Timeline, at: number, pressed?: Element | null): void {
    tl.to(this.body, { scale: 0.86, duration: 0.07, ease: EASE.settle }, at)
    tl.to(this.body, { scale: 1, duration: 0.14, ease: EASE.settle }, at + 0.07)
    if (pressed) {
      tl.to(pressed, { scale: PRESS_SCALE, duration: DUR.press / 2, ease: EASE.settle }, at)
      tl.to(pressed, { scale: 1, duration: DUR.press, ease: EASE.enter }, at + DUR.press / 2)
    }
  }
}

function travelTime(a: Point, b: Point): number {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  return Math.min(1.0, Math.max(0.45, 0.4 + dist / 1400))
}
