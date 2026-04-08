import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const flashcard = await db.flashcard.findUnique({
      where: { id },
      include: { deck: { select: { id: true, name: true } } },
    })

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    return NextResponse.json(flashcard)
  } catch (error) {
    console.error('Error fetching flashcard:', error)
    return NextResponse.json({ error: 'Failed to fetch flashcard' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const flashcard = await db.flashcard.findUnique({ where: { id } })
    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    const updatedFlashcard = await db.flashcard.update({
      where: { id },
      data: {
        ...(body.vocabulary !== undefined && { vocabulary: body.vocabulary }),
        ...(body.ipa !== undefined && { ipa: body.ipa }),
        ...(body.wordType !== undefined && { wordType: body.wordType }),
        ...(body.meaning !== undefined && { meaning: body.meaning }),
        ...(body.example1 !== undefined && { example1: body.example1 || null }),
        ...(body.example1Image !== undefined && { example1Image: body.example1Image || null }),
        ...(body.example2 !== undefined && { example2: body.example2 || null }),
        ...(body.example2Image !== undefined && { example2Image: body.example2Image || null }),
        ...(body.deckId !== undefined && { deckId: body.deckId }),
      },
      include: { deck: { select: { id: true, name: true } } },
    })

    return NextResponse.json(updatedFlashcard)
  } catch (error) {
    console.error('Error updating flashcard:', error)
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const flashcard = await db.flashcard.findUnique({ where: { id } })
    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    await db.flashcard.delete({ where: { id } })
    return NextResponse.json({ message: 'Flashcard deleted successfully' })
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 })
  }
}
