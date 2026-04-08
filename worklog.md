# FlashCard App - Worklog

## Task ID: 2

### Date: 2026-04-08

---

## Completed Work

### 1. Environment Setup
- Initialized fullstack development environment
- Prisma schema with Flashcard model already configured
- Pushed database schema with `bun run db:push`

### 2. Theme & Styling
- Updated `globals.css` with emerald/teal color scheme (light + dark mode)
- Added custom `perspective-1000` utility class for 3D card flip animation
- Updated layout metadata for Vietnamese flashcard app

### 3. API Routes
- `GET /api/flashcards` - List all flashcards (ordered by createdAt desc)
- `POST /api/flashcards` - Create new flashcard with validation
- `GET /api/flashcards/[id]` - Get single flashcard
- `PUT /api/flashcards/[id]` - Update flashcard
- `DELETE /api/flashcards/[id]` - Delete flashcard
- `POST /api/flashcards/seed` - Seed 3 example flashcards (idempotent)

### 4. Components Built
- **types.ts** - TypeScript interfaces, empty form, word types, helpers
- **flashcard-card.tsx** - Grid card for manage tab with edit/delete hover actions
- **flashcard-preview.tsx** - Live front/back preview for add/edit form
- **flashcard-flip-card.tsx** - 3D flip card with framer-motion animation
- **manage-cards-tab.tsx** - Card grid with search, delete confirmation dialog
- **add-edit-tab.tsx** - Full form with live preview, create/update modes
- **study-tab.tsx** - Study mode with flip animation, progress bar, shuffle, navigation

### 5. Main Page (`page.tsx`)
- Single page app with 3 tabs using shadcn Tabs
- Header with logo and "Add New Card" button
- Auto-seeds database on first load
- Loading spinner state
- Sticky footer

### 6. Seed Data
- Serendipity (Noun) - Sự tình cờ may mắn
- Ephemeral (Adjective) - Phù du, chóng tàn
- Ubiquitous (Adjective) - Có mặt khắp mọi nơi

### 7. Quality
- ESLint passes with 0 errors
- All shadcn/ui components used (no custom UI)
- Responsive design (mobile-first)
- Vietnamese UI labels throughout

---

## Upgrade: SRS, Deck System, TTS, New UI

### Date: 2026-04-08 (Phase 2)

---

### 1. Database Schema Upgrade
- Added `Deck` model with self-referential hierarchy (parent → children)
- Added SRS (SM-2) fields to `Flashcard` model:
  - `srsLevel` (0-5), `easeFactor` (1.3-2.5), `interval` (days)
  - `nextReview`, `reviewCount`, `lastReview`
- Changed `deck` string field to `deckId` with `Deck` relation
- Reset and pushed new schema

### 2. API Routes Added/Updated
- `GET /api/decks` - Fetch deck tree structure with flashcard counts
- `POST /api/decks` - Create deck (parent or child)
- `PUT /api/decks/[id]` - Update deck (name, parentId, order) with circular reference check
- `DELETE /api/decks/[id]` - Recursive delete (deck + children + flashcards)
- `GET /api/flashcards` - Updated with `deckId` filter and `includeChildren` support
- `POST /api/flashcards` - Updated with `deckId` required field and deck validation
- `PUT /api/flashcards/[id]` - Updated to handle SRS fields
- `POST /api/flashcards/[id]/review` - SM-2 SRS review algorithm:
  - Ratings: again (L0, 1min), hard (L-1, half interval), good (L+1, next interval), easy (L+2, 1.3x interval)
  - Intervals: [0, 1, 3, 7, 14, 30] days
  - Tracks easeFactor adjustments and review count
- `POST /api/flashcards/seed` - Updated with hierarchical deck structure and varying SRS levels

### 3. New Hook: `use-tts.ts`
- Web Speech API integration with auto voice selection (en-US preferred)
- `speak(text, rate)` / `stop()` controls
- `isSpeaking` / `speakingText` state for UI feedback
- Cleanup on unmount

### 4. Updated Types (`types.ts`)
- `DeckData` with hierarchical structure (children, totalCount)
- `FlashcardData` with SRS fields (srsLevel, easeFactor, interval, nextReview, reviewCount, lastReview, deck relation)
- `FlashcardFormData` with `deckId` instead of `deck`
- `SRS_LEVELS` config (6 levels with colors: gray, orange, yellow, blue, purple, emerald)
- `ReviewRating` type and `RATING_CONFIG` array with labels, colors, icons
- Helper: `getSRSLevelConfig(level)`

### 5. New Components
- **deck-sidebar.tsx** - Hierarchical deck tree sidebar:
  - Expand/collapse parent decks with children
  - Create parent/child decks inline
  - Rename decks inline
  - Delete with recursive confirmation
  - "Tất cả" (All) option to show all cards
  - Card count badges per deck

- **srs-overview.tsx** - SRS dashboard overview:
  - Stacked bar showing level distribution
  - 6 level badges with counts (Mới → Thành thạo)
  - Due count card (🔥 fire icon, orange accent)
  - Total review count card

- **word-list.tsx** - Enhanced word list table:
  - Search by vocabulary/meaning/word type
  - Filter by SRS level
  - TTS button (🔊) per word
  - Level badge with SRS color coding
  - Due indicator dot
  - "Ôn tập" button with due card count
  - Quick "Ôn" button per card for single-card study
  - Edit/Delete actions

- **study-mode.tsx** - Full SRS study session:
  - Shows only due/review cards
  - Auto-reads vocabulary on card show (TTS)
  - Auto-reads example sentence on flip
  - 4 rating buttons: Nhớ lại (😵), Khó (😤), Tốt (😊), Dễ (🤩)
  - Progress bar + card counter
  - Level-up animation on upgrade
  - Completion summary with per-card breakdown
  - Smooth card transitions (framer-motion)

- **flashcard-flip-card.tsx** - Updated with TTS:
  - TTS button on front (vocabulary)
  - TTS button per example on back
  - Visual feedback when speaking

- **add-edit-tab.tsx** - Updated form:
  - Deck selector dropdown (hierarchical with indent)
  - Auto-selects current deck when adding from deck view
  - Maintains live preview

### 6. Main Page Rewrite (`page.tsx`)
- Dark-themed dashboard layout with sidebar + main content
- Desktop: 264px deck sidebar + flexible content area
- Mobile: Sheet-based sidebar + bottom navigation bar
- View mode switching: Browse / Study / Add-Edit (no page reload)
- AnimatePresence transitions between views
- SRS Overview at top of browse view
- Deck filter indicator with clear button
- Responsive header with view mode tabs

### 7. Seed Data (Enhanced)
- **Từ vựng 100 ngày** (parent)
  - Ngày 1: Serendipity, Ephemeral, Ubiquitous (all Level 0)
  - Ngày 2: Resilience (L2, due), Pragmatic (L4, not due)
  - Ngày 3: Eloquent (L1, due), Ambiguous (L0)
- **IELTS Vocabulary** (parent)
  - Unit 1: Family: Nurture (L3, due), Sibling (L5)
  - Unit 2: Education: Pedagogy (L1, due), Curriculum (L3), Comprehend (L0)
- Total: 13 flashcards across 5 child decks, 2 parent decks
- 6 cards due for review for immediate testing

### 8. Quality
- ESLint: 0 errors, 0 warnings
- All components use shadcn/ui (Card, Button, Input, Select, Badge, Dialog, Sheet, ScrollArea, Progress, etc.)
- Lucide icons throughout
- Framer Motion for animations (flip, transitions, level-up)
- Responsive: mobile-first with md: breakpoint for sidebar
- Vietnamese UI labels for all text
- Dark theme compatible (uses bg-card, text-foreground, border-border variables)
- No external dependencies beyond existing stack
