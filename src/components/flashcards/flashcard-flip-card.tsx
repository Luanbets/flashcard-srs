'use client'

import { motion } from 'framer-motion'
import { FlashcardData } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FlashcardFlipCardProps {
  card: FlashcardData
  isFlipped: boolean
  onFlip: () => void
  onSpeak: (text: string) => void
  isSpeaking: boolean
}

export function FlashcardFlipCard({
  card,
  isFlipped,
  onFlip,
  onSpeak,
  isSpeaking,
}: FlashcardFlipCardProps) {
  return (
    <div
      className="perspective-1000 w-full cursor-pointer"
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onFlip()
      }}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Show front of card' : 'Show back of card'}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Front Side */}
        <div
          className="w-full rounded-2xl border border-border/50 bg-card p-8 shadow-xl sm:p-10"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex min-h-[280px] sm:min-h-[320px] flex-col items-center justify-center gap-4 text-center">
            <Badge variant="secondary" className="text-sm font-medium">
              {card.wordType}
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {card.vocabulary}
            </h2>
            <p className="text-lg text-muted-foreground">{card.ipa}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSpeak(card.vocabulary)
              }}
              className={cn(
                'mt-2 flex h-12 w-12 items-center justify-center rounded-full transition-all',
                isSpeaking
                  ? 'bg-primary/20 text-primary scale-110'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full rounded-2xl border border-border/50 bg-card p-8 shadow-xl sm:p-10"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex min-h-[280px] sm:min-h-[320px] flex-col gap-4">
            {/* Header */}
            <div className="border-b border-border/50 pb-3">
              <h3 className="text-lg font-semibold text-foreground">
                {card.vocabulary}{' '}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {card.wordType}
                </Badge>
              </h3>
            </div>

            {/* Meaning */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nghĩa</p>
              <p className="mt-1 text-base text-foreground">{card.meaning}</p>
            </div>

            {/* Examples with TTS */}
            <div className="mt-1 flex-1 space-y-3">
              {card.example1 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Ví dụ 1</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSpeak(card.example1!)
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{card.example1}</p>
                  {card.example1Image && (
                    <div className="mt-2 overflow-hidden rounded-md">
                      <Image
                        src={card.example1Image}
                        alt="Example 1"
                        width={400}
                        height={150}
                        className="h-auto w-full rounded-md object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              )}
              {card.example2 && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Ví dụ 2</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSpeak(card.example2!)
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{card.example2}</p>
                  {card.example2Image && (
                    <div className="mt-2 overflow-hidden rounded-md">
                      <Image
                        src={card.example2Image}
                        alt="Example 2"
                        width={400}
                        height={150}
                        className="h-auto w-full rounded-md object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
