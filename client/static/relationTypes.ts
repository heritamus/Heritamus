import { Types } from './types';

export const relationTypes: Types[] = [
  { en: 'AuthoredBy', pt: 'AutoriaDe' },
  { en: 'ArrangedBy', pt: 'ArranjoPor' },
  { en: 'BelongsTo', pt: 'FazParteDe' },
  { en: 'Biography', pt: 'Biografia' },
  { en: 'ComposedBy ', pt: 'CompostaPor' },
  { en: 'FriendsWith', pt: 'AmigoDe' },
  { en: 'Genre', pt: 'Género' },
  { en: 'Has', pt: 'Para' },
  { en: 'Illustrates', pt: 'Ilustrou' },
  { en: 'InfluencedBy', pt: 'InfluenciadoPor' },
  { en: 'InvolvedIn', pt: 'EnvolvidoEm' },
  { en: 'Makes', pt: 'Constroi' },
  { en: 'MentoredBy', pt: 'EstudouCom' },
  { en: 'Owns', pt: 'Possui' },
  { en: 'ParticipatedIn', pt: 'ParticipouEm' },
  { en: 'PerformanceOf', pt: 'InterpretaçãoDe' },
  { en: 'Performs', pt: 'Interpreta' },
  { en: 'PerformedBy', pt: 'InterpretadaPor' },
  { en: 'PerformedWith', pt: 'ActuouCom' },
  { en: 'Plays', pt: 'Toca' },
  { en: 'PrintedBy', pt: 'PublicadoPor' },
  { en: 'PublishedBy', pt: 'PublicadoPor' },
  { en: 'RecordedBy', pt: 'GravadaPor' },
  { en: 'RelatedTo', pt: 'RelacionadoCom' },
  { en: 'RepresentedBy', pt: 'RepresentadoPor' },
  { en: 'Sings', pt: 'Canta' },
  { en: 'TranscribedBy', pt: 'TranscritoPor' },
  { en: 'TranscriptionOf', pt: 'Transcrição de' },
  { en: 'UploadedBy', pt: 'DisponibilizadoPor' },
  { en: 'WithWords', pt: 'ContadaComALetra' },
  { en: 'WithTune', pt: 'CantadaComAMelodia' },
  { en: 'WorksFor', pt: 'TrabalhouPara' },
  { en: 'WrittenBy', pt: 'EscritoPor' },
  { en: 'Custom', pt: 'Personalizado' }
];

export function getRelationType(type: string, lang: string): string {
  let found = relationTypes.find(r => r.en === type);
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

export const OldrelationTypes = [
  'ActuouCom',
  'AmigoDe',
  'Canta',
  'ComA',
  'ComALetra',
  'CompostaPor',
  'Construção',
  'EnvolvidoEm',
  'EstudouCom',
  'FornecidoPor',
  'GravadaPor',
  'Ilustra',
  'InfluenciadoPor',
  'Interpretou',
  'InterpretadoPor',
  'ParticipouEm',
  'PertenceA',
  'Possui',
  'PublicadoPor',
  'RelacionadoCom',
  'RepresentadoPor',
  'Tem',
  'Tocou',
  'TrabalhouPara',
  'Personalizado'
];

export const OldrelationTypesEn = [
  'BelongsTo',
  'ComposedBy',
  'FriendsWith',
  'Has',
  'Illustrates',
  'InfluencedBy',
  'InvolvedIn',
  'Makes',
  'MentoredBy',
  'Owns',
  'ParticipatedIn',
  'Performs',
  'PerformedBy',
  'PerformedWith',
  'Plays',
  'PublishedBy',
  'RecordedBy',
  'RelatedTo',
  'RepresentedBy',
  'Sings',
  'UploadedBy',
  'WithWords',
  'WithTune',
  'WorksFor',
  'Custom'
];