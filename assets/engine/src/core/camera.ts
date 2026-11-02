import gsap from 'gsap'
import type { Rect } from './dom'
import { DUR, EASE } from './taste'

export interface Shot { x: number; y: number; scale: number }

export interface CameraOptions {
  width: number
  height: number
  /**
   * Janela do quadro, em pixels do filme. O mundo e recortado nela (cantos
   * arredondados) e o enquadramento centraliza o assunto dentro dela. Fora da
   * janela fica so o fundo: o topo e dos letreiros, que nunca dividem espaco com
   * o produto. Em repouso o card cabe inteiro na janela; no zoom, o produto a
   * preenche.
   */
  safe: { top: number; right: number; bottom: number; left: number }
  /** Raio da janela. */
  radius?: number
  /**
   * O produto, em coordenadas do mundo. Nenhum enquadramento mostra fundo dentro
   * da janela: quando o produto e maior que ela, ele a cobre inteira; quando e
   * menor, fica inteiro dentro dela. Um zoom no chat (a coluna da direita) encosta
   * o card na borda direita em vez de centralizar o chat e sobrar preto ao lado.
   */
  cover?: Rect
}

/**
 * Camera do filme: um transform (translate + scale) no mundo. Cada enquadramento e
 * calculado a partir de um retangulo do produto, nunca de numeros soltos, para que
 * mudar o layout de uma tela nao desalinhe a camera.
 */
export class Camera {
  readonly world: HTMLElement
  readonly opts: CameraOptions

  constructor(world: HTMLElement, opts: CameraOptions) {
    this.world = world
    this.opts = opts
    gsap.set(world, { transformOrigin: '0 0', x: 0, y: 0, scale: 1 })
  }

  /** Plano aberto: o mundo como foi desenhado. */
  wide(): Shot {
    return { x: 0, y: 0, scale: 1 }
  }

  /**
   * Enquadra um retangulo do mundo. `scale` fixa o zoom; sem ele, o retangulo
   * preenche a area util ate `maxScale`. `focusY` desloca o ponto de interesse
   * dentro da area util (0 = topo, 0.5 = centro).
   */
  frame(rect: Rect, options: { scale?: number; maxScale?: number; focusY?: number } = {}): Shot {
    const { width, height, safe } = this.opts
    const safeW = width - safe.left - safe.right
    const safeH = height - safe.top - safe.bottom
    const scale = options.scale ?? Math.min(options.maxScale ?? 1.8, safeW / rect.w, safeH / rect.h)
    const cx = safe.left + safeW / 2
    const cy = safe.top + safeH * (options.focusY ?? 0.5)
    let x = cx - (rect.x + rect.w / 2) * scale
    let y = cy - (rect.y + rect.h / 2) * scale
    const cover = this.opts.cover
    if (cover) {
      x = clampBetween(x, safe.left - cover.x * scale, width - safe.right - (cover.x + cover.w) * scale)
      y = clampBetween(y, safe.top - cover.y * scale, height - safe.bottom - (cover.y + cover.h) * scale)
    }
    return { x, y, scale }
  }

  /** Move a camera para um enquadramento dentro da timeline. */
  to(tl: gsap.core.Timeline, shot: Shot, at: number, duration: number = DUR.camera): void {
    tl.to(this.world, { x: shot.x, y: shot.y, scale: shot.scale, duration, ease: EASE.travel }, at)
  }

  /** Posiciona sem movimento (corte seco). */
  cut(tl: gsap.core.Timeline, shot: Shot, at: number): void {
    tl.set(this.world, { x: shot.x, y: shot.y, scale: shot.scale }, at)
  }
}

/** Prende `v` entre dois limites, em qualquer ordem. */
function clampBetween(v: number, a: number, b: number): number {
  return Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b))
}
