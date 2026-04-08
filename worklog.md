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
