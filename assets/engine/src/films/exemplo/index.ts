import type { Film } from '../../core/film'
import type { FilmModule } from '../../core/master'
import { abertura } from './scenes/01-abertura'
import { proposta } from './scenes/02-proposta'
import { resultado } from './scenes/03-resultado'
import { marca } from './scenes/04-marca'
import { storyboard } from './storyboard'
import { mountExemplo, type ExemploRefs } from './ui'

// Filme-modelo. Para um filme novo: copie esta pasta para src/films/<id>, registre
// em src/films/index.ts e troque content.ts, film.css, ui.ts e as cenas.

export const film: Film<ExemploRefs> = {
  storyboard,
  mount: mountExemplo,
  scenes: { abertura, proposta, resultado, marca },
}

// Linguagem de cartoes: sem camera, quadro inteiro. Para a linguagem de janela de
// produto com camera, veja references/storyboard.md da skill.
export const camera: FilmModule<ExemploRefs>['camera'] = () => ({
  safe: { top: 0, right: 0, bottom: 0, left: 0 },
  radius: 0,
})
