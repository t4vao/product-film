# Micro-interações e pacing

Todas existem em `src/core/motion.ts` e `src/core/cursor.ts`. Use as funções; os
números estão lá para que dois filmes se mexam igual.

## Cartão que entra e pilha

```ts
cardIn(tl, slot, at)                 // sobe 28px e acende em 750ms; legenda 250ms depois
stepBack(tl, atual, proximo, at)     // atual sobe ate 22px acima do proximo, 96,5%, escurece
```

Mesmo `at` para os dois: o próximo chega enquanto o anterior recua. Estado
inicial no mount: `gsap.set(slot.slot, slotInitial.slot); gsap.set(slot.card, slotInitial.card)`.

## Texto digitado com ritmo

```ts
const fim = typeText(tl, campo, caret, 'Fundamente este trecho', b.typeFrom) // 40 car/s
caretOff(tl, caret, fim + 0.3)
```

Só para o que alguém digita (campo, terminal). Resposta do sistema não é
digitada: chega em blocos com `arrive`.

## Destaque que sobe

```css
.trecho { background-image: linear-gradient(var(--selection), var(--selection));
          background-repeat: no-repeat; background-size: 0% 100%; }
```
```ts
cursor.drag(tl, marcadorFim, b.selectFrom, 0.9)
highlight(tl, trecho, b.selectFrom, 0.9)   // linha por linha, junto com o arrasto
```

Marcadores de largura zero (`<span class="marcador">`) no início e no fim do
trecho dão os pontos exatos para o ponteiro.

## Cursor que age

```ts
cursor.place(tl, { x: p.x - 160, y: p.y + 120 }, at - 0.3) // aparece perto, nunca do canto
cursor.show(tl, at)
cursor.moveTo(tl, botao, at + 0.1, 0.8)    // power2.inOut
cursor.click(tl, b.click, botao)           // ponteiro afunda; botao faz press .985 em 120ms
// consequencia a partir de b.click + DUR.press
cursor.hide(tl, b.click + 0.7)             // sai quando nao tem mais o que fazer
```

O ponteiro mora no mundo e cresce com o zoom, como numa gravação ampliada.
Depois de clicar algo que abre leitura (popover, card), tire a mão de cima do
texto: `moveTo` para 40px acima ou para a margem.

## Fonte ou elemento que entra com precisão

```ts
gsap.set(fonte, { autoAlpha: 0, y: 6 })    // no mount
arrive(tl, fonte, b.sourceIn)              // 420ms, power3.out
arrive(tl, [bloco1, bloco2, bloco3], at)   // em sequencia, 110ms entre eles
```

## Troca de estado de um controle

```ts
swap(tl, botaoAplicar, rotuloAplicado, b.click + DUR.press)
```

Os dois no mesmo `grid-area`. Nada de mudar `textContent` no meio.

## O que acabou de entrar

```ts
wash(tl, trechoNovo, 'rgba(62, 95, 77, 0.2)', at, 1.2) // acende 300ms, segura, desbota 1,6s
```

## Espera real

Duas mensagens de espera do produto, uma depois da outra, com o indicador girando
linear (rotação calculada pelo tempo, 850ms por volta). 1 a 1,5s no total.

## Exemplos de pacing

**Gesto com consequência em outro lugar (aceite):**
```
0.00  camera abre para mostrar botao e documento juntos (1,2s)
0.60  ponteiro sai em direcao ao botao (0,95s)
1.55  clique
1.67  card de revisao fecha, documento troca o trecho (420ms), lavado acende
1.77  contador de palavras atualiza
4.00  fim da cena (2,3s de leitura do resultado)
```

**Proposta com fonte (cartões):**
```
0.10  cartao chega; o anterior recua
0.90  texto digitado (2s)
3.00  fonte chega (420ms)
3.70  ponteiro aparece perto do botao
4.90  clique em Aceitar; troca para "Aceito"
6.00  proximo cartao
```

**Abertura:** o objeto do filme na tela antes de 1s. O primeiro gesto até 1,5s.
