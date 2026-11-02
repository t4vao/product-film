import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { downloadPlugin } from './scripts/download-plugin'

// O filme usa os ativos reais do produto (logo, icones, favicons) direto do repo,
// para nunca divergir dele. `@product` aponta para a pasta de codigo do produto.
// Padrao: ../../src (o motor mora em <repo>/tools/product-films). Outra pasta:
// PRODUCT_SRC=../../apps/web/src npm run dev
const root = fileURLToPath(new URL('.', import.meta.url))
const productSrc = resolve(root, process.env.PRODUCT_SRC ?? '../../src')
const repoRoot = resolve(root, '../..')

export default defineConfig({
  resolve: { alias: { '@product': productSrc } },
  server: { fs: { allow: [repoRoot, productSrc, root] }, watch: { ignored: ['**/out/**'] } },
  // PostCSS vazio: sem isso o Vite sobe ate o postcss.config do app (Tailwind etc.).
  css: { postcss: {} },
  plugins: [downloadPlugin(root)],
})
