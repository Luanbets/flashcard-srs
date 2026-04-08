import { db } from './firebase'
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Timestamp,
  serverTimestamp,
  limit,
} from 'firebase/firestore'

// ─── Types ───────────────────────────────────────────────────────

export interface DeckData {
  id: string
  name: string
  parentId: string | null
  order: number
  totalCount: number
  createdAt: any // Firestore Timestamp
  updatedAt: any
  children?: DeckData[]
}

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
  srsLevel: number
  easeFactor: number
  interval: number
  nextReview: any // Firestore Timestamp
  reviewCount: number
  lastReview: any | null // Firestore Timestamp
  deckId: string
  deck: { id: string; name: string }
  createdAt: any
  updatedAt: any
}

export interface DeckFormData {
  name: string
  parentId: string | null
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

// ─── Helper: convert Firestore doc to app object ─────────────────

function deckFromDoc(docSnap: any): DeckData {
  const d = docSnap.data()
  return {
    id: docSnap.id,
    name: d.name || '',
    parentId: d.parentId || null,
    order: d.order ?? 0,
    totalCount: 0, // populated by subscribeDecks from local map
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

function flashcardFromDoc(docSnap: any, deckName?: string): FlashcardData {
  const d = docSnap.data()
  return {
    id: docSnap.id,
    vocabulary: d.vocabulary || '',
    ipa: d.ipa || '',
    wordType: d.wordType || '',
    meaning: d.meaning || '',
    example1: d.example1 || null,
    example1Image: d.example1Image || null,
    example2: d.example2 || null,
    example2Image: d.example2Image || null,
    srsLevel: d.srsLevel ?? 0,
    easeFactor: d.easeFactor ?? 2.5,
    interval: d.interval ?? 0,
    nextReview: d.nextReview,
    reviewCount: d.reviewCount ?? 0,
    lastReview: d.lastReview || null,
    deckId: d.deckId || '',
    deck: { id: d.deckId || '', name: deckName || '' },
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

// ─── Helper: Timestamp to JS Date ────────────────────────────────

export function toDate(value: any): Date | null {
  if (!value) return null
  if (value instanceof Timestamp) return value.toDate()
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') return new Date(value)
  return null
}

export function toDateOrNow(value: any): Date {
  const d = toDate(value)
  return d || new Date()
}

// ─── Collections ─────────────────────────────────────────────────

const DECKS_COL = 'decks'
const CARDS_COL = 'flashcards'

// ─── Global Deck Cache ──────────────────────────────────────────
// Populated by subscribeDecks. Used by subscribeFlashcards to build
// efficient server-side queries.

let _deckNameCache: Record<string, string> = {}
let _deckParentCache: Record<string, string | null> = {}
let _parentDeckIds: Set<string> = new Set()
let _allDeckIds: string[] = []
let _deckTree: DeckData[] = []
let _deckCacheReady = false

// Local card count map - updated incrementally
let _cardCountMap: Record<string, number> = {}

function getChildDeckIds(parentId: string): Set<string> {
  const ids = new Set<string>([parentId])
  Object.entries(_deckParentCache).forEach(([id, pid]) => {
    if (pid === parentId) {
      ids.add(id)
      const nested = getChildDeckIds(id)
      nested.forEach(nid => ids.add(nid))
    }
  })
  return ids
}

function invalidateDeckCache() {
  _deckNameCache = {}
  _deckParentCache = {}
  _parentDeckIds = new Set()
  _allDeckIds = []
  _deckTree = []
  _deckCacheReady = false
}

function getDeckName(deckId: string): string {
  return _deckNameCache[deckId] || ''
}

// ─── Deck CRUD ───────────────────────────────────────────────────

export async function createDeck(data: { name: string; parentId: string | null }): Promise<string> {
  const now = Timestamp.now()
  const docRef = await addDoc(collection(db, DECKS_COL), {
    name: data.name.trim(),
    parentId: data.parentId || null,
    order: 0,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

export async function updateDeck(id: string, data: Partial<{ name: string; parentId: string; order: number }>) {
  const ref = doc(db, DECKS_COL, id)
  const updateData: Record<string, any> = { updatedAt: Timestamp.now() }
  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.parentId !== undefined) updateData.parentId = data.parentId || null
  if (data.order !== undefined) updateData.order = data.order
  await updateDoc(ref, updateData)
}

export async function deleteDeck(id: string) {
  await deleteDeckRecursive(id)
}

async function deleteDeckRecursive(deckId: string) {
  // Get children
  const childrenSnap = await getDocs(
    query(collection(db, DECKS_COL), where('parentId', '==', deckId))
  )
  for (const childDoc of childrenSnap.docs) {
    await deleteDeckRecursive(childDoc.id)
  }
  // Delete flashcards in this deck
  const cardsSnap = await getDocs(
    query(collection(db, CARDS_COL), where('deckId', '==', deckId))
  )
  const batch = writeBatch(db)
  cardsSnap.docs.forEach((cardDoc) => {
    batch.delete(cardDoc.ref)
  })
  // Also delete the deck itself
  batch.delete(doc(db, DECKS_COL, deckId))
  await batch.commit()
}

// ─── Flashcard CRUD (PERFORMANCE: use Timestamp.now instead of serverTimestamp) ──

export async function createFlashcard(data: FlashcardFormData): Promise<string> {
  const now = Timestamp.now()
  const docRef = await addDoc(collection(db, CARDS_COL), {
    vocabulary: data.vocabulary,
    ipa: data.ipa,
    wordType: data.wordType,
    meaning: data.meaning,
    example1: data.example1 || null,
    example1Image: data.example1Image || null,
    example2: data.example2 || null,
    example2Image: data.example2Image || null,
    srsLevel: 0,
    easeFactor: 2.5,
    interval: 0,
    nextReview: now,
    reviewCount: 0,
    lastReview: null,
    deckId: data.deckId,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

export async function updateFlashcard(id: string, data: Partial<FlashcardFormData>) {
  const ref = doc(db, CARDS_COL, id)
  const updateData: Record<string, any> = { updatedAt: Timestamp.now() }
  if (data.vocabulary !== undefined) updateData.vocabulary = data.vocabulary
  if (data.ipa !== undefined) updateData.ipa = data.ipa
  if (data.wordType !== undefined) updateData.wordType = data.wordType
  if (data.meaning !== undefined) updateData.meaning = data.meaning
  if (data.example1 !== undefined) updateData.example1 = data.example1 || null
  if (data.example1Image !== undefined) updateData.example1Image = data.example1Image || null
  if (data.example2 !== undefined) updateData.example2 = data.example2 || null
  if (data.example2Image !== undefined) updateData.example2Image = data.example2Image || null
  if (data.deckId !== undefined) updateData.deckId = data.deckId
  await updateDoc(ref, updateData)
}

export async function deleteFlashcard(id: string) {
  await deleteDoc(doc(db, CARDS_COL, id))
}

// ─── SM-2 Algorithm ──────────────────────────────────────────────

type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

const INTERVALS = [0, 1, 3, 7, 14, 30]

function calculateInterval(level: number, easeFactor: number): number {
  if (level >= INTERVALS.length) {
    return Math.round(INTERVALS[INTERVALS.length - 1] * easeFactor)
  }
  return INTERVALS[level]
}

function applySM2(
  currentLevel: number,
  currentEaseFactor: number,
  currentInterval: number,
  rating: ReviewRating
): {
  newLevel: number
  newEaseFactor: number
  newInterval: number
  nextReview: Date
} {
  const now = new Date()

  switch (rating) {
    case 'again': {
      const newEaseFactor = Math.max(1.3, currentEaseFactor - 0.2)
      const nextReview = new Date(now.getTime() + 1 * 60 * 1000) // 1 minute
      return { newLevel: 0, newEaseFactor, newInterval: 0, nextReview }
    }
    case 'hard': {
      const newLevel = Math.max(0, currentLevel - 1)
      const newEaseFactor = Math.max(1.3, currentEaseFactor - 0.15)
      const halfInterval = Math.max(currentInterval * 0.5, 6 / 1440) // min 6 minutes
      const newInterval = Math.round(halfInterval * 1440) / 1440
      const nextReview = new Date(
        now.getTime() + Math.max(halfInterval, 6 / 1440) * 24 * 60 * 60 * 1000
      )
      return { newLevel, newEaseFactor, newInterval, nextReview }
    }
    case 'good': {
      const newLevel = Math.min(5, currentLevel + 1)
      const newInterval = calculateInterval(newLevel, currentEaseFactor)
      const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
      return { newLevel, newEaseFactor: currentEaseFactor, newInterval, nextReview }
    }
    case 'easy': {
      const newLevel = Math.min(5, currentLevel + 2)
      const newEaseFactor = currentEaseFactor + 0.15
      const newInterval = Math.round(calculateInterval(newLevel, newEaseFactor) * 1.3)
      const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
      return { newLevel, newEaseFactor, newInterval, nextReview }
    }
  }
}

export async function reviewFlashcard(
  id: string,
  rating: ReviewRating
): Promise<{ previousLevel: number; newLevel: number; rating: ReviewRating }> {
  const cardRef = doc(db, CARDS_COL, id)
  const cardSnap = await getDoc(cardRef)
  if (!cardSnap.exists()) throw new Error('Flashcard not found')

  const d = cardSnap.data()
  const result = applySM2(d.srsLevel ?? 0, d.easeFactor ?? 2.5, d.interval ?? 0, rating)

  const now = Timestamp.now()
  await updateDoc(cardRef, {
    srsLevel: result.newLevel,
    easeFactor: result.newEaseFactor,
    interval: result.newInterval,
    nextReview: Timestamp.fromDate(result.nextReview),
    reviewCount: (d.reviewCount ?? 0) + 1,
    lastReview: now,
    updatedAt: now,
  })

  return {
    previousLevel: d.srsLevel ?? 0,
    newLevel: result.newLevel,
    rating,
  }
}

// ─── Realtime Subscriptions (OPTIMIZED) ──────────────────────────

export type DecksCallback = (decks: DeckData[]) => void
export type FlashcardsCallback = (cards: FlashcardData[]) => void

// subscribeDecks - LIGHTWEIGHT: no extra queries on each snapshot!
// Card counts are maintained locally via the card count map.
export function subscribeDecks(callback: DecksCallback): () => void {
  const unsubscribeDecks = onSnapshot(
    query(collection(db, DECKS_COL), orderBy('order', 'asc')),
    (snap) => {
      // Build deck tree directly from snapshot (NO extra queries!)
      const allDecks: DeckData[] = snap.docs.map(deckFromDoc)
      const parents = allDecks.filter((d) => !d.parentId)
      const children = allDecks.filter((d) => d.parentId)

      // Assign children to parents
      const childMap: Record<string, DeckData[]> = {}
      children.forEach((c) => {
        if (!childMap[c.parentId!]) childMap[c.parentId!] = []
        childMap[c.parentId!].push(c)
      })

      const tree: DeckData[] = parents.map((p) => ({
        ...p,
        children: childMap[p.id] || [],
      }))

      // Apply counts from LOCAL card count map (no network queries!)
      tree.forEach((p) => {
        const childCount = (p.children || []).reduce(
          (sum, c) => sum + (_cardCountMap[c.id] || 0),
          0
        )
        p.totalCount = (_cardCountMap[p.id] || 0) + childCount
        ;(p.children || []).forEach((c) => {
          c.totalCount = _cardCountMap[c.id] || 0
        })
      })

      // Update global cache
      _deckNameCache = {}
      _deckParentCache = {}
      _parentDeckIds = new Set()
      _allDeckIds = allDecks.map((d) => d.id)
      allDecks.forEach((d) => {
        _deckNameCache[d.id] = d.name
        _deckParentCache[d.id] = d.parentId
        if (!d.parentId) _parentDeckIds.add(d.id)
      })
      _deckTree = tree
      _deckCacheReady = true

      callback(tree)
    },
    (error) => {
      console.error('[subscribeDecks] Firestore error:', error.code, error.message)
      if (error.code === 'permission-denied') {
        console.error('[subscribeDecks] Firestore rules may be blocking reads. Check Firebase Console > Firestore > Rules.')
      }
      callback([])
    }
  )
  return unsubscribeDecks
}

// subscribeFlashcards - EFFICIENT: queries ONLY cards for selected deck!
// When deckId is null: queries ALL cards (initial load)
// When deckId is set: queries ONLY cards where deckId matches (or parent+children)
// NOTE: We do NOT use orderBy in queries with where() to avoid needing composite indexes.
// Sorting is done client-side instead.
export function subscribeFlashcards(
  deckId: string | null,
  callback: FlashcardsCallback,
  onCardCountUpdate?: (countMap: Record<string, number>) => void
): () => void {
  // Determine deck IDs to query
  let targetDeckIds: string[] | null = null

  if (deckId && _deckCacheReady) {
    const isParent = _parentDeckIds.has(deckId)
    if (isParent) {
      targetDeckIds = Array.from(getChildDeckIds(deckId))
    } else {
      targetDeckIds = [deckId]
    }
  }

  // Build Firestore query - NO orderBy with where() to avoid composite index requirement!
  // Sorting is done client-side after receiving data.
  let firestoreQuery
  if (targetDeckIds && targetDeckIds.length === 1) {
    firestoreQuery = query(
      collection(db, CARDS_COL),
      where('deckId', '==', targetDeckIds[0])
    )
  } else if (targetDeckIds && targetDeckIds.length > 1) {
    firestoreQuery = query(
      collection(db, CARDS_COL),
      where('deckId', 'in', targetDeckIds)
    )
  } else {
    firestoreQuery = collection(db, CARDS_COL)
  }

  const unsubscribeCards = onSnapshot(
    firestoreQuery,
    (snap) => {
      // Update local card count map from this snapshot
      let newCountMap: Record<string, number> = { ..._cardCountMap }

      if (targetDeckIds) {
        for (const tid of targetDeckIds) {
          newCountMap[tid] = 0
        }
        snap.docs.forEach((docSnap) => {
          const did = docSnap.data().deckId
          if (did && targetDeckIds.includes(did)) {
            newCountMap[did] = (newCountMap[did] || 0) + 1
          }
        })
      } else {
        newCountMap = {}
        snap.docs.forEach((docSnap) => {
          const did = docSnap.data().deckId
          if (did) {
            newCountMap[did] = (newCountMap[did] || 0) + 1
          }
        })
      }

      _cardCountMap = newCountMap

      if (onCardCountUpdate) {
        onCardCountUpdate(_cardCountMap)
      }

      // Process cards and SORT client-side by createdAt descending
      const cards = snap.docs
        .map((docSnap) => {
          const d = docSnap.data()
          return flashcardFromDoc(docSnap, getDeckName(d.deckId))
        })
        .sort((a, b) => {
          const aTime = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0
          const bTime = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0
          return bTime - aTime // newest first
        })

      callback(cards)
    },
    (error) => {
      // CRITICAL: Log errors instead of silently failing!
      console.error('[subscribeFlashcards] Firestore error:', error.code, error.message)
      // If permission denied, it's likely a Firestore rules issue
      if (error.code === 'permission-denied') {
        console.error('[subscribeFlashcards] Firestore rules may be blocking reads. Check Firebase Console > Firestore > Rules.')
      }
      // Still call callback with empty array so UI doesn't hang
      callback([])
    }
  )

  return unsubscribeCards
}

// ─── Seed Data (NON-BLOCKING) ────────────────────────────────────

export async function seedData(): Promise<void> {
  // Use localStorage to remember if seed has been done (prevents re-seeding on F5)
  if (typeof window !== 'undefined' && localStorage.getItem('flashcard_seeded')) {
    return
  }

  // Quick check: only query 1 document to see if data exists
  try {
    const existingSnap = await getDocs(
      query(collection(db, DECKS_COL), limit(1))
    )
    if (!existingSnap.empty) {
      // Data exists - mark as seeded
      if (typeof window !== 'undefined') localStorage.setItem('flashcard_seeded', 'true')
      return
    }
  } catch (err) {
    console.error('[seedData] Error checking existing data:', err)
    return
  }

  const now = Timestamp.now()
  const pastReview = Timestamp.fromDate(
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  )
  const futureReview10d = Timestamp.fromDate(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  )
  const futureReview20d = Timestamp.fromDate(
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
  )
  const futureReview3d = Timestamp.fromDate(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  )
  const futureReview1d = Timestamp.fromDate(
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  )

  // ── Decks ──
  const dayParentRef = doc(collection(db, DECKS_COL))
  const day1Ref = doc(collection(db, DECKS_COL))
  const day2Ref = doc(collection(db, DECKS_COL))
  const day3Ref = doc(collection(db, DECKS_COL))
  const ieltsParentRef = doc(collection(db, DECKS_COL))
  const unit1Ref = doc(collection(db, DECKS_COL))
  const unit2Ref = doc(collection(db, DECKS_COL))

  const deckBatch = writeBatch(db)
  deckBatch.set(dayParentRef, {
    name: 'Từ vựng 100 ngày',
    parentId: null,
    order: 0,
    createdAt: now,
    updatedAt: now,
  })
  deckBatch.set(day1Ref, {
    name: 'Ngày 1',
    parentId: dayParentRef.id,
    order: 0,
    createdAt: now,
    updatedAt: now,
  })
  deckBatch.set(day2Ref, {
    name: 'Ngày 2',
    parentId: dayParentRef.id,
    order: 1,
    createdAt: now,
    updatedAt: now,
  })
  deckBatch.set(day3Ref, {
    name: 'Ngày 3',
    parentId: dayParentRef.id,
    order: 2,
    createdAt: now,
    updatedAt: now,
  })
  deckBatch.set(ieltsParentRef, {
    name: 'IELTS Vocabulary',
    parentId: null,
    order: 1,
    createdAt: now,
    updatedAt: now,
  })
  deckBatch.set(unit1Ref, {
    name: 'Unit 1: Family',
    parentId: ieltsParentRef.id,
    order: 0,
    createdAt: now,
    updatedAt: now,
  })
  deckBatch.set(unit2Ref, {
    name: 'Unit 2: Education',
    parentId: ieltsParentRef.id,
    order: 1,
    createdAt: now,
    updatedAt: now,
  })
  await deckBatch.commit()

  // ── Flashcards: Ngày 1 (Level 0 - new) ──
  const cardsBatch = writeBatch(db)

  const day1Cards = [
    {
      vocabulary: 'Serendipity',
      ipa: '/ˌserənˈdɪpɪti/',
      wordType: 'Noun',
      meaning: 'Sự tình cờ may mắn',
      example1: 'Finding that book was pure serendipity',
      example1Image:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
      example2:
        'The discovery of penicillin was a case of serendipity',
      deckId: day1Ref.id,
      srsLevel: 0,
      nextReview: now,
    },
    {
      vocabulary: 'Ephemeral',
      ipa: '/ɪˈfemərəl/',
      wordType: 'Adjective',
      meaning: 'Phù du, chóng tàn',
      example1: 'The beauty of cherry blossoms is ephemeral',
      example1Image:
        'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=250&fit=crop',
      example2:
        'Fame in the modern world is often ephemeral',
      deckId: day1Ref.id,
      srsLevel: 0,
      nextReview: now,
    },
    {
      vocabulary: 'Ubiquitous',
      ipa: '/juːˈbɪkwɪtəs/',
      wordType: 'Adjective',
      meaning: 'Có mặt khắp mọi nơi',
      example1: 'Smartphones have become ubiquitous',
      example1Image:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop',
      example2: 'Coffee shops are ubiquitous in this city',
      deckId: day1Ref.id,
      srsLevel: 0,
      nextReview: now,
    },
  ]

  // ── Flashcards: Ngày 2 ──
  const day2Cards = [
    {
      vocabulary: 'Resilience',
      ipa: '/rɪˈzɪliəns/',
      wordType: 'Noun',
      meaning: 'Sự kiên cường, khả năng phục hồi',
      example1:
        'Her resilience helped her overcome many challenges',
      example2:
        'The city showed remarkable resilience after the earthquake',
      deckId: day2Ref.id,
      srsLevel: 2,
      easeFactor: 2.5,
      interval: 3,
      nextReview: pastReview,
      reviewCount: 3,
      lastReview: pastReview,
    },
    {
      vocabulary: 'Pragmatic',
      ipa: '/præɡˈmætɪk/',
      wordType: 'Adjective',
      meaning: 'Thực tế, thực dụng',
      example1:
        'We need a pragmatic approach to solve this problem',
      example2: 'She took a pragmatic view of the situation',
      deckId: day2Ref.id,
      srsLevel: 4,
      easeFactor: 2.65,
      interval: 14,
      nextReview: futureReview10d,
      reviewCount: 7,
      lastReview: pastReview,
    },
  ]

  // ── Flashcards: Ngày 3 ──
  const day3Cards = [
    {
      vocabulary: 'Eloquent',
      ipa: '/ˈeləkwənt/',
      wordType: 'Adjective',
      meaning: 'Hùng biện, nói khéo léo',
      example1: 'She gave an eloquent speech at the ceremony',
      deckId: day3Ref.id,
      srsLevel: 1,
      easeFactor: 2.35,
      interval: 1,
      nextReview: pastReview,
      reviewCount: 1,
      lastReview: pastReview,
    },
    {
      vocabulary: 'Ambiguous',
      ipa: '/æmˈbɪɡjuəs/',
      wordType: 'Adjective',
      meaning: 'Mơ hồ, không rõ ràng',
      example1:
        'The instructions were ambiguous and confusing',
      deckId: day3Ref.id,
      srsLevel: 0,
      nextReview: now,
    },
  ]

  // ── Flashcards: IELTS Unit 1 ──
  const unit1Cards = [
    {
      vocabulary: 'Nurture',
      ipa: '/ˈnɜːrtʃər/',
      wordType: 'Verb',
      meaning: 'Nuôi dưỡng, chăm sóc',
      example1:
        "Parents should nurture their children's creativity",
      example2:
        'She nurtured her talent for painting throughout her childhood',
      deckId: unit1Ref.id,
      srsLevel: 3,
      easeFactor: 2.5,
      interval: 7,
      nextReview: futureReview1d,
      reviewCount: 5,
      lastReview: pastReview,
    },
    {
      vocabulary: 'Sibling',
      ipa: '/ˈsɪblɪŋ/',
      wordType: 'Noun',
      meaning: 'Anh chị em',
      example1:
        'She has three siblings, two brothers and a sister',
      deckId: unit1Ref.id,
      srsLevel: 5,
      easeFactor: 2.8,
      interval: 30,
      nextReview: futureReview20d,
      reviewCount: 10,
      lastReview: pastReview,
    },
  ]

  // ── Flashcards: IELTS Unit 2 ──
  const unit2Cards = [
    {
      vocabulary: 'Pedagogy',
      ipa: '/ˈpedəɡɒdʒi/',
      wordType: 'Noun',
      meaning: 'Phương pháp giảng dạy',
      example1:
        'Modern pedagogy emphasizes student-centered learning',
      deckId: unit2Ref.id,
      srsLevel: 1,
      easeFactor: 2.35,
      interval: 1,
      nextReview: pastReview,
      reviewCount: 1,
      lastReview: pastReview,
    },
    {
      vocabulary: 'Curriculum',
      ipa: '/kəˈrɪkjələm/',
      wordType: 'Noun',
      meaning: 'Chương trình giảng dạy',
      example1:
        'The school updated its curriculum to include more technology courses',
      deckId: unit2Ref.id,
      srsLevel: 3,
      easeFactor: 2.5,
      interval: 7,
      nextReview: futureReview3d,
      reviewCount: 4,
      lastReview: pastReview,
    },
    {
      vocabulary: 'Comprehend',
      ipa: '/ˌkɒmprɪˈhend/',
      wordType: 'Verb',
      meaning: 'Hiểu rõ, nắm bắt',
      example1:
        'It takes time to comprehend complex scientific concepts',
      deckId: unit2Ref.id,
      srsLevel: 0,
      nextReview: now,
    },
  ]

  const allCards = [...day1Cards, ...day2Cards, ...day3Cards, ...unit1Cards, ...unit2Cards]

  for (const card of allCards) {
    const cardRef = doc(collection(db, CARDS_COL))
    const cardData: Record<string, any> = {
      ...card,
      example1: card.example1 || null,
      example1Image: card.example1Image || null,
      example2: card.example2 || null,
      example2Image: card.example2Image || null,
      easeFactor: (card as any).easeFactor ?? 2.5,
      interval: (card as any).interval ?? 0,
      reviewCount: (card as any).reviewCount ?? 0,
      lastReview: (card as any).lastReview || null,
      createdAt: now,
      updatedAt: now,
    }
    cardsBatch.set(cardRef, cardData)
  }

  await cardsBatch.commit()
}
