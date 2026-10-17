# Phase 5: Emergency and Notifications

Frontend milestone: Phase 5. Three required numbered phases follow (6 Android, 7 Quality, 8 Deployment); Phase 9 is optional. Earlier production gates remain open.

## Implemented

- Confirmed SOS creation with a stable request reference; an existing active request prevents duplicate local creation.
- Device geolocation only on user request, with finite coordinates, accuracy and capture time; expired GPS is rejected. Permission denial, unavailable location and timeout support a manual address/landmark.
- Account-scoped persistent pending requests and history. No fabricated ambulance, ETA, speed, ICU reservation, responder acknowledgement or automatically contacted emergency contact.
- Cancellation requires confirmation and a reason. Cancellation history and its notification commit together. Only pending demo requests can be cancelled.
- Inbox events reflect actual local SOS actions, with combined search/category/unread filters, date/time, safe internal links, individual and bulk read actions, and an accurate shared unread badge.
- Request and inbox event use one versioned storage write; failures are reported without replacing corrupt data. Session/role changes clear emergency memory and stale async results cannot repopulate it.
- Optional browser alerts ask permission only after a click. They use generic text without medical/location details, respect account opt-out, provide a test action, and do not replay historical alerts after reload. Inbox operation does not depend on browser support.
- Before/after at /app/compare. Earlier comparisons remain at /app/compare/services and /app/compare/records. NFC, insurance, providers, records and Phase 4 services are preserved.

## Live contract and remaining integration

The available workspace contains the React frontend; it does not contain a Java Spring Boot backend to implement or deploy. Live mode preserves API failure propagation and never creates a mock emergency on network failure.

Authenticated routes:
- POST /api/v1/emergency/sos with Idempotency-Key and clientRequestId, emergencyType, address, locationSource, optional latitude/longitude/accuracyMeters/locationCapturedAt.
- GET /api/v1/emergency/active and GET /api/v1/emergency/history.
- POST /api/v1/emergency/{id}/cancel with reason; response includes cancelled and message.
- GET /api/v1/notifications, PATCH /api/v1/notifications/{id}/read and POST /api/v1/notifications/mark-all-read.

The Java backend must derive the patient from verified Firebase authentication, enforce ownership/roles on every route, validate locations and timestamps, enforce request uniqueness/idempotency transactionally, and commit state changes with notification events via a durable outbox. Client storage and locks are not production authorization or cross-device idempotency.

Only authenticated, integrated emergency providers may advance pending requests to dispatched/en route/arrived/resolved. Dispatch, contact/SMS delivery, bed reservation, live tracking and real ETAs require provider acknowledgement. Cancellation after dispatch needs a provider-specific protocol; this demo cannot cancel a real emergency response.

FCM background push is not configured or claimed. It requires Firebase project messaging configuration, a VAPID public key, an HTTPS messaging service worker, authenticated token registration/deletion and rotation, per-account preferences, notification permission handling, server-side Firebase Admin sending and invalid-token cleanup. Notifications should contain generic text and fetch sensitive content only after authentication. The inbox remains the durable source of truth.

The India direct-call link uses 112, verified against https://112.gov.in/ on 2026-10-15. Clicking a phone link opens the user's dialer; the app does not call automatically. Optional browser alerts work only while this app is open and subject to browser/OS support.

## Verification

Run npm test, npm run lint and npm run build. Phase 5 rules cover location validity/freshness, account and role isolation, idempotency, cancellation, atomic storage failures, corruption preservation, filters and unsafe message URLs. Browser checks cover location denial and GPS success, confirmation, reload persistence, cancellation, read counts, filtering, account isolation, role guards and narrow mobile layouts.

Validated on 2026-10-15: 88/88 rules tests passed; TypeScript checking and production build passed; Chromium checks of the production bundle passed with no page errors or live API calls. Browser/OS policy can suppress native alerts; the test verified the permission/failure path and continued inbox operation, not background push delivery. Desktop and 390px mobile screens were visually inspected.
