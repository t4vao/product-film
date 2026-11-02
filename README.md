# Product Film: an Agent Skill

![Agent Skill](https://img.shields.io/badge/Agent-Skill-5b4ee6)
![Output](https://img.shields.io/badge/output-1440p%2060fps-2ea44f)
![Micro-interactions](https://img.shields.io/badge/micro--interactions-7-2ea44f)
![Updated](https://img.shields.io/badge/updated-2026--11--02-e67e22)

> A code-first workflow for making product films that **look designed, move with
> intent, and stay true to your product**, packaged as an [Agent Skill](https://agentskills.io)
> for Claude Code, Cursor, Codex, Copilot, Gemini, and any [skills.sh](https://skills.sh)-compatible agent.

**Product films entirely in code**, in the spirit of **Polar's launch films by Emil
Widlund**: a TypeScript storyboard as data, your product's **real UI rebuilt in
DOM** from its own design system, **GSAP** on one scrubbable timeline, a **live
preview** that updates as you edit, and a **frame-exact render** with Playwright
and ffmpeg. The throughline is taste enforced in code: the movement serves the
meaning, never the spectacle, and the human decides.

> **Last updated:** 2 November 2026 **Version:** 1.1.0. Output is always a
> 2560x1440, 60fps MP4. See [CHANGELOG](CHANGELOG.md) for what changed.

## Install

```bash
npx skills add t4vao/product-film
```

This pulls the skill into your agent's skills directory (`.claude/skills/`,
`.agents/skills/`, ...) and works with any Agent Skills-compatible agent.

**Already installed it?** Pull the latest version with `npx skills update product-film`
(or a bare `npx skills update` to refresh every installed skill). The command
re-fetches from GitHub; your agent picks up the new content on its next session.

Or install it manually:

```bash
git clone https://github.com/t4vao/product-film.git ~/.claude/skills/product-film
```

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
