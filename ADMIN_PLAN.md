# Admin Panel Implementation Plan

## Phase 4: Admin Panel & CRUD Operations
*Goal: Provide a secure, private interface to manage the Watch catalog using Clean Architecture.*

- [x] **Backend Domain**: Update `Watch` entity to include `category`. Expand `WatchRepository` interface with `create`, `update`, and `delete` methods.
- [x] **Backend Application**: Add Use Cases for `CreateWatch`, `UpdateWatch`, and `DeleteWatch`.
- [x] **Backend Infrastructure**: Implement standard SQL commands (INSERT, UPDATE, DELETE) in `PostgresWatchRepository`. Update `init.sql` schema.
- [x] **Backend Presentation**: Expose POST, PUT, DELETE endpoints in `WatchController` and `watchRoutes`.
- [x] **Frontend Service**: Expand `watch.service.ts` to include mutating API calls.
- [x] **Frontend UI**: Create a dedicated `/admin` route group with its own Layout (sidebar), Dashboard (list view), and WatchForm for creating/editing records.
- [x] **i18n**: Add Admin vocabulary to dictionary JSONs.
