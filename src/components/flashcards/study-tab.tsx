'use client'

import { useState } from 'react'
import { FlashcardData } from './types'
import { FlashcardFlipCard } from './flashcard-flip-card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, BookOpen } from 'lucide-react'

interface StudyTabProps {
  cards: FlashcardData[]
}

export function StudyTab({ cards }: StudyTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledCards, setShuffledCards] = useState<FlashcardData[]>(cards)
  const [prevCards, setPrevCards] = useState<FlashcardData[]>(cards)
  const { toast } = useToast()

  // Sync shuffled cards when source cards change
  if (prevCards !== cards) {
    setShuffledCards(cards)
    setCurrentIndex(0)
    setIsFlipped(false)
    setPrevCards(cards)
  }

  const currentCard = shuffledCards[currentIndex]

  const handleShuffle = () => {
    const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    toast({ title: 'Đã xáo trộn', description: 'Thứ tự thẻ đã được xáo trộn.' })
  }

  const handlePrevious = () => {
    if (shuffledCards.length === 0) return
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === 0 ? shuffledCards.length - 1 : prev - 1))
  }

  const handleNext = () => {
    if (shuffledCards.length === 0) return
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev === shuffledCards.length - 1 ? 0 : prev + 1))
  }

  const handleFlip = () => {
    setIsFlipped((prev) => !prev)
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">Chưa có thẻ để học</p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Hãy thêm thẻ từ vựng trước khi bắt đầu học.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Học từ vựng</h2>
          <p className="text-sm text-muted-foreground">
            Nhấn vào thẻ để lật và xem nghĩa
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleShuffle}>
          <Shuffle className="mr-1 h-4 w-4" />
          Xáo trộn
        </Button>
      </div>

      {/* Progress Counter */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{currentIndex + 1}</span>
        <span>/</span>
        <span>{shuffledCards.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="mx-auto h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / shuffledCards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="mx-auto max-w-md">
        {currentCard && (
          <FlashcardFlipCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="lg" onClick={handlePrevious} aria-label="Previous card">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleFlip}
          className="min-w-[120px]"
          aria-label="Flip card"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Lật
        </Button>
        <Button variant="outline" size="lg" onClick={handleNext} aria-label="Next card">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-muted-foreground/60">
        Dùng phím ← → để chuyển thẻ, Space để lật
      </p>
    </div>
  )
}
