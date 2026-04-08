'use client'

import { useState, useEffect, useCallback } from 'react'
import { FlashcardData, ReviewRating, RATING_CONFIG, getSRSLevelConfig } from './types'
import { reviewFlashcard } from '@/lib/firestore'
import { FlashcardFlipCard } from './flashcard-flip-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, RotateCcw, BookOpen } from 'lucide-react'

interface StudyModeProps {
  cards: FlashcardData[]
  onSpeak: (text: string) => void
  isSpeaking: boolean
  onComplete: () => void
  onCancel: () => void
}

interface ReviewResult {
  cardId: string
  rating: ReviewRating
  previousLevel: number
  newLevel: number
}

export function StudyMode({
  cards,
  onSpeak,
  isSpeaking,
  onComplete,
  onCancel,
}: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCards, setReviewedCards] = useState<ReviewResult[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [levelUpAnimation, setLevelUpAnimation] = useState<string | null>(null)

  const currentCard = cards[currentIndex]
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0

  // Auto-speak vocabulary when card changes
  useEffect(() => {
    if (currentCard && !isFlipped) {
      const timer = setTimeout(() => {
        onSpeak(currentCard.vocabulary)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentCard, isFlipped, onSpeak])

  // Auto-speak examples when flipped
  useEffect(() => {
    if (isFlipped && currentCard?.example1) {
      const timer = setTimeout(() => {
        onSpeak(currentCard.example1!)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isFlipped, currentCard, onSpeak])

  const handleRate = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard || isSubmitting) return
      setIsSubmitting(true)

      try {
        const result = await reviewFlashcard(currentCard.id, rating)
        setReviewedCards((prev) => [
          ...prev,
          {
            cardId: currentCard.id,
            rating,
            previousLevel: result.previousLevel,
            newLevel: result.newLevel,
          },
        ])

        // Show level change animation
        if (result.newLevel > result.previousLevel) {
          setLevelUpAnimation(currentCard.id)
          setTimeout(() => setLevelUpAnimation(null), 800)
        }

        // Move to next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setIsFlipped(false)
        } else {
          setIsComplete(true)
        }
      } catch {
        // Error handling silent
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentCard, currentIndex, cards.length, isSubmitting]
  )

  const handleFlip = () => {
    setIsFlipped((prev) => !prev)
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/50" />
        <p className="text-lg font-medium text-muted-foreground">Không có thẻ để ôn</p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Tất cả thẻ đã được ôn tập hoặc không có thẻ nào trong bộ đã chọn.
        </p>
        <Button variant="outline" className="mt-4" onClick={onCancel}>
          Quay lại
        </Button>
      </div>
    )
  }

  // Completion screen
  if (isComplete) {
    const againCount = reviewedCards.filter((r) => r.rating === 'again').length
    const hardCount = reviewedCards.filter((r) => r.rating === 'hard').length
    const goodCount = reviewedCards.filter((r) => r.rating === 'good').length
    const easyCount = reviewedCards.filter((r) => r.rating === 'easy').length
    const leveledUp = reviewedCards.filter((r) => r.newLevel > r.previousLevel).length

    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Hoàn thành!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Đã ôn {reviewedCards.length} thẻ
        </p>

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-2xl font-bold text-emerald-400">{leveledUp}</p>
            <p className="text-xs text-muted-foreground">Thăng cấp</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-2xl font-bold text-orange-400">{againCount + hardCount}</p>
            <p className="text-xs text-muted-foreground">Cần ôn lại</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-2xl font-bold text-green-400">{goodCount}</p>
            <p className="text-xs text-muted-foreground">Tốt</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <p className="text-2xl font-bold text-emerald-300">{easyCount}</p>
            <p className="text-xs text-muted-foreground">Dễ</p>
          </div>
        </div>

        {/* Per-card results */}
        <div className="mt-6 w-full space-y-1.5 text-left">
          {reviewedCards.map((result) => {
            const config = getSRSLevelConfig(result.newLevel)
            const prevConfig = getSRSLevelConfig(result.previousLevel)
            const ratingConf = RATING_CONFIG.find((r) => r.rating === result.rating)
            const card = cards.find((c) => c.id === result.cardId)
            return (
              <div
                key={result.cardId}
                className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
              >
                <span className="text-sm font-medium">{card?.vocabulary}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {prevConfig.shortLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className={cn('text-xs font-semibold', config.textColor)}>
                    {config.shortLabel}
                  </span>
                  <span className="text-xs">{ratingConf?.icon}</span>
                </div>
              </div>
            )
          })}
        </div>

        <Button className="mt-6" onClick={onComplete}>
          Quay lại danh sách
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Ôn tập</h2>
          <p className="text-sm text-muted-foreground">
            Nhấn vào thẻ để lật · Đánh giá mức nhớ
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Thoát
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {currentIndex + 1} / {cards.length}
          </span>
          <span>{reviewedCards.length} đã ôn</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="relative mx-auto max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <FlashcardFlipCard
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              onSpeak={onSpeak}
              isSpeaking={isSpeaking}
            />

            {/* Level up animation */}
            {levelUpAnimation === currentCard.id && (
              <motion.div
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 1, scale: 0.5 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.8 }}
              >
                <div className="rounded-full bg-emerald-500/20 p-4 text-3xl">⬆️</div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating buttons - show after flip */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-2"
          >
            <p className="text-center text-xs text-muted-foreground">
              Bạn nhớ từ này tốt thế nào?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {RATING_CONFIG.map(({ rating, label, color, hoverColor, icon }) => (
                <Button
                  key={rating}
                  disabled={isSubmitting}
                  onClick={() => handleRate(rating)}
                  className={cn(
                    'h-auto flex-col gap-1 rounded-xl border py-3 text-xs font-medium transition-all',
                    color,
                    hoverColor
                  )}
                >
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isFlipped && (
        <p className="text-center text-xs text-muted-foreground/60">
          Nhấn thẻ hoặc Space để lật · Xem nghĩa và đánh giá
        </p>
      )}
    </div>
  )
}
