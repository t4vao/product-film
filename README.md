# product-film

An agent skill for making product films entirely in code, at the level of
Polar's launch films: a TypeScript storyboard as data, the product's real UI
rebuilt in DOM, GSAP animation on one scrubbable master timeline, a live preview
in the browser, and a frame-exact render (Playwright + ffmpeg) to MP4 at 1080p,
1440p or 4K.

A film is code. Changing a timing, a line of copy or the order of scenes is
editing one line and rendering again. Every frame is computed by seeking the
timeline, so the video comes out identical on any machine and never drops a frame.

> Português abaixo.

## What it gives the agent

- **Taste that is enforced, not suggested.** Allowed easing (`power3.out`,
  `power2.out`, `power2.inOut` for pointer and camera travel), durations, pacing,
  hierarchy and a list of what never to do. The engine refuses to build with
  bounce/elastic/back easing, long captions, hype words or trailer sounds.
- **Fidelity first.** A discovery step reads the product's design system, tokens,
  components, real UI labels and public copy, and records where every value came
  from. No invented UI, features, colors or copy.
- **Human in control.** For AI products: the real wait, the source visible before
  acceptance, and acceptance as a visible click.
- **A working engine.** Storyboard as data, scenes as isolated modules, camera
  framing from real element rects, a pointer that acts, a micro-interaction kit
  (card in, stack, typing, highlight, wash, precise arrival, state swap), audio
  cues exported as JSON for offline mixing, and a download button in the preview.
- **A neutral example film** to copy, and a scaffold script.

## Install

Claude Code (personal skill):

```bash
git clone https://github.com/t4vao/product-film ~/.claude/skills/product-film
```

Or per project, at `.claude/skills/product-film`. Other agents: point them at
`SKILL.md` and the files it references.

Requirements: Node 20+, and a Chromium for Playwright (`npx playwright install
chromium` if none is found). ffmpeg comes from `ffmpeg-static`.

## Use

In the product's repo:

```bash
node ~/.claude/skills/product-film/scripts/scaffold.mjs tools/product-films --film launch
cd tools/product-films
npm install          # if install scripts are blocked: npm install-scripts approve ffmpeg-static esbuild && npm rebuild
npm run dev          # preview at http://localhost:5190/?film=launch
```

Then ask the agent:

> Use the product-film skill. A 30s film about <feature>: <the user does X, the
> product proposes Y with its source, they accept, the result stays>. Card language.

Render:

```bash
npm run render          # 1920x1080 60fps, for review
npm run render:1440p    # 2560x1440 60fps, default delivery
npm run render:4k       # 3840x2160 60fps
npm run stills -- 2.4,8,15
```

## Layout

```
SKILL.md                    workflow, taste rules, anti-patterns, quality checklist
references/                 discovery, taste, storyboard, micro-interactions, render
assets/engine/              the engine the scaffold copies (core/, scripts/, example film)
scripts/scaffold.mjs        copies the engine and the example film into a repo
evals/evals.json            trigger and behavior cases
```

## Português

Skill para agentes fazerem filmes de produto 100% em código, no nível dos filmes
da Polar. O `SKILL.md` e as referências estão em português. Instale clonando em
`~/.claude/skills/product-film`, rode o scaffold no repo do produto e peça:

> Use a skill product-film. Filme de 30s sobre <feature>: <o usuário faz X, o
> produto propõe Y com fonte, ele aceita, o resultado fica>. Linguagem de cartões.

## License

MIT. See [LICENSE](LICENSE).
