import type { SceneSpec, Storyboard } from '../../core/film'

// STORYBOARD (dados). E aqui que o filme se ajusta sem abrir as cenas:
// - `duration`: o ritmo. A soma e a duracao do filme.
// - `beats`: o instante de cada gesto, em segundos desde o inicio da cena.
// - `audio`: sons do gesto para mixar depois (render grava out/<id>.cues.json).
//
// Cada cena parte do estado em que a anterior terminou (plano-sequencia). O topo
// de cada arquivo em scenes/ diz de que estado parte e em qual termina.

const abertura = {
  id: 'abertura', label: 'Documento', duration: 4.0,
  beats: { cardIn: 0.2, pointerIn: 1.0, selectFrom: 1.4, selectFor: 0.9 },
} satisfies SceneSpec

const proposta = {
  id: 'proposta', label: 'Proposta com fonte', duration: 6.0,
  beats: { cardIn: 0.1, typeFrom: 0.9, sourceIn: 3.0, pointerIn: 3.7, clickAccept: 4.9 },
} satisfies SceneSpec

const resultado = {
  id: 'resultado', label: 'Resultado', duration: 4.0,
  beats: { cardIn: 0.1, wash: 0.5 },
} satisfies SceneSpec

const marca = {
  id: 'marca', label: 'Marca', duration: 2.5,
  beats: { out: 0, brandIn: 0.5 },
} satisfies SceneSpec

export const storyboard: Storyboard = {
  id: 'exemplo-16s',
  title: 'Filme-modelo',
  width: 1920,
  height: 1080,
  fps: 60,
  fonts: [],
  scenes: [abertura, proposta, resultado, marca],
  audio: [
    { scene: 'proposta', at: proposta.beats.clickAccept, sound: 'click', note: 'o clique que decide' },
  ],
}

export type AberturaBeats = typeof abertura.beats
export type PropostaBeats = typeof proposta.beats
export type ResultadoBeats = typeof resultado.beats
export type MarcaBeats = typeof marca.beats
