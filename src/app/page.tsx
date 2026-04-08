'use client'

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ManageCardsTab } from '@/components/flashcards/manage-cards-tab'
import { AddEditTab } from '@/components/flashcards/add-edit-tab'
import { StudyTab } from '@/components/flashcards/study-tab'
import { FlashcardData } from '@/components/flashcards/types'
import { Plus, Layers, GraduationCap } from 'lucide-react'

export default function Home() {
  const [cards, setCards] = useState<FlashcardData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingCard, setEditingCard] = useState<FlashcardData | null>(null)
  const [activeTab, setActiveTab] = useState('manage')

  const fetchCards = useCallback(async () => {
    try {
      const res = await fetch('/api/flashcards')
      if (res.ok) {
        const data = await res.json()
        setCards(data)
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Seed data on first load
  const seedData = useCallback(async () => {
    try {
      await fetch('/api/flashcards/seed', { method: 'POST' })
    } catch (error) {
      console.error('Failed to seed data:', error)
    }
  }, [])

  useEffect(() => {
    seedData().then(() => fetchCards())
  }, [fetchCards, seedData])

  const handleEdit = (card: FlashcardData) => {
    setEditingCard(card)
    setActiveTab('addedit')
  }

  const handleClearEditing = () => {
    setEditingCard(null)
  }

  const handleSaved = () => {
    fetchCards()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">FlashCard</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Học từ vựng hiệu quả</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingCard(null)
              setActiveTab('addedit')
            }}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Thêm thẻ mới</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
                <TabsTrigger value="manage" className="gap-1.5">
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">Quản lý thẻ</span>
                  <span className="sm:hidden">Thẻ</span>
                </TabsTrigger>
                <TabsTrigger value="addedit" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {editingCard ? 'Sửa thẻ' : 'Thêm thẻ'}
                  </span>
                  <span className="sm:hidden">
                    {editingCard ? 'Sửa' : 'Thêm'}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="study" className="gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Học</span>
                  <span className="sm:hidden">Học</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manage">
                <ManageCardsTab
                  cards={cards}
                  onRefresh={fetchCards}
                  onEdit={handleEdit}
                />
              </TabsContent>

              <TabsContent value="addedit">
                <AddEditTab
                  editingCard={editingCard}
                  onClearEditing={handleClearEditing}
                  onSaved={handleSaved}
                />
              </TabsContent>

              <TabsContent value="study">
                <StudyTab cards={cards} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            FlashCard — Ứng dụng học từ vựng ANKI
          </p>
        </div>
      </footer>
    </div>
  )
}
