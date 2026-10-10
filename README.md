# Aangan Studio — Google Calendar Booking Proxy

Two serverless endpoints Vaani's agent calls to book/check consultations on Google Calendar.

## Endpoints
- `POST /api/book-appointment` — creates a calendar event.
- `POST /api/check-availability` — returns busy time blocks for a date range.

Both require header: `x-api-key: <PROXY_API_KEY>`

## Environment variables to set in Vercel (Project Settings → Environment Variables)
- `GOOGLE_CLIENT_ID` — from the OAuth client created in Google Cloud Console
- `GOOGLE_CLIENT_SECRET` — from the same OAuth client
- `GOOGLE_REFRESH_TOKEN` — generated via OAuth Playground (long-lived; do not share)
- `GOOGLE_CALENDAR_ID` — the calendar to book into (use `primary` for the account's main calendar, or a specific calendar's ID from Google Calendar settings)
- `PROXY_API_KEY` — any random string you choose; this is NOT a Google credential, just a shared secret between Vaani and this proxy. Generate one yourself (e.g. a long random password) and use the same value in Vaani's custom tool Authorization header.

## Deploy
1. Push this folder to a GitHub repo, or deploy directly via `vercel` CLI from this directory.
2. In Vercel project settings, add the five environment variables above.
3. Redeploy after adding env vars.
4. Your endpoints will be live at `https://<your-project>.vercel.app/api/book-appointment` and `/api/check-availability`.
