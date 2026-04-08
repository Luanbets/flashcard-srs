import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, parentId, order } = body

    const deck = await db.deck.findUnique({ where: { id } })
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Prevent setting parentId to self or a descendant (circular reference)
    if (parentId && parentId !== deck.id) {
      const isDescendant = await checkDescendant(id, parentId)
      if (isDescendant) {
        return NextResponse.json({ error: 'Cannot move deck into its own child' }, { status: 400 })
      }
    }

    const updatedDeck = await db.deck.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(updatedDeck)
  } catch (error) {
    console.error('Error updating deck:', error)
    return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 })
  }
}

async function checkDescendant(ancestorId: string, checkId: string): Promise<boolean> {
  const children = await db.deck.findMany({
    where: { parentId: ancestorId },
    select: { id: true },
  })
  for (const child of children) {
    if (child.id === checkId) return true
    if (await checkDescendant(child.id, checkId)) return true
  }
  return false
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const deck = await db.deck.findUnique({
      where: { id },
      include: { children: true },
    })
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    // Recursively delete all descendants and their flashcards
    await deleteDeckRecursive(id)

    return NextResponse.json({ message: 'Deck deleted successfully' })
  } catch (error) {
    console.error('Error deleting deck:', error)
    return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 })
  }
}

async function deleteDeckRecursive(deckId: string) {
  const children = await db.deck.findMany({
    where: { parentId: deckId },
    select: { id: true },
  })
  for (const child of children) {
    await deleteDeckRecursive(child.id)
  }
  await db.flashcard.deleteMany({ where: { deckId } })
  await db.deck.delete({ where: { id: deckId } })
}
