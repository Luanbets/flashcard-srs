'use client'

import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

interface FlashcardPreviewProps {
  vocabulary: string
  ipa: string
  wordType: string
  meaning: string
  example1: string
  example1Image: string
  example2: string
  example2Image: string
}

export function FlashcardPreview({
  vocabulary,
  ipa,
  wordType,
  meaning,
  example1,
  example1Image,
  example2,
  example2Image,
}: FlashcardPreviewProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-muted-foreground">Xem trước</p>

      {/* Front Preview */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-md">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Mặt trước
        </p>
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
          {wordType && (
            <Badge variant="secondary" className="text-sm">
              {wordType}
            </Badge>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {vocabulary || <span className="text-muted-foreground/40">Từ vựng</span>}
          </h2>
          <p className="text-base text-muted-foreground">
            {ipa || <span className="text-muted-foreground/40">/IPA/</span>}
          </p>
        </div>
      </div>

      {/* Back Preview */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-md">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Mặt sau
        </p>
        <div className="space-y-3">
          {/* Header */}
          <div className="border-b border-border/50 pb-2">
            <h3 className="text-base font-semibold text-foreground">
              {vocabulary || <span className="text-muted-foreground/40">Từ vựng</span>}{' '}
              {wordType && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {wordType}
                </Badge>
              )}
            </h3>
          </div>

          {/* Meaning */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Nghĩa</p>
            <p className="mt-0.5 text-sm text-foreground">
              {meaning || <span className="text-muted-foreground/40">Nghĩa của từ</span>}
            </p>
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Ví dụ 1</p>
              <p className="mt-0.5 text-sm text-foreground">
                {example1 || <span className="text-muted-foreground/40">Câu ví dụ</span>}
              </p>
              {example1Image && (
                <div className="mt-2 overflow-hidden rounded-md">
                  <Image
                    src={example1Image}
                    alt="Example 1"
                    width={400}
                    height={150}
                    className="h-auto w-full rounded-md object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Ví dụ 2</p>
              <p className="mt-0.5 text-sm text-foreground">
                {example2 || <span className="text-muted-foreground/40">Câu ví dụ</span>}
              </p>
              {example2Image && (
                <div className="mt-2 overflow-hidden rounded-md">
                  <Image
                    src={example2Image}
                    alt="Example 2"
                    width={400}
                    height={150}
                    className="h-auto w-full rounded-md object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
