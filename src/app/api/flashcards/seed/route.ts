import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const existingCount = await db.deck.count()
    if (existingCount > 0) {
      return NextResponse.json({ message: 'Database already has data, skipping seed' })
    }

    // Create parent deck: Từ vựng 100 ngày
    const dayParent = await db.deck.create({
      data: { name: 'Từ vựng 100 ngày', order: 0 },
    })

    const day1 = await db.deck.create({
      data: { name: 'Ngày 1', parentId: dayParent.id, order: 0 },
    })
    const day2 = await db.deck.create({
      data: { name: 'Ngày 2', parentId: dayParent.id, order: 1 },
    })
    const day3 = await db.deck.create({
      data: { name: 'Ngày 3', parentId: dayParent.id, order: 2 },
    })

    // Create parent deck: IELTS Vocabulary
    const ieltsParent = await db.deck.create({
      data: { name: 'IELTS Vocabulary', order: 1 },
    })

    const unit1 = await db.deck.create({
      data: { name: 'Unit 1: Family', parentId: ieltsParent.id, order: 0 },
    })
    const unit2 = await db.deck.create({
      data: { name: 'Unit 2: Education', parentId: ieltsParent.id, order: 1 },
    })

    // Flashcards for Ngày 1 (Level 0 - new)
    const now = new Date()
    await db.flashcard.createMany({
      data: [
        {
          vocabulary: 'Serendipity',
          ipa: '/ˌserənˈdɪpɪti/',
          wordType: 'Noun',
          meaning: 'Sự tình cờ may mắn',
          example1: 'Finding that book was pure serendipity',
          example1Image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
          example2: 'The discovery of penicillin was a case of serendipity',
          deckId: day1.id,
          srsLevel: 0,
          nextReview: now,
        },
        {
          vocabulary: 'Ephemeral',
          ipa: '/ɪˈfemərəl/',
          wordType: 'Adjective',
          meaning: 'Phù du, chóng tàn',
          example1: 'The beauty of cherry blossoms is ephemeral',
          example1Image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=250&fit=crop',
          example2: 'Fame in the modern world is often ephemeral',
          deckId: day1.id,
          srsLevel: 0,
          nextReview: now,
        },
        {
          vocabulary: 'Ubiquitous',
          ipa: '/juːˈbɪkwɪtəs/',
          wordType: 'Adjective',
          meaning: 'Có mặt khắp mọi nơi',
          example1: 'Smartphones have become ubiquitous',
          example1Image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop',
          example2: 'Coffee shops are ubiquitous in this city',
          deckId: day1.id,
          srsLevel: 0,
          nextReview: now,
        },
      ],
    })

    // Flashcards for Ngày 2 (varying SRS levels, some due)
    const pastReview = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    await db.flashcard.createMany({
      data: [
        {
          vocabulary: 'Resilience',
          ipa: '/rɪˈzɪliəns/',
          wordType: 'Noun',
          meaning: 'Sự kiên cường, khả năng phục hồi',
          example1: 'Her resilience helped her overcome many challenges',
          example2: 'The city showed remarkable resilience after the earthquake',
          deckId: day2.id,
          srsLevel: 2,
          easeFactor: 2.5,
          interval: 3,
          nextReview: pastReview, // Due for review
          reviewCount: 3,
          lastReview: pastReview,
        },
        {
          vocabulary: 'Pragmatic',
          ipa: '/præɡˈmætɪk/',
          wordType: 'Adjective',
          meaning: 'Thực tế, thực dụng',
          example1: 'We need a pragmatic approach to solve this problem',
          example2: 'She took a pragmatic view of the situation',
          deckId: day2.id,
          srsLevel: 4,
          easeFactor: 2.65,
          interval: 14,
          nextReview: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // Not due
          reviewCount: 7,
          lastReview: pastReview,
        },
      ],
    })

    // Flashcards for Ngày 3
    await db.flashcard.createMany({
      data: [
        {
          vocabulary: 'Eloquent',
          ipa: '/ˈeləkwənt/',
          wordType: 'Adjective',
          meaning: 'Hùng biện, nói khéo léo',
          example1: 'She gave an eloquent speech at the ceremony',
          deckId: day3.id,
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
          example1: 'The instructions were ambiguous and confusing',
          deckId: day3.id,
          srsLevel: 0,
          nextReview: now,
        },
      ],
    })

    // Flashcards for IELTS Unit 1
    await db.flashcard.createMany({
      data: [
        {
          vocabulary: 'Nurture',
          ipa: '/ˈnɜːrtʃər/',
          wordType: 'Verb',
          meaning: 'Nuôi dưỡng, chăm sóc',
          example1: 'Parents should nurture their children\'s creativity',
          example2: 'She nurtured her talent for painting throughout her childhood',
          deckId: unit1.id,
          srsLevel: 3,
          easeFactor: 2.5,
          interval: 7,
          nextReview: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Due
          reviewCount: 5,
          lastReview: pastReview,
        },
        {
          vocabulary: 'Sibling',
          ipa: '/ˈsɪblɪŋ/',
          wordType: 'Noun',
          meaning: 'Anh chị em',
          example1: 'She has three siblings, two brothers and a sister',
          deckId: unit1.id,
          srsLevel: 5,
          easeFactor: 2.8,
          interval: 30,
          nextReview: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
          reviewCount: 10,
          lastReview: pastReview,
        },
      ],
    })

    // Flashcards for IELTS Unit 2
    await db.flashcard.createMany({
      data: [
        {
          vocabulary: 'Pedagogy',
          ipa: '/ˈpedəɡɒdʒi/',
          wordType: 'Noun',
          meaning: 'Phương pháp giảng dạy',
          example1: 'Modern pedagogy emphasizes student-centered learning',
          deckId: unit2.id,
          srsLevel: 1,
          easeFactor: 2.35,
          interval: 1,
          nextReview: pastReview, // Due
          reviewCount: 1,
          lastReview: pastReview,
        },
        {
          vocabulary: 'Curriculum',
          ipa: '/kəˈrɪkjələm/',
          wordType: 'Noun',
          meaning: 'Chương trình giảng dạy',
          example1: 'The school updated its curriculum to include more technology courses',
          deckId: unit2.id,
          srsLevel: 3,
          easeFactor: 2.5,
          interval: 7,
          nextReview: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
          reviewCount: 4,
          lastReview: pastReview,
        },
        {
          vocabulary: 'Comprehend',
          ipa: '/ˌkɒmprɪˈhend/',
          wordType: 'Verb',
          meaning: 'Hiểu rõ, nắm bắt',
          example1: 'It takes time to comprehend complex scientific concepts',
          deckId: unit2.id,
          srsLevel: 0,
          nextReview: now,
        },
      ],
    })

    return NextResponse.json({
      message: 'Seeded 2 parent decks, 5 child decks, and 13 flashcards',
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
