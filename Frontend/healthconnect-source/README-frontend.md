# HealthConnect frontend stabilization

This phase changes only `Frontend/healthconnect-source`. It does not implement backend services.

## Run the standalone demo

From this directory:
1. Copy `.env.example` to `.env.local` and keep `VITE_DEMO_MODE=true`.
2. Run `npm ci`, then `npm run dev`.
3. Open the displayed localhost URL and sign in with the sample values.
4. Use Settings > Demo preview to switch between Success, Request failure and Empty lists.

The banner identifies the preview. Firebase and the backend are not contacted in demo mode. No passwords are stored. Profile edits and preferences are saved to the browser; sample records are isolated by demo account. Unchecking Remember me limits the demo session to the browser tab.

Set `VITE_DEMO_MODE=false` and configure the Firebase/API environment values for live integration. Live request failures never become mock successes. Provider role switching is available only in the demo.

## Validation

- `npm test`: date/slot validation, search and specialization filters, checkout constraints, live failure propagation, demo scenarios, account-isolated persistence and storage failures.
- `npm run lint`: TypeScript checking.
- `npm run build`: production bundle.
- Frontend CI runs these checks, then Chromium smoke checks of login, profile persistence, booking/cancellation, patient pages, saved settings and preview scenario recovery. Desktop/mobile screenshots are uploaded as a workflow artifact.

## Browser smoke checklist

- Sign in, refresh, sign out, and verify that Remember me behaves as described.
- Register a sample patient; name/contact values should appear in Profile.
- Edit profile and preferences, reload, and verify retained values.
- Search doctors by name/clinic and select each specialization.
- Book a future available slot; verify it in Appointments and Dashboard.
- Try booking the same slot again; expect an error rather than a second success.
- Reschedule to an available future slot, then cancel; verify the list updates.
- Try past dates, unavailable times, short delivery addresses and invalid cart quantities.
- Filter pharmacy categories, add a stocked item, and check out; displayed and stored totals should match.
- Book a lab test; a center-only test must disable home collection.
- Switch preview scenarios and verify the error/empty screens; switch back to Success to recover.
- Check the main flows at narrow mobile and desktop widths.

## Remaining phases

Medical record uploads accept PDF, JPG, and PNG files up to 10 MB, with preview and download controls. Demo attachments are stored in browser IndexedDB and scoped to the signed-in demo account. Live mode submits record metadata and the file as multipart form data; the backend must expose the matching medical-record endpoint. Prescription upload and order checks, diagnostic booking history, NFC/consent/insurance and provider workflows are available as frontend demo milestones. Phase 5 adds persistent SOS requests and an event-driven inbox; see Phase5-emergency-notifications.md for the implemented behavior and live integration contract. Email/SMS/push preference switches do not enable delivery; optional current-app browser alerts are configured explicitly in the Notification inbox.
