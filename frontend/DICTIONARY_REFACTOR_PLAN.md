# Dictionary Refactoring Plan (Clean Code)

## Goal
Break down the overly long `en.json` and `fa.json` files into smaller, domain-specific modules to improve maintainability and readability (Clean Code Principle: Small Files / Separation of Concerns).

## Structure
- `common.json`: Header, Footer, Auth, Legal, Cart, and shared elements.
- `home.json`: All sections specific to the Landing Page (Hero, Editorials, Spotlights, etc.).
- `watches.json`: Product Listing Page (PLP) and Product Detail Page (PDP) vocabulary.
- `pages.json`: Auxiliary pages like Story, Support, Concierge, and Admin.

## Implementation
1. Create `frontend/dictionaries/en/` and `frontend/dictionaries/fa/` directories.
2. Distribute the keys from the monolithic JSONs into the 4 sub-files.
3. Create an `index.ts` in each language folder that spreads and exports the combined objects.
4. Update `frontend/app/dictionaries.ts` to point to the new `index.ts` files.
5. Delete the old `en.json` and `fa.json`.
