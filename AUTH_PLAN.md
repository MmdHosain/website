# Fast Login / Registration (OTP) Implementation Plan

## Phase 1: Backend Domain & Use Cases
- [x] **Entities**: Create `User` entity.
- [x] **Interfaces**: Define `OtpProvider` interface to abstract the SMS provider.
- [x] **Use Cases**: Implement `RequestOtp` (generates code, saves to DB, calls provider) and `VerifyOtp` (validates code, creates user if new, returns session token).

## Phase 2: Backend Infrastructure & Presentation
- [x] **Database**: Update `postgres.ts` to auto-create `users` and `otps` tables on startup.
- [x] **Providers**: Create `MockOtpProvider` which currently logs the OTP. The controller will also return it in development mode for the frontend popup.
- [x] **API**: Expose `POST /api/auth/request-otp` and `POST /api/auth/verify-otp` in `AuthController`.

## Phase 3: Frontend Integration
- [x] **Dictionaries**: Add auth translations to `en.json` and `fa.json`.
- [x] **Services**: Create `auth.service.ts` to handle API calls and local storage of the token.
- [x] **UI Components**: Create `AuthModal.tsx` for the mobile and OTP input steps.
- [x] **Popup Notification**: Implement an `alert()` based popup in the frontend to simulate receiving the SMS, as requested.
- [x] **Header Update**: Connect the 'Account' button in the Header to trigger the `AuthModal`.
