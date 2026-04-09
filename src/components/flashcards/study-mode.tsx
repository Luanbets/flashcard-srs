'use client'

import { useState, useEffect, useCallback } from 'react'
import { FlashcardData, ReviewRating, RATING_CONFIG, getSRSLevelConfig } from './types'
import { reviewFlashcard } from '@/lib/firestore'
import { FlashcardFlipCard } from './flashcard-flip-card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, RotateCcw, BookOpen, Trophy, Star, Zap } from 'lucide-react'

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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="text-lg font-semibold text-foreground/80">Không có thẻ để ôn</p>
        <p className="mt-2 text-sm text-muted-foreground/60">
          Tất cả thẻ đã được ôn tập hoặc không có thẻ nào trong bộ đã chọn.
        </p>
        <Button variant="outline" className="mt-6 border-white/10 hover:bg-white/5" onClick={onCancel}>
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
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-xs shadow-lg"
            >
              <Star className="h-3.5 w-3.5 text-white" />
            </motion.div>
          </div>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-2xl font-bold gradient-text"
        >
          Hoàn thành!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-1 text-sm text-muted-foreground/70"
        >
          Đã ôn {reviewedCards.length} thẻ
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid w-full grid-cols-2 gap-3"
        >
          <div className="glass rounded-2xl p-4 glow-primary">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Thăng cấp</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400">{leveledUp}</p>
          </div>
          <div className="glass rounded-2xl p-4 glow-accent">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="h-4 w-4 text-orange-400" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Cần ôn lại</span>
            </div>
            <p className="text-3xl font-bold text-orange-400">{againCount + hardCount}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Tốt</span>
            </div>
            <p className="text-3xl font-bold text-green-400">{goodCount}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-purple-400" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Dễ</span>
            </div>
            <p className="text-3xl font-bold text-purple-400">{easyCount}</p>
          </div>
        </motion.div>

        {/* Per-card results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 w-full space-y-1.5 text-left"
        >
          {reviewedCards.map((result) => {
            const config = getSRSLevelConfig(result.newLevel)
            const prevConfig = getSRSLevelConfig(result.previousLevel)
            const ratingConf = RATING_CONFIG.find((r) => r.rating === result.rating)
            const card = cards.find((c) => c.id === result.cardId)
            return (
              <div
                key={result.cardId}
                className="flex items-center justify-between rounded-xl bg-white/3 px-3 py-2 border border-white/5"
              >
                <span className="text-sm font-medium text-foreground/80">{card?.vocabulary}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/60">{prevConfig.shortLabel}</span>
                  <span className="text-xs text-muted-foreground/40">→</span>
                  <span className={cn('text-xs font-bold', config.textColor)}>{config.shortLabel}</span>
                  <span className="text-sm">{ratingConf?.icon}</span>
                </div>
              </div>
            )
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button className="mt-8 btn-gradient rounded-xl px-8 text-white" onClick={onComplete}>
            Quay lại danh sách
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold gradient-text">Ôn tập</h2>
          <p className="text-sm text-muted-foreground/60 mt-0.5">
            Nhấn vào thẻ để lật · Đánh giá mức nhớ
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground/60 hover:text-foreground hover:bg-white/5" onClick={onCancel}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Thoát
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground/60">
          <span className="tabular-nums">{currentIndex + 1} / {cards.length}</span>
          <span className="tabular-nums">{reviewedCards.length} đã ôn</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
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
                <div className="rounded-full bg-emerald-500/20 p-4 text-3xl backdrop-blur-sm">⬆️</div>
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
            <p className="text-center text-xs text-muted-foreground/60">
              Bạn nhớ từ này tốt thế nào?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {RATING_CONFIG.map(({ rating, label, color, hoverColor, icon }) => (
                <Button
                  key={rating}
                  disabled={isSubmitting}
                  onClick={() => handleRate(rating)}
                  className={cn(
                    'h-auto flex-col gap-1 rounded-xl border py-3 text-xs font-medium transition-all duration-200',
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
        <p className="text-center text-xs text-muted-foreground/40">
          Nhấn thẻ hoặc Space để lật · Xem nghĩa và đánh giá
        </p>
      )}
    </div>
  )
}
