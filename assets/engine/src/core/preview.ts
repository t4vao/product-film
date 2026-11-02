import { h } from './dom'
import type { BuiltFilm } from './master'
import { DEFAULT_FILM } from '../films'

// Preview ao vivo. A timeline mestra e tocada em tempo real e pode ser arrastada.
//
// Teclado:
//   espaco        toca / pausa
//   setas         1 quadro (com Shift: 1 segundo)
//   1..9          vai para o inicio da cena N
//   L             repete so a cena atual
//   Home / End    inicio / fim
//
// URL: ?t=12.4 abre parado nesse tempo; ?scene=aceite abre repetindo aquela cena.

/**
 * Botao de download. Pede ao servidor de desenvolvimento o render do filme aberto
 * em 2560x1440, 60fps, H.264 High (crf 12), mostra o progresso no proprio botao e
 * baixa o MP4 quando termina. A resolucao vem do servidor (HEIGHT em
 * scripts/download-plugin.ts), entao o rotulo e o arquivo nunca divergem.
 * O render roda quadro a quadro e leva alguns minutos; o preview segue livre.
 */
function mountDownload(film: string): HTMLButtonElement {
  let height = 1440
  const idle = () => `Baixar em ${height}p`
  const button = h('button.pv-btn.pv-baixar', { type: 'button' }, idle())
  let timer = 0
  const label = (text: string) => { button.textContent = text }
  const poll = async () => {
    const res = await fetch(`/__render/status?film=${film}`).then((r) => r.json()).catch(() => null)
    if (!res) return
    if (res.state === 'running') {
      label(`Renderizando ${height}p… ${Math.floor(res.progress * 100)}%`)
      timer = window.setTimeout(poll, 1000)
    } else if (res.state === 'done') {
      label(idle())
      button.disabled = false
      location.href = `/__render/file?film=${film}`
    } else if (res.state === 'error') {
      label('Falhou. Tentar de novo')
      button.disabled = false
      console.error('[render]', res.error)
    }
  }
  button.addEventListener('click', async () => {
    window.clearTimeout(timer)
    button.disabled = true
    label(`Renderizando ${height}p… 0%`)
    await fetch(`/__render/start?film=${film}`)
    poll()
  })
  // Le a resolucao do servidor e, se um render ja estava rodando (pagina
  // recarregada no meio), retoma o progresso.
  fetch(`/__render/status?film=${film}`).then((r) => r.json()).then((res) => {
    height = res.height ?? height
    label(idle())
    if (res.state === 'running') { button.disabled = true; poll() }
  }).catch(() => undefined)
  return button
}

export function mountPreview(built: BuiltFilm, host: HTMLElement): void {
  const { master, duration, starts, film } = built
  const { fps, width, height, scenes } = film.storyboard
  const params = new URLSearchParams(location.search)

  const stageBox = h('div.pv-stage')
  stageBox.append(built.ctx.stage.root)
  const play = h('button.pv-btn', { type: 'button', 'aria-label': 'Tocar' }, 'Tocar')
  const loop = h('button.pv-btn', { type: 'button', 'aria-pressed': 'false' }, 'Repetir cena')
  const time = h('span.pv-time')
  const range = h('input.pv-range', { type: 'range', min: 0, max: duration, step: 1 / fps, value: 0, 'aria-label': 'Tempo do filme' })
  const marks = h('div.pv-marks')
  scenes.forEach((scene, i) => {
    const mark = h('button.pv-mark', { type: 'button', style: `left:${(starts[i] / duration) * 100}%;width:${(scene.duration / duration) * 100}%` }, `${i + 1}. ${scene.label}`)
    mark.addEventListener('click', () => seek(starts[i] + 0.001))
    marks.append(mark)
  })
  const track = h('div.pv-track', null, marks, range)
  const download = mountDownload(params.get('film') ?? DEFAULT_FILM)
  const bar = h('div.pv-bar', null, play, loop, time, track, download)
  host.append(stageBox, bar)

  // O palco e desenhado em 1920x1080 e reduzido para caber na janela.
  const fit = () => {
    const box = stageBox.getBoundingClientRect()
    const k = Math.min(box.width / width, box.height / height)
    built.ctx.stage.root.style.transform = `scale(${k})`
    built.ctx.stage.root.style.left = `${(box.width - width * k) / 2}px`
    built.ctx.stage.root.style.top = `${(box.height - height * k) / 2}px`
  }
  new ResizeObserver(fit).observe(stageBox)

  let t = 0
  let playing = false
  let loopScene: number | null = null
  let last = 0

  const sceneAt = (at: number) => Math.max(0, starts.findLastIndex((s) => s <= at + 1e-6))
  const fmt = (s: number) => `${s.toFixed(2).padStart(5, '0')}s · quadro ${Math.round(s * fps)}`

  function seek(next: number) {
    t = Math.min(duration, Math.max(0, next))
    master.time(t)
    range.value = String(t)
    const i = sceneAt(t)
    time.textContent = `${fmt(t)} · ${scenes[i].label}`
    marks.querySelectorAll('.pv-mark').forEach((m, j) => m.toggleAttribute('data-ativa', j === i))
  }

  function setPlaying(next: boolean) {
    playing = next
    play.textContent = playing ? 'Pausar' : 'Tocar'
    if (playing) {
      if (t >= duration) seek(loopScene !== null ? starts[loopScene] : 0)
      last = performance.now()
      requestAnimationFrame(tick)
    }
  }

  function tick(now: number) {
    if (!playing) return
    const dt = (now - last) / 1000
    last = now
    let next = t + dt
    if (loopScene !== null) {
      const end = starts[loopScene] + scenes[loopScene].duration
      if (next >= end) next = starts[loopScene]
    } else if (next >= duration) {
      seek(duration)
      setPlaying(false)
      return
    }
    seek(next)
    requestAnimationFrame(tick)
  }

  play.addEventListener('click', () => setPlaying(!playing))
  loop.addEventListener('click', () => {
    loopScene = loopScene === null ? sceneAt(t) : null
    loop.setAttribute('aria-pressed', String(loopScene !== null))
  })
  range.addEventListener('input', () => {
    setPlaying(false)
    seek(Number(range.value))
  })
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') { e.preventDefault(); setPlaying(!playing) }
    else if (e.key === 'ArrowRight') seek(t + (e.shiftKey ? 1 : 1 / fps))
    else if (e.key === 'ArrowLeft') seek(t - (e.shiftKey ? 1 : 1 / fps))
    else if (e.key === 'Home') seek(0)
    else if (e.key === 'End') seek(duration)
    else if (e.key.toLowerCase() === 'l') loop.click()
    else if (/^[1-9]$/.test(e.key) && starts[Number(e.key) - 1] !== undefined) seek(starts[Number(e.key) - 1] + 0.001)
    else return
    if (e.key !== ' ') setPlaying(false)
  })

  const sceneParam = params.get('scene')
  const sceneIndex = sceneParam ? scenes.findIndex((s) => s.id === sceneParam) : -1
  if (sceneIndex >= 0) {
    loopScene = sceneIndex
    loop.setAttribute('aria-pressed', 'true')
    seek(starts[sceneIndex])
    setPlaying(true)
  } else {
    seek(Number(params.get('t') ?? 0))
  }
}
