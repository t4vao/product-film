# Changelog

## 1.1.0 · 2026-11-02

- Uma qualidade só: `npm run render` gera 2560x1440, 60fps. Sem 1080p, 4K ou
  opção de escala. O botão do preview virou "Baixar vídeo".
- README reduzido a instalar, usar e o que tem dentro.
- `npx skills add t4vao/product-film` instala a skill.

## 1.0.0 · 2026-11-02

- Motor testado em produção em dois filmes reais: janela do produto com câmera e
  linguagem de cartões.
- Storyboard como dados com `fonts` e `audio` (cues exportados em JSON no render).
- Regras de gosto que quebram o build: curvas, legendas, termos e sons vetados.
- Kit de micro-interações em `core/motion.ts`: cartão, pilha, digitação, destaque,
  lavado, entrada precisa, troca de estado.
- Render frame a frame em 1080p, 1440p e 2160p; botão de download no preview.
- Filme-modelo neutro e scaffold que copia motor e modelo para o repo do produto.
