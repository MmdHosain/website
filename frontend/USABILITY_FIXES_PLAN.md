# Usability & Navigation Fixes Plan

## Phase 1: Missing Pages
- Create `frontend/app/[lang]/terms/page.tsx` for Terms of Use.
- Create `frontend/app/[lang]/privacy/page.tsx` for Privacy Notice.
- Create `frontend/app/[lang]/cart/page.tsx` for the Shopping Cart empty state.

## Phase 2: Navigation & Header
- Convert `Header.tsx` to a Client Component.
- Implement a full-screen mobile menu overlay toggled by the Hamburger icon.
- Connect the Search icon to the `/watches` product listing page.

## Phase 3: Broken Buttons & Forms
- Update `EditorialText.tsx` to wrap the 'Discover' button in a working Next.js `Link`.
- Update `ProductInfo.tsx` to wrap 'Add to Cart' in a working `Link` leading to `/cart`.
- Update `WatchesPage` to remove the non-functional 'Load More' placeholder.
- Fix HTML validation in `ProductCard.tsx` (removed `<button>` inside `<a>`).
- Add a success state to `ConciergeForm.tsx` to provide visual feedback upon submission.

## Phase 4: Dictionaries
- Expand `en.json` and `fa.json` with new keys for the header menu, legal pages, cart, and form success messages.
