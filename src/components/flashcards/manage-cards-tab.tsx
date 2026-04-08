'use client'

import { useState, useEffect, useCallback } from 'react'
import { FlashcardData } from './types'
import { FlashcardCard } from './flashcard-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, BookOpen } from 'lucide-react'

interface ManageCardsTabProps {
  cards: FlashcardData[]
  onRefresh: () => void
  onEdit: (card: FlashcardData) => void
}

export function ManageCardsTab({ cards, onRefresh, onEdit }: ManageCardsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<FlashcardData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const filteredCards = cards.filter(
    (card) =>
      card.vocabulary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.wordType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/flashcards/${deleteTarget.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: 'Đã xóa', description: `Đã xóa thẻ "${deleteTarget.vocabulary}" thành công.` })
        onRefresh()
      } else {
        toast({ title: 'Lỗi', description: 'Không thể xóa thẻ. Vui lòng thử lại.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra.', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget, onRefresh, toast])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý thẻ</h2>
          <p className="text-sm text-muted-foreground">
            {cards.length} thẻ từ vựng trong bộ thẻ của bạn
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm từ vựng, nghĩa, loại từ..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCards.map((card) => (
            <FlashcardCard
              key={card.id}
              card={card}
              onEdit={onEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            {searchQuery ? 'Không tìm thấy thẻ nào' : 'Chưa có thẻ nào'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            {searchQuery
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Nhấn nút "Thêm thẻ mới" để bắt đầu'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thẻ &ldquo;{deleteTarget?.vocabulary}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thẻ từ vựng này sẽ bị xóa vĩnh viễn.
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
