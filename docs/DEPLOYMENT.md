# Hosted preview

The frontend is configured for Vercel and the existing Docker backend at `https://divvy-backend.onrender.com`.

`vercel.json` forwards `/api/:path*` to the Render API before applying the SPA fallback to `index.html`. This lets routes such as `/expenses` and `/bills` open directly. A clean cloud build needs no local `.env` file: the API client defaults to `/api`. Keep the local `.env` API URL for local development.

Use Node 24 for builds. Run `npm run build`, `npm run lint` and `npm test` before deployment. Local agent skill assets are excluded from ESLint because they are not application source.

Deploy a preview using the Vercel CLI from the intended personal workspace. Do not deploy this personal project into an unrelated work team. Deployment packages must exclude local environment files and credentials.

The existing Render service is on the free compute plan. The API/database readiness endpoint is `/api/ready`; it was confirmed to return HTTP 200 during setup. Free Render services sleep when idle, which introduces a cold start and pauses in-process recurring jobs. Use an always-on service later if those jobs must run continuously.

No database, account or secret is provisioned by the frontend configuration. Backend credentials remain on Render; no JWT secret or database URI belongs in Vite variables or the frontend bundle.
