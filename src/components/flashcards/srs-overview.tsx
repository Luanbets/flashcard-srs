'use client'

import { useMemo, useRef, useEffect } from 'react'
import { FlashcardData, SRS_LEVELS, toDate } from './types'
import { Flame, Clock, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SRSOverviewProps {
  cards: FlashcardData[]
}

export function SRSOverview({ cards }: SRSOverviewProps) {
  const nowRef = useRef(Date.now())
  useEffect(() => {
    const interval = setInterval(() => {
      nowRef.current = Date.now()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const totalCards = cards.length

  const { levelCounts, dueCount, levelPercentages, totalReviews } = useMemo(() => {
    const nowMs = nowRef.current
    const counts = SRS_LEVELS.map((level) => ({
      ...level,
      count: cards.filter((c) => c.srsLevel === level.level).length,
    }))
    const due = cards.filter((c) => {
      const nextReviewDate = toDate(c.nextReview)
      return nextReviewDate ? nextReviewDate.getTime() <= nowMs : false
    })
    const pcts = counts.map((l) =>
      totalCards > 0 ? (l.count / totalCards) * 100 : 0
    )
    const reviews = cards.reduce((sum, c) => sum + c.reviewCount, 0)
    return { levelCounts: counts, dueCount: due.length, levelPercentages: pcts, totalReviews: reviews }
  }, [cards, totalCards])

  return (
    <div className="space-y-3">
      {/* Level distribution bar */}
      <div className="glass rounded-2xl p-4 glow-primary">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
            Phân bổ SRS
          </h3>
          <span className="text-xs text-muted-foreground">{totalCards} từ</span>
        </div>

        {/* Stacked bar with gradients */}
        {totalCards > 0 ? (
          <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            {levelPercentages.map(
              (pct, idx) =>
                pct > 0 && (
                  <div
                    key={idx}
                    className={cn('h-full transition-all duration-500', levelCounts[idx].barClass)}
                    style={{ width: `${pct}%` }}
                    title={`${levelCounts[idx].label}: ${levelCounts[idx].count}`}
                  />
                )
            )}
          </div>
        ) : (
          <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full bg-white/5" />
        )}

        {/* Level badges with gradient backgrounds */}
        <div className="flex flex-wrap gap-1.5">
          {levelCounts.map((level) => (
            <div
              key={level.level}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium border transition-all',
                level.count > 0
                  ? level.badgeClass
                  : 'bg-white/3 text-muted-foreground/40 border-white/5'
              )}
            >
              <div className={cn('h-1.5 w-1.5 rounded-full', level.barClass)} />
              <span className="hidden sm:inline">{level.label}</span>
              <span className="sm:hidden">{level.shortLabel}</span>
              <span className="font-bold">{level.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Due + Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={cn(
            'glass rounded-2xl p-4 transition-all',
            dueCount > 0 && 'glow-accent'
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                dueCount > 0
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'bg-white/5 text-muted-foreground'
              )}
            >
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Đến hạn</p>
              <p
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  dueCount > 0 ? 'text-orange-400' : 'text-foreground/50'
                )}
              >
                {dueCount}
              </p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Đã ôn</p>
              <p className="text-2xl font-bold tabular-nums text-foreground/70">
                {totalReviews}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
