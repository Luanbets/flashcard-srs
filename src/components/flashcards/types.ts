// Deck types
export interface DeckData {
  id: string
  name: string
  parentId: string | null
  order: number
  totalCount: number
  createdAt: string
  updatedAt: string
  children?: DeckData[]
  _count?: { flashcards: number }
}

export interface DeckFormData {
  name: string
  parentId: string | null
}

// Flashcard types with SRS fields
export interface FlashcardData {
  id: string
  vocabulary: string
  ipa: string
  wordType: string
  meaning: string
  example1: string | null
  example1Image: string | null
  example2: string | null
  example2Image: string | null
  // SRS fields
  srsLevel: number
  easeFactor: number
  interval: number
  nextReview: string
  reviewCount: number
  lastReview: string | null
  // Relations
  deckId: string
  deck: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export interface FlashcardFormData {
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

export const EMPTY_FORM: FlashcardFormData = {
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

export function flashcardToForm(card: FlashcardData): FlashcardFormData {
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

// SRS Level configuration
export const SRS_LEVELS = [
  { level: 0, label: 'Chưa học', color: 'bg-gray-400', textColor: 'text-gray-400', shortLabel: 'Mới' },
  { level: 1, label: 'Mới nhớ', color: 'bg-orange-400', textColor: 'text-orange-400', shortLabel: 'L1' },
  { level: 2, label: 'Dễ quên', color: 'bg-yellow-400', textColor: 'text-yellow-400', shortLabel: 'L2' },
  { level: 3, label: 'Khá tốt', color: 'bg-blue-400', textColor: 'text-blue-400', shortLabel: 'L3' },
  { level: 4, label: 'Tốt', color: 'bg-purple-400', textColor: 'text-purple-400', shortLabel: 'L4' },
  { level: 5, label: 'Thành thạo', color: 'bg-emerald-400', textColor: 'text-emerald-400', shortLabel: 'L5' },
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
  { rating: 'again', label: 'Nhớ lại', color: 'bg-red-500/20 text-red-400 border-red-500/30', hoverColor: 'hover:bg-red-500/30 hover:border-red-500/50', icon: '😵' },
  { rating: 'hard', label: 'Khó', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', hoverColor: 'hover:bg-orange-500/30 hover:border-orange-500/50', icon: '😤' },
  { rating: 'good', label: 'Tốt', color: 'bg-green-500/20 text-green-400 border-green-500/30', hoverColor: 'hover:bg-green-500/30 hover:border-green-500/50', icon: '😊' },
  { rating: 'easy', label: 'Dễ', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', hoverColor: 'hover:bg-emerald-500/30 hover:border-emerald-500/50', icon: '🤩' },
]
