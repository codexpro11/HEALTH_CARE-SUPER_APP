# Native Java Android client

This is a native Android addition alongside the existing React web app. It is a client implementation milestone; live integration and device acceptance remain open.

## Install the demo

Copy `HealthConnect-Phase6-Demo.apk` from the package root to an Android 8.0+ phone, open it and allow installation from the opening app if Android requests that setting. Choose the first demo patient, second patient or doctor workspace. No credentials are needed. The package ID is `com.healthconnect.android.demo`.

The APK is debug-signed. A different signing key on a future rebuild may require uninstalling this demo; uninstalling removes its local data. Android demo accounts/data are separate from the web demo and other phones.

## Native features

| Area | Behavior |
| --- | --- |
| Navigation | Native Java screens, scrollable cards, bottom navigation, search, back handling and system/keyboard insets |
| Authentication | Demo personas; live Firebase email/password sign-in, patient registration, reset and refresh through Firebase REST |
| Session | Live role from authenticated `/api/v1/users/me`; no live role picker; stale account/screen callbacks discarded |
| Storage | Android Keystore AES-GCM encryption, atomic account-scoped state/files, backup disabled; access tokens in memory and only explicitly remembered refresh tokens saved |
| Doctors | Search, review future appointments, history and cancellation with a reason |
| Diagnostics | Test/center/date/time selection, supported collection method and home-address validation, booking history/cancellation |
| Pharmacy | Quantity/stock/prescription-document checks, cash-on-delivery order review/history/cancellation |
| Records | Android file picker; PDF/JPG/PNG signature and 10 MB checks; encrypted attachments; image/PDF first-page preview, explicit export and archive/restore |
| NFC | Optional hardware; explicit NDEF read/write, writable/capacity checks, timeout, opaque identifier issuance/replacement/revocation |
| Consent | One-hour local demo consent; provider checks share only display name and document count; summary closes on pause or expiry |
| SOS | Explicit precise/approximate location permission, accuracy/freshness checks, manual address fallback, review, active-request guard, pending cancellation and history |
| Live SOS retry | Encrypted original payload/idempotency reference retained after failure; retry resends original details and changed unresolved requests are blocked |
| Inbox | SOS events, unread count/filtering, individual/bulk read actions, generic opt-in Android device alerts |
| Insurance | Local policy and claim drafts; no insurer transport or simulated approval |
| Directories | Hospital/blood-bank search and facility dialer links where usable phone numbers exist |

Patient actions reject provider sessions. There is no background location, automatic phone call, broad storage permission or medical information in device notifications. Screens and document dialogs use the secure-window flag.

## Build

Open this directory in Android Studio. Install Android platform 36 and Build Tools 36.0.0. Use JDK 17+ (verified here with JDK 21). Java source level is 17; the wrapper uses Gradle 9.1.0 and AGP 9.0.1.

On Windows run `gradlew.bat assembleDebug`; on macOS/Linux run `sh gradlew assembleDebug`. Debug always uses `DEMO_MODE=true` and the `.demo` package suffix.

Alternatively, run `java tools/BuildDemo.java <absolute-Android-SDK-path> <output-directory>` from this directory. This Java tool compiles resources and Java, generates DEX, aligns/signs the APK with a local debug key and verifies its signature. It builds only the demo. It does not bypass release configuration.

To run standalone checks, compile `app/src/main/java/com/healthconnect/android/Rules.java` and `tests/RulesTest.java` into a temporary classes directory with `javac -encoding UTF-8 -d <directory> ...`, then run `java -cp <directory> com.healthconnect.android.RulesTest`.

## Live configuration

1. Copy `healthconnect.properties.example` to `healthconnect.properties`. Set the real HTTPS Spring Boot base URL and Firebase public web API key for the same project as the backend.
2. Enable Firebase Email/Password authentication and configure the key's API restrictions for the REST calls. Never put a Firebase Admin/service-account key in the app.
3. Implement/expose the authenticated API contracts below. The backend must verify Firebase ID tokens, derive the patient from that identity and enforce ownership, provider membership, consent, audit, validation and server capacity controls.
4. Select the release variant and configure production signing in Android Studio. Release builds fail with missing/example connection settings. The debug APK has no switch into live mode.

Firebase REST authentication requires no `google-services.json` or Firebase Android SDK dependency. Live Google sign-in is not implemented. Firebase/backend integration was not exercised against a configured service in this task.

| API group | Contract |
| --- | --- |
| User | GET/PATCH `/api/v1/users/me` |
| Doctors/appointments | GET `/api/v1/doctors`; GET/POST `/api/v1/appointments`; DELETE `/api/v1/appointments/{id}` with reason |
| Diagnostics | GET `/api/v1/diagnostics/centers`, `/tests`, `/bookings`; POST `/bookings`; POST `/bookings/{id}/cancel` |
| Pharmacy | GET `/api/v1/pharmacy/medicines`, `/orders`; POST `/orders`; POST `/orders/{id}/cancel` |
| Records | GET/POST `/api/v1/medical-records`; GET `/{id}/file`; POST `/{id}/archive` or `/{id}/restore`; multipart JSON `metadata` and binary `file` parts |
| Emergency | GET `/api/v1/emergency/history`; POST `/api/v1/emergency/sos` with `Idempotency-Key`; POST `/api/v1/emergency/{id}/cancel` |
| Inbox | GET `/api/v1/notifications`; PATCH `/{id}/read`; POST `/mark-all-read` |
| Directories | GET `/api/v1/hospitals`, `/api/v1/blood-banks` |

JSON envelopes use `data`; list responses may also use `content`. Live failures never fall back to mock success. Server availability/pricing/fees and cancellation decisions remain authoritative. Demo appointment conflict checks cover the current local account, not cross-account server capacity.

## Try NFC and consent

1. As the first patient, issue a card and grant one-hour demo consent in NFC health card.
2. Copy its identifier or write to an empty, formatted, writable NDEF tag. Writing replaces existing NDEF contents and requires confirmation.
3. Sign out and enter the doctor workspace on the same device. Scan/paste the identifier to request the limited summary.
4. Return to that patient, revoke consent or replace/revoke the card, and try the old identifier again as the doctor. Access should fail.

Android demo identifiers use `HCNFC1:` and a fixed synthetic doctor persona. They do not interoperate with the separate web demo's `HC-NFC:` fixtures. No medical documents are written to a tag. Live NFC access stays closed pending shared server credential/membership/consent/audit services. Reader mode and NDEF writing do not emulate an NFC card; host card emulation is not included.

## Remaining production work

- Run device acceptance: installation, rotation, font scaling, accessibility, keyboard/insets, permission denial/revocation, file-provider failures, preview/export, process death, Keystore, real NFC and notifications.
- Exercise live Firebase/API authentication, 401/403 behavior, ownership, pending-request account switches, uploads and booking/order/SOS endpoints against the deployed Java backend.
- Connect live NFC and insurer services. Native insurance currently supports local policy/claim drafts; full insurance and provider consultation workflows remain in the preserved web app.
- Configure Google sign-in and FCM token registration/server sending if required. Current device alerts are foreground app-action alerts, not background push.
- Connect real dispatch, responder acknowledgement and emergency-contact delivery. A saved request is not evidence that help was dispatched.
- Configure production signing, privacy/distribution and release testing under Phases 7–8.

## Verification boundary

52 Java rule checks passed. The full Android app compiled against platform 36; resources linked, DEX generated and an aligned, signed APK passed signature verification. Package/launcher/minimum API/permissions were inspected from the APK. See `../VERIFICATION.md` for final results.

Gradle build/lint and emulator execution were blocked by local daemon/ADB connection restrictions here. No screen, hardware workflow, Keystore runtime, permission prompt or notification delivery is claimed as device-tested. The web source is preserved byte-for-byte from the Phase 5 archive.

References: [Firebase Auth REST](https://firebase.google.com/docs/reference/rest/auth), [AGP 9.0.1](https://developer.android.com/build/releases/agp-9-0-0-release-notes), [Android NFC](https://developer.android.com/develop/connectivity/nfc/advanced-nfc).
