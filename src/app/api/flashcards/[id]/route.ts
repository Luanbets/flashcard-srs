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

    const flashcard = await db.flashcard.findUnique({
      where: { id },
    })

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    const updatedFlashcard = await db.flashcard.update({
      where: { id },
      data: {
        vocabulary: body.vocabulary,
        ipa: body.ipa,
        wordType: body.wordType,
        meaning: body.meaning,
        example1: body.example1 || null,
        example1Image: body.example1Image || null,
        example2: body.example2 || null,
        example2Image: body.example2Image || null,
        deck: body.deck || 'default',
      },
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

    const flashcard = await db.flashcard.findUnique({
      where: { id },
    })

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    await db.flashcard.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Flashcard deleted successfully' })
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 })
  }
}
