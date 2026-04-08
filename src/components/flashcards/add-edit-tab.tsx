'use client'

import { useState, useEffect } from 'react'
import {
  FlashcardData,
  FlashcardFormData,
  EMPTY_FORM,
  WORD_TYPES,
  flashcardToForm,
  DeckData,
} from './types'
import { FlashcardPreview } from './flashcard-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Save, X, Plus } from 'lucide-react'

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
  const [formData, setFormData] = useState<FlashcardFormData>({
    ...EMPTY_FORM,
    deckId: defaultDeckId || '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (editingCard) {
      setFormData(flashcardToForm(editingCard))
    } else {
      setFormData({ ...EMPTY_FORM, deckId: defaultDeckId || '' })
    }
  }, [editingCard, defaultDeckId])

  const updateField = (field: keyof FlashcardFormData, value: string) => {
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
    try {
      const url = editingCard ? `/api/flashcards/${editingCard.id}` : '/api/flashcards'
      const method = editingCard ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: editingCard ? 'Đã cập nhật' : 'Đã tạo',
          description: editingCard
            ? `Thẻ "${formData.vocabulary}" đã được cập nhật.`
            : `Thẻ "${formData.vocabulary}" đã được tạo thành công.`,
        })
        setFormData({ ...EMPTY_FORM, deckId: defaultDeckId || '' })
        onSaved()
        if (editingCard) onClearEditing()
      } else {
        toast({ title: 'Lỗi', description: 'Không thể lưu thẻ.', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Có lỗi xảy ra.', variant: 'destructive' })
    } finally {
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
          <h2 className="text-2xl font-bold tracking-tight">
            {editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editingCard
              ? `Đang sửa: ${editingCard.vocabulary}`
              : 'Điền thông tin để tạo thẻ từ vựng mới'}
          </p>
        </div>
        {editingCard && (
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="mr-1 h-4 w-4" />
            Hủy
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Thông tin thẻ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deck selector */}
            <div className="space-y-2">
              <Label>
                Bộ từ <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.deckId} onValueChange={(v) => updateField('deckId', v)}>
                <SelectTrigger>
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
              <Label htmlFor="vocabulary">
                Từ vựng <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vocabulary"
                placeholder="Ví dụ: Beautiful"
                value={formData.vocabulary}
                onChange={(e) => updateField('vocabulary', e.target.value)}
              />
            </div>

            {/* IPA */}
            <div className="space-y-2">
              <Label htmlFor="ipa">
                IPA <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ipa"
                placeholder="Ví dụ: /ˈbjuːtɪfəl/"
                value={formData.ipa}
                onChange={(e) => updateField('ipa', e.target.value)}
              />
            </div>

            {/* Word Type */}
            <div className="space-y-2">
              <Label htmlFor="wordType">
                Loại từ <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.wordType} onValueChange={(v) => updateField('wordType', v)}>
                <SelectTrigger id="wordType">
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
              <Label htmlFor="meaning">
                Nghĩa <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="meaning"
                placeholder="Ví dụ: Đẹp, xinh đẹp"
                value={formData.meaning}
                onChange={(e) => updateField('meaning', e.target.value)}
                rows={2}
              />
            </div>

            {/* Example 1 */}
            <div className="space-y-2">
              <Label htmlFor="example1">Ví dụ 1</Label>
              <Textarea
                id="example1"
                placeholder="Câu ví dụ tiếng Anh"
                value={formData.example1}
                onChange={(e) => updateField('example1', e.target.value)}
                rows={2}
              />
              <Input
                placeholder="URL hình ảnh (không bắt buộc)"
                value={formData.example1Image}
                onChange={(e) => updateField('example1Image', e.target.value)}
              />
            </div>

            {/* Example 2 */}
            <div className="space-y-2">
              <Label htmlFor="example2">Ví dụ 2</Label>
              <Textarea
                id="example2"
                placeholder="Câu ví dụ tiếng Anh"
                value={formData.example2}
                onChange={(e) => updateField('example2', e.target.value)}
                rows={2}
              />
              <Input
                placeholder="URL hình ảnh (không bắt buộc)"
                value={formData.example2Image}
                onChange={(e) => updateField('example2Image', e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  'Đang lưu...'
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
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>

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
