'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FlashcardData,
  EMPTY_FORM,
  WORD_TYPES,
  flashcardToForm,
  DeckData,
} from './types'
import { createFlashcard, updateFlashcard } from '@/lib/firestore'
import { FlashcardPreview } from './flashcard-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Save, X, Plus, PenLine } from 'lucide-react'

interface AddEditTabProps {
  editingCard: FlashcardData | null
  decks: DeckData[]
  defaultDeckId: string | null
  onClearEditing: () => void
  onSaved: () => void
}

function getAllDecks(decks: DeckData[]): { id: string; name: string; depth: number }[] {
  const result: { id: string; name: string; depth: number }[] = []
  for (const deck of decks) {
    result.push({ id: deck.id, name: deck.name, depth: 0 })
    if (deck.children) {
      for (const child of deck.children) {
        result.push({ id: child.id, name: child.name, depth: 1 })
        if (child.children) {
          for (const grandChild of child.children) {
            result.push({ id: grandChild.id, name: grandChild.name, depth: 2 })
          }
        }
      }
    }
  }
  return result
}

export function AddEditTab({
  editingCard,
  decks,
  defaultDeckId,
  onClearEditing,
  onSaved,
}: AddEditTabProps) {
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    deckId: defaultDeckId || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const savingRef = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    if (editingCard) {
      setFormData(flashcardToForm(editingCard))
    } else {
      setFormData({ ...EMPTY_FORM, deckId: defaultDeckId || '' })
    }
  }, [editingCard, defaultDeckId])

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (
      !formData.vocabulary.trim() ||
      !formData.ipa.trim() ||
      !formData.wordType.trim() ||
      !formData.meaning.trim()
    ) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng điền đầy đủ Từ vựng, IPA, Loại từ và Nghĩa.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.deckId) {
      toast({
        title: 'Chưa chọn bộ từ',
        description: 'Vui lòng chọn bộ từ cho thẻ này.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    savingRef.current = true
    try {
      if (editingCard) {
        await updateFlashcard(editingCard.id, formData)
        toast({
          title: 'Đã cập nhật',
          description: `Thẻ "${formData.vocabulary}" đã được cập nhật.`,
        })
        onSaved()
        onClearEditing()
      } else {
        await createFlashcard(formData)
        toast({
          title: 'Đã tạo',
          description: `Thẻ "${formData.vocabulary}" đã được tạo thành công.`,
        })
        setFormData({ ...EMPTY_FORM, deckId: defaultDeckId || '' })
        onSaved()
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra.', variant: 'destructive' })
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({ ...EMPTY_FORM, deckId: defaultDeckId || '' })
    onClearEditing()
  }

  const allDecks = getAllDecks(decks)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">
            {editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới'}
          </h2>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {editingCard
              ? `Đang sửa: ${editingCard.vocabulary}`
              : 'Điền thông tin để tạo thẻ từ vựng mới'}
          </p>
        </div>
        {editingCard && (
          <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5" onClick={handleCancel}>
            <X className="mr-1 h-4 w-4" />
            Hủy
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form - Glass card */}
        <div className="glass rounded-2xl p-6 glow-primary">
          <h3 className="text-lg font-semibold text-foreground/90 mb-4 flex items-center gap-2">
            <PenLine className="h-4 w-4 text-purple-400" />
            Thông tin thẻ
          </h3>
          <div className="space-y-4">
            {/* Deck selector */}
            <div className="space-y-2">
              <Label className="text-muted-foreground/80 text-xs uppercase tracking-wide font-medium">
                Bộ từ <span className="text-red-400">*</span>
              </Label>
              <Select value={formData.deckId} onValueChange={(v) => updateField('deckId', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors">
                  <SelectValue placeholder="Chọn bộ từ" />
                </SelectTrigger>
                <SelectContent>
                  {allDecks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {'　'.repeat(deck.depth)}
                      {deck.depth > 0 && '└ '}
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vocabulary */}
            <div className="space-y-2">
              <Label htmlFor="vocabulary" className="text-muted-foreground/80 text-xs uppercase tracking-wide font-medium">
                Từ vựng <span className="text-red-400">*</span>
              </Label>
              <Input
                id="vocabulary"
                placeholder="Ví dụ: Beautiful"
                value={formData.vocabulary}
                onChange={(e) => updateField('vocabulary', e.target.value)}
                className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors"
              />
            </div>

            {/* IPA */}
            <div className="space-y-2">
              <Label htmlFor="ipa" className="text-muted-foreground/80 text-xs uppercase tracking-wide font-medium">
                IPA <span className="text-red-400">*</span>
              </Label>
              <Input
                id="ipa"
                placeholder="Ví dụ: /ˈbjuːtɪfəl/"
                value={formData.ipa}
                onChange={(e) => updateField('ipa', e.target.value)}
                className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors"
              />
            </div>

            {/* Word Type */}
            <div className="space-y-2">
              <Label htmlFor="wordType" className="text-muted-foreground/80 text-xs uppercase tracking-wide font-medium">
                Loại từ <span className="text-red-400">*</span>
              </Label>
              <Select value={formData.wordType} onValueChange={(v) => updateField('wordType', v)}>
                <SelectTrigger id="wordType" className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors">
                  <SelectValue placeholder="Chọn loại từ" />
                </SelectTrigger>
                <SelectContent>
                  {WORD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Meaning */}
            <div className="space-y-2">
              <Label htmlFor="meaning" className="text-muted-foreground/80 text-xs uppercase tracking-wide font-medium">
                Nghĩa <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="meaning"
                placeholder="Ví dụ: Đẹp, xinh đẹp"
                value={formData.meaning}
                onChange={(e) => updateField('meaning', e.target.value)}
                rows={2}
                className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors resize-none"
              />
            </div>

            {/* Example 1 */}
            <div className="space-y-2">
              <Label htmlFor="example1" className="text-muted-foreground/80 text-xs uppercase tracking-wide font-medium">
                Ví dụ 1
              </Label>
              <Textarea
                id="example1"
                placeholder="Câu ví dụ tiếng Anh"
                value={formData.example1}
                onChange={(e) => updateField('example1', e.target.value)}
                rows={2}
                className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors resize-none"
              />
              <Input
                placeholder="URL hình ảnh (không bắt buộc)"
                value={formData.example1Image}
                onChange={(e) => updateField('example1Image', e.target.value)}
                className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors"
              />
            </div>

            {/* Example 2 */}
            <div className="space-y-2">
              <Label htmlFor="example2" className="text-muted-foreground/80 text-xs uppercase tracking-wide font-medium">
                Ví dụ 2
              </Label>
              <Textarea
                id="example2"
                placeholder="Câu ví dụ tiếng Anh"
                value={formData.example2}
                onChange={(e) => updateField('example2', e.target.value)}
                rows={2}
                className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors resize-none"
              />
              <Input
                placeholder="URL hình ảnh (không bắt buộc)"
                value={formData.example2Image}
                onChange={(e) => updateField('example2Image', e.target.value)}
                className="bg-white/5 border-white/10 rounded-lg hover:border-purple-500/30 focus:border-purple-500/40 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 btn-gradient rounded-xl text-white font-medium h-10"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lưu...
                  </span>
                ) : editingCard ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cập nhật
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo thẻ
                  </>
                )}
              </Button>
              <Button variant="outline" className="border-white/10 hover:bg-white/5 rounded-xl" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div>
          <div className="sticky top-6">
            <FlashcardPreview
              vocabulary={formData.vocabulary}
              ipa={formData.ipa}
              wordType={formData.wordType}
              meaning={formData.meaning}
              example1={formData.example1}
              example1Image={formData.example1Image}
              example2={formData.example2}
              example2Image={formData.example2Image}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
