#!/usr/bin/env node
// Scaffold da skill product-film.
//
//   node <skill>/scripts/scaffold.mjs <destino> [--film <id>]
//
// - Se <destino> nao tem o motor, copia assets/engine para la (sem node_modules/out).
// - Com --film, cria src/films/<id> a partir do filme-modelo e registra no indice,
//   como filme padrao do preview.
// Nunca sobrescreve: se o filme ja existe, para com erro.

import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const skill = join(dirname(fileURLToPath(import.meta.url)), '..')
const engine = join(skill, 'assets', 'engine')
const [destArg, ...rest] = process.argv.slice(2)
if (!destArg) {
  console.error('Uso: node scaffold.mjs <destino> [--film <id>]')
  process.exit(1)
}
const dest = resolve(destArg)
const filmFlag = rest.indexOf('--film')
const filmId = filmFlag >= 0 ? rest[filmFlag + 1] : null
if (filmId && !/^[a-z0-9][a-z0-9-]*$/.test(filmId)) {
  console.error(`Id de filme invalido: "${filmId}". Use minusculas, numeros e hifen.`)
  process.exit(1)
}

if (!existsSync(join(dest, 'src', 'core', 'master.ts'))) {
  cpSync(engine, dest, {
    recursive: true,
    filter: (src) => !/[\\/](node_modules|out)([\\/]|$)/.test(src),
  })
  console.log(`motor copiado para ${dest}`)
} else {
  console.log(`motor ja existe em ${dest}; mantido`)
}

if (filmId && filmId !== 'exemplo') {
  const target = join(dest, 'src', 'films', filmId)
  if (existsSync(target)) {
    console.error(`O filme "${filmId}" ja existe em ${target}. Nada foi alterado.`)
    process.exit(1)
  }
  cpSync(join(engine, 'src', 'films', 'exemplo'), target, { recursive: true })
  const index = join(dest, 'src', 'films', 'index.ts')
  let s = readFileSync(index, 'utf8')
  s = s.replace("  exemplo: () => import('./exemplo'),", `  exemplo: () => import('./exemplo'),\n  '${filmId}': () => import('./${filmId}'),`)
  s = s.replace(/export const DEFAULT_FILM = '[^']*'/, `export const DEFAULT_FILM = '${filmId}'`)
  writeFileSync(index, s)
  console.log(`filme criado em ${target} e registrado como padrao`)
}

console.log(`\nProximos passos:\n  cd ${dest}\n  npm install\n  npm run dev        # preview em http://localhost:5190${filmId ? `/?film=${filmId}` : ''}`)
