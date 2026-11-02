# Descoberta

Objetivo: sair desta fase com uma ficha do produto em que cada valor tem um
arquivo de origem. Sem ela, o filme vira UI genérica. Escreva a ficha no topo de
`content.ts` e `film.css` como comentário de procedência.

## Ordem de leitura

Leia o mínimo que responde cada item, nesta ordem. Pare quando tiver a resposta.

1. **Instruções do repo:** `AGENTS.md`, `CLAUDE.md`, `design.md`, `CONTEXT.md`,
   `README`. Eles dizem o que o produto é, a voz e as regras que não se quebram.
2. **Tokens:** `tokens.css`, `tailwind.config.*`, `theme.ts`, variáveis CSS em
   `:root`, `design-tokens.json`, Figma variables se houver acesso.
3. **Mock fiel já existente:** demo da landing, Storybook, UI Lab, fixtures de
   teste visual. Se existir um mock do fluxo do filme, ele vale mais que o código
   de produção: já foi desenhado para ser mostrado. Copie estrutura, valores e
   rótulos de lá e cite o arquivo.
4. **Componentes do fluxo:** só os que aparecem no filme (editor, menu, chat,
   card de revisão, botão primário). Abra o componente e o CSS dele.
5. **Copy pública:** landing, página de produto, docs. Legendas e frase final
   saem daqui, adaptadas para fala curta, nunca inventadas.
6. **Ativos:** logo (SVG, variante clara), ícones (família e traço), favicons,
   fontes (arquivo local ou pacote, nunca CDN no render).

## Ficha

| Item | O que anotar | Exemplo de origem |
| --- | --- | --- |
| Fonte de interface | família, pesos usados, pacote local | `index.html`, `@fontsource/*` |
| Fonte mono | se o produto usa; senão, uma mono de sistema só para cabeçalhos do filme | tokens |
| Neutros | escala de cinzas com hex | `tokens.css` |
| Destaque | a cor de marca e onde o produto a usa (e onde proíbe) | `design.md` |
| Estados | hover, seleção, foco, sucesso, erro | componentes |
| Raio | escala; qual vale para cartão, botão, menu | tokens |
| Sombras | as do produto (menus, popovers); o filme não inventa outras | CSS do componente |
| Curvas e tempos | `--ease-out`, duração de press, de menu, de drawer | tokens, `design.md` |
| Ícones | biblioteca, tamanho, `stroke-width` | imports |
| Rótulos | texto exato de cada botão, menu e estado do fluxo | componente |
| Mensagens de espera | o texto real enquanto o sistema trabalha | componente ou serviço |
| Voz | o que o produto diz e o que proíbe dizer | `CONTEXT.md`, guia de marca |
| Regras do fluxo | o que o humano sempre decide, o que sempre aparece antes | `design.md`, ADRs |

## O que perguntar (só se o repo não responder)

Pergunte em um bloco curto, com a sua sugestão em cada item:

- Duração alvo e onde o filme vai passar (landing, rede social, apresentação).
- Linguagem: cartões (padrão) ou janela do produto com câmera.
- O fluxo exato, se o pedido não disser qual caminho do produto mostrar.

Não pergunte o que o repo responde (cor, fonte, rótulos). Não pergunte gosto
(curva, ritmo): a skill já decide.

## Sinais de alerta

- O pedido descreve uma feature que você não acha no código: confirme com o
  usuário antes. Filme de feature inexistente é anúncio falso.
- O produto tem duas cores de marca (uma antiga): pergunte ou siga a regra mais
  recente do `design.md`. Anote a decisão.
- A copy da landing contradiz a UI: o filme mostra a UI; a legenda segue a landing.
