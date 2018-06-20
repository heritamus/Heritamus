import { Types } from './types';

export const nodeTypes: Types[] = [
  { en: 'Album', pt: 'Albúm' },
  { en: 'Concept', pt: 'Conceito' },
  { en: 'Controversy', pt: 'Controvérsia' },
  { en: 'Custom', pt: 'Personalizado' },
  { en: 'Document ', pt: 'Documento' },
  { en: 'Entity', pt: 'Entidade' },
  { en: 'Group', pt: 'Grupo' },
  { en: 'Metric', pt: 'Métrica' },
  { en: 'Object', pt: 'Objecto' },
  { en: 'Person', pt: 'Pessoa' },
  { en: 'Phonogram', pt: 'Fonograma' },
  { en: 'Poem', pt: 'Poema' },
  { en: 'Score', pt: 'Partitura' },
  { en: 'Song', pt: 'Canção' },
  { en: 'Track', pt: 'Gravação' },
  { en: 'Tune', pt: 'Melodia' },
  { en: 'Work', pt: 'Obra' },
];

export function getNodeType(type: string, lang: string): string {
  let found = nodeTypes.find(n => n.en === type);
  if (found) {
    return found[lang];
  } else {
    if (lang === 'en') {
      return `Custom (${type})`;
    } else {
      return `Personalizado (${type})`;
    }
  }
}

export const OldnodeTypes = [
  'Canção',
  'Conceito',
  'Controvérsia',
  'Documento',
  'Entitade',
  'Gravação',
  'Grupo',
  'Melodia',
  'Métrica',
  'Objecto',
  'Obra',
  'Partitura',
  'Pessoa',
  'Poema',
  'Personalizado'
  /**'Evento', */
  /**'Letra', */
  /**'Passo', */
];

export const OldnodeTypesEn = [
  'Concept',
  'Controversy',
  'Document',
  'Entity',
  'Group',
  'Metric',
  'Object',
  'Person',
  'Poem ',
  'Score',
  'Song',
  'Track',
  'Tune ',
  'Work',
  'Custom'
  /**'Event', */
  /**'Letter', */
  /**'Step', */
];

