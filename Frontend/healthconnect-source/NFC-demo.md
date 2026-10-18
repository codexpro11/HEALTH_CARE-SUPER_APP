# NFC frontend demo phase

The original patient dashboard, SOS, insurance, pharmacy and diagnostics remain in place.

## Try the flow
1. Enable `VITE_DEMO_MODE=true` and sign in with sample credentials.
2. Open NFC Card to revoke, activate or replace the identifier. Reload to verify persistence.
3. In Consent, use Manage Access to choose provider scopes and expiry.
4. Switch the demo role to DOCTOR, HOSPITAL or ADMIN. The provider scanner checks the demo hospital association, card and consent.
5. Use the reader scenario selector to test wrong hospitals, unlinked providers or unknown cards.
6. A successful scan grants a five-minute summary view. Direct URLs, wrong patient IDs and expired/revoked grants show no patient details.
7. Emergency access requires an active card and a reason of at least ten characters; its scope excludes insurance and full records.
8. Return to the patient persona to inspect granted and denied access attempts.

## Authorization boundary
This is a frontend simulation. Sign-in and role switching are demo controls. Browser storage and client-side route guards are not a security boundary for real medical data. No Firebase identity, hospital membership, server audit log, insurer or emergency-dispatch integration is verified here. Spring Boot must enforce authentication, RBAC, facility association, patient consent, record ownership and time-limited emergency authorization before live use.

NFC identifiers contain no medical or insurance data. Cards, consent and access history are scoped to the demo account in localStorage; grants are tab-local in sessionStorage and cleared on role switch and logout. No demo backend requests are made.

## Verification
`npm test` covers existing frontend regressions and NFC permission denials.
`npm run lint` and `npm run build` verify types and production output.
`node tests/nfc-authorization.mjs` checks route guards, direct URLs, hospital denial, card replacement and revocation, consent scopes, emergency reasons and expiry, account isolation and mobile rendering.

The browser test defaults to http://127.0.0.1:4173/. For the static-host deployment, set TEST_APP_URL to its root URL and TEST_HASH_ROUTER=true.

Next frontend phase in the shared roadmap: insurance policy and claim forms, document metadata, and claim detail/status workflows. Native NFC and server authorization remain separate integration work.

