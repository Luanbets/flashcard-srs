// Re-export types from firestore module
export type {
  DeckData,
  FlashcardData,
  DeckFormData,
  FlashcardFormData,
} from '@/lib/firestore'
export { toDate, toDateOrNow } from '@/lib/firestore'

import type { DeckData, FlashcardData, FlashcardFormData } from '@/lib/firestore'

export interface DeckFormDataLocal {
  name: string
  parentId: string | null
}

// Flashcard form data for add/edit
export interface FlashcardFormDataLocal {
  vocabulary: string
  ipa: string
  wordType: string
  meaning: string
  example1: string
  example1Image: string
  example2: string
  example2Image: string
  deckId: string
}

export const EMPTY_FORM: FlashcardFormDataLocal = {
  vocabulary: '',
  ipa: '',
  wordType: 'Noun',
  meaning: '',
  example1: '',
  example1Image: '',
  example2: '',
  example2Image: '',
  deckId: '',
}

export const WORD_TYPES = [
  'Noun',
  'Verb',
  'Adjective',
  'Adverb',
  'Pronoun',
  'Preposition',
  'Conjunction',
  'Interjection',
]

export function flashcardToForm(card: FlashcardData): FlashcardFormDataLocal {
  return {
    vocabulary: card.vocabulary,
    ipa: card.ipa,
    wordType: card.wordType,
    meaning: card.meaning,
    example1: card.example1 || '',
    example1Image: card.example1Image || '',
    example2: card.example2 || '',
    example2Image: card.example2Image || '',
    deckId: card.deckId,
  }
}

// SRS Level configuration - designed for dark theme with gradient badges
export const SRS_LEVELS = [
  { level: 0, label: 'Chưa học', textColor: 'text-gray-400', shortLabel: 'Mới', badgeClass: 'srs-badge-l0', barClass: 'srs-bar-l0' },
  { level: 1, label: 'Mới nhớ', textColor: 'text-orange-400', shortLabel: 'L1', badgeClass: 'srs-badge-l1', barClass: 'srs-bar-l1' },
  { level: 2, label: 'Dễ quên', textColor: 'text-yellow-400', shortLabel: 'L2', badgeClass: 'srs-badge-l2', barClass: 'srs-bar-l2' },
  { level: 3, label: 'Khá tốt', textColor: 'text-blue-400', shortLabel: 'L3', badgeClass: 'srs-badge-l3', barClass: 'srs-bar-l3' },
  { level: 4, label: 'Tốt', textColor: 'text-purple-400', shortLabel: 'L4', badgeClass: 'srs-badge-l4', barClass: 'srs-bar-l4' },
  { level: 5, label: 'Thành thạo', textColor: 'text-emerald-400', shortLabel: 'L5', badgeClass: 'srs-badge-l5', barClass: 'srs-bar-l5' },
]

export function getSRSLevelConfig(level: number) {
  return SRS_LEVELS[Math.min(Math.max(level, 0), SRS_LEVELS.length - 1)]
}

// Review rating
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export const RATING_CONFIG: {
  rating: ReviewRating
  label: string
  color: string
  hoverColor: string
  icon: string
}[] = [
  { rating: 'again', label: 'Nhớ lại', color: 'bg-red-500/15 text-red-400 border-red-500/30', hoverColor: 'hover:bg-red-500/25 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]', icon: '😵' },
  { rating: 'hard', label: 'Khó', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', hoverColor: 'hover:bg-orange-500/25 hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]', icon: '😤' },
  { rating: 'good', label: 'Tốt', color: 'bg-green-500/15 text-green-400 border-green-500/30', hoverColor: 'hover:bg-green-500/25 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]', icon: '😊' },
  { rating: 'easy', label: 'Dễ', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', hoverColor: 'hover:bg-emerald-500/25 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]', icon: '🤩' },
]
