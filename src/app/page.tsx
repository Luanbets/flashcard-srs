'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DeckData, FlashcardData } from '@/components/flashcards/types'
import { DeckSidebar } from '@/components/flashcards/deck-sidebar'
import { SRSOverview } from '@/components/flashcards/srs-overview'
import { WordList } from '@/components/flashcards/word-list'
import { StudyMode } from '@/components/flashcards/study-mode'
import { AddEditTab } from '@/components/flashcards/add-edit-tab'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useTTS } from '@/hooks/use-tts'
import { subscribeDecks, subscribeFlashcards, seedData as seedFirestoreData } from '@/lib/firestore'
import {
  Plus,
  Menu,
  X,
  BookOpen,
  PenLine,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'

type ViewMode = 'browse' | 'study' | 'addedit'

export default function Home() {
  const [decks, setDecks] = useState<DeckData[]>([])
  const [cards, setCards] = useState<FlashcardData[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('browse')
  const [editingCard, setEditingCard] = useState<FlashcardData | null>(null)
  const [studyCards, setStudyCards] = useState<FlashcardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [decksLoaded, setDecksLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { speak, isSpeaking } = useTTS()
  const seededRef = useRef(false)

  // Safety timeout: hide loading after 3s even if Firestore is slow
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Seed data on first load (non-blocking)
  useEffect(() => {
    if (seededRef.current) return
    seededRef.current = true
    seedFirestoreData().catch(() => {
      // ignore seed errors
    })
  }, [])

  // Subscribe to decks realtime - lightweight, no extra queries
  useEffect(() => {
    const unsub = subscribeDecks((updatedDecks) => {
      setDecks(updatedDecks)
      setDecksLoaded(true)
    })
    return () => unsub()
  }, [])

  // Subscribe to flashcards realtime - efficient per-deck queries
  useEffect(() => {
    const unsub = subscribeFlashcards(
      selectedDeckId,
      (updatedCards) => {
        setCards(updatedCards)
        setIsLoading(false)
      }
    )
    return () => unsub()
  }, [selectedDeckId])

  // Handlers
  const handleEdit = (card: FlashcardData) => {
    setEditingCard(card)
    setViewMode('addedit')
  }

  const handleClearEditing = () => {
    setEditingCard(null)
    setViewMode('browse')
  }

  const handleSaved = () => {
    if (!editingCard) {
      setViewMode('browse')
    }
  }

  const handleStartStudy = (studyDeckCards: FlashcardData[]) => {
    setStudyCards(studyDeckCards)
    setViewMode('study')
  }

  const handleStudyComplete = () => {
    setViewMode('browse')
  }

  const handleAddNew = () => {
    setEditingCard(null)
    setViewMode('addedit')
  }

  const handleSelectDeck = (deckId: string | null) => {
    setSelectedDeckId(deckId)
    setViewMode('browse')
    setSidebarOpen(false)
  }

  const handleRefresh = useCallback(() => {
    // Realtime handles refresh automatically, no-op
  }, [])

  const selectedDeckName = selectedDeckId
    ? (() => {
        for (const d of decks) {
          if (d.id === selectedDeckId) return d.name
          if (d.children) {
            for (const c of d.children) {
              if (c.id === selectedDeckId) return c.name
            }
          }
        }
        return null
      })()
    : null

  return (
    <div className="flex h-screen flex-col text-foreground">
      {/* Header - Gradient with glow */}
      <header className="relative flex h-14 shrink-0 items-center justify-between px-4 glass-strong z-10">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        
        <div className="flex items-center gap-3">
          {/* Mobile sidebar trigger */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 glass-strong border-l border-border/20">
              <SheetTitle className="sr-only">Bộ từ</SheetTitle>
              <DeckSidebar
                decks={decks}
                selectedDeckId={selectedDeckId}
                onSelectDeck={handleSelectDeck}
                onRefresh={handleRefresh}
              />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20">
              <Sparkles className="h-4.5 w-4.5 text-white" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 blur-sm -z-10" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-tight gradient-text">
                FlashCard SRS
              </h1>
              <p className="hidden text-[10px] text-muted-foreground sm:block">
                Học từ vựng hiệu quả
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode tabs */}
          <div className="hidden sm:flex items-center rounded-xl bg-white/5 p-0.5 border border-white/5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('browse')}
              className={cn(
                'h-7 gap-1.5 px-3 text-xs rounded-lg transition-all',
                viewMode === 'browse'
                  ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Danh sách
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingCard(null)
                setViewMode('addedit')
              }}
              className={cn(
                'h-7 gap-1.5 px-3 text-xs rounded-lg transition-all',
                viewMode === 'addedit'
                  ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <PenLine className="h-3.5 w-3.5" />
              Thêm thẻ
            </Button>
          </div>

          <Button
            size="sm"
            onClick={handleAddNew}
            className="gap-1.5 h-8 btn-gradient rounded-lg text-white text-xs"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm thẻ mới</span>
          </Button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar - Glass effect */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col glass-strong border-r border-border/10">
          <DeckSidebar
            decks={decks}
            selectedDeckId={selectedDeckId}
            onSelectDeck={handleSelectDeck}
            onRefresh={handleRefresh}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col"
              >
                {/* SRS Overview */}
                <div className="shrink-0 p-4">
                  <SRSOverview cards={cards} />
                </div>

                {/* Deck name indicator */}
                {selectedDeckName && (
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-border/10">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground">Bộ từ:</span>
                    <span className="text-xs font-semibold text-foreground">
                      {selectedDeckName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedDeckId(null)}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Xóa lọc
                    </Button>
                  </div>
                )}

                {/* Word List */}
                <div className="flex-1 overflow-hidden">
                  <WordList
                    cards={cards}
                    onEdit={handleEdit}
                    onDelete={() => {}}
                    onStartStudy={handleStartStudy}
                    onSpeak={speak}
                    isSpeaking={isSpeaking}
                    onRefresh={handleRefresh}
                    deckId={selectedDeckId}
                    isLoading={isLoading}
                  />
                </div>
              </motion.div>
            )}

            {viewMode === 'study' && (
              <motion.div
                key="study"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                <div className="mx-auto max-w-2xl p-4 sm:p-6">
                  <StudyMode
                    cards={studyCards}
                    onSpeak={speak}
                    isSpeaking={isSpeaking}
                    onComplete={handleStudyComplete}
                    onCancel={handleStudyComplete}
                  />
                </div>
              </motion.div>
            )}

            {viewMode === 'addedit' && (
              <motion.div
                key="addedit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto custom-scrollbar"
              >
                <div className="mx-auto max-w-4xl p-4 sm:p-6">
                  {/* Mobile back button */}
                  <div className="mb-4 sm:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        setViewMode('browse')
                        setEditingCard(null)
                      }}
                    >
                      ← Quay lại danh sách
                    </Button>
                  </div>
                  <AddEditTab
                    editingCard={editingCard}
                    decks={decks}
                    defaultDeckId={selectedDeckId}
                    onClearEditing={handleClearEditing}
                    onSaved={handleSaved}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="relative flex shrink-0 items-center glass-strong border-t border-border/10 md:hidden z-10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
        <Button
          variant="ghost"
          className={cn(
            'flex-1 h-14 flex-col gap-0.5 rounded-none transition-colors',
            viewMode === 'browse' ? 'text-purple-400' : 'text-muted-foreground'
          )}
          onClick={() => setViewMode('browse')}
        >
          <BookOpen className="h-5 w-5" />
          <span className={cn('text-[10px]', viewMode === 'browse' && 'font-medium')}>
            Danh sách
          </span>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            'flex-1 h-14 flex-col gap-0.5 rounded-none transition-colors',
            viewMode === 'addedit' ? 'text-purple-400' : 'text-muted-foreground'
          )}
          onClick={handleAddNew}
        >
          <Plus className="h-5 w-5" />
          <span className={cn('text-[10px]', viewMode === 'addedit' && 'font-medium')}>
            Thêm thẻ
          </span>
        </Button>
      </nav>
    </div>
  )
}
