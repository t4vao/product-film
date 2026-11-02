# product-film

An agent skill for making product films entirely in code, at the level of
Polar's launch films. The agent rebuilds your product's real UI in DOM, animates
it with GSAP on one scrubbable timeline, and renders it frame by frame to a
2560x1440, 60fps MP4.

## Install

```bash
npx skills add t4vao/product-film
```

Works with Claude Code, Cursor, Codex and any [skills](https://github.com/vercel-labs/skills)-compatible agent.
Update with `npx skills update product-film`.

## Use

Ask your agent:

> Use the product-film skill. A 30s film about <feature>: <the user does X, the
> product proposes Y with its source, they accept, the result stays>.

The agent reads your design system, writes the storyboard, builds the scenes and
opens a live preview. To render:

```bash
npm run render    # out/<film>.mp4
```

Or click **Baixar vídeo** in the preview.

## What's inside

- **Taste enforced in code:** allowed easing, durations and pacing; bounce,
  elastic, hype copy and trailer sounds break the build.
- **Fidelity first:** colors, type, labels and flow come from your repo, never
  invented.
- **Human in control:** in AI products, the source shows before the user accepts.
- **A working engine** with an example film, a micro-interaction kit and audio
  cues exported as JSON.

Entry point: [`SKILL.md`](SKILL.md). Details in [`references/`](references/).

## Português

Skill para agentes fazerem filmes de produto 100% em código, no nível dos filmes
da Polar. Instale com `npx skills add t4vao/product-film` e peça o filme ao seu
agente. O `SKILL.md` e as referências estão em português.

## License

MIT
