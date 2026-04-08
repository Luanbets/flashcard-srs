import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type Rating = 'again' | 'hard' | 'good' | 'easy'

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
  rating: Rating
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
      return {
        newLevel: 0,
        newEaseFactor,
        newInterval: 0,
        nextReview,
      }
    }
    case 'hard': {
      const newLevel = Math.max(0, currentLevel - 1)
      const newEaseFactor = Math.max(1.3, currentEaseFactor - 0.15)
      const halfInterval = Math.max(currentInterval * 0.5, 6 / 1440) // min 6 minutes
      const newInterval = Math.round(halfInterval * 1440) / 1440 // keep as fraction of days
      const nextReview = new Date(now.getTime() + Math.max(halfInterval, 6 / 1440) * 24 * 60 * 60 * 1000)
      return {
        newLevel,
        newEaseFactor,
        newInterval,
        nextReview,
      }
    }
    case 'good': {
      const newLevel = Math.min(5, currentLevel + 1)
      const newInterval = calculateInterval(newLevel, currentEaseFactor)
      const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
      return {
        newLevel,
        newEaseFactor: currentEaseFactor,
        newInterval,
        nextReview,
      }
    }
    case 'easy': {
      const newLevel = Math.min(5, currentLevel + 2)
      const newEaseFactor = currentEaseFactor + 0.15
      const newInterval = Math.round(calculateInterval(newLevel, newEaseFactor) * 1.3)
      const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)
      return {
        newLevel,
        newEaseFactor,
        newInterval,
        nextReview,
      }
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { rating } = body as { rating: Rating }

    if (!rating || !['again', 'hard', 'good', 'easy'].includes(rating)) {
      return NextResponse.json(
        { error: 'Rating must be one of: again, hard, good, easy' },
        { status: 400 }
      )
    }

    const flashcard = await db.flashcard.findUnique({ where: { id } })
    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    const result = applySM2(
      flashcard.srsLevel,
      flashcard.easeFactor,
      flashcard.interval,
      rating
    )

    const updatedFlashcard = await db.flashcard.update({
      where: { id },
      data: {
        srsLevel: result.newLevel,
        easeFactor: result.newEaseFactor,
        interval: result.newInterval,
        nextReview: result.nextReview,
        reviewCount: flashcard.reviewCount + 1,
        lastReview: new Date(),
      },
      include: { deck: { select: { id: true, name: true } } },
    })

    return NextResponse.json({
      flashcard: updatedFlashcard,
      changes: {
        previousLevel: flashcard.srsLevel,
        newLevel: result.newLevel,
        rating,
      },
    })
  } catch (error) {
    console.error('Error reviewing flashcard:', error)
    return NextResponse.json({ error: 'Failed to review flashcard' }, { status: 500 })
  }
}
