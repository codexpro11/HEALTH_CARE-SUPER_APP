# 🏥 Healthcare Super App

> A practical, mobile-first healthcare platform that brings doctor discovery, appointments, medical records, diagnostics, pharmacy, hospitals, blood banks, and emergency support into one application.

**Project approach:** Build a secure **modular monolith first**, prove the core workflows, and add advanced infrastructure only when it is actually needed.

---

## 📌 Why This Version Is Different

The original design included many production-scale technologies at the same time: API Gateway, Kafka/RabbitMQ, Redis, Elasticsearch/OpenSearch, Kubernetes, Terraform, distributed tracing, and several observability systems.

For a final-year project, implementing all of these before the core application works would create unnecessary complexity.

This version intentionally follows a simpler path:

```text
Android App
    ↓
Spring Boot REST API
    ↓
PostgreSQL
    │
    ├── Firebase Authentication
    ├── Firebase Cloud Messaging
    ├── Firebase Storage
    └── Google Maps / Location APIs
```

The backend remains a **Java + Spring Boot modular monolith**, while Firebase provides mobile-friendly supporting services. Firebase Authentication can integrate with a custom backend, Firebase Cloud Messaging provides push notifications, and Firebase Storage provides authenticated file storage. citeturn853231search12turn853231search15turn853231search13

Advanced technologies such as Redis, Kafka, WebSockets, search engines, and Kubernetes are **optional later phases**, not prerequisites for the MVP.

---

# 🎯 Project Objective

Build a working healthcare application that demonstrates:

- Java and Spring Boot
- REST API development
- PostgreSQL and JPA/Hibernate
- Authentication and role-based authorization
- Secure medical-data access
- Appointment booking and concurrency handling
- File/document management
- Mobile application development
- Firebase integration
- API testing
- Docker deployment
- Clean software architecture

The project should be impressive enough for a final-year engineering project while remaining realistically implementable by a small student team or a single developer.

---

# 👥 User Roles

| Role | Main Responsibilities |
|---|---|
| PATIENT | Search doctors, appointments, records, diagnostics, pharmacy, hospitals, blood banks, emergency |
| DOCTOR | Manage profile, availability, appointments, consultations, prescriptions |
| HOSPITAL | Manage hospital profile, departments, beds and emergency availability |
| DIAGNOSTIC_CENTER | Manage tests, bookings and reports |
| PHARMACY | Manage medicines, stock and orders |
| AMBULANCE_PROVIDER | Manage ambulance availability and emergency requests |
| BLOOD_BANK | Manage blood inventory and requests |
| ADMIN | Manage users/providers and platform operations |

For the first release, **PATIENT + DOCTOR + ADMIN** are the priority roles. Other provider roles can be added incrementally.

---

# 🧱 Architecture

## Initial Architecture

```text
                         ┌──────────────────────┐
                         │      Android App     │
                         │ Kotlin + Compose     │
                         └──────────┬───────────┘
                                    │
                              HTTPS / REST
                                    │
                                    ▼
                      ┌─────────────────────────┐
                      │   Spring Boot Backend   │
                      │      Java 21+           │
                      └────────────┬────────────┘
                                   │
             ┌─────────────────────┼──────────────────────┐
             │                     │                      │
             ▼                     ▼                      ▼
       PostgreSQL             Firebase Services      Google APIs
       Main database          Auth / FCM / Storage   Maps / Location
```

## Backend Architecture

Use a **modular monolith**, not microservices.

```text
healthcare-backend/
│
├── auth/
├── user/
├── patient/
├── doctor/
├── appointment/
├── medicalrecord/
├── prescription/
├── diagnostic/
├── pharmacy/
├── hospital/
├── ambulance/
├── bloodbank/
├── notification/
├── audit/
└── common/
```

Each module follows:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Business rules belong in the service layer. Controllers should remain thin.

---

# 🛠️ Recommended Technology Stack

## Android

- Kotlin
- Jetpack Compose
- Material 3
- Navigation Compose
- Retrofit
- OkHttp
- Kotlin Coroutines
- StateFlow
- Hilt
- Firebase Android SDKs
- Google Maps SDK / location services where required

> Android Studio's AI tools can be used to accelerate UI and client implementation, but the Android application must treat the Spring Boot API as the source of truth for business data and authorization.

## Backend

- Java 21+
- Spring Boot 4.x
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- Maven
- Bean Validation
- Spring Boot Actuator
- OpenAPI / Swagger

Spring Boot 4.1.0 was released as a stable release in June 2026; use the latest compatible stable 4.x version available when creating the project rather than a milestone release. citeturn853231search0turn853231search9

## Firebase

Use Firebase only for supporting services:

- **Authentication** — user sign-in and account management
- **Cloud Messaging (FCM)** — push notifications
- **Cloud Storage** — profile images and uploaded documents
- **Crashlytics** — Android crash reporting

Firebase Authentication supports integration with custom backend services, and an authentication token can be verified by the backend. citeturn853231search12

## Database

- PostgreSQL — primary application database
- Flyway — database migrations

Do **not** use Firestore as the primary application database for the first version.

Core healthcare relationships are relational and the backend should own transactional operations such as appointments and orders.

## Later / Optional

Add only after the MVP works:

- Redis — caching
- WebSockets — live status updates
- Kafka or RabbitMQ — asynchronous events
- Elasticsearch/OpenSearch — large-scale search
- Docker Compose — local infrastructure
- Cloud deployment

Do not add these technologies merely to make the architecture diagram look larger.

---

# 🔐 Authentication Strategy

## Recommended Approach

Use:

```text
Android
   ↓
Firebase Authentication
   ↓
Firebase ID Token
   ↓
Spring Boot
   ↓
Verify token
   ↓
Load application user + role from PostgreSQL
   ↓
Authorize request
```

This avoids implementing password storage, password reset flows and identity-provider integration yourself while still keeping application authorization inside Spring Boot.

Firebase Authentication supports email/password, phone authentication and federated providers, and its ID tokens can be used with custom backend services. citeturn853231search12

## Backend Responsibility

The backend must remain responsible for:

- Role checks
- Ownership checks
- Patient/provider access rules
- Consent checks
- Resource-level authorization
- Audit logging

Never rely on the Android UI alone to enforce permissions.

---

# 🔑 Roles

```text
PATIENT
DOCTOR
HOSPITAL
PHARMACY
DIAGNOSTIC_CENTER
AMBULANCE_PROVIDER
BLOOD_BANK
ADMIN
```

The database stores the application's role mapping against the authenticated Firebase user.

Example:

```text
Firebase UID: abc123
        ↓
Application User
        ↓
role = DOCTOR
        ↓
Spring Security authorization
```

---

# 🚀 MVP Scope

The first complete release should contain only these features:

### Phase 1 — Foundation

- Spring Boot project
- PostgreSQL
- Flyway
- Firebase Authentication integration
- User profile
- Role-based authorization
- Global exception handling
- Validation
- Standard API response
- Swagger/OpenAPI
- Audit log foundation

### Phase 2 — Doctor + Patient

- Patient profile
- Doctor profile
- Specialization
- Doctor search
- Doctor availability
- Appointment booking
- Appointment history
- Cancel/reschedule

### Phase 3 — Medical Records

- Medical history
- Allergies
- Prescriptions
- Diagnostic reports
- Medical documents
- Consent management
- Audit logging

### Phase 4 — Supporting Healthcare Services

- Diagnostic centers
- Test catalog
- Diagnostic bookings
- Hospitals
- Hospital bed availability
- Blood banks
- Pharmacy catalog
- Medicine orders

### Phase 5 — Emergency + Notifications

- Emergency request
- Device location
- Nearby hospitals
- Nearby ambulances
- Basic status tracking
- Firebase push notifications

### Phase 6 — Quality + Deployment

- Unit tests
- Integration tests
- Docker
- CI/CD
- Cloud deployment
- Crash reporting
- Application monitoring

---

# 👤 Patient Features

Patients should be able to:

- Register/login
- Complete profile
- Search doctors
- View doctor profiles
- View available appointment slots
- Book appointments
- Reschedule/cancel appointments
- View appointment history
- View medical records
- View prescriptions
- View diagnostic reports
- Upload permitted documents
- Search hospitals
- Check hospital availability
- Search blood banks
- Search medicines
- Place medicine orders
- Receive notifications
- Submit emergency requests

---

# 🩺 Doctor Features

Doctors should be able to:

- Create/manage professional profile
- Add specialization
- Add qualifications
- Set consultation fee
- Set consultation type
- Define availability
- View appointments
- Confirm/reject appointments
- Start consultation
- Add consultation notes
- Create prescriptions
- Access authorized patient records
- Revoke or lose access when authorization expires

---

# 📅 Appointment System

Appointment booking is one of the most important backend workflows.

## Status

```text
AVAILABLE
   ↓
BOOKED
   ↓
CONFIRMED
   ↓
IN_PROGRESS
   ↓
COMPLETED
```

Failure/cancellation states:

```text
CANCELLED
NO_SHOW
EXPIRED
```

## Booking Rules

The backend must prevent two patients from successfully booking the same doctor slot.

Use the simplest reliable strategy first:

1. Database transaction
2. Unique database constraint on doctor + slot
3. Service-layer validation
4. Meaningful `409 CONFLICT` response
5. Idempotency for retry-sensitive operations

Do **not** introduce a distributed lock until a real scaling requirement exists.

Example constraint concept:

```text
doctor_id + appointment_start_time = UNIQUE
```

The exact schema should also account for appointment date, slot type and cancellation behavior.

---

# 📋 Medical Records

Medical records contain sensitive information.

Initial record types:

- Medical history
- Allergy
- Diagnosis
- Prescription
- Lab report
- Consultation note
- Vaccination
- Uploaded document

## Access Rule

A provider can access a patient's protected medical record only when:

```text
Authenticated user
        ↓
Correct role
        ↓
Patient/provider relationship or consent
        ↓
Requested operation allowed
        ↓
Access granted
```

Every sensitive access should create an audit event.

---

# 🤝 Consent Management

Keep the first version simple.

Create a consent record with:

- patientId
- providerId
- scope
- grantedAt
- expiresAt (optional)
- revokedAt (optional)
- status

Example scopes:

```text
VIEW_MEDICAL_RECORD
VIEW_LAB_REPORT
VIEW_PRESCRIPTIONS
ADD_CONSULTATION_NOTE
```

Do not implement a complex policy engine for the MVP.

---

# 📎 File Uploads

Use Firebase Cloud Storage for files such as:

- Diagnostic reports
- Prescription documents
- Profile images
- Other permitted healthcare documents

Firebase Cloud Storage supports authenticated access through Security Rules. Keep access restricted; do not make medical files public. citeturn853231search13turn853231search16

Recommended flow:

```text
Android
   ↓
Request upload permission / backend authorization
   ↓
Upload document
   ↓
Store metadata in PostgreSQL
   ↓
Store file in Firebase Storage
```

PostgreSQL should contain document metadata, not large binary files in the MVP.

Example metadata:

```text
MedicalDocument
├── id
├── patientId
├── uploadedBy
├── fileName
├── contentType
├── storagePath
├── documentType
├── createdAt
└── status
```

---

# 🧪 Diagnostic Services

Patients can:

- Browse diagnostic centers
- Browse tests
- View prices
- Choose home collection or center visit
- Select slot
- Book a test
- Track booking status
- View reports

Status:

```text
BOOKED
   ↓
SAMPLE_COLLECTION
   ↓
PROCESSING
   ↓
REPORT_READY
   ↓
DELIVERED
```

Keep payment integration optional until this workflow works.

---

# 💊 Pharmacy

Patients can:

- Search medicines
- View medicine details
- Check stock
- Add items to cart
- Upload prescriptions where required
- Place an order
- Track order

Pharmacy users can:

- Manage products
- Manage stock
- Review prescriptions
- Process orders
- Update order status

## Order Status

```text
CREATED
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
PACKED
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

Failure states:

```text
PAYMENT_FAILED
CANCELLED
REFUNDED
```

For the student MVP, payment can initially be **simulated or handled as a clearly separated optional integration**. Do not block the entire project on payment-provider approval.

---

# 🏥 Hospital Module

Hospitals can manage:

- Profile
- Address
- Contact details
- Departments
- Emergency availability
- Bed inventory

Bed categories:

```text
GENERAL
ICU
EMERGENCY
SPECIALIZED
```

Bed states:

```text
AVAILABLE
OCCUPIED
RESERVED
MAINTENANCE
```

For the MVP, hospitals update availability manually through the provider dashboard.

Do not attempt to integrate with real hospital information systems in the first version.

---

# 🚑 Emergency Module

Emergency functionality must be simple and fast.

## MVP Flow

```text
Patient
   ↓
Emergency Button
   ↓
Get Current Location
   ↓
Create Emergency Request
   ↓
Find Nearby Hospitals
   ↓
Find Available Ambulances
   ↓
Show Contact / Dispatch Status
```

The first version should focus on:

- Location capture
- Emergency request creation
- Nearby hospital discovery
- Ambulance availability
- Request status
- Push notification

Real-time ambulance GPS tracking can be added later.

> This application is a software project and must not be represented as a certified emergency-dispatch system. Real-world emergency numbers/services should remain available as a fallback.

---

# 🩸 Blood Bank Module

Patients can search by:

- Blood group
- Location
- Availability
- Distance
- Operating status

Blood banks can manage:

- Blood group inventory
- Units available
- Operating hours
- Contact information

Use location coordinates for basic nearby search first.

Advanced geospatial search can be added later if needed.

---

# 🔔 Notifications

Use Firebase Cloud Messaging for mobile push notifications. FCM supports Android clients and server-side sending through trusted server environments. citeturn853231search15turn853231search17

Notification events can include:

```text
APPOINTMENT_BOOKED
APPOINTMENT_CONFIRMED
APPOINTMENT_CANCELLED
APPOINTMENT_REMINDER
PRESCRIPTION_CREATED
LAB_REPORT_READY
ORDER_CONFIRMED
ORDER_SHIPPED
EMERGENCY_REQUEST_CREATED
```

Initial implementation:

```text
Spring Boot
   ↓
NotificationService
   ↓
Firebase Admin SDK / FCM
   ↓
Android device
```

Store in-app notification metadata in PostgreSQL if an in-app notification history is required.

Do not add Kafka just to send the first notifications.

---

# 🌐 REST API Design

Prefix all application APIs with:

```text
/api/v1
```

## Authentication / User

```http
GET    /api/v1/users/me
PATCH  /api/v1/users/me
```

Firebase handles identity authentication; the backend exposes the application's authenticated user profile.

## Doctors

```http
GET    /api/v1/doctors
GET    /api/v1/doctors/{id}
GET    /api/v1/doctors/{id}/availability
PATCH  /api/v1/doctors/{id}
```

## Appointments

```http
POST   /api/v1/appointments
GET    /api/v1/appointments/{id}
GET    /api/v1/appointments/my
PATCH  /api/v1/appointments/{id}
DELETE /api/v1/appointments/{id}
```

## Medical Records

```http
GET    /api/v1/medical-records
GET    /api/v1/medical-records/{id}
POST   /api/v1/medical-records
```

## Diagnostics

```http
GET    /api/v1/diagnostics/centers
GET    /api/v1/diagnostics/tests
POST   /api/v1/diagnostics/bookings
GET    /api/v1/diagnostics/bookings/{id}
```

## Pharmacy

```http
GET    /api/v1/medicines
GET    /api/v1/medicines/{id}
POST   /api/v1/orders
GET    /api/v1/orders/{id}
GET    /api/v1/orders/my
```

## Hospitals

```http
GET    /api/v1/hospitals
GET    /api/v1/hospitals/{id}
GET    /api/v1/hospitals/{id}/beds
```

## Blood Banks

```http
GET    /api/v1/blood-banks
GET    /api/v1/blood-banks/{id}
```

## Emergency

```http
POST   /api/v1/emergency/requests
GET    /api/v1/emergency/requests/{id}
GET    /api/v1/emergency/hospitals/nearby
GET    /api/v1/emergency/ambulances/nearby
```

---

# 📦 Standard API Response

## Success

```json
{
  "success": true,
  "data": {},
  "message": "Request processed successfully",
  "timestamp": "2026-09-07T00:00:00Z"
}
```

## Error

```json
{
  "success": false,
  "error": {
    "code": "APPOINTMENT_SLOT_UNAVAILABLE",
    "message": "The selected appointment slot is no longer available."
  },
  "timestamp": "2026-09-07T00:00:00Z"
}
```

Recommended HTTP status codes:

```text
200 OK
201 CREATED
204 NO CONTENT
400 BAD REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT FOUND
409 CONFLICT
422 UNPROCESSABLE ENTITY
500 INTERNAL SERVER ERROR
```

---

# 🗄️ Database Design

Use PostgreSQL with JPA/Hibernate.

## Core Tables

```text
users
patients
doctors
doctor_availability
appointments
medical_records
consents
prescriptions
prescription_items
diagnostic_centers
diagnostic_tests
diagnostic_bookings
medical_documents
hospitals
departments
beds
pharmacies
medicines
medicine_orders
medicine_order_items
ambulances
emergency_requests
blood_banks
blood_inventory
notifications
audit_logs
```

## Important Relationships

```text
User 1 ───── 1 Patient
User 1 ───── 1 Doctor

Patient 1 ───── N Appointment
Doctor  1 ───── N Appointment

Doctor  1 ───── N Availability
Patient 1 ───── N MedicalRecord
Patient 1 ───── N Prescription
Patient 1 ───── N DiagnosticBooking
Patient 1 ───── N MedicineOrder

Hospital 1 ───── N Department
Department 1 ─── N Bed

Pharmacy 1 ───── N Medicine
MedicineOrder 1 ─ N MedicineOrderItem

BloodBank 1 ──── N BloodInventory
```

Keep entities focused. Avoid one giant `User` table with dozens of optional provider fields.

---

# 🛡️ Security

Security requirements for the MVP:

- HTTPS in deployed environments
- Firebase Authentication for identity
- Spring Security for backend authorization
- Role-based access control
- Resource ownership checks
- Consent checks for protected records
- Bean Validation
- Parameterized JPA queries
- Secure HTTP headers
- No secrets committed to Git
- Sensitive information excluded from logs
- Audit logs for protected medical-record access
- Restricted Firebase Storage rules

Firebase Storage rules should not be opened publicly for medical documents; Firebase documents that authenticated user identity can be used in Storage Security Rules for access control. citeturn853231search16

---

# 📝 Audit Logging

Create a simple `audit_logs` table.

Example fields:

```text
id
actor_user_id
action
resource_type
resource_id
ip_address
created_at
```

Example events:

```text
MEDICAL_RECORD_VIEWED
MEDICAL_RECORD_CREATED
CONSENT_GRANTED
CONSENT_REVOKED
PRESCRIPTION_CREATED
APPOINTMENT_BOOKED
APPOINTMENT_CANCELLED
EMERGENCY_REQUEST_CREATED
```

Do not store passwords, tokens or sensitive medical content inside audit entries.

---

# ⚡ Caching Strategy

Do not install Redis on day one.

First release:

- PostgreSQL indexes
- Pagination
- Reasonable query design

Later, Redis can cache:

- Doctor availability
- Hospital metadata
- Blood-bank summaries
- Frequently requested doctor profiles

Use short TTLs for changing availability data.

---

# 🔄 Asynchronous Processing

Initial release:

```text
Spring Boot
   ↓
@Service
   ↓
Notification / background task
```

Later, when there is a real need for distributed event processing:

```text
Spring Boot
   ↓
Kafka / RabbitMQ
   ↓
Notification / Analytics / Other consumers
```

Do not introduce Kafka before the core transaction flows are stable.

---

# ♻️ Idempotency

Use idempotency only for operations where retries could create duplicates.

High-priority examples:

```text
POST /api/v1/appointments
POST /api/v1/orders
POST /api/v1/emergency/requests
```

Example:

```http
Idempotency-Key: 7e5b9c1d-...
```

The first implementation can use a PostgreSQL table such as:

```text
idempotency_records
├── key
├── user_id
├── request_hash
├── response_body
├── response_status
└── created_at
```

Do not build a distributed idempotency service for the MVP.

---

# 📍 Location

Location is needed for:

- Nearby doctors
- Nearby hospitals
- Nearby ambulances
- Nearby blood banks

For the first version:

- Store latitude/longitude
- Use the Android location API
- Pass coordinates to Spring Boot
- Use PostgreSQL queries for simple distance filtering

Advanced GIS/geospatial search can be introduced later if the dataset grows.

---

# 📱 Android Application Structure

```text
app/
└── src/main/java/com/healthcare/app/
    ├── core/
    │   ├── network/
    │   ├── auth/
    │   ├── common/
    │   └── navigation/
    │
    ├── feature/
    │   ├── home/
    │   ├── doctor/
    │   ├── appointment/
    │   ├── medicalrecord/
    │   ├── diagnostic/
    │   ├── pharmacy/
    │   ├── hospital/
    │   ├── bloodbank/
    │   ├── emergency/
    │   ├── notification/
    │   └── profile/
    │
    └── MainActivity.kt
```

Each feature should preferably contain:

```text
ui/
viewmodel/
repository/
data/
```

Use ViewModels and repositories rather than putting network calls directly inside Compose screens.

---

# 🖥️ Main Android Screens

```text
Splash
  ↓
Login / Register
  ↓
Home
  ├── Doctors
  ├── Appointments
  ├── Medical Records
  ├── Prescriptions
  ├── Diagnostics
  ├── Pharmacy
  ├── Hospitals
  ├── Blood Banks
  ├── Emergency
  ├── Notifications
  └── Profile
```

Emergency access should remain easy to reach from the main patient experience.

---

# 🧪 Testing Strategy

## Backend Unit Tests

Use:

- JUnit 5
- Mockito

Test:

- Appointment rules
- Availability rules
- Authorization logic
- Consent checks
- Order status transitions
- Validation

## Integration Tests

Use:

- Spring Boot Test
- Testcontainers PostgreSQL

Important integration tests:

```text
Registration/profile creation
Doctor search
Appointment booking
Double-booking prevention
Medical-record authorization
Consent enforcement
Diagnostic booking
Order creation
Emergency request
```

## API Testing

Use:

- Postman
- Swagger UI

Start with Postman collections for the main workflows.

## Android Testing

Use:

- JUnit
- Compose UI tests where practical
- Firebase Crashlytics for runtime crash visibility

---

# 🐳 Docker

For local development, keep Docker simple:

```text
Docker Compose
├── postgres
└── healthcare-backend
```

Add Redis later if required.

Do not require Kubernetes for local development.

---

# 🚀 Deployment

## Development

```text
Android Emulator
      ↓
Spring Boot localhost
      ↓
PostgreSQL local/container
      ↓
Firebase project
```

## Production / Demo

```text
Android App
      ↓
HTTPS
      ↓
Spring Boot API
      ↓
Managed PostgreSQL
      ↓
Firebase Services
```

Use environment variables or a secrets manager for:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
FIREBASE_CREDENTIALS
GOOGLE_MAPS_KEY
```

Never commit secrets to Git.

---

# 📊 Observability

For the first deployment use:

- Spring Boot Actuator
- Application logs
- Firebase Crashlytics for Android crashes
- Basic health endpoint

Important endpoints:

```text
/actuator/health
/actuator/info
```

Later, add:

- OpenTelemetry
- Prometheus
- Grafana
- Centralized logging

Do not make observability infrastructure a blocker for the MVP.

---

# 📚 Project Documentation

Keep documentation small and useful:

```text
docs/
├── architecture.md
├── database-schema.md
├── api-specification.md
├── authentication.md
├── authorization.md
├── firebase.md
├── deployment.md
└── testing.md
```

Swagger/OpenAPI should document the REST APIs.

---

# 🗺️ Development Roadmap

## Phase 0 — Project Setup

- [ ] Create Git repository
- [ ] Create Spring Boot backend
- [ ] Create Android app
- [ ] Create Firebase project
- [ ] Create PostgreSQL database
- [ ] Configure environments

## Phase 1 — Backend Foundation

- [ ] Spring Security integration
- [ ] Firebase ID-token verification
- [ ] User profile
- [ ] Roles
- [ ] Global exception handling
- [ ] Validation
- [ ] Standard responses
- [ ] Flyway migrations
- [ ] Swagger
- [ ] Audit foundation

## Phase 2 — Patient + Doctor

- [ ] Patient profile
- [ ] Doctor profile
- [ ] Doctor search
- [ ] Doctor availability
- [ ] Appointment creation
- [ ] Appointment cancellation
- [ ] Appointment rescheduling
- [ ] Double-booking protection

## Phase 3 — Medical Records

- [ ] Medical history
- [ ] Allergies
- [ ] Prescriptions
- [ ] Reports
- [ ] Firebase Storage integration
- [ ] Consent management
- [ ] Protected record access
- [ ] Audit logs

## Phase 4 — Healthcare Services

- [ ] Diagnostics
- [ ] Diagnostic booking
- [ ] Hospitals
- [ ] Bed availability
- [ ] Blood banks
- [ ] Pharmacy
- [ ] Medicine orders

## Phase 5 — Emergency + Notifications

- [ ] Android location permission
- [ ] Emergency request
- [ ] Nearby hospital search
- [ ] Ambulance availability
- [ ] FCM notifications
- [ ] Notification history

## Phase 6 — Android Completion

- [ ] Patient dashboard
- [ ] Doctor screens
- [ ] Appointment screens
- [ ] Medical-record screens
- [ ] Pharmacy screens
- [ ] Emergency screens
- [ ] Loading/error/empty states
- [ ] Navigation polish

## Phase 7 — Quality

- [ ] Unit tests
- [ ] Integration tests
- [ ] API test collection
- [ ] Security review
- [ ] Error handling review
- [ ] Database index review
- [ ] Crash reporting

## Phase 8 — Deployment

- [ ] Dockerize backend
- [ ] Deploy PostgreSQL
- [ ] Deploy Spring Boot
- [ ] Configure Firebase production settings
- [ ] Configure HTTPS
- [ ] Production environment variables
- [ ] Final smoke testing

## Phase 9 — Optional Advanced Features

Only after all previous phases are stable:

- [ ] Redis
- [ ] WebSockets
- [ ] Kafka/RabbitMQ
- [ ] Advanced geospatial search
- [ ] Search engine
- [ ] Online video consultation
- [ ] Real payment gateway
- [ ] Advanced monitoring
- [ ] Kubernetes

---

# 🧠 Engineering Principles

Follow these principles throughout the project:

- Keep the architecture simple until complexity is justified
- Prefer modular monolith over premature microservices
- Keep business logic in services/domain code
- Validate input at API boundaries
- Enforce authorization on the backend
- Use database constraints for data integrity
- Use transactions for critical workflows
- Use indexes for frequently queried fields
- Never log secrets or sensitive medical data
- Prefer explicit, understandable code over clever abstractions
- Keep third-party integrations behind service interfaces
- Keep Firebase concerns separate from healthcare business logic

---

# ⚠️ Important Project Boundaries

This is an academic/software engineering project, not a certified medical system.

The application must not claim to:

- Diagnose disease autonomously
- Replace a qualified medical professional
- Guarantee emergency response times
- Guarantee real hospital/ambulance availability without verified data sources

Any future AI features should be advisory and clearly separated from clinical decision-making.

---

# ✅ Definition of Done

A feature is considered complete when:

- [ ] Database schema exists
- [ ] API contract exists
- [ ] Validation exists
- [ ] Authorization exists
- [ ] Service-layer logic is implemented
- [ ] Error handling exists
- [ ] Unit tests exist where applicable
- [ ] Integration tests exist for critical workflows
- [ ] Swagger documentation exists
- [ ] Android UI is connected to the API
- [ ] Loading and error states work
- [ ] Sensitive information is protected
- [ ] Audit logging is added when required

---

# 🏁 Recommended First Milestone

Do **not** start by implementing every feature.

The first end-to-end milestone should be:

```text
Android App
   ↓
Firebase Login
   ↓
Spring Boot verifies Firebase token
   ↓
PostgreSQL user profile
   ↓
Role-based access
   ↓
Patient dashboard
```

Then build the first complete business workflow:

```text
Patient
   ↓
Search Doctor
   ↓
View Availability
   ↓
Select Slot
   ↓
Book Appointment
   ↓
PostgreSQL Transaction
   ↓
Appointment Confirmed
   ↓
Firebase Push Notification
```

Once this workflow works end-to-end, continue to medical records, diagnostics, pharmacy, hospitals, blood banks and emergency services.

---

# 🎓 Final-Year Project Value

This architecture demonstrates practical knowledge of:

```text
Java
Spring Boot
Spring Security
REST APIs
PostgreSQL
JPA / Hibernate
Firebase
Android Development
Authentication
RBAC
Transactions
Concurrency
File Storage
Push Notifications
API Testing
Docker
CI/CD
Cloud Deployment
Software Architecture
```

The goal is not to build the largest possible architecture.

The goal is to build a **working, secure, understandable and demonstrable healthcare application** first, then add advanced distributed-system capabilities only when the core product is stable.
