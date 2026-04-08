'use client'

import { FlashcardData } from './types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface FlashcardCardProps {
  card: FlashcardData
  onEdit: (card: FlashcardData) => void
  onDelete: (card: FlashcardData) => void
}

export function FlashcardCard({ card, onEdit, onDelete }: FlashcardCardProps) {
  return (
    <Card className="group relative gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-primary" />

      <CardContent className="space-y-4 p-5">
        {/* Header with word type badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/15"
            >
              {card.wordType}
            </Badge>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(card)}
              aria-label={`Edit ${card.vocabulary}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(card)}
              aria-label={`Delete ${card.vocabulary}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Vocabulary */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {card.vocabulary}
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{card.ipa}</p>
        </div>

        {/* Meaning */}
        <p className="text-sm leading-relaxed text-foreground/80">{card.meaning}</p>

        {/* Example images (compact) */}
        {(card.example1Image || card.example2Image) && (
          <div className="flex gap-2 pt-1">
            {card.example1Image && (
              <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={card.example1Image}
                  alt="Example 1"
                  width={80}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            )}
            {card.example2Image && (
              <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-md">
                <Image
                  src={card.example2Image}
                  alt="Example 2"
                  width={80}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
