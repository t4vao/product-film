// Regras de gosto dos filmes de produto (skill product-film).
//
// Este arquivo e a parte reutilizavel do criterio: qualquer filme novo importa daqui
// as curvas, as duracoes e a paleta, e passa pelas checagens no fim do arquivo antes
// de tocar. Se uma regra precisa mudar, ela muda aqui, para todos os filmes, e nao
// num tween perdido dentro de uma cena.
//
// O principio: o filme mostra o produto sendo usado, nao um efeito sobre o produto.
// Tudo que se mexe tem um motivo que o espectador reconhece de uso real (um clique,
// uma resposta chegando, um texto entrando na peca). Sem whoosh, sem particula, sem
// mola, sem brilho.

// ---------------------------------------------------------------------------
// Curvas. Facil de trocar: mudar o valor aqui muda o filme inteiro.
// ---------------------------------------------------------------------------
export const EASE = {
  /** Algo aparece porque o sistema respondeu: menu, card, resposta, letreiro. */
  enter: 'power3.out',
  /** Ajustes pequenos e saidas: cor, opacidade, colapso de um card. */
  settle: 'power2.out',
  /**
   * Deslocamento entre dois pontos parados: ponteiro e camera. Uma mao (e um
   * operador de camera) acelera e desacelera; um .out puro aqui parece teleporte.
   * Continua na familia power2, sem overshoot.
   */
  travel: 'power2.inOut',
  /** Arrastar para selecionar: velocidade da mao, quase constante. */
  drag: 'power1.inOut',
  /** Sem curva. So para coisas mecanicas, como o giro do indicador de espera. */
  linear: 'none',
} as const

/** Curvas proibidas: qualquer coisa que passe do alvo ou chacoalhe. */
const FORBIDDEN_EASE = /bounce|elastic|back|rough|wiggle|slow|steps/i

// ---------------------------------------------------------------------------
// Duracoes em segundos. As de interface seguem boas regras de UI (< 300ms para UI
// comum, press de 120ms); se o design system do produto disser outra coisa, ele manda. As de camera e letreiro sao de filme: lentas o bastante para o
// olho acompanhar, curtas o bastante para nao parecerem efeito.
// ---------------------------------------------------------------------------
export const DUR = {
  /** Botao afundando no clique (scale .985). */
  press: 0.12,
  /** Hover, troca de cor, ficha que aparece. */
  micro: 0.16,
  /** Menu, popover, card de revisao. */
  ui: 0.26,
  /** Bloco de texto chegando, trecho trocando na peca. */
  enter: 0.42,
  /** Letreiro entrando ou saindo. */
  caption: 0.5,
  /** Camera indo de um enquadramento a outro. */
  camera: 1.2,
  /** Respiro de leitura minimo depois que algo importante aparece. */
  read: 1.2,
} as const

/** Atraso entre blocos de uma resposta chegando (o produto usa 70ms; o filme, mais lento). */
export const STAGGER = 0.11

/** Escala do clique em botao (no maximo .985; use a do produto se ele definir). */
export const PRESS_SCALE = 0.985

// ---------------------------------------------------------------------------
// Cor do palco. Fundo quase preto, cards claros. A cor de destaque e a do produto
// e so aparece onde o produto a usa: defina-a no CSS do filme, nao aqui.
// ---------------------------------------------------------------------------
export const PALETTE = {
  stage: '#0b0b0c',
  captionText: '#f4f4f4',
  captionMuted: '#8a8a8a',
  card: '#ffffff',
  cardEdge: 'rgba(255, 255, 255, 0.07)',
} as const

// ---------------------------------------------------------------------------
// Letreiros: curtos e falados. Uma frase que alguem diria em voz alta.
// ---------------------------------------------------------------------------
export const CAPTION = {
  maxChars: 48,
  maxWords: 8,
  /**
   * Hype vetado em qualquer produto. Acrescente aqui os termos que a voz do produto
   * proibe (ex.: "IA" como argumento de venda), descobertos na fase de descoberta.
   */
  forbidden: [/revolucion/i, /m[aá]gic/i, /game.?changer/i, /incr[ií]vel/i, /\bseamless/i, /supercharge/i, /\bunlock/i, /powered by ai/i],
} as const

// ---------------------------------------------------------------------------
// Checagens. Rodam ao montar o filme e quebram o preview com uma mensagem clara.
// ---------------------------------------------------------------------------
export function checkCaption(text: string, where: string): void {
  const words = text.trim().split(/\s+/).length
  if (text.length > CAPTION.maxChars || words > CAPTION.maxWords) {
    throw new Error(`[gosto] Letreiro longo demais em ${where}: "${text}" (${text.length} caracteres, ${words} palavras). Corte para uma frase falada.`)
  }
  for (const rule of CAPTION.forbidden) {
    if (rule.test(text)) throw new Error(`[gosto] Letreiro em ${where} usa termo vetado (${rule}): "${text}".`)
  }
}

/** Sons vetados: efeito de trailer, nao de produto. */
const FORBIDDEN_SOUND = /whoosh|swoosh|riser|boom|impact|swell|sparkle|magic/i

export function checkSound(sound: string, where: string): void {
  if (FORBIDDEN_SOUND.test(sound)) {
    throw new Error(`[gosto] Som "${sound}" em ${where} e efeito, nao interacao. Use o som do gesto (click, tecla, notificacao) ou nenhum.`)
  }
}

/**
 * Percorre a timeline inteira e recusa curvas fora da familia permitida. A GSAP
 * guarda a curva ja convertida em funcao, entao a comparacao e com as funcoes das
 * curvas de EASE.
 */
export function checkTimeline(tl: gsap.core.Timeline, parseEase: (name: string) => unknown): void {
  const allowed = new Set(Object.values(EASE).map((name) => parseEase(name)))
  for (const child of tl.getChildren(true, true, false)) {
    const ease = (child.vars as gsap.TweenVars).ease
    if (ease === undefined) continue
    if (typeof ease === 'string' && FORBIDDEN_EASE.test(ease)) {
      throw new Error(`[gosto] Curva vetada "${ease}". Use EASE.enter, EASE.settle ou EASE.travel.`)
    }
    if (!allowed.has(typeof ease === 'string' ? parseEase(ease) : ease)) {
      throw new Error(`[gosto] Curva fora da familia (${String(ease)}). Use os nomes de EASE para manter o filme coerente.`)
    }
  }
}
