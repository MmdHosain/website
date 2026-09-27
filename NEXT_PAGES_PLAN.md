# UI/UX Next Pages Implementation Plan

This document tracks the step-by-step implementation of the remaining pages for the Luxe Watches (ARIWATCH) project, considering the complexity of building a full e-commerce flow.

## Phase 1: Product Listing Page (PLP) - [COMPLETED]
*Goal: Build the main collection page (`/watches`) where users can browse all products with category filters.*
- [x] Create `NEXT_PAGES_PLAN.md`.
- [x] Add PLP translation keys to `en.json` and `fa.json`.
- [x] Create `FilterBar` component for category switching (All, Original, High Copy, Custom).
- [x] Create `ProductCard` component with aesthetic geometric placeholders, hover effects, and category badges.
- [x] Create `ProductGrid` component mapped to backend API data.
- [x] Implement the `frontend/app/[lang]/watches/page.tsx` route with Server-Side Rendering (SSR).
- [x] Integrate global `watch.service.ts` for data retrieval.

## Phase 2: Product Detail Page (PDP) - [COMPLETED]
*Goal: Build the dynamic product page (`/watches/[id]`) for individual watch presentation.*
- [x] Update Backend API to support `GET /api/watches/:id` following Clean Architecture (UseCase, Controller, Route).
- [x] Create PDP dynamic route `frontend/app/[lang]/watches/[id]/page.tsx`.
- [x] Implement `ProductGallery` (Main image + thumbnail placeholders).
- [x] Implement `ProductInfo` (Price, Title, Status Badge, Add to Cart / Request buttons).
- [x] Implement `ProductSpecs` (Technical details simple grid).

## Phase 3: Editorial & Support Pages - [COMPLETED]
*Goal: Build out the business identity and custom sourcing workflows.*
- [x] Implement `/story` (The World of Ariwatch - Brand history & leadership text layout).
- [x] Implement `/concierge` (Custom Order form and contact endpoints).
