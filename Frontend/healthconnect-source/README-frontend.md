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
- Frontend CI runs these checks on frontend changes and pull requests.

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

File upload/preview/download, prescription attachments, diagnostic history, NFC/consent/insurance workflows and provider dashboards remain separate frontend milestones. Notification preference switches do not enable message delivery or security mechanisms.
