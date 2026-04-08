import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const seedData = [
  {
    vocabulary: 'Serendipity',
    ipa: '/ˌserənˈdɪpɪti/',
    wordType: 'Noun',
    meaning: 'Sự tình cờ may mắn',
    example1: 'Finding that book was pure serendipity',
    example1Image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
    example2: 'The discovery of penicillin was a case of serendipity',
    example2Image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop',
    deck: 'default',
  },
  {
    vocabulary: 'Ephemeral',
    ipa: '/ɪˈfemərəl/',
    wordType: 'Adjective',
    meaning: 'Phù du, chóng tàn',
    example1: 'The beauty of cherry blossoms is ephemeral',
    example1Image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=250&fit=crop',
    example2: 'Fame in the modern world is often ephemeral',
    example2Image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=250&fit=crop',
    deck: 'default',
  },
  {
    vocabulary: 'Ubiquitous',
    ipa: '/juːˈbɪkwɪtəs/',
    wordType: 'Adjective',
    meaning: 'Có mặt khắp mọi nơi',
    example1: 'Smartphones have become ubiquitous',
    example1Image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop',
    example2: 'Coffee shops are ubiquitous in this city',
    example2Image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=250&fit=crop',
    deck: 'default',
  },
]

export async function POST() {
  try {
    const existingCount = await db.flashcard.count()

    if (existingCount > 0) {
      return NextResponse.json({ message: 'Database already has data, skipping seed' })
    }

    const result = await db.flashcard.createMany({
      data: seedData,
    })

    return NextResponse.json({ message: `Seeded ${result.count} flashcards` })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
