import { spawn, type ChildProcess } from 'node:child_process'
import { createReadStream, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

// Botao "Baixar em 1440p" do preview. So existe no servidor de desenvolvimento.
//
//   GET /__render/start?film=exemplo   comeca o render (ou devolve o que esta rodando)
//   GET /__render/status?film=exemplo  { state, progress, error }
//   GET /__render/file?film=exemplo    o MP4, como download
//
// O render e o mesmo `scripts/render.mjs --height 1440`, rodando num processo a parte: o
// preview continua livre enquanto ele trabalha.

// FACIL DE TROCAR: altura do video que o botao baixa. 1440 = 2560x1440; 2160 = 4K.
export const HEIGHT = 1440

type Job = { state: 'running' | 'done' | 'error'; progress: number; error?: string; file: string; child?: ChildProcess }

export function downloadPlugin(root: string): Plugin {
  const jobs = new Map<string, Job>()

  const start = (film: string): Job => {
    const current = jobs.get(film)
    if (current?.state === 'running') return current
    const file = join(root, 'out', `${film}-${HEIGHT}p.mp4`)
    const job: Job = { state: 'running', progress: 0, file }
    const child = spawn(process.execPath, [join(root, 'scripts', 'render.mjs'), '--film', film, '--height', String(HEIGHT), '--json'], { cwd: root })
    job.child = child
    let stderr = ''
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
      for (const line of chunk.split('\n')) {
        try { job.progress = JSON.parse(line).progress ?? job.progress } catch { /* linha que nao e JSON */ }
      }
    })
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => { stderr += chunk })
    child.on('close', (code) => {
      job.state = code === 0 ? 'done' : 'error'
      if (code !== 0) job.error = stderr.trim().split('\n').slice(-3).join(' ') || `render saiu com codigo ${code}`
      job.child = undefined
    })
    jobs.set(film, job)
    return job
  }

  return {
    name: 'film-download',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__render', (req, res) => {
        const url = new URL(req.url ?? '/', 'http://local')
        const film = (url.searchParams.get('film') ?? 'exemplo').replace(/[^a-z0-9-]/gi, '')
        const send = (body: unknown) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (url.pathname === '/start') {
          const { state, progress } = start(film)
          return send({ state, progress, height: HEIGHT })
        }
        if (url.pathname === '/status') {
          const job = jobs.get(film)
          return send(job ? { state: job.state, progress: job.progress, error: job.error, height: HEIGHT } : { state: 'idle', progress: 0, height: HEIGHT })
        }
        if (url.pathname === '/file') {
          const job = jobs.get(film)
          if (job?.state !== 'done') { res.statusCode = 404; return res.end('Render ainda nao terminou.') }
          res.setHeader('Content-Type', 'video/mp4')
          res.setHeader('Content-Length', String(statSync(job.file).size))
          res.setHeader('Content-Disposition', `attachment; filename="${film}-${HEIGHT}p-60fps.mp4"`)
          return createReadStream(job.file).pipe(res)
        }
        res.statusCode = 404
        res.end()
      })
    },
  }
}
