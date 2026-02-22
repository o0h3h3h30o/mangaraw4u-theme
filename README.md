# Manga Reader Theme Demo

Dự án standalone chứa toàn bộ theme/UI từ manga-reader-sd, sử dụng dữ liệu cứng (mock data).

## Tech Stack

- **Framework**: Next.js 16.1 (App Router) + React 19
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State**: Zustand + React Query (TanStack Query v5)
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl (Vietnamese + English)
- **Theme**: next-themes (Dark/Light mode)

## Quick Start

```bash
pnpm install
pnpm dev
```

Mở [http://localhost:3001](http://localhost:3001) để xem ứng dụng.

## Đặc điểm

- ✅ Toàn bộ UI/theme giữ nguyên từ dự án gốc
- ✅ Dark/Light mode toggle
- ✅ Dữ liệu cứng (không cần backend API)
- ✅ Đa ngôn ngữ (Vietnamese + English)
- ✅ Responsive design
- ✅ Tất cả trang: Home, Browse, Manga Detail, Reader, Auth, Profile, Library

## Cấu trúc

```
manga-theme-demo/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # 26 shadcn/ui components
│   ├── manga/             # Manga-specific components
│   ├── layout/            # Header, Footer, Loading states
│   ├── browse/            # Browse filters
│   ├── reader/            # Chapter reader
│   ├── comments/          # Comment system
│   └── providers/         # Theme, Query, OAuth (stub)
├── lib/
│   ├── mock-data/         # ⭐ Hardcoded data (mangas, chapters, comments)
│   ├── api/               # API endpoints (return mock data)
│   ├── store/             # Zustand stores
│   └── seo/               # SEO config
├── messages/              # i18n translations (vi, en)
├── public/                # Static assets
└── types/                 # TypeScript types
```
