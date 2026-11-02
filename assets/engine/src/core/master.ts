import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { Camera, type CameraOptions } from './camera'
import { Captions } from './captions'
import { Cursor } from './cursor'
import { h } from './dom'
import { filmDuration, sceneStarts, type AudioCue, type Film, type FilmContext, type Stage } from './film'
import { checkCaption, checkSound, checkTimeline, EASE, PALETTE } from './taste'

gsap.registerPlugin(TextPlugin)
// Sem escrita adiada: no render, cada quadro e lido logo depois do seek, e um valor
// que a GSAP so gravasse no proximo tick sairia um quadro atrasado.
// Curva padrao da familia permitida, para tween sem `ease` explicito nao cair no
// power1.out da GSAP.
gsap.defaults({ lazy: false, ease: EASE.settle })

export interface BuiltFilm {
  film: Film<unknown>
  master: gsap.core.Timeline
  duration: number
  starts: number[]
  ctx: FilmContext<unknown>
  /** Cues de audio com o tempo absoluto (`time`) ja calculado. */
  cues: (AudioCue & { time: number })[]
}

export interface FilmModule<Refs> {
  film: Film<Refs>
  /** Area util e trava do topo da camera, calculadas depois do mount. */
  camera: (refs: Refs) => Omit<CameraOptions, 'width' | 'height'>
}

/**
 * Monta o palco, o cenario do filme e a timeline mestra.
 * A mestra comeca pausada: quem decide o tempo e o preview (scrub) ou o render
 * (seek quadro a quadro).
 */
export async function buildFilm<Refs>(mod: FilmModule<Refs>, host: HTMLElement): Promise<BuiltFilm> {
  const { film } = mod
  const { width, height } = film.storyboard

  // world: coordenadas do filme (0,0 no canto do quadro), movido pela camera.
  // viewport: a janela que recorta o mundo. Ganha posicao depois do mount, quando o
  // filme diz onde ela fica.
  const world = h('div.film-world', { style: `width:${width}px;height:${height}px` })
  const viewport = h('div.film-viewport', null, world)
  const overlay = h('div.film-overlay')
  const root = h('div.film-stage', { style: `width:${width}px;height:${height}px;background:${PALETTE.stage}` }, viewport, overlay)
  host.append(root)
  const stage: Stage = { root, world, overlay }

  // O mount mede o layout (onde a barra de selecao nasce, onde o popover abre), e
  // essas medidas so valem com a fonte final. Carrega antes de montar.
  const families = film.storyboard.fonts ?? []
  await Promise.all(families.flatMap((family) => ['400', '500', '600', '700'].map((w) => document.fonts.load(`${w} 16px "${family}"`))))
  const refs = film.mount(stage)
  await document.fonts.ready
  await Promise.all(Array.from(root.querySelectorAll('img')).map((img) => img.decode().catch(() => undefined)))

  const cameraOptions = { width, height, ...mod.camera(refs) }
  const { safe, radius = 20 } = cameraOptions
  Object.assign(viewport.style, {
    left: `${safe.left}px`,
    top: `${safe.top}px`,
    width: `${width - safe.left - safe.right}px`,
    height: `${height - safe.top - safe.bottom}px`,
    borderRadius: `${radius}px`,
  })
  Object.assign(world.style, { left: `${-safe.left}px`, top: `${-safe.top}px` })
  const camera = new Camera(world, cameraOptions)
  const cursor = new Cursor(world)
  const captions = new Captions(overlay)
  const ctx: FilmContext<Refs> = { stage, camera, cursor, captions, refs }

  const master = gsap.timeline({ paused: true })
  film.setup?.(ctx)

  const starts = sceneStarts(film.storyboard)
  film.storyboard.scenes.forEach((spec, i) => {
    const build = film.scenes[spec.id]
    if (!build) throw new Error(`Cena "${spec.id}" esta no storyboard mas nao tem funcao em scenes.`)
    const tl = gsap.timeline()
    build(tl, spec, ctx)
    if (tl.duration() > spec.duration + 0.001) {
      console.warn(`[filme] A cena "${spec.id}" dura ${tl.duration().toFixed(2)}s e o storyboard reserva ${spec.duration}s. O excedente invade a cena seguinte.`)
    }
    master.add(tl, starts[i])
    if (spec.caption) {
      checkCaption(spec.caption.text, `cena "${spec.id}"`)
      const tIn = starts[i] + (spec.caption.in ?? 0.25)
      const tOut = starts[i] + (spec.caption.out ?? spec.duration)
      captions.add(master, spec.caption.text, tIn, tOut)
    }
  })

  const duration = filmDuration(film.storyboard)
  // Garante que a mestra tem exatamente a duracao do storyboard, mesmo que a ultima
  // cena termine antes (quadro final parado).
  master.set({}, {}, duration)
  checkTimeline(master, gsap.parseEase)

  // Cues de audio em tempo absoluto, validados contra o storyboard.
  const cues = (film.storyboard.audio ?? []).map((cue) => {
    const i = film.storyboard.scenes.findIndex((s) => s.id === cue.scene)
    if (i < 0) throw new Error(`Cue de audio aponta para a cena "${cue.scene}", que nao existe.`)
    checkSound(cue.sound, `cue da cena "${cue.scene}"`)
    return { ...cue, time: +(starts[i] + cue.at).toFixed(3) }
  })
  master.time(0)

  return { film: film as Film<unknown>, master, duration, starts, ctx: ctx as FilmContext<unknown>, cues }
}
