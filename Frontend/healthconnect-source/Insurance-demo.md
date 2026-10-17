# Insurance frontend demo phase

The existing HealthConnect dashboard, NFC, SOS, pharmacy and diagnostics design is preserved.

## Workflows
- Add/edit/delete sample policies with masked identifiers, selected currency, valid dates and coverage notes.
- Upload, preview, download and remove PDF/JPG/PNG policy documents up to 10 MB; actual files persist in IndexedDB.
- Create/edit/delete draft claims. Attach documents before submission; submitted claims and their documents are read-only.
- Simulate submission, review, full/partial approval, rejection with a reason, and settlement. The claim timeline persists.
- Search/filter claims and follow policy/claim detail routes.
- Show only active masked policy summaries to a provider with a current NFC Insurance scope.

## Boundaries
Policies, claims and document references are scoped to the demo account. Wrong or foreign identifiers have no fallback to a sample record. Document reads recheck account and role after asynchronous access. Provider personas cannot manage policies, claims or files. NFC access shares no full identifiers, documents or claim details.

Demo identity and browser storage are not a security boundary for real healthcare information. Insurer verification, eligibility, claim transmission, financial settlement and server authorization are not implemented. Review controls are explicitly simulations. Existing sample policies use USD; new policy forms default to INR and never silently convert currencies. Policies with claims cannot be deleted or have their currency changed.

## Verification
Run npm test, npm run lint and npm run build. The CI browser step includes tests/browser-smoke.mjs, tests/nfc-authorization.mjs and tests/insurance-demo.mjs. Insurance checks cover form errors, persistence, actual file bytes, draft editing/deletion, irreversible submitted state, decisions, account/role isolation, NFC scope filtering, responsive forms and empty/error recovery.

Browser tests use http://127.0.0.1:4173/ by default. Static-host testing uses TEST_APP_URL with TEST_HASH_ROUTER=true.

Next frontend work should extend the same NFC consent model to authorized record/prescription/report previews. Backend integration remains a separate phase.

