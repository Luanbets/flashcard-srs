import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const decks = await db.deck.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                _count: { select: { flashcards: true } },
              },
            },
            _count: { select: { flashcards: true } },
          },
        },
        _count: { select: { flashcards: true } },
      },
    })

    // Also get root-level counts for parent decks
    const allDecks = await db.deck.findMany()
    const deckMap = new Map(allDecks.map(d => [d.id, d]))

    function getTotalCount(deckId: string): number {
      const deck = deckMap.get(deckId)
      if (!deck) return 0
      return deck._count?.flashcards || 0
    }

    function getDescendantCount(deck: any): number {
      let count = getTotalCount(deck.id)
      if (deck.children) {
        for (const child of deck.children) {
          count += getDescendantCount(child)
        }
      }
      return count
    }

    const enrichedDecks = decks.map(deck => ({
      ...deck,
      totalCount: getDescendantCount(deck),
      children: deck.children?.map((child: any) => ({
        ...child,
        totalCount: getDescendantCount(child),
      })),
    }))

    return NextResponse.json(enrichedDecks)
  } catch (error) {
    console.error('Error fetching decks:', error)
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, parentId, order } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Deck name is required' }, { status: 400 })
    }

    const deck = await db.deck.create({
      data: {
        name: name.trim(),
        parentId: parentId || null,
        order: order ?? 0,
      },
    })

    return NextResponse.json(deck, { status: 201 })
  } catch (error) {
    console.error('Error creating deck:', error)
    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 })
  }
}
