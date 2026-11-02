// Render quadro a quadro: Vite serve o filme, o Playwright posiciona a timeline em
// cada quadro (seek, nunca tempo real) e tira a foto, e o ffmpeg monta o video.
// Como ninguem toca em tempo real, o resultado e identico em qualquer maquina,
// sem quadro pulado.
//
// Uso:
//   npm run render                         filme inteiro -> out/exemplo.mp4 (2560x1440, 60fps)
//   npm run render -- --film exemplo --scene acao
//   npm run render -- --from 6.6 --to 15.6
//   npm run stills -- 0.5,3.4,12,29         PNGs desses tempos em out/stills/
//   npm run stills                          um PNG no meio de cada cena
//
// --json troca a barra de progresso por linhas JSON ({"progress":0.42}), que e o
// que o botao "Baixar video" do preview le.
//
// ffmpeg: usa $FFMPEG se definido, senao o binario do pacote ffmpeg-static.

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = parseArgs(process.argv.slice(2))
const filmId = args.film ?? 'exemplo'
// Uma qualidade so: 2560x1440, 60fps. O filme e desenhado em 1920x1080 logicos e
// o navegador rasteriza direto em 1440 linhas (escala 4/3), entao o texto sai
// nitido, sem ampliar uma imagem menor. Os stills saem em 1080 para revisar rapido.
const OUTPUT_HEIGHT = 1440
const json = args.json !== undefined

const server = await createServer({ root, logLevel: 'error', server: { port: 0 } })
await server.listen()
const url = server.resolvedUrls.local[0]

const browser = await launch()
try {
  const film = await openFilm(browser)
  if (args.stills !== undefined) await stills(film)
  else await video(film)
} finally {
  await browser.close()
  await server.close()
}

async function launch() {
  // Ordem: $CHROME, o Chromium desta versao do Playwright, o Chrome instalado, e por
  // fim qualquer Chromium que outra versao do Playwright ja tenha baixado na maquina.
  // So se nada existir e preciso rodar `npx playwright install chromium`.
  // Texto em tons de cinza, sem subpixel colorido nem hinting: em video, o
  // antialias LCD vira franja colorida quando a camera escala o quadro.
  const flags = ['--disable-lcd-text', '--font-render-hinting=none', '--force-color-profile=srgb']
  const attempts = [
    process.env.CHROME && (() => chromium.launch({ executablePath: process.env.CHROME, args: flags })),
    () => chromium.launch({ args: flags }),
    () => chromium.launch({ channel: 'chrome', args: flags }),
    ...cachedChromiums().map((path) => () => chromium.launch({ executablePath: path, args: flags })),
  ].filter(Boolean)
  for (const attempt of attempts) {
    try { return await attempt() } catch { /* tenta o proximo */ }
  }
  throw new Error('Nenhum Chromium encontrado. Rode `npx playwright install chromium` ou defina CHROME=<caminho>.')
}

function cachedChromiums() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH
    ?? (process.platform === 'win32' ? join(process.env.LOCALAPPDATA ?? '', 'ms-playwright')
      : process.platform === 'darwin' ? join(homedir(), 'Library', 'Caches', 'ms-playwright')
        : join(homedir(), '.cache', 'ms-playwright'))
  if (!existsSync(base)) return []
  const exe = process.platform === 'win32' ? ['chrome-win64', 'chrome.exe'] : process.platform === 'darwin'
    ? ['chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'] : ['chrome-linux', 'chrome']
  return readdirSync(base)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    .map((d) => join(base, d, ...exe))
    .filter(existsSync)
}

async function openFilm(b) {
  const probe = await b.newPage()
  await probe.goto(`${url}?film=${filmId}&render`)
  const meta = await waitFilm(probe)
  await probe.close()
  const scale = args.stills !== undefined ? 1 : OUTPUT_HEIGHT / meta.height
  const page = await b.newPage({ viewport: { width: meta.width, height: meta.height }, deviceScaleFactor: scale })
  await page.goto(`${url}?film=${filmId}&render`)
  await waitFilm(page)
  return { page, meta }
}

async function waitFilm(page) {
  page.on('pageerror', (e) => console.error('[pagina]', e.message))
  await page.waitForFunction(() => window.__film?.ready === true, null, { timeout: 30000 })
  return page.evaluate(() => {
    const { duration, fps, width, height, scenes, cues } = window.__film
    return { duration, fps, width, height, scenes, cues }
  })
}

async function seek(page, t) {
  await page.evaluate((time) => window.__film.seek(time), t)
}

async function stills({ page, meta }) {
  const dir = join(root, 'out', 'stills')
  mkdirSync(dir, { recursive: true })
  const times = typeof args.stills === 'string' && args.stills.length
    ? args.stills.split(',').map(Number)
    : meta.scenes.map((s) => +(s.start + s.duration / 2).toFixed(2))
  for (const t of times) {
    await seek(page, t)
    const file = join(dir, `${filmId}-${t.toFixed(2).padStart(5, '0')}s.png`)
    await page.screenshot({ path: file })
    console.log(file)
  }
}

async function video({ page, meta }) {
  let from = Number(args.from ?? 0)
  let to = Number(args.to ?? meta.duration)
  if (args.scene) {
    const scene = meta.scenes.find((s) => s.id === args.scene)
    if (!scene) throw new Error(`Cena "${args.scene}" nao existe. Cenas: ${meta.scenes.map((s) => s.id).join(', ')}`)
    from = scene.start
    to = scene.start + scene.duration
  }
  const total = Math.round((to - from) * meta.fps)
  const suffix = (args.scene ? `-${args.scene}` : args.from || args.to ? `-${from}-${to}` : '') 
  const out = args.out ? join(root, args.out) : join(root, 'out', `${filmId}${suffix}.mp4`)
  mkdirSync(dirname(out), { recursive: true })
  // Escreve num arquivo temporario e so renomeia no fim: um download nunca pega
  // um video pela metade.
  const partial = out.replace(/\.mp4$/, '.part.mp4')

  const ffmpegPath = process.env.FFMPEG ?? (await import('ffmpeg-static')).default
  // PNG sem perda entra pelo stdin; sai H.264 High com qualidade de master (crf 12)
  // e yuv420p para tocar em qualquer lugar.
  const ff = spawn(ffmpegPath, [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(meta.fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
    '-movflags', '+faststart', partial,
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  const finished = new Promise((resolve, reject) => {
    ff.on('error', reject)
    ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg saiu com codigo ${code}`))))
  })

  const started = Date.now()
  for (let i = 0; i < total; i++) {
    await seek(page, from + i / meta.fps)
    const png = await page.screenshot({ type: 'png' })
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r))
    if (json) {
      if (i % 15 === 0) console.log(JSON.stringify({ progress: (i + 1) / total }))
    } else if (i % meta.fps === 0 || i === total - 1) {
      const pct = (((i + 1) / total) * 100).toFixed(0).padStart(3)
      process.stdout.write(`\r${pct}%  quadro ${i + 1}/${total}  ${((Date.now() - started) / 1000).toFixed(0)}s`)
    }
  }
  ff.stdin.end()
  await finished
  renameSync(partial, out)
  // Cues de audio, com o tempo ja relativo ao inicio deste arquivo, para mixar.
  if (meta.cues?.length) {
    const cues = meta.cues.filter((c) => c.time >= from && c.time < to).map((c) => ({ ...c, time: +(c.time - from).toFixed(3) }))
    writeFileSync(out.replace(/\.mp4$/, '.cues.json'), JSON.stringify({ fps: meta.fps, cues }, null, 2))
  }
  console.log(json ? JSON.stringify({ progress: 1, file: out }) : `\n${out}`)
}

function parseArgs(list) {
  const out = {}
  for (let i = 0; i < list.length; i++) {
    const a = list[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = list[i + 1]
    out[key] = next && !next.startsWith('--') ? (i++, next) : ''
  }
  return out
}
