# ARIWATCH - Admin Dashboard

## Overview
The ARIWATCH Admin Dashboard is a secure, private interface designed for store managers to manage the luxury watch catalog. It interacts with the Clean Architecture backend to perform full CRUD operations on the PostgreSQL database.

## Access
- **English Interface**: [http://localhost:3000/en/admin](http://localhost:3000/en/admin)
- **Persian Interface**: [http://localhost:3000/fa/admin](http://localhost:3000/fa/admin)

## Features
- **View Catalog**: A comprehensive table listing all watches, displaying IDs, names, categories, and pricing.
- **Add Product**: A dedicated form to input new watches into the system with direct image URL support.
- **Edit Product**: Update existing watch details (price, description, images, categories).
- **Delete Product**: Remove watches permanently from the database.

## Architecture
The Admin Panel strictly isolates UI concerns from business logic in the Next.js frontend:
- **`useWatchForm` Hook**: Handles state management, API calls, and error handling.
- **`WatchForm` Component**: Solely responsible for rendering the UI and handling user input events.
- **Backend Use Cases**: `CreateWatch`, `UpdateWatch`, `DeleteWatch` execute the business logic, interacting with the `PostgresWatchRepository`.

## API Integration
The dashboard communicates with the backend via the `watchService.ts` utility, which centralizes all API requests. The service handles Docker-internal requests during SSR (`http://backend:4000`) and resolves to `http://localhost:4000` on the client side.

## Future Enhancements
- **Authentication**: Integrate NextAuth or JWT-based authentication to secure the `/admin` routes so it is not publicly accessible.
- **Pagination**: Implement cursor or offset-based pagination for large catalogs to improve performance.
- **Image Uploads**: Add a media server (e.g., AWS S3) for direct image uploads instead of utilizing raw image URLs.
