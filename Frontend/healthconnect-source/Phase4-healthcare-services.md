# Phase 4: Healthcare Services frontend milestone

Current numbered phase: **4**. Four required phases follow: **5 emergency and notifications, 6 native Android, 7 quality, 8 deployment**. Phase 9 is optional. These counts describe roadmap order, not end-to-end completion. Earlier backend, security and device release gates remain open.

## Implemented

- Diagnostics: search, eligible center selection, explicit collection time, home/center collection, home address validation, duplicate-slot guard, account-scoped booking history, status filters and confirmed cancellation of unstarted bookings.
- Pharmacy: catalog-based demo price/stock validation; shared rounded totals; uploaded prescription document selection for prescription medicines; pending pharmacist review; order status filters and confirmed cancellation before packing. New order timeline entries use ISO timestamps. No simulated payment is treated as insurance approval or a real charge.
- Hospitals: specialty search, ICU and distance filters, nearest/rating sort, reset controls; sample bed counts labelled accurately and fabricated ambulance ETA removed.
- Blood banks: blood group plus 24-hour/distance filters, nearest-first results, reset controls. Listed units are not a compatibility decision or reservation.
- Demo service state requires a patient session and remains scoped to the account; corrupt or failed writes report errors. Unknown catalog IDs do not substitute an unrelated sample.
- Before/after at `#/app/compare`; earlier medical records comparison retained at `#/app/compare/records`; roadmap at `#/app/progress`.

## Live contract and release gates

Existing diagnostic centers/tests/bookings and pharmacy medicines/orders routes are preserved. Cancellation adds authenticated `POST /api/v1/diagnostics/bookings/{id}/cancel` and `POST /api/v1/pharmacy/orders/{id}/cancel`. Pharmacy order creation now supplies `prescriptionRecordId` for prescription items; a client boolean is not evidence of prescription validity.

The Java Spring Boot backend must derive patient identity from the verified Firebase principal, enforce ownership and roles on reads and writes, validate center/test/serviceable address/real slot availability, prevent duplicate submissions with transactional idempotency, and enforce cancellation transitions. Provider capacity and hours must be authoritative; demo collection windows are illustrative. The browser does not reserve stock, slots, beds or blood units.

For pharmacy orders, the server must reprice against current inventory, reserve stock atomically, authorize the selected private prescription for the requesting patient and dispensing pharmacy, enforce expiry/medicine matching and pharmacist review, and process payment/insurance/refunds through actual providers. Document selection requests explicit sharing; this frontend demo does not transfer a document to a real pharmacy. No medical report, dispatch or review is manufactured.

## Validation

Run `npm test`, `npm run lint`, and `npm run build`. Healthcare rules tests cover center/test boundaries, dates, collection addresses, duplicate slots, catalog tampering, Rx document requirements and account isolation, stock/quantity checks, totals, cancellation eligibility, directory filters, roles and storage failures. Browser acceptance scenarios in `tests/tests.json` cover booking/cancellation persistence, prescription upload/checkout, orders, directory filters and the comparison.
