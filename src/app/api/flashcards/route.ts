import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const flashcards = await db.flashcard.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(flashcards)
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vocabulary, ipa, wordType, meaning, example1, example1Image, example2, example2Image, deck } = body

    if (!vocabulary || !ipa || !wordType || !meaning) {
      return NextResponse.json(
        { error: 'Vocabulary, IPA, word type, and meaning are required' },
        { status: 400 }
      )
    }

    const flashcard = await db.flashcard.create({
      data: {
        vocabulary,
        ipa,
        wordType,
        meaning,
        example1: example1 || null,
        example1Image: example1Image || null,
        example2: example2 || null,
        example2Image: example2Image || null,
        deck: deck || 'default',
      },
    })

    return NextResponse.json(flashcard, { status: 201 })
  } catch (error) {
    console.error('Error creating flashcard:', error)
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}
