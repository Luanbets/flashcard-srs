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
  deck: string
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
  deck: string
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
  deck: 'default',
}

export const WORD_TYPES = ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition', 'Conjunction', 'Interjection']

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
    deck: card.deck,
  }
}
