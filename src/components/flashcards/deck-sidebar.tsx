'use client'

import { useState, useCallback } from 'react'
import { DeckData } from './types'
import { createDeck as createDeckFirestore, updateDeck as updateDeckFirestore, deleteDeck as deleteDeckFirestore } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import {
  FolderOpen,
  Folder,
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeckSidebarProps {
  decks: DeckData[]
  selectedDeckId: string | null
  onSelectDeck: (deckId: string | null) => void
  onRefresh: () => void
}

export function DeckSidebar({
  decks,
  selectedDeckId,
  onSelectDeck,
  onRefresh,
}: DeckSidebarProps) {
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set(decks.map((d) => d.id))
  )
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [creatingParent, setCreatingParent] = useState(false)
  const [creatingChildFor, setCreatingChildFor] = useState<string | null>(null)
  const [newDeckName, setNewDeckName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DeckData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const toggleExpand = (parentId: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev)
      if (next.has(parentId)) next.delete(parentId)
      else next.add(parentId)
      return next
    })
  }

  const handleSelectDeck = (deckId: string) => {
    if (selectedDeckId === deckId) {
      onSelectDeck(null)
    } else {
      onSelectDeck(deckId)
    }
  }

  const handleSelectParent = (parentId: string) => {
    onSelectDeck(parentId)
    if (!expandedParents.has(parentId)) {
      toggleExpand(parentId)
    }
  }

  const startEdit = (deck: DeckData) => {
    setEditingDeckId(deck.id)
    setEditName(deck.name)
  }

  const saveEdit = useCallback(async () => {
    if (!editingDeckId || !editName.trim()) return
    setIsSaving(true)
    try {
      await updateDeckFirestore(editingDeckId, { name: editName.trim() })
      toast({ title: 'Đã cập nhật', description: `Đã đổi tên bộ từ.` })
      setEditingDeckId(null)
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể cập nhật.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }, [editingDeckId, editName, toast])

  const createDeckFn = useCallback(
    async (name: string, parentId: string | null) => {
      if (!name.trim()) return
      setIsSaving(true)
      try {
        await createDeckFirestore({ name: name.trim(), parentId })
        toast({
          title: 'Đã tạo',
          description: `Bộ từ "${name.trim()}" đã được tạo.`,
        })
        setCreatingParent(false)
        setCreatingChildFor(null)
        setNewDeckName('')
        if (parentId) {
          setExpandedParents((prev) => new Set(prev).add(parentId))
        }
      } catch {
        toast({ title: 'Lỗi', description: 'Không thể tạo bộ từ.', variant: 'destructive' })
      } finally {
        setIsSaving(false)
      }
    },
    [toast]
  )

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteDeckFirestore(deleteTarget.id)
      toast({
        title: 'Đã xóa',
        description: `Bộ từ "${deleteTarget.name}" đã bị xóa.`,
      })
      if (selectedDeckId === deleteTarget.id) onSelectDeck(null)
    } catch {
      toast({ title: 'Lỗi', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget, selectedDeckId, onSelectDeck, toast])

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-3 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bộ từ
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCreatingParent(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* All decks option */}
            <button
              onClick={() => onSelectDeck(null)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                selectedDeckId === null
                  ? 'bg-primary/15 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Layers className="h-4 w-4 shrink-0" />
              <span>Tất cả</span>
            </button>

            {/* Parent decks */}
            {decks.map((parent) => (
              <div key={parent.id} className="mt-0.5">
                {/* Parent row */}
                <div
                  className={cn(
                    'group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors',
                    selectedDeckId === parent.id
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <button
                    onClick={() => toggleExpand(parent.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-accent"
                  >
                    {expandedParents.has(parent.id) ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleSelectParent(parent.id)}
                    className="flex flex-1 items-center gap-2 text-left text-sm"
                  >
                    {expandedParents.has(parent.id) ? (
                      <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <Folder className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate">{parent.name}</span>
                    <span className="ml-auto text-xs opacity-60">{parent.totalCount}</span>
                  </button>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setCreatingChildFor(parent.id)}
                      className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => startEdit(parent)}
                      className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(parent)}
                      className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editing parent */}
                {editingDeckId === parent.id && (
                  <div className="flex items-center gap-1 px-9 py-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') setEditingDeckId(null)
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setEditingDeckId(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* Creating child */}
                {creatingChildFor === parent.id && (
                  <div className="flex items-center gap-1 px-9 py-1">
                    <Input
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      placeholder="Tên bộ con..."
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') createDeckFn(newDeckName, parent.id)
                        if (e.key === 'Escape') setCreatingChildFor(null)
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => createDeckFn(newDeckName, parent.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setCreatingChildFor(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                {/* Children */}
                {expandedParents.has(parent.id) && parent.children && (
                  <div className="ml-4 border-l border-border/50 pl-2">
                    {parent.children.map((child) => (
                      <div key={child.id} className="relative">
                        <div
                          className={cn(
                            'group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
                            selectedDeckId === child.id
                              ? 'bg-primary/15 text-primary font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          <button
                            onClick={() => handleSelectDeck(child.id)}
                            className="flex flex-1 items-center gap-2 text-left"
                          >
                            <div className="h-2 w-2 rounded-full bg-primary/60" />
                            <span className="truncate">{child.name}</span>
                            <span className="ml-auto text-xs opacity-60">
                              {child.totalCount}
                            </span>
                          </button>
                          <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => startEdit(child)}
                              className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(child)}
                              className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Editing child */}
                        {editingDeckId === child.id && (
                          <div className="flex items-center gap-1 px-3 py-1">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit()
                                if (e.key === 'Escape') setEditingDeckId(null)
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={saveEdit}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => setEditingDeckId(null)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Creating new parent deck */}
            {creatingParent && (
              <div className="mt-1 flex items-center gap-1 px-2 py-1">
                <Input
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Tên bộ từ..."
                  className="h-7 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createDeckFn(newDeckName, null)
                    if (e.key === 'Escape') setCreatingParent(false)
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => createDeckFn(newDeckName, null)}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setCreatingParent(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bộ từ &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa bộ từ và tất cả thẻ trong đó. Không thể hoàn tác.
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
    </>
  )
}

function Layers({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  )
}
