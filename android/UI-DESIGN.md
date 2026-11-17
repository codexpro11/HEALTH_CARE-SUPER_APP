# Android / web design alignment

The native Java client follows the existing React design in
`Frontend/healthconnect-source/src/layouts/AppLayout.tsx`, the common `Card`,
`Button` and `Input` components, and `pages/dashboard/DashboardPage.tsx`.

## What changed

- Tailwind v4 teal-600 (`#009689`), slate-50 (`#F8FAFC`), white surfaces,
  slate text/borders, and the web blue/green/orange/purple service accents.
- 16 dp bordered cards, 12 dp buttons/fields, native outline icons, 24 sp
  page headings, and at least 48 dp action targets.
- A white header and mobile navigation drawer with active teal destinations,
  pharmacy/profile shortcuts, unread notification badge and red Emergency SOS.
- The dashboard uses the same quick actions, upcoming appointment, recent
  records, health stats and teal tip sections. Phones use a two-column action
  grid; tablets use four actions and a two-column content layout.
- Light/dark palettes, a saved theme preference, themed dialogs/system bars,
  and the web teal-to-emerald NFC card gradient.
- Existing native booking, files, authentication, consent, NFC, SOS and
  insurance actions remain connected to their existing Java handlers.

Dashboard content comes from the active account. Upcoming appointments are
selected by date/time, archived records are omitted, and each list panel has
its own loading, empty and retry states. Health measurements have empty states
until a measurement source is connected. No sample vital signs are presented as
the patient's readings. Native and web demo data remain separate.

## Validation (2026-10-19)

- SDK-only full build: Android 36 resource linking, Java compilation, DEX
  generation, APK alignment and APK v2/v3 signature verification passed.
  Command from `android/`:
  `java tools/BuildDemo.java <Android-SDK-path> build/ui-parity`.
- `java tools/QualityGate.java build/ui-quality`: 52 rules, 85 security,
  48 HTTP contract and 13 platform-policy checks passed (198 total).
- The quality gate's TLS runtime suite was blocked by a local socket permission
  error. Gradle assemble/lint was blocked by the same environment's inability
  to connect to its daemon. These checks are not recorded as passing.
- ADB could not start its daemon, so emulator/phone rendering and visual parity
  have not been verified. A compiled APK does not establish pixel-level parity.

## Review on a device

Pull `main-atharv`, open `android/` in Android Studio, rebuild and run the debug
variant. Compare with the web client at the equivalent screen width:

1. Open a patient demo; inspect the header, quick actions and empty dashboard.
2. Book a future visit, add a record, return home and check the displayed data.
3. Open the drawer, navigate each destination and check the active item and SOS.
4. Switch between light/dark on the dashboard and reopen the app.
5. Check the NFC gradient and form fields, then repeat at a large text size,
   landscape orientation and tablet width. Confirm keyboard/cutout insets.
6. Verify patient/provider separation and that theme/navigation changes never
   submit a booking, SOS or insurance action.

The native screens adapt the web design to Android controls and existing native
features; screenshots are still needed to confirm exact visual alignment.
