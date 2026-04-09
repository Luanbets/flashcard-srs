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
      <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">Xem trước</p>

      {/* Front Preview - Glass card with gradient border */}
      <div className="gradient-border rounded-3xl p-[1px]">
        <div className="rounded-3xl glass-strong p-6">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
            Mặt trước
          </p>
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
            {wordType && (
              <Badge variant="secondary" className="text-sm bg-white/5 border-white/10 text-muted-foreground">
                {wordType}
              </Badge>
            )}
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              {vocabulary || <span className="text-muted-foreground/30 bg-none">Từ vựng</span>}
            </h2>
            <p className="text-base text-muted-foreground/50">
              {ipa || <span className="text-muted-foreground/30">/IPA/</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Back Preview - Glass card with gradient border */}
      <div className="gradient-border rounded-3xl p-[1px]">
        <div className="rounded-3xl glass-strong p-6">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/50">
            Mặt sau
          </p>
          <div className="space-y-3">
            {/* Header */}
            <div className="border-b border-white/10 pb-2">
              <h3 className="text-base font-semibold text-foreground/90">
                {vocabulary || <span className="text-muted-foreground/30">Từ vựng</span>}{' '}
                {wordType && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/5 border-white/10 text-muted-foreground">
                    {wordType}
                  </Badge>
                )}
              </h3>
            </div>

            {/* Meaning */}
            <div>
              <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wide">Nghĩa</p>
              <p className="mt-0.5 text-sm text-foreground/80">
                {meaning || <span className="text-muted-foreground/30">Nghĩa của từ</span>}
              </p>
            </div>

            {/* Examples */}
            <div className="space-y-2">
              <div className="rounded-xl bg-white/3 border border-white/5 p-3">
                <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wide">Ví dụ 1</p>
                <p className="mt-0.5 text-sm text-foreground/70">
                  {example1 || <span className="text-muted-foreground/30">Câu ví dụ</span>}
                </p>
                {example1Image && (
                  <div className="mt-2 overflow-hidden rounded-lg">
                    <Image
                      src={example1Image}
                      alt="Example 1"
                      width={400}
                      height={150}
                      className="h-auto w-full rounded-lg object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-white/3 border border-white/5 p-3">
                <p className="text-xs font-medium text-muted-foreground/50 uppercase tracking-wide">Ví dụ 2</p>
                <p className="mt-0.5 text-sm text-foreground/70">
                  {example2 || <span className="text-muted-foreground/30">Câu ví dụ</span>}
                </p>
                {example2Image && (
                  <div className="mt-2 overflow-hidden rounded-lg">
                    <Image
                      src={example2Image}
                      alt="Example 2"
                      width={400}
                      height={150}
                      className="h-auto w-full rounded-lg object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
