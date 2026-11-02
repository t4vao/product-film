# Gosto

Este arquivo é o critério. O código aplica a parte que dá para checar
(`src/core/taste.ts`); o resto é julgamento, e o julgamento segue isto.

## A ideia

O filme mostra o produto sendo usado por alguém que sabe usar. Cada movimento é
uma coisa que acontece de verdade: um clique, uma resposta chegando, um texto
entrando, um estado trocando. Se você não consegue dizer qual gesto causou um
movimento, ele sai.

A referência é a série de filmes da Polar (Emil Widlund): fundo quase preto,
cartões claros grandes, cabeçalho em mono maiúsculo com filete, uma cor de
destaque só, legenda curta embaixo do cartão, sessão em estilo terminal com
digitação, cartões que se empilham quando o próximo chega, assinatura da marca
no fim. Nada pisca, nada quica, nada brilha.

## Curvas

| Uso | Curva | Por quê |
| --- | --- | --- |
| Algo aparece porque o sistema respondeu (menu, card, texto, legenda) | `power3.out` | chega rápido e assenta; é o jeito de uma UI boa responder |
| Ajuste pequeno, troca de cor, saída, colapso | `power2.out` | mais suave, não chama atenção |
| Ponteiro e câmera indo de um ponto parado a outro | `power2.inOut` | mão e câmera aceleram e desaceleram; `.out` puro parece teleporte |
| Arrastar para selecionar | `power1.inOut` | velocidade de mão, quase constante |
| Giro de indicador de espera, digitação | `none` | mecânico de propósito |

Proibido: `bounce`, `elastic`, `back` (overshoot), `rough`, `steps`, `slow`,
curva customizada em função. O preview quebra se aparecer uma.

## Durações

| Gesto | Duração |
| --- | --- |
| Press de botão | 120ms, `scale(.985)` no máximo |
| Hover acendendo | 80 a 160ms |
| Menu, popover, barra de seleção | 140 a 160ms, de `scale(.97)` e 4px |
| Card de revisão, painel | 260 a 280ms, de 8px e `scale(.985)` |
| Bloco de texto chegando | 420ms, 6px, 110ms entre blocos |
| Cartão do filme entrando | 750ms, 28px |
| Pilha (cartão indo para trás) | 750ms |
| Legenda | 500ms entrando, 300ms saindo |
| Câmera | 1,0 a 1,2s |
| Ponteiro | 0,45 a 1,0s, cresce com a distância |
| Digitação | 40 caracteres por segundo (30 a 55 aceitável) |

## Pacing

- **Leitura manda nas pausas.** Depois que algo importante aparece, segure o
  bastante para ler em voz alta, uns 1,2s por frase curta. Não segure mais.
- **Nenhum quadro morto.** Se nada acontece por mais de 1,5s e não há texto
  novo para ler, encurte a cena.
- **Causa antes de efeito, no mesmo quadro.** Quando um clique muda outra parte
  da tela, a câmera (ou o layout) mostra as duas antes do clique.
- **A consequência vem depois do gesto.** O clique termina (120ms), depois a coisa
  acontece. Nunca simultâneo.
- **Esperas reais.** Se o produto mostra "consultando…" por 2s, o filme mostra a
  mesma mensagem, encurtada para 1 a 1,5s, nunca pulada.
- **Ritmo de 30s:** 4 a 7 cenas. Abertura curta (o objeto do filme na tela em
  menos de 1s), um momento de virada claro (a decisão), fim com assinatura de 2,5
  a 4s parada.

## Hierarquia visual

- Um elemento principal por quadro. Menu aberto: o resto não se mexe. Texto
  chegando: o ponteiro sai do caminho.
- O cartão (ou a janela) ocupa o centro; a legenda fica alinhada à borda esquerda
  dele, embaixo, em duas cores: rótulo branco, frase cinza.
- Texto dentro do cartão é grande: corpo 28 a 36px a 1080p. Rótulo mono 15px.
- A cor de destaque aparece só onde o produto a usa (botão da ação, estado de
  sucesso, trecho inserido). Hover e seleção ficam no tom do produto.

## Texto

- Legenda: até 8 palavras, uma frase falada. "Você decide o que entra." e não
  "Controle total sobre cada sugestão gerada".
- Rótulo da legenda: até 3 palavras, verbo ou estado ("Confira", "A fonte fica").
- A copy vem da landing ou da UI. Se precisar adaptar, encurte; não reescreva.
- Sem hype: "revolucionário", "mágico", "incrível", "game changer", "desbloqueie".
- Em produto com IA, não venda a tecnologia. Nomeie o produto; mostre o que ele faz.

## O que NÃO fazer

| Não | Em vez disso |
| --- | --- |
| Whoosh, partícula, brilho, lens flare, glitch | nada; o gesto basta |
| Zoom para "dar energia" | câmera só acompanha onde o gesto acontece |
| Parallax, tilt 3D, cartão girando | pilha: o anterior sobe e escurece |
| Gradiente de fundo, textura, fumaça | fundo liso quase preto |
| Texto aparecendo letra a letra fora de um campo de digitação | o bloco chega inteiro com 6px de subida |
| Resposta da IA pronta, sem espera | a mensagem de espera real, curta |
| Aceite implícito (o texto entra sozinho) | o ponteiro clica no botão do produto |
| Fonte no fim, como rodapé | fonte antes do aceite, e ela permanece depois |
| Contador animado sem motivo | número muda quando o dado muda |
| Cursor girando em círculo enquanto "pensa" | o ponteiro para fora do caminho |
| Logo com revelação, máscara ou brilho | o último cartão apaga, a marca acende |
| Música épica, riser, impacto nos cues | click, tecla, notificação, ou silêncio |
