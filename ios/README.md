# HealthConnect iOS

Native SwiftUI client starter aligned with the HealthConnect web and Android visual system.

## Open in Xcode

Open `HealthConnect.xcodeproj`, select the `HealthConnect` scheme, choose an iOS 17+ simulator or device, then run.

## Current scope

The starter includes the iOS app entry point, teal/slate styling, Dashboard, Care, Records, Emergency and Profile tabs, empty states that do not invent patient measurements, and an SOS review confirmation screen.

The screens are UI scaffolding. Firebase sign-in, API requests, persistence, appointment booking, record upload, push notifications, NFC, and live SOS submission still need iOS service implementations. The SOS review button does not contact emergency services.

## Backend contract

The existing Android client documents the shared API routes in `android/README.md`. Keep authentication and patient/provider authorization enforced by the backend when implementing the iOS networking layer. Store credentials in iOS Keychain; never embed Firebase Admin credentials in the app.
