import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')
    const includeChildren = searchParams.get('includeChildren') === 'true'

    let flashcards

    if (deckId && includeChildren) {
      // Get all descendant deck IDs
      const deckIds = await getDescendantDeckIds(deckId)
      deckIds.push(deckId)
      flashcards = await db.flashcard.findMany({
        where: { deckId: { in: deckIds } },
        orderBy: { createdAt: 'desc' },
        include: { deck: { select: { id: true, name: true } } },
      })
    } else if (deckId) {
      flashcards = await db.flashcard.findMany({
        where: { deckId },
        orderBy: { createdAt: 'desc' },
        include: { deck: { select: { id: true, name: true } } },
      })
    } else {
      flashcards = await db.flashcard.findMany({
        orderBy: { createdAt: 'desc' },
        include: { deck: { select: { id: true, name: true } } },
      })
    }

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 })
  }
}

async function getDescendantDeckIds(parentId: string): Promise<string[]> {
  const children = await db.deck.findMany({
    where: { parentId },
    select: { id: true },
  })
  const ids: string[] = []
  for (const child of children) {
    ids.push(child.id)
    const childIds = await getDescendantDeckIds(child.id)
    ids.push(...childIds)
  }
  return ids
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vocabulary, ipa, wordType, meaning, example1, example1Image, example2, example2Image, deckId } = body

    if (!vocabulary || !ipa || !wordType || !meaning || !deckId) {
      return NextResponse.json(
        { error: 'Vocabulary, IPA, word type, meaning, and deckId are required' },
        { status: 400 }
      )
    }

    // Verify deck exists
    const deck = await db.deck.findUnique({ where: { id: deckId } })
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
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
        deckId,
      },
      include: { deck: { select: { id: true, name: true } } },
    })

    return NextResponse.json(flashcard, { status: 201 })
  } catch (error) {
    console.error('Error creating flashcard:', error)
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}
