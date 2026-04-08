# 🎴 FlashCard SRS - Ứng dụng học từ vựng

Ứng dụng flashcard ANKI-style với hệ thống **Spaced Repetition (SRS)**, **Text-to-Speech**, và quản lý **Deck** phân cấp.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-2d3748)

## ✨ Tính năng

- **SRS (Spaced Repetition System)** - Thuật toán SM-2 chuẩn ANKI với 6 cấp độ
- **Deck phân cấp** - Tổ chức từ vựng theo bộ/day/unit
- **Text-to-Speech** - Đọc to từ vựng và ví dụ bằng giọng Anh-Mỹ
- **Flip Animation** - Lật thẻ 3D với framer-motion
- **Dashboard SRS** - Thống kê phân bổ cấp độ, thẻ đến hạn
- **Responsive** - Hoạt động tốt trên mobile và desktop

## 📁 Cấu trúc Deck

```
📚 Từ vựng 100 ngày
  ├── Ngày 1
  ├── Ngày 2
  └── Ngày 3

📚 IELTS Vocabulary
  ├── Unit 1: Family
  └── Unit 2: Education
```

## 🔄 Thuật toán SRS

| Nút | Hiệu ứng | Khoảng ôn tiếp |
|-----|-----------|----------------|
| 😵 Again | → Level 0 | 1 phút |
| 😤 Hard | → Level - 1 | 6 phút |
| 😊 Good | → Level + 1 | 1 → 3 → 7 → 14 → 30 ngày |
| 🤩 Easy | → Level + 2 | × 1.3 |

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+ hoặc Bun
- SQLite (mặc định qua Prisma)

### Chạy dự án

```bash
# Clone repository
git clone <repo-url>
cd flashcard-srs

# Cài đặt dependencies
bun install

# Tạo file .env
cp .env.example .env

# Setup database
bun run db:push

# Chạy development server
bun run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM + SQLite
- **Animation**: Framer Motion
- **TTS**: Web Speech API
- **Icons**: Lucide React

## 📦 Scripts

```bash
bun run dev       # Development server (port 3000)
bun run lint      # ESLint check
bun run db:push   # Push schema to database
bun run build     # Build for production
```

## 📄 License

MIT
