# Login & Cart Fixes Plan

## 1. Login Issue (CORS Preflight)
- **Problem**: The frontend `POST` request with `application/json` triggered a CORS preflight (`OPTIONS`) request, which the Express backend was not handling, causing the login to fail silently or throw a network error.
- **Solution**: Updated `backend/src/presentation/server.ts` to properly return `200 OK` for all `OPTIONS` requests.

## 2. Shopping Cart Issue (State & HTML Errors)
- **Problem 1**: There was no global state to hold cart items.
- **Problem 2**: Buttons were wrapped inside Next.js `<Link>` components (`<Link><button>...</button></Link>`). This is invalid HTML and causes React hydration errors, breaking clicks and navigation.
- **Solution**: 
  - Created `CartContext.tsx` to manage cart state using `localStorage`.
  - Wrapped the app in `<CartProvider>`.
  - Updated `Header.tsx` to show the cart item count and added a Logout function.
  - Updated `ProductInfo.tsx` to be a Client Component and interact with the `CartContext`.
  - Converted all invalid `<Link><button>` structures into clean `<Link className="...">` tags across the homepage.
