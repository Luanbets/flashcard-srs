'use client'

import { useState, useMemo } from 'react'
import { FlashcardData, getSRSLevelConfig, SRS_LEVELS, toDate } from './types'
import { deleteFlashcard as deleteFlashcardFirestore } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Search, Volume2, Pencil, Trash2, Play, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface WordListProps {
  cards: FlashcardData[]
  onEdit: (card: FlashcardData) => void
  onDelete: (card: FlashcardData) => void
  onStartStudy: (cards: FlashcardData[]) => void
  onSpeak: (text: string) => void
  isSpeaking: boolean
  onRefresh: () => void
  deckId: string | null
  isLoading?: boolean
}

export function WordList({
  cards,
  onEdit,
  onDelete,
  onStartStudy,
  onSpeak,
  isSpeaking,
  onRefresh,
  deckId,
  isLoading = false,
}: WordListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<FlashcardData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const now = new Date()
  const dueCards = useMemo(
    () => {
      const nowMs = now.getTime()
      return cards.filter((c) => {
        const nextReviewDate = toDate(c.nextReview)
        return nextReviewDate ? nextReviewDate.getTime() <= nowMs : false
      })
    },
    [cards, now]
  )

  const filteredCards = useMemo(() => {
    let result = cards
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.vocabulary.toLowerCase().includes(q) ||
          c.meaning.toLowerCase().includes(q) ||
          c.wordType.toLowerCase().includes(q)
      )
    }
    if (levelFilter !== 'all') {
      const level = parseInt(levelFilter)
      result = result.filter((c) => c.srsLevel === level)
    }
    return result
  }, [cards, searchQuery, levelFilter])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteFlashcardFirestore(deleteTarget.id)
      toast({ title: 'Đã xóa', description: `Đã xóa "${deleteTarget.vocabulary}".` })
    } catch {
      toast({ title: 'Lỗi', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleStudySingle = (card: FlashcardData) => {
    onStartStudy([card])
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search & Filter Bar - Glass effect */}
      <div className="flex flex-col gap-2 border-b border-border/10 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Tìm từ vựng..."
            className="h-9 pl-9 text-sm bg-white/5 border-white/10 focus:border-purple-500/40 focus:bg-white/8 transition-all placeholder:text-muted-foreground/40 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-9 w-[130px] text-sm bg-white/5 border-white/10 rounded-lg">
              <SelectValue placeholder="Mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức</SelectItem>
              {SRS_LEVELS.map((l) => (
                <SelectItem key={l.level} value={String(l.level)}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {dueCards.length > 0 && (
            <Button
              size="sm"
              className={cn(
                'h-9 gap-1.5 border rounded-lg transition-all text-xs',
                'bg-orange-500/15 text-orange-400 border-orange-500/25',
                'hover:bg-orange-500/25 hover:border-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]'
              )}
              onClick={() => onStartStudy(dueCards)}
            >
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ôn tập</span>
              <Badge
                variant="secondary"
                className="ml-0.5 h-5 bg-orange-500/25 text-orange-300 px-1.5 text-[10px] border-0 rounded-md"
              >
                {dueCards.length}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <p className="text-[11px] text-muted-foreground/60 font-medium">
          {filteredCards.length} từ
          {deckId && ' trong bộ đã chọn'}
        </p>
        {dueCards.length > 0 && (
          <p className="text-[11px] font-semibold text-orange-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
            {dueCards.length} từ đến hạn
          </p>
        )}
      </div>

      {/* Word list */}
      <ScrollArea className="flex-1 custom-scrollbar">
        {filteredCards.length > 0 ? (
          <div className="px-2 pb-4 space-y-0.5">
            {filteredCards.map((card, index) => {
              const config = getSRSLevelConfig(card.srsLevel)
              const nextReviewDate = toDate(card.nextReview)
              const isDue = nextReviewDate ? nextReviewDate.getTime() <= now.getTime() : false
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-white/5"
                >
                  {/* TTS button */}
                  <button
                    onClick={() => onSpeak(card.vocabulary)}
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                      isSpeaking
                        ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(124,91,245,0.2)]'
                        : 'text-muted-foreground/60 hover:bg-white/5 hover:text-foreground'
                    )}
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Word info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-sm text-foreground/90">
                        {card.vocabulary}
                      </span>
                      <span className="text-[11px] text-muted-foreground/50">{card.ipa}</span>
                      {isDue && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse shrink-0" title="Đến hạn ôn" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground/60 mt-0.5">{card.meaning}</p>
                  </div>

                  {/* Level badge */}
                  <div className={cn(
                    'shrink-0 border text-[10px] font-bold px-2 py-0.5 rounded-md',
                    config.badgeClass
                  )}>
                    {config.shortLabel}
                  </div>

                  {/* Actions - fade in on hover */}
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-purple-400/70 hover:text-purple-300 hover:bg-purple-500/10"
                      onClick={() => handleStudySingle(card)}
                      title="Ôn thẻ này"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/60 hover:text-foreground hover:bg-white/5"
                      onClick={() => onEdit(card)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/60 hover:text-red-400 hover:bg-red-500/10"
                      onClick={() => setDeleteTarget(card)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {isLoading ? (
              <>
                <div className="relative h-8 w-8 mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground/60">Đang tải từ vựng...</p>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 mb-4">
                  <BookOpen className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground/60">
                  {searchQuery || levelFilter !== 'all'
                    ? 'Không tìm thấy thẻ nào'
                    : 'Chưa có thẻ nào'}
                </p>
              </>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="glass-strong border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa &ldquo;{deleteTarget?.vocabulary}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground/70">
              Thẻ này sẽ bị xóa vĩnh viễn. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-muted-foreground">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/90 text-white hover:bg-red-500 border-0"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
