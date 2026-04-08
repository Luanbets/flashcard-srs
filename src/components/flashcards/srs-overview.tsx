'use client'

import { FlashcardData, SRS_LEVELS } from './types'
import { Card, CardContent } from '@/components/ui/card'
import { Flame, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SRSOverviewProps {
  cards: FlashcardData[]
}

export function SRSOverview({ cards }: SRSOverviewProps) {
  const now = new Date()
  const totalCards = cards.length

  // Count cards per level
  const levelCounts = SRS_LEVELS.map((level) => ({
    ...level,
    count: cards.filter((c) => c.srsLevel === level.level).length,
  }))

  // Count due cards
  const dueCards = cards.filter((c) => new Date(c.nextReview) <= now)
  const dueCount = dueCards.length

  // Calculate percentage for each level for the bar
  const levelPercentages = levelCounts.map((l) =>
    totalCards > 0 ? (l.count / totalCards) * 100 : 0
  )

  return (
    <div className="space-y-3">
      {/* Level distribution bar */}
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phân bổ SRS
            </h3>
            <span className="text-xs text-muted-foreground">{totalCards} từ</span>
          </div>

          {/* Stacked bar */}
          {totalCards > 0 ? (
            <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
              {levelPercentages.map(
                (pct, idx) =>
                  pct > 0 && (
                    <div
                      key={idx}
                      className={cn('h-full transition-all duration-500', levelCounts[idx].color)}
                      style={{ width: `${pct}%` }}
                      title={`${levelCounts[idx].label}: ${levelCounts[idx].count}`}
                    />
                  )
              )}
            </div>
          ) : (
            <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full bg-muted" />
          )}

          {/* Level badges */}
          <div className="flex flex-wrap gap-2">
            {levelCounts.map((level) => (
              <div
                key={level.level}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                  level.count > 0
                    ? 'bg-muted/80 text-foreground'
                    : 'bg-muted/30 text-muted-foreground/50'
                )}
              >
                <div className={cn('h-2 w-2 rounded-full', level.color)} />
                <span className="hidden sm:inline">{level.label}</span>
                <span className="sm:hidden">{level.shortLabel}</span>
                <span className="font-semibold">{level.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Due + Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className={cn(
            'border-border/50 bg-card/80',
            dueCount > 0 && 'border-orange-500/30 bg-orange-500/5'
          )}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                dueCount > 0
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đến hạn ôn tập</p>
              <p
                className={cn(
                  'text-xl font-bold',
                  dueCount > 0 ? 'text-orange-400' : 'text-foreground'
                )}
              >
                {dueCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng đã ôn</p>
              <p className="text-xl font-bold text-foreground">
                {cards.reduce((sum, c) => sum + c.reviewCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
