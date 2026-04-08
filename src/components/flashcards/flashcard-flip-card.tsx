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
        {/* Front Side - Glass card with gradient border */}
        <div
          className="gradient-border w-full rounded-3xl p-[1px]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full rounded-3xl glass-strong p-8 sm:p-10">
            <div className="flex min-h-[280px] sm:min-h-[320px] flex-col items-center justify-center gap-4 text-center">
              <Badge variant="secondary" className="text-sm font-medium bg-white/5 border-white/10 text-muted-foreground">
                {card.wordType}
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
                {card.vocabulary}
              </h2>
              <p className="text-lg text-muted-foreground/60">{card.ipa}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSpeak(card.vocabulary)
                }}
                className={cn(
                  'mt-2 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200',
                  isSpeaking
                    ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(124,91,245,0.3)] scale-110'
                    : 'bg-white/5 text-muted-foreground/60 hover:bg-white/10 hover:text-foreground'
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
        </div>

        {/* Back Side - Glass card with gradient border */}
        <div
          className="absolute inset-0 w-full rounded-3xl p-[1px]"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full rounded-3xl glass-strong p-8 sm:p-10">
            <div className="flex min-h-[280px] sm:min-h-[320px] flex-col gap-4">
              {/* Header */}
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-lg font-semibold text-foreground/90">
                  {card.vocabulary}{' '}
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/5 border-white/10 text-muted-foreground">
                    {card.wordType}
                  </Badge>
                </h3>
              </div>

              {/* Meaning */}
              <div>
                <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Nghĩa</p>
                <p className="mt-1 text-base text-foreground/85">{card.meaning}</p>
              </div>

              {/* Examples with TTS */}
              <div className="mt-1 flex-1 space-y-3">
                {card.example1 && (
                  <div className="rounded-xl bg-white/3 border border-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wide">Ví dụ 1</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSpeak(card.example1!)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 hover:bg-white/5 hover:text-foreground transition-colors"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-foreground/80">{card.example1}</p>
                    {card.example1Image && (
                      <div className="mt-2 overflow-hidden rounded-lg">
                        <Image
                          src={card.example1Image}
                          alt="Example 1"
                          width={400}
                          height={150}
                          className="h-auto w-full rounded-lg object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                )}
                {card.example2 && (
                  <div className="rounded-xl bg-white/3 border border-white/5 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-muted-foreground/50 uppercase tracking-wide">Ví dụ 2</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSpeak(card.example2!)
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/50 hover:bg-white/5 hover:text-foreground transition-colors"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-foreground/80">{card.example2}</p>
                    {card.example2Image && (
                      <div className="mt-2 overflow-hidden rounded-lg">
                        <Image
                          src={card.example2Image}
                          alt="Example 2"
                          width={400}
                          height={150}
                          className="h-auto w-full rounded-lg object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
