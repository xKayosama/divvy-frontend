
## Signup email verification

Registration now opens code entry instead of claiming the account is ready. Users can verify an eight-digit email code or resend it, then sign in. A login response with `EMAIL_NOT_VERIFIED` resumes code entry using the supplied email without storing credentials or codes. Backend endpoints: `/auth/verify-email` and `/auth/resend-verification`; delivery requires backend Resend configuration. Existing accounts retain access. Validation: frontend build, lint and 51 regression tests; backend 363 tests pass. Browser fixture checks passed for signup-to-code entry, invalid codes, resend, successful verification, and resuming verification from login. Live email delivery requires a configured sender and is not covered by fixture checks.
