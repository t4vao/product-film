---
name: product-film
description: Faz filmes de produto 100% em código, no nível dos filmes da Polar (Emil Widlund): storyboard em TypeScript como dados, a UI real do produto montada em DOM, animação GSAP numa timeline mestra scrubável, preview ao vivo no navegador e render frame a frame (Playwright + ffmpeg) em MP4 1080p, 1440p ou 4K. Use quando pedirem um filme, vídeo, demo animada, motion de lançamento, teaser ou walkthrough de um produto ou feature; quando pedirem "um vídeo igual ao da Polar/Linear/Vercel"; ou para iterar, re-renderizar ou exportar um filme já feito com este sistema. Não use para gravação de tela real, edição de vídeo existente, GIF de bug ou animação de UI dentro do produto.
---

# Filmes de produto em código

Um filme é código: cada cena é um módulo TypeScript que monta DOM e escreve numa
timeline GSAP. Mudar um tempo, um texto ou a ordem é mudar uma linha e
re-renderizar. O render posiciona a timeline quadro a quadro, então o MP4 sai
idêntico em qualquer máquina.

O padrão de qualidade é o dos filmes da Polar: fundo quase preto, cartões claros,
tipografia limpa, movimento seco e intencional, que parece interação real e não
efeito. Quatro princípios mandam em tudo:

1. **Gosto acima de instrução.** O critério está em `references/taste.md` e no
   código (`src/core/taste.ts` quebra o build com curva ou legenda fora da regra).
2. **Fidelidade absoluta.** Cor, fonte, raio, rótulos e fluxo vêm do produto real.
   Nunca inventar UI genérica, feature, cor ou copy.
3. **Mudança barata.** Storyboard como dados, cenas isoladas, um lugar para cada
   coisa. Ninguém caça um `setTimeout`.
4. **O humano no controle.** Em produto com IA, a IA propõe e o humano decide. A
   fonte aparece antes do aceite, e o aceite é um clique visível.

## Comando de uso

Quem pede um filme diz o fluxo e a duração. Exemplo:

> Use a skill product-film. Filme de 30s sobre <feature>: <o usuário faz X, o
> produto propõe Y com fonte, ele aceita, o resultado fica>. Linguagem de cartões.

Para começar no repo do produto:

```bash
node ~/.claude/skills/product-film/scripts/scaffold.mjs tools/product-films --film <id>
cd tools/product-films && npm install
npm run dev                      # preview: http://localhost:5190/?film=<id>
```

`npm install` pode bloquear scripts de instalação; aprove `ffmpeg-static` e
`esbuild` (`npm install-scripts approve ffmpeg-static esbuild && npm rebuild`).

## Fluxo

Siga na ordem. Não pule a descoberta: é ela que separa um filme fiel de um filme
genérico.

### 1. Descoberta (antes de qualquer código)

Leia `references/discovery.md` e extraia do repo, com o arquivo de origem de cada
item: tokens (cor, fonte, espaçamento, raio, sombras, curvas), os componentes que
aparecem no fluxo, os rótulos exatos da UI, a copy pública (landing, docs) e as
regras do produto (o que nunca dizer, o que o humano sempre decide). Se o repo
tiver um mock fiel do fluxo (demo da landing, fixture de UI Lab, Storybook), ele é
a fonte principal: copie estrutura e valores de lá.

Pergunte só o que o repo não responde e muda o filme: duração alvo, público
(lançamento ou explicação), formato final, se a linguagem é de cartões ou de
janela do produto. Use o padrão da skill para o resto e diga que usou.

### 2. Storyboard (dados)

Leia `references/storyboard.md`. Quebre o fluxo em 4 a 7 cenas de 3 a 9 segundos,
cada uma com um gesto principal. Escreva `storyboard.ts`: `duration`, `caption`
(ou legenda do cartão) e `beats` por cena, mais `fonts` e `audio`. Mostre o
storyboard em texto ao usuário (cena, duração, o que acontece, frase) antes de
implementar se o pedido for aberto; se o fluxo veio fechado, siga.

### 3. Cenário e cenas

- `content.ts`: todo texto que aparece, com a procedência no topo.
- `film.css`: os tokens do produto. Nada de `transition` ou `animation` em CSS.
- `ui.ts` (o `mount`): monta todos os estados de uma vez, mede o layout, aplica os
  estados iniciais, nessa ordem.
- `scenes/NN-*.ts`: uma por cena, com o comentário "Parte de / Termina em" no topo.
  Use o kit de `src/core/motion.ts` e o ponteiro de `src/core/cursor.ts`. Os
  padrões com código estão em `references/micro-interactions.md`.

### 4. Revisão no preview e nos stills

Rode o preview e os stills (`npm run stills -- 2.4,8,15`, um por gesto) e olhe
cada quadro. Passe a lista de qualidade abaixo. Corrija e repita. Só renderize o
final quando os stills passarem.

### 5. Render

Leia `references/render.md`. `npm run render` (1080p) para revisar,
`npm run render:1440p` ou o botão "Baixar em 1440p" do preview para entregar,
`npm run render:4k` quando pedirem 4K. Confira o MP4 extraindo quadros com ffmpeg
antes de entregar. Os cues de áudio saem em `out/<id>.cues.json`.

## Regras de gosto (sempre ativas)

Detalhe e valores em `references/taste.md`. O núcleo:

- **Curvas:** `power3.out` para o que o sistema responde, `power2.out` para
  ajustes e saídas, `power2.inOut` só para ponteiro e câmera viajando entre dois
  pontos parados. Proibido bounce, elastic, back, overshoot, steps.
- **Pacing seco:** nenhuma cena parada sem leitura acontecendo. Depois que algo
  importante aparece, segure 1,2s para ler, não mais. Transições de 0,4 a 0,75s.
- **Um elemento principal por vez.** Se dois disputam o olho, um espera.
- **Movimento com motivo:** cada movimento é um clique, uma resposta, um texto
  entrando ou uma troca de estado. Sem whoosh, partícula, brilho, parallax,
  zoom de efeito ou textura decorativa.
- **Texto curto e falado:** legenda de até 8 palavras, uma frase que alguém diria
  em voz alta. Sem hype. Termos vetados pela voz do produto entram em
  `CAPTION.forbidden`.
- **Interface com tempo de interface:** press 120ms com `scale(.985)`, menus em
  140 a 160ms, cards em 260 a 280ms, texto chegando em 420ms com 110ms entre blocos.

## Anti-padrões (recuse ou corrija)

- UI inventada "parecida com o produto", ícone de outra família, cor fora dos tokens.
- Feature que o produto não tem, ou estado que ele não alcança, mesmo "só no vídeo".
- Copy nova de marketing quando a landing já diz a mesma coisa.
- Resposta de IA aparecendo pronta, sem a espera real; ou aceita sem clique.
- Fonte que aparece depois do aceite, ou some depois.
- Câmera que se mexe sem acompanhar um gesto; zoom para "dar energia".
- Texto digitado em velocidade de robô (> 55 car/s) ou de lesma (< 30 car/s).
- Logo voando, revelação com máscara, contagem regressiva, música épica nos cues.
- CSS `transition`/`animation` nas cenas (quebra o scrub e o render).

## Lista de qualidade antes de entregar

- [ ] Cada texto na tela tem procedência anotada em `content.ts`.
- [ ] Tokens do filme batem com os do design system (cor, fonte, raio).
- [ ] O fluxo é o do produto, na ordem do produto, com os rótulos dele.
- [ ] Em produto com IA: espera real, fonte visível antes do aceite, aceite por clique.
- [ ] Nenhum quadro com dois focos; nenhum quadro morto além de 1,5s.
- [ ] Legendas passam no `checkCaption` (o preview quebra se não passarem).
- [ ] Scrub para trás e para frente chega no mesmo quadro (sem CSS animado).
- [ ] Stills de cada gesto revisados; MP4 final conferido por quadros extraídos.

## Mapa

| Preciso de | Arquivo |
| --- | --- |
| O que extrair do repo e o que perguntar | `references/discovery.md` |
| Curvas, durações, pacing, hierarquia, o que não fazer | `references/taste.md` |
| Formato do storyboard, contrato das cenas, as duas linguagens | `references/storyboard.md` |
| Código dos micro-movimentos e exemplos de pacing | `references/micro-interactions.md` |
| Render, qualidade, áudio, problemas comuns | `references/render.md` |
| Motor (copiado pelo scaffold) | `assets/engine/` |
| Filme-modelo para copiar | `assets/engine/src/films/exemplo/` |
| Casos de teste da skill | `evals/evals.json` |
