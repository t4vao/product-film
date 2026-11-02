# Storyboard e contrato das cenas

## Estrutura de um filme

```
src/films/<id>/
  storyboard.ts   dados: cenas, duracoes, beats, legendas, fontes, audio
  content.ts      todo texto da tela, com procedencia no topo
  film.css        tokens e visual do produto (sem transition/animation)
  ui.ts           mount: monta o cenario, mede, aplica estados iniciais
  scenes/NN-*.ts  uma funcao por cena
  index.ts        exporta `film` e `camera`
```

Registre o filme em `src/films/index.ts`. O scaffold faz isso.

## Formato do storyboard

```ts
const proposta = {
  id: 'proposta',                 // estavel: ?scene=proposta, nome dos stills
  label: 'Proposta com fonte',    // regua do preview
  duration: 6.0,                  // segundos; a soma e o filme
  caption: { text: 'A proposta vem com a fonte.', in: 0.3, out: 5.7 }, // opcional
  beats: { cardIn: 0.1, typeFrom: 0.9, sourceIn: 3.0, clickAccept: 4.9 },
} satisfies SceneSpec

export const storyboard: Storyboard = {
  id: 'feature-30s', title: '...', width: 1920, height: 1080, fps: 60,
  fonts: ['Inter Variable'],     // o motor espera carregar antes de medir
  scenes: [abertura, proposta, resultado, marca],
  audio: [{ scene: 'proposta', at: proposta.beats.clickAccept, sound: 'click' }],
}
```

- **Beats** são os instantes dos gestos, relativos à cena. Os gestos derivados (o
  menu abre `DUR.press` depois do clique) ficam na cena, calculados a partir do beat.
- **`caption`** é o letreiro fixo do topo (linguagem de janela). Na linguagem de
  cartões, a legenda mora embaixo de cada cartão e vem de `content.ts`.
- **`audio`** usa os mesmos beats: mover o clique move o som.
- Sempre o layout 1920x1080 lógico. Resolução de saída é decisão do render.

## Contrato das cenas

```ts
export const proposta: SceneBuilder<Refs, PropostaBeats> = (tl, { beats: b, duration }, ctx) => {
  // so tl.to(), tl.set() e helpers do kit, com tempos relativos a cena
}
```

1. **Plano-sequência.** Todas as cenas compartilham um cenário montado uma vez.
   Cada cena começa no estado em que a anterior terminou. O topo do arquivo diz:
   `Parte de: ... Termina em: ...`.
2. **Estado inicial só no `mount`.** Cenas usam `.to()`. `fromTo` só com
   `immediateRender: false`. Assim o scrub para trás sempre volta certo.
3. **Nada de CSS animado.** Nenhum `transition`/`animation` no CSS do filme.
4. **Sem callbacks com efeito.** Nada de `onComplete` que mexe no DOM; o render
   faz seek e callbacks não disparam de forma confiável. Troca de texto com o
   plugin de texto (`tl.to(el, { text: { value } })`) ou dois elementos empilhados.
5. **Medir com `worldRect`/`cursor.point`.** Eles ignoram transforms de entrada.
   Rolagens feitas por transform são somadas pela cena (`shiftRect`).
6. **Uma cena não pode passar da duração.** O preview avisa no console.

## As duas linguagens

### Cartões (padrão, estilo Polar)

Um momento por cartão, sem câmera (`camera: safe 0, radius 0`). Cartão de
1160px, centrado, legenda embaixo. Transição: `stepBack(atual, próximo)` +
`cardIn(próximo)` no mesmo instante. Bom para lançamento e redes. Exemplo:
`src/films/exemplo/`.

Composição típica de 30s:

| Cena | Duração | O que acontece |
| --- | --- | --- |
| Objeto | 4 a 5,5s | o documento/tela, um gesto (selecionar, abrir) |
| Pedido | 4 a 5,5s | sessão estilo terminal: pedido digitado, passos reais com ✓ |
| Proposta | 5 a 6s | a proposta com a fonte, ainda sem decisão |
| Decisão | 5 a 6s | antes/depois, o clique de aceite, o estado novo |
| Resultado | 4 a 5s | o objeto atualizado, com a fonte junto |
| Assinatura | 2,5 a 4s | marca e frase, parado |

### Janela do produto com câmera

O app inteiro num card, a câmera aproxima de cada gesto. O mundo é recortado
numa janela abaixo da faixa do letreiro (`safe.top` ~184), com `cover` = o
retângulo do app, para a câmera nunca mostrar fundo dentro da janela.
Enquadramentos saem de retângulos reais: `camera.frame(padRect(worldRect(el), 48, 36), { maxScale: 1.6 })`.
Centralize os planos num `layout.ts` quando mais de uma cena usa. Bom para
walkthrough e explicação. Regra: a câmera abre antes de um clique cuja
consequência está em outra parte da tela.

## Quebrando um briefing em cenas

1. Escreva o fluxo como verbos do usuário: seleciona, pede, confere, aceita, vê.
2. Cada verbo é uma cena, ou um beat se for curto (< 1s).
3. Para cada cena: o gesto, o estado de partida, o estado de chegada, a frase.
4. Some as durações. Passou do alvo: corte esperas e transições antes de cortar
   leitura. Faltou: segure a leitura, nunca invente gesto.
