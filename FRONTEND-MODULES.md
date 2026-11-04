
## Signup email verification

Registration now opens code entry instead of claiming the account is ready. Users can verify an eight-digit email code or resend it, then sign in. A login response with `EMAIL_NOT_VERIFIED` resumes code entry using the supplied email without storing credentials or codes. Backend endpoints: `/auth/verify-email` and `/auth/resend-verification`; delivery requires backend Resend configuration. Existing accounts retain access. Validation: frontend build, lint and 51 regression tests; backend 363 tests pass. Browser fixture checks passed for signup-to-code entry, invalid codes, resend, successful verification, and resuming verification from login. Live email delivery requires a configured sender and is not covered by fixture checks.

## Dark mode

Added a single sun/moon toggle button for browser-local Light/Dark selection to the app header and Groups page after sign-in. Account-access screens do not display the selector. Existing mint/green dark tokens now activate before first paint. Saved selections synchronize across tabs; light is the default for new users and previous System selections. Storage failures retain an in-memory selection. Auth and Groups surfaces use semantic colors. Backend source/tests expose no theme preference contract; this preference needs no endpoint or service configuration and does not synchronize across devices. Validation: build, lint and all 51 regression tests pass; browser check confirmed dark login rendering and persistence after reload. Authenticated financial flows were not exercised.

Theme switching now crossfades the page over 280 ms using View Transitions, with a color-transition fallback and a rotating/fading sun/moon icon. Reduced-motion preferences disable these animations. Validation: build, lint and focused runtime checks for theme updates, reduced motion and fallback pass.
