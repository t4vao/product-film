import type { Camera } from './camera'
import type { Captions } from './captions'
import type { Cursor } from './cursor'

// Contrato de um filme. Um filme e:
//   1. um storyboard (dados: cenas, duracoes, letreiros, momentos-chave);
//   2. um `mount` que monta o cenario uma vez (o produto em DOM puro);
//   3. uma funcao por cena que escreve a sua parte numa timeline GSAP.
//
// As cenas compartilham o mesmo cenario, como num plano-sequencia: o estado em que
// uma cena termina e o estado em que a seguinte comeca. Por isso cada cena so usa
// `.to()` e `set` dentro da propria timeline, e o estado inicial de tudo e definido
// uma vez, no `mount`. Assim o scrub para tras e para frente sempre chega no mesmo
// quadro.

export interface Caption {
  text: string
  /** Segundos depois do inicio da cena em que o letreiro entra. */
  in?: number
  /** Segundos depois do inicio da cena em que ele sai. Padrao: fim da cena. */
  out?: number
}

export interface SceneSpec<Beats extends Record<string, number> = Record<string, number>> {
  /** Identificador estavel: usado em ?scene= no preview e no nome dos stills. */
  id: string
  /** Rotulo que aparece na regua do preview. */
  label: string
  /** Duracao em segundos. A soma das cenas e a duracao do filme. */
  duration: number
  caption?: Caption
  /**
   * Momentos-chave da cena, em segundos desde o inicio dela. E aqui que se ajusta
   * o ritmo: trocar um numero desloca aquele gesto sem mexer no codigo da cena.
   */
  beats: Beats
}

/**
 * Cue de audio: um som que alguem vai mixar depois, offline, em cima do video.
 * O filme nao toca audio; o render grava estes cues num JSON ao lado do MP4
 * (out/<filme>.cues.json), com o tempo absoluto de cada um.
 */
export interface AudioCue {
  /** Cena em que o cue mora. */
  scene: string
  /** Segundos desde o inicio da cena. */
  at: number
  /** O que soa: 'click', 'type', 'whoosh' e vetado pelas regras de gosto. */
  sound: string
  /** Volume relativo de 0 a 1. */
  gain?: number
  note?: string
}

export interface Storyboard {
  id: string
  title: string
  width: number
  height: number
  fps: number
  /**
   * Familias de fonte que o filme usa. O motor espera todas carregarem antes de
   * medir o layout (posicao de menus, quebra de linha). Ex.: ['Inter Variable'].
   */
  fonts?: string[]
  scenes: SceneSpec[]
  audio?: AudioCue[]
}

export interface Stage {
  root: HTMLElement
  /** Camada que a camera move. O produto e o ponteiro vivem aqui. */
  world: HTMLElement
  /** Camada fixa por cima do mundo: letreiros e marca. */
  overlay: HTMLElement
}

export interface FilmContext<Refs = unknown> {
  stage: Stage
  camera: Camera
  cursor: Cursor
  captions: Captions
  refs: Refs
}

export type SceneBuilder<Refs, Beats extends Record<string, number> = Record<string, number>> = (
  tl: gsap.core.Timeline,
  spec: SceneSpec<Beats>,
  ctx: FilmContext<Refs>,
) => void

export interface Film<Refs = unknown> {
  storyboard: Storyboard
  /** Monta o cenario dentro do mundo e devolve as referencias que as cenas usam. */
  mount: (stage: Stage) => Refs
  /** Uma funcao por cena, na mesma chave do `id` do storyboard. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scenes: Record<string, SceneBuilder<Refs, any>>
  /** Enquadramento inicial e posicao inicial do ponteiro, antes da primeira cena. */
  setup?: (ctx: FilmContext<Refs>) => void
}

export function sceneStarts(storyboard: Storyboard): number[] {
  const starts: number[] = []
  let t = 0
  for (const scene of storyboard.scenes) {
    starts.push(t)
    t += scene.duration
  }
  return starts
}

export function filmDuration(storyboard: Storyboard): number {
  return storyboard.scenes.reduce((sum, scene) => sum + scene.duration, 0)
}
