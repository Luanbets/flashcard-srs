'use client'

import { useState, useMemo } from 'react'
import { FlashcardData, getSRSLevelConfig, SRS_LEVELS } from './types'
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
}: WordListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [deleteTarget, setDeleteTarget] = useState<FlashcardData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const now = new Date()
  const dueCards = useMemo(
    () => cards.filter((c) => new Date(c.nextReview) <= now),
    [cards]
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
      const res = await fetch(`/api/flashcards/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Đã xóa', description: `Đã xóa "${deleteTarget.vocabulary}".` })
        onRefresh()
      }
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
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-2 border-b border-border/50 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm từ vựng..."
            className="h-9 pl-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
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
              className="h-9 gap-1.5 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30"
              onClick={() => onStartStudy(dueCards)}
            >
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ôn tập</span>
              <Badge
                variant="secondary"
                className="ml-0.5 h-5 bg-orange-500/30 text-orange-300 px-1.5 text-[10px]"
              >
                {dueCards.length}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          {filteredCards.length} từ
          {deckId && ' trong bộ đã chọn'}
        </p>
        {dueCards.length > 0 && (
          <p className="text-xs font-medium text-orange-400">
            🔥 {dueCards.length} từ đến hạn
          </p>
        )}
      </div>

      {/* Word list */}
      <ScrollArea className="flex-1">
        {filteredCards.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredCards.map((card) => {
              const config = getSRSLevelConfig(card.srsLevel)
              const isDue = new Date(card.nextReview) <= now
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent/50"
                >
                  {/* TTS button */}
                  <button
                    onClick={() => onSpeak(card.vocabulary)}
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                      isSpeaking
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>

                  {/* Word info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-sm">
                        {card.vocabulary}
                      </span>
                      <span className="text-xs text-muted-foreground">{card.ipa}</span>
                      {isDue && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" title="Đến hạn ôn" />
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{card.meaning}</p>
                  </div>

                  {/* Level badge */}
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 border text-[10px] font-semibold px-1.5 py-0',
                      config.textColor,
                      `border-current/20`
                    )}
                  >
                    {config.shortLabel}
                  </Badge>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                      onClick={() => handleStudySingle(card)}
                      title="Ôn thẻ này"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(card)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-400"
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {searchQuery || levelFilter !== 'all'
                ? 'Không tìm thấy thẻ nào'
                : 'Chưa có thẻ nào'}
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa &ldquo;{deleteTarget?.vocabulary}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Thẻ này sẽ bị xóa vĩnh viễn. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
