import type { Lang } from './types';

export interface StyleLabels {
  technical: string;
  original: string;
  editorial: string;
  noir: string;
  running: string;
  paused: string;
  progress: string;
}

const LABELS: Record<Lang, StyleLabels> = {
  en: {
    technical: 'Blue and green style',
    original: 'Original blue style',
    editorial: 'Orange style',
    noir: 'Monochrome ink style',
    running: 'Pause automatic style changes',
    paused: 'Resume automatic style changes',
    progress: 'Progress to next style',
  },
  es: {
    technical: 'Estilo azul y verde',
    original: 'Estilo azul original',
    editorial: 'Estilo naranja',
    noir: 'Estilo tinta monocroma',
    running: 'Pausar cambio automático de estilo',
    paused: 'Reanudar cambio automático de estilo',
    progress: 'Progreso hasta el siguiente estilo',
  },
  fr: {
    technical: 'Style bleu et vert',
    original: 'Style bleu original',
    editorial: 'Style orange',
    noir: 'Style encre monochrome',
    running: 'Mettre en pause le changement automatique de style',
    paused: 'Reprendre le changement automatique de style',
    progress: 'Progression vers le style suivant',
  },
};

export function getStyleLabels(lang: Lang): StyleLabels {
  return LABELS[lang];
}
