# HealthConnect for iPhone and iPad

Open ios/HealthConnect.xcodeproj in Xcode. The shared HealthConnect scheme supports iOS 17+, iPhone, iPad and Simulator.

## Install on iPhone
1. Pull main-atharv and open ios/HealthConnect.xcodeproj.
2. Add your Apple account in Xcode Settings > Accounts.
3. Select the HealthConnect target > Signing & Capabilities. Select your Team with automatic signing enabled. Use a unique bundle identifier for your team if required.
4. Connect and trust your iPhone, select it as the run destination and enable Developer Mode if Xcode requests it.
5. Click Run and follow Xcode's signing instructions.

For Simulator, choose an installed iPhone simulator and click Run.

## Distribution
This repository contains source, not a signed IPA. TestFlight distribution requires your Apple Developer Program team, App Store Connect app record and signing. Use Product > Archive and Distribute App after configuring these. No TestFlight or App Store release has been created.

## Current functionality
This is a SwiftUI UI starter with Home, Care, Records, Emergency and Profile tabs, navigation and an SOS information dialog. It is not the complete web/Android app. Search has no connected results. Login, bookings, document upload, persistence, insurance actions, notifications, NFC and live SOS remain unimplemented. No emergency request is sent.

Shared API contracts are documented in android/README.md.

## Validation
The local build on 2026-10-25 reached Swift compilation but sandbox permissions blocked the Swift macro process. A successful local build and iPhone installation have not been verified. The GitHub workflow builds for Simulator without signing.
