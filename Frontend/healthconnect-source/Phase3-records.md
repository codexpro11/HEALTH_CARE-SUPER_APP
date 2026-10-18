# Phase 3: Medical Records frontend milestone

Current numbered phase: **3**. Five required phases follow it: 4 healthcare services, 5 emergency/notifications, 6 native Android, 7 quality, 8 deployment. Phase 9 is optional. Phase 3 is not complete end to end until live backend integration is verified; earlier phases also retain release gates.

Implemented: text search across title, clinician, facility, notes and tags; inclusive date filters; status/category filters; newest/oldest/title sorting; month timeline; upload privacy; sharing visibility; confirmed archive and restore; personal document activity alongside NFC scan attempts. Existing NFC, insurance, SOS and provider workflows remain available.

The shared scope rule now maps LAB_REPORT, DIAGNOSTIC_REPORT and RADIOLOGY to Diagnostic Reports, PRESCRIPTION to Prescriptions, and supported clinical/history categories to Medical Summary. Basic Profile remains required. Archived, restricted, confidential and unknown categories are excluded from provider demo summaries; attachments remain patient-only. Consent expiry and revocation affect eligibility. Provider access still requires the existing valid standard NFC grant; emergency grants do not grant full records.

Demo records, attachments and activity are scoped to the signed-in account. Archive retains the attachment and original verification status for restoration. New uploads remain PENDING and must not be presented as clinician verified. Upload metadata/date and attachment constraints run before writes. Activity contains up to 100 recent personal events and 50 NFC requests. Personal activity is browser-held demonstration data, not an immutable clinical audit trail. An upload/archive write is successful even if its optional activity append fails; view/download report an activity-save failure separately. A granted scan is not evidence that a record was opened.

## Live integration contract to implement and verify

Existing GET /api/v1/medical-records and multipart POST /api/v1/medical-records are preserved. POST uses metadata (application/json) and file parts. Authenticated downloads use the existing record file endpoint. This frontend adds POST /api/v1/medical-records/{id}/archive, POST /api/v1/medical-records/{id}/restore, and GET /api/v1/medical-records/activity. These endpoints are not implemented by this frontend repository.

The Java Spring Boot backend must verify the Firebase token, derive account/patient identity server-side, authorize every document operation, validate file content/size rather than trusting MIME/extension, enforce confidentiality and current provider consent, deny archived record sharing, store originals privately, and audit reads/downloads on the server. Client activity logging is disabled in live mode. The live sharing display does not assert demo consent as backend authorization.

## Validation

Run npm test, npm run lint, npm run build and the records browser smoke test. New rules tests cover diagnostic scope boundaries, archive/privacy exclusions, expired/revoked consent, attachment exclusion, inclusive search/date filters, timeline grouping and upload-date validation. Browser checks cover search, timeline, privacy upload, file persistence/download, archive/restore, activity and account isolation.
