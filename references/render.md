# Render

## Como funciona

`scripts/render.mjs` sobe um Vite próprio, abre o filme com `?render` no
Chromium do Playwright, e para cada quadro chama `window.__film.seek(t)` e tira
um PNG. Os PNGs vão por pipe para o ffmpeg. Ninguém toca em tempo real: cada
quadro é calculado, então o vídeo é idêntico entre máquinas e nunca pula quadro.

## Comandos

| Comando | Saída |
| --- | --- |
| `npm run render` | o filme: 2560x1440, 60fps, `out/<id>.mp4` |
| `npm run render -- --scene <id>` | só uma cena |
| `npm run render -- --from 6 --to 12` | um trecho |
| `npm run stills -- 2.4,8,15` | PNGs em `out/stills/` |
| `npm run stills` | um PNG no meio de cada cena |
| botão "Baixar vídeo" no preview | renderiza o filme aberto e baixa |

Todos aceitam `--film <id>`. Há uma qualidade só, de propósito: 2560x1440,
60fps. O filme é desenhado em 1920x1080 lógicos e o navegador rasteriza direto em
1440 linhas, então o texto sai nítido, sem ampliar imagem. Os stills saem em 1080
para revisar rápido.

## Qualidade

- H.264 High, `crf 12`, `preset slow`, `yuv420p`, cor bt709, `+faststart`.
- O bitrate sai baixo em filmes de fundo liso (é qualidade constante, não perda).
- Chromium com `--disable-lcd-text --font-render-hinting=none`: sem franja colorida.
- Arquivo escrito como `.part.mp4` e renomeado no fim: download nunca pega metade.
- Tempo aproximado: uns 4 minutos para 30s de filme.

## Áudio

O filme não toca som. `storyboard.audio` vira `out/<arquivo>.cues.json`:

```json
{ "fps": 60, "cues": [{ "scene": "aceite", "at": 1.55, "sound": "click", "time": 17.15 }] }
```

`time` é relativo ao início do arquivo renderizado (cena ou trecho incluídos).
Mixe offline (DAW, ffmpeg `adelay`). Sons vetados pelo gosto: whoosh, riser,
boom, impacto, brilho.

## Determinismo: regras que o render exige

- Timeline mestra pausada; o tempo só muda por seek.
- `gsap.defaults({ lazy: false })` (o motor já faz): nada escrito no tick seguinte.
- Sem CSS `transition`/`animation`, sem `requestAnimationFrame` próprio, sem
  `setTimeout` em cena, sem `Date.now()`/`Math.random()` em cena.
- Fontes locais (pacote npm), declaradas em `storyboard.fonts`. CDN pode atrasar.
- Imagens decodificadas antes de medir (o motor espera).

## Problemas comuns

| Sintoma | Causa | Correção |
| --- | --- | --- |
| `Executable doesn't exist ... chromium` | Playwright sem navegador | o script tenta Chrome e Chromiums em cache; senão `npx playwright install chromium` ou `CHROME=<caminho>` |
| ffmpeg não acha `libx264` | ffmpeg sem x264 (ex.: o do Playwright) | use o do `ffmpeg-static` ou `FFMPEG=<caminho>` |
| `npm install` não baixa ffmpeg | install scripts bloqueados | `npm install-scripts approve ffmpeg-static esbuild && npm rebuild` |
| Tailwind reclama de `content` | Vite herdou o PostCSS do app | `css: { postcss: {} }` no `vite.config.ts` (já vem) |
| Menu ou popover no lugar errado | mediu antes da fonte carregar | declarar a família em `storyboard.fonts` |
| Quadro do render diferente do preview | CSS animado ou callback | mover para a timeline |
| Página trava em "carregando" | erro de gosto ou exceção no mount | abra o preview: o erro aparece na tela |
