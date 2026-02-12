# Project: Spraby API

## Overview

Multi-tenant e-commerce platform backend and admin panel. The API serves as the central hub for a Laravel 12 monolith with a React/Inertia admin interface, sharing a PostgreSQL database with two Next.js frontends (admin dashboard and customer storefront) via Prisma ORM.

## Core Features

- Product catalog with variants, options, and images (S3 storage)
- Multi-tenant brand management with row-level security
- Order management (orders, items, shipping)
- User authentication with role-based access (admin, manager, customer)
- Category and collection-based product organization
- Rich text editing (TipTap), drag-and-drop (dnd-kit), data visualization (Recharts)
- Bilingual support (English/Russian)

## Tech Stack

- **Language:** PHP 8.2+ (backend), TypeScript 5.x (frontend)
- **Framework:** Laravel 12 + Inertia.js 2.x
- **Frontend:** React 19 + shadcn/ui (Radix) + Tailwind CSS 4
- **State Management:** Zustand + TanStack React Query
- **Database:** PostgreSQL 15 (shared with Next.js apps via Prisma)
- **Storage:** AWS S3 (images)
- **Auth:** Spatie Laravel Permission + Sanctum
- **Containerization:** Docker (PHP-FPM + Nginx + PostgreSQL)
- **Build:** Vite 6
- **Validation:** Zod (frontend), Form Requests (backend)
- **Routing:** Ziggy (TypeScript-safe Laravel routes)

## Architecture Notes

- Shared database pattern: Laravel (Eloquent) + Next.js (Prisma) access same PostgreSQL
- Schema changes require dual updates (Laravel migrations + Prisma schemas)
- React admin at `/admin` uses Inertia for SPA-like navigation without REST API
- Row-level security enforced per brand for manager users
- ProductImageObserver handles S3 cleanup on deletion
- 21 Eloquent models, BigInt IDs throughout

## Non-Functional Requirements

- Logging: Laravel Pail for real-time log viewing
- Error handling: Laravel exception handling + Inertia error pages
- Security: RBAC via Spatie, brand-scoped data access, mass assignment protection
- Queue: Database driver for background jobs
- i18n: English and Russian locale support
