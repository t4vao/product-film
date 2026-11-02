import { createElement, type IconNode } from 'lucide'

type Child = Node | string | null | undefined | false
type Attrs = Record<string, string | number | boolean | undefined>

/**
 * Monta DOM sem framework. `h('p.tf-doc-p', { ref: 'trecho' }, 'texto')`.
 * Classe no seletor depois do ponto; atributos viram attributes; filhos podem ser
 * texto ou nos. E tudo que as cenas precisam: o filme e um documento estatico que
 * a GSAP anima, sem estado de framework para dessincronizar do scrub.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tagAndClasses: K | `${K}.${string}`,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const [tag, ...classes] = tagAndClasses.split('.') as [K, ...string[]]
  const el = document.createElement(tag)
  if (classes.length) el.className = classes.join(' ')
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === undefined || value === false) continue
    if (key === 'style') el.setAttribute('style', String(value))
    else el.setAttribute(key, value === true ? '' : String(value))
  }
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue
    el.append(child)
  }
  return el
}

/** Icone Lucide como SVG, com os mesmos tamanhos e tracos usados no produto. */
export function icon(node: IconNode, size = 16, strokeWidth = 1.7): SVGElement {
  return createElement(node, { width: size, height: size, 'stroke-width': strokeWidth, 'aria-hidden': 'true' })
}

/** SVG a partir de uma string (glifos proprios do produto, logo). */
export function svg(markup: string): SVGElement {
  const tpl = document.createElement('template')
  tpl.innerHTML = markup.trim()
  return tpl.content.firstElementChild as SVGElement
}

export interface Rect { x: number; y: number; w: number; h: number }

/**
 * Retangulo de um elemento nas coordenadas do mundo (o espaco que a camera move).
 *
 * Usa a cadeia de offsets, que ignora transforms de proposito: as cenas medem os
 * alvos ao montar a timeline, quando muita coisa ainda esta no estado inicial
 * (deslocada 6px para entrar, em escala .97 para abrir). O que importa e onde o
 * elemento mora no layout, nao onde ele esta no quadro zero. Rolagens feitas por
 * transform (o chat) sao somadas pela cena com `shiftRect`.
 */
export function worldRect(el: Element, world: HTMLElement): Rect {
  if (!(el instanceof HTMLElement)) throw new Error('worldRect precisa de um elemento HTML (SVG nao tem offsetParent).')
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== world) {
    x += node.offsetLeft
    y += node.offsetTop
    const parent = node.offsetParent as HTMLElement | null
    if (parent && parent !== world) {
      x += parent.clientLeft
      y += parent.clientTop
    }
    node = parent
  }
  if (node !== world) throw new Error('worldRect: o elemento nao esta dentro do mundo.')
  return { x, y, w: el.offsetWidth, h: el.offsetHeight }
}

/** Mesmo calculo, relativo a um ancestral posicionado qualquer (para posicionar menus). */
export function localRect(el: HTMLElement, ancestor: HTMLElement): Rect {
  const a = worldRect(el, ancestor.closest('.film-world') as HTMLElement)
  const b = worldRect(ancestor, ancestor.closest('.film-world') as HTMLElement)
  return { x: a.x - b.x - ancestor.clientLeft, y: a.y - b.y - ancestor.clientTop, w: a.w, h: a.h }
}

export function unionRect(...rects: Rect[]): Rect {
  const x = Math.min(...rects.map((r) => r.x))
  const y = Math.min(...rects.map((r) => r.y))
  const right = Math.max(...rects.map((r) => r.x + r.w))
  const bottom = Math.max(...rects.map((r) => r.y + r.h))
  return { x, y, w: right - x, h: bottom - y }
}

export function padRect(r: Rect, px: number, py = px): Rect {
  return { x: r.x - px, y: r.y - py, w: r.w + px * 2, h: r.h + py * 2 }
}

export function shiftRect(r: Rect, dx: number, dy: number): Rect {
  return { ...r, x: r.x + dx, y: r.y + dy }
}
