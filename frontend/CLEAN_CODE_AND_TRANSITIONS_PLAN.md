# Clean Code & Page Transitions Plan

## Phase 1: Type Safety (Clean Code)
- Create `frontend/types/index.ts` to hold shared interfaces like `Watch`.
- Update `watch.service.ts` to use explicit types instead of `any`.
- Refactor product components (`ProductCard`, `ProductGrid`, `ProductInfo`, `ProductGallery`, `RelatedWatches`) to use the `Watch` interface.
- Refactor admin components (`WatchForm`, `useWatchForm`, `AdminDashboard`) to remove implicit `any` types.

## Phase 2: Loading State
- Introduce `frontend/app/[lang]/loading.tsx` to handle Suspense-based loading between route navigations.
- Design a luxury-themed loading spinner using the AriWatch brand aesthetic (red ring, serif 'A' logo) to improve the user experience during slow network scenarios.

## Phase 3: Page Transitions
- Update `frontend/tailwind.config.ts` to include a new `page-enter` keyframe and animation (blur and fade-in-up effect).
- Implement `frontend/app/[lang]/template.tsx` which wraps route segments and triggers the entrance animation automatically on every navigation.
