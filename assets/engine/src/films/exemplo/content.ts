// TROQUE TUDO AQUI. Este e o filme-modelo da skill product-film: os textos sao
// marcadores neutros. Num filme real, cada texto vem do produto (rotulos da UI,
// copy da landing, dados de fixture) e o topo deste arquivo diz de onde veio cada
// um. Nada de copy inventada.

export const DOC = {
  header: 'Documento · rascunho',
  meta: 'Editado agora',
  section: 'Contexto',
  before: 'O prazo de entrega ficou para o próximo trimestre.',
  tail: 'A equipe confirmou a data em reunião e registrou a decisão.',
  after: 'O prazo de entrega passou para 15 de março, segundo a ata da reunião de 2 de fevereiro',
  afterRef: '(ata, item 3).',
}

export const PROPOSAL = {
  header: 'Sugestão',
  meta: '1 trecho',
  title: 'Trocar por uma data verificável',
  text: 'O prazo de entrega passou para 15 de março, segundo a ata da reunião de 2 de fevereiro (ata, item 3).',
  source: { label: 'Fonte', title: 'Ata da reunião · 2 de fevereiro', host: 'exemplo.org/atas/0202' },
  discard: 'Descartar',
  accept: 'Aceitar',
  accepted: 'Aceito',
}

export const NOTES = {
  abertura: { label: 'Selecione', note: 'Marque o trecho que precisa mudar.' },
  proposta: { label: 'Confira', note: 'A fonte aparece antes do aceite.' },
  resultado: { label: 'Pronto', note: 'O texto entra com a fonte junto.' },
}

export const BRAND = {
  /** TROQUE pelo logo real: import logo from '@product/assets/logo.svg?raw'. */
  wordmark: 'Produto',
  line: 'Uma frase da landing, dita em voz alta.',
}
