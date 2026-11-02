// Fontes do produto: importe aqui (ex.: import '@fontsource-variable/inter') ou no
// CSS do filme, e declare as familias em `storyboard.fonts`.
import './core/stage.css'
import { buildFilm } from './core/master'
import { mountPreview } from './core/preview'
import { DEFAULT_FILM, FILMS } from './films'

declare global {
  interface Window {
    __film?: {
      ready: true
      id: string
      duration: number
      fps: number
      width: number
      height: number
      scenes: { id: string; start: number; duration: number }[]
      cues: unknown[]
      seek: (t: number) => void
    }
  }
}

async function boot() {
  const params = new URLSearchParams(location.search)
  const id = params.get('film') ?? DEFAULT_FILM
  const load = FILMS[id]
  if (!load) throw new Error(`Filme "${id}" nao registrado em src/films/index.ts.`)
  const render = params.has('render')
  document.body.dataset.mode = render ? 'render' : 'preview'

  const app = document.getElementById('app')!
  // Monta sempre dentro da pagina: o layout precisa estar no documento para ser
  // medido. O preview depois move o palco para dentro da sua moldura.
  const built = await buildFilm(await load(), app)
  const { storyboard } = built.film

  // API que o script de render usa. O preview tambem expoe, para depuracao.
  window.__film = {
    ready: true,
    id,
    duration: built.duration,
    fps: storyboard.fps,
    width: storyboard.width,
    height: storyboard.height,
    scenes: storyboard.scenes.map((s, i) => ({ id: s.id, start: built.starts[i], duration: s.duration })),
    cues: built.cues,
    seek: (t: number) => { built.master.time(t) },
  }

  if (!render) mountPreview(built, app)
}

boot().catch((error) => {
  console.error(error)
  document.body.innerHTML = `<pre class="film-error">${String(error?.message ?? error)}</pre>`
})
