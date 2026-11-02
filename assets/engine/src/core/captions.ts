import gsap from 'gsap'
import { h } from './dom'
import { DUR, EASE } from './taste'

/**
 * Letreiros. Ficam na camada fixa, fora do alcance da camera: o produto se move,
 * a frase fica parada no mesmo lugar do quadro, como uma legenda.
 *
 * Entrada: sobe 10px e acende. Saida: so apaga, mais rapido. Um letreiro nunca
 * divide a tela com outro.
 */
export class Captions {
  readonly layer: HTMLElement

  constructor(overlay: HTMLElement) {
    this.layer = h('div.film-captions')
    overlay.append(this.layer)
  }

  add(tl: gsap.core.Timeline, text: string, tIn: number, tOut: number): HTMLElement {
    const el = h('p.film-caption', null, text)
    this.layer.append(el)
    gsap.set(el, { autoAlpha: 0, y: 10 })
    tl.to(el, { autoAlpha: 1, y: 0, duration: DUR.caption, ease: EASE.enter }, tIn)
    tl.to(el, { autoAlpha: 0, duration: DUR.caption * 0.6, ease: EASE.settle }, tOut - DUR.caption * 0.6)
    return el
  }
}
