import Foundation

public final class APIService {
    public static let shared = APIService()

    public var baseURL: String = "http://localhost:8080"
    public var authToken: String? = nil
    public var isDemoMode: Bool = true

    private init() {}

    // MARK: - Generic Networking Helper

    public func execute<T: Codable>(
        path: String,
        method: String = "GET",
        body: Data? = nil,
        headers: [String: String] = [:],
        fallback: () throws -> T
    ) async throws -> T {
        // In demo mode, bypass network and return fallback
        if isDemoMode {
            return try fallback()
        }

        guard let url = URL(string: baseURL.trimmingCharacters(in: CharacterSet(charactersIn: "/")) + path) else {
            return try fallback()
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = 10.0
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token = authToken, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        for (k, v) in headers {
            request.setValue(v, forHTTPHeaderField: k)
        }

        request.httpBody = body

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            if let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) {
                // Try decoding direct object or ApiResponse envelope
                let decoder = JSONDecoder()
                if let direct = try? decoder.decode(T.self, from: data) {
                    return direct
                }
                if let envelope = try? decoder.decode(ApiResponse<T>.self, from: data), let val = envelope.data {
                    return val
                }
            }
            // If server returned non-200 or decode failed, fallback
            return try fallback()
        } catch {
            return try fallback()
        }
    }

    // MARK: - Auth & User Endpoints

    public func login(credentials: LoginRequest) async throws -> AuthResponse {
        let body = try? JSONEncoder().encode(credentials)
        return try await execute(path: "/api/v1/auth/login", method: "POST", body: body) {
            AuthResponse(
                accessToken: "jwt-demo-sarah-jenkins",
                refreshToken: "rt-demo-sarah-jenkins",
                expiresIn: 3600,
                user: MockData.patientSarah
            )
        }
    }

    public func register(payload: RegisterRequest) async throws -> AuthResponse {
        let body = try? JSONEncoder().encode(payload)
        return try await execute(path: "/api/v1/auth/register", method: "POST", body: body) {
            let newUser = User(
                id: "usr-\(UUID().uuidString.prefix(8))",
                fullName: payload.fullName,
                email: payload.email,
                phoneNumber: payload.phoneNumber,
                dateOfBirth: payload.dateOfBirth,
                gender: payload.gender,
                role: payload.role
            )
            return AuthResponse(
                accessToken: "jwt-registered-\(UUID().uuidString)",
                refreshToken: "rt-registered-\(UUID().uuidString)",
                expiresIn: 3600,
                user: newUser
            )
        }
    }

    public func getCurrentUser() async throws -> User {
        return try await execute(path: "/api/v1/users/me") {
            MockData.patientSarah
        }
    }

    public func updateCurrentUser(updates: User) async throws -> User {
        let body = try? JSONEncoder().encode(updates)
        return try await execute(path: "/api/v1/users/me", method: "PATCH", body: body) {
            updates
        }
    }

    // MARK: - Doctors & Appointments

    public func getDoctors(specialization: String? = nil, search: String? = nil) async throws -> [Doctor] {
        var queryItems: [String] = []
        if let s = specialization, s != "All" { queryItems.append("specialization=\(s.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? s)") }
        if let q = search, !q.isEmpty { queryItems.append("search=\(q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? q)") }
        let queryString = queryItems.isEmpty ? "" : "?" + queryItems.joined(separator: "&")

        return try await execute(path: "/api/v1/doctors\(queryString)") {
            var list = MockData.doctors
            if let s = specialization, s != "All" {
                list = list.filter { $0.specialization.localizedCaseInsensitiveContains(s) }
            }
            if let q = search, !q.isEmpty {
                list = list.filter { $0.name.localizedCaseInsensitiveContains(q) || $0.specialization.localizedCaseInsensitiveContains(q) }
            }
            return list
        }
    }

    public func getDoctorById(id: String) async throws -> Doctor {
        return try await execute(path: "/api/v1/doctors/\(id)") {
            MockData.doctors.first(where: { $0.id == id }) ?? MockData.doctors[0]
        }
    }

    public func getAppointments(status: String? = nil) async throws -> [Appointment] {
        let query = (status != nil && status != "ALL") ? "?status=\(status!)" : ""
        return try await execute(path: "/api/v1/appointments\(query)") {
            if let st = status, st != "ALL", let appStatus = AppointmentStatus(rawValue: st) {
                return MockData.appointments.filter { $0.status == appStatus }
            }
            return MockData.appointments
        }
    }

    public func createAppointment(req: CreateAppointmentRequest) async throws -> Appointment {
        let body = try? JSONEncoder().encode(req)
        return try await execute(path: "/api/v1/appointments", method: "POST", body: body) {
            let doc = MockData.doctors.first(where: { $0.id == req.doctorId }) ?? MockData.doctors[0]
            return Appointment(
                id: "apt-\(UUID().uuidString.prefix(8))",
                doctorId: doc.id,
                doctorName: doc.name,
                doctorSpecialization: doc.specialization,
                doctorPhotoUrl: doc.photoUrl,
                hospitalName: doc.hospitalAffiliation,
                patientId: MockData.patientSarah.id,
                patientName: MockData.patientSarah.fullName,
                appointmentDate: req.slotDate,
                appointmentTime: req.slotTime,
                consultationType: req.consultationType,
                consultationFee: doc.consultationFee,
                status: .confirmed,
                reasonForVisit: req.reasonForVisit,
                meetingLink: req.consultationType == .video ? "https://telehealth.healthconnect.io/v/meet-\(Int.random(in: 100000...999999))" : nil,
                roomNumber: req.consultationType == .inPerson ? "Room 204, East Wing" : nil
            )
        }
    }

    public func rescheduleAppointment(id: String, slotDate: String, slotTime: String) async throws -> Appointment {
        struct ReschedulePayload: Codable {
            let slotDate: String
            let slotTime: String
        }
        let body = try? JSONEncoder().encode(ReschedulePayload(slotDate: slotDate, slotTime: slotTime))
        return try await execute(path: "/api/v1/appointments/\(id)", method: "PATCH", body: body) {
            var apt = MockData.appointments.first(where: { $0.id == id }) ?? MockData.appointments[0]
            apt.appointmentDate = slotDate
            apt.appointmentTime = slotTime
            apt.status = .confirmed
            return apt
        }
    }

    public func cancelAppointment(id: String, reason: String) async throws -> Appointment {
        struct CancelPayload: Codable {
            let reason: String
        }
        let body = try? JSONEncoder().encode(CancelPayload(reason: reason))
        return try await execute(path: "/api/v1/appointments/\(id)", method: "DELETE", body: body) {
            var apt = MockData.appointments.first(where: { $0.id == id }) ?? MockData.appointments[0]
            apt.status = .cancelled
            apt.notes = "Cancelled: \(reason)"
            return apt
        }
    }

    // MARK: - Diagnostics

    public func getDiagnosticCenters(search: String? = nil) async throws -> [DiagnosticCenter] {
        let q = search?.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let path = q.isEmpty ? "/api/v1/diagnostics/centers" : "/api/v1/diagnostics/centers?search=\(q)"
        return try await execute(path: path) {
            if let search = search, !search.isEmpty {
                return MockData.diagnosticCenters.filter { $0.name.localizedCaseInsensitiveContains(search) }
            }
            return MockData.diagnosticCenters
        }
    }

    public func getDiagnosticTests(category: String? = nil, query: String? = nil) async throws -> [DiagnosticTest] {
        var queryItems: [String] = []
        if let cat = category, cat != "ALL" { queryItems.append("category=\(cat.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? cat)") }
        if let q = query, !q.isEmpty { queryItems.append("query=\(q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? q)") }
        let queryString = queryItems.isEmpty ? "" : "?" + queryItems.joined(separator: "&")

        return try await execute(path: "/api/v1/diagnostics/tests\(queryString)") {
            var list = MockData.diagnosticTests
            if let cat = category, cat != "ALL" {
                list = list.filter { $0.category.localizedCaseInsensitiveContains(cat) }
            }
            if let q = query, !q.isEmpty {
                list = list.filter { $0.name.localizedCaseInsensitiveContains(q) || $0.description.localizedCaseInsensitiveContains(q) }
            }
            return list
        }
    }

    public func getDiagnosticBookings() async throws -> [DiagnosticBooking] {
        return try await execute(path: "/api/v1/diagnostics/bookings") {
            MockData.diagnosticBookings
        }
    }

    public func createDiagnosticBooking(req: DiagnosticBookingRequest) async throws -> DiagnosticBooking {
        let body = try? JSONEncoder().encode(req)
        return try await execute(path: "/api/v1/diagnostics/bookings", method: "POST", body: body) {
            let center = MockData.diagnosticCenters.first(where: { $0.id == req.centerId }) ?? MockData.diagnosticCenters[0]
            let test = MockData.diagnosticTests.first(where: { $0.id == req.testId }) ?? MockData.diagnosticTests[0]
            return DiagnosticBooking(
                id: "diag-b-\(UUID().uuidString.prefix(8))",
                bookingRef: "DB-2026-\(Int.random(in: 1000...9999))",
                centerId: center.id,
                centerName: center.name,
                testId: test.id,
                testName: test.name,
                collectionType: req.collectionType,
                scheduledDate: req.scheduledDate,
                scheduledTime: req.scheduledTime,
                status: "BOOKED",
                price: test.discountedPrice ?? test.price,
                patientAddress: req.patientAddress
            )
        }
    }

    public func cancelDiagnosticBooking(id: String) async throws -> DiagnosticBooking {
        return try await execute(path: "/api/v1/diagnostics/bookings/\(id)/cancel", method: "POST") {
            var b = MockData.diagnosticBookings.first(where: { $0.id == id }) ?? MockData.diagnosticBookings[0]
            b.status = "CANCELLED"
            return b
        }
    }

    // MARK: - Pharmacy

    public func getMedicines(category: String? = nil, query: String? = nil) async throws -> [Medicine] {
        var queryItems: [String] = []
        if let cat = category, cat != "ALL" { queryItems.append("category=\(cat)") }
        if let q = query, !q.isEmpty { queryItems.append("query=\(q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? q)") }
        let queryString = queryItems.isEmpty ? "" : "?" + queryItems.joined(separator: "&")

        return try await execute(path: "/api/v1/pharmacy/medicines\(queryString)") {
            var list = MockData.medicines
            if let cat = category, cat != "ALL" {
                list = list.filter { $0.category.rawValue.localizedCaseInsensitiveContains(cat) }
            }
            if let q = query, !q.isEmpty {
                list = list.filter { $0.name.localizedCaseInsensitiveContains(q) || $0.genericName.localizedCaseInsensitiveContains(q) }
            }
            return list
        }
    }

    public func getPharmacyOrders() async throws -> [PharmacyOrder] {
        return try await execute(path: "/api/v1/pharmacy/orders") {
            MockData.pharmacyOrders
        }
    }

    public func createPharmacyOrder(items: [CartItem], deliveryAddress: String, paymentMethod: String, prescriptionRecordId: String?) async throws -> PharmacyOrder {
        struct OrderPayload: Codable {
            let items: [CartItem]
            let deliveryAddress: String
            let paymentMethod: String
            let prescriptionRecordId: String?
        }
        let payload = OrderPayload(items: items, deliveryAddress: deliveryAddress, paymentMethod: paymentMethod, prescriptionRecordId: prescriptionRecordId)
        let body = try? JSONEncoder().encode(payload)

        return try await execute(path: "/api/v1/pharmacy/orders", method: "POST", body: body) {
            let subtotal = items.reduce(0.0) { $0 + ($1.medicine.discountPrice ?? $1.medicine.price) * Double($1.quantity) }
            let deliveryFee = 5.0
            return PharmacyOrder(
                id: "ord-\(UUID().uuidString.prefix(8))",
                orderNumber: "HC-ORD-2026-\(Int.random(in: 1000...9999))",
                patientId: MockData.patientSarah.id,
                items: items,
                totalAmount: subtotal,
                discountAmount: 0,
                deliveryFee: deliveryFee,
                finalAmount: subtotal + deliveryFee,
                deliveryAddress: deliveryAddress,
                prescriptionUploaded: prescriptionRecordId != nil,
                prescriptionRecordId: prescriptionRecordId,
                status: "CONFIRMED",
                paymentMethod: paymentMethod,
                timeline: [
                    OrderTimelineStep(status: "CREATED", timestamp: ISO8601DateFormatter().string(from: Date()), description: "Order confirmed")
                ]
            )
        }
    }

    public func cancelPharmacyOrder(id: String) async throws -> PharmacyOrder {
        return try await execute(path: "/api/v1/pharmacy/orders/\(id)/cancel", method: "POST") {
            var order = MockData.pharmacyOrders.first(where: { $0.id == id }) ?? MockData.pharmacyOrders[0]
            order.status = "CANCELLED"
            order.timeline.append(OrderTimelineStep(status: "CANCELLED", timestamp: ISO8601DateFormatter().string(from: Date()), description: "Order cancelled by patient"))
            return order
        }
    }

    // MARK: - Medical Records & Prescriptions

    public func getMedicalRecords(type: String? = nil) async throws -> [MedicalRecord] {
        let query = (type != nil && type != "ALL") ? "?type=\(type!)" : ""
        return try await execute(path: "/api/v1/medical-records\(query)") {
            if let t = type, t != "ALL", let rt = RecordType(rawValue: t) {
                return MockData.medicalRecords.filter { $0.recordType == rt }
            }
            return MockData.medicalRecords
        }
    }

    public func uploadMedicalRecord(record: MedicalRecord) async throws -> MedicalRecord {
        let body = try? JSONEncoder().encode(record)
        return try await execute(path: "/api/v1/medical-records", method: "POST", body: body) {
            record
        }
    }

    public func setRecordArchived(id: String, archive: Bool) async throws -> MedicalRecord {
        let action = archive ? "archive" : "restore"
        return try await execute(path: "/api/v1/medical-records/\(id)/\(action)", method: "POST") {
            var rec = MockData.medicalRecords.first(where: { $0.id == id }) ?? MockData.medicalRecords[0]
            rec.status = archive ? .archived : .verified
            return rec
        }
    }

    public func getPrescriptions(status: String? = nil) async throws -> [Prescription] {
        let query = (status != nil && status != "ALL") ? "?status=\(status!)" : ""
        return try await execute(path: "/api/v1/prescriptions\(query)") {
            if let st = status, st != "ALL" {
                return MockData.prescriptions.filter { $0.status == st }
            }
            return MockData.prescriptions
        }
    }

    public func getProviderConsents() async throws -> [ProviderConsent] {
        return try await execute(path: "/api/v1/medical-records/consents") {
            MockData.providerConsents
        }
    }

    public func revokeProviderConsent(id: String) async throws -> ProviderConsent {
        return try await execute(path: "/api/v1/medical-records/consents/\(id)/revoke", method: "POST") {
            var consent = MockData.providerConsents.first(where: { $0.id == id }) ?? MockData.providerConsents[0]
            consent.status = "REVOKED"
            return consent
        }
    }

    // MARK: - Emergency / SOS

    public func triggerSOS(input: SosInput) async throws -> EmergencyRequest {
        let body = try? JSONEncoder().encode(input)
        return try await execute(
            path: "/api/v1/emergency/sos",
            method: "POST",
            body: body,
            headers: ["Idempotency-Key": input.clientRequestId]
        ) {
            EmergencyRequest(
                id: "emg-\(UUID().uuidString.prefix(8))",
                clientRequestId: input.clientRequestId,
                patientId: MockData.patientSarah.id,
                patientName: MockData.patientSarah.fullName,
                patientPhone: MockData.patientSarah.phoneNumber,
                emergencyType: input.emergencyType,
                latitude: input.latitude ?? 37.7749,
                longitude: input.longitude ?? -122.4194,
                locationSource: input.locationSource,
                accuracyMeters: input.accuracyMeters ?? 12,
                locationCapturedAt: input.locationCapturedAt,
                address: input.address,
                status: "DISPATCHED",
                etaMinutes: 6,
                ambulance: AmbulanceInfo(
                    vehicleNumber: "MEDIC-42",
                    paramedicName: "Alex Vance, EMT-P",
                    paramedicContact: "+1 (555) 911-0420",
                    currentSpeedKmh: 58,
                    assignedHospital: "Central Metro Super Specialty Hospital"
                ),
                nearbyHospitals: [
                    EmergencyHospital(id: "hosp-001", name: "Central Metro Hospital", distanceKm: 1.8, emergencyBeds: 8, icuBeds: 6, phone: "+1 (555) 911-0001"),
                    EmergencyHospital(id: "hosp-002", name: "St. Jude University Hospital", distanceKm: 3.5, emergencyBeds: 5, icuBeds: 4, phone: "+1 (555) 911-0002")
                ]
            )
        }
    }

    public func getActiveEmergency() async throws -> EmergencyRequest? {
        return try await execute(path: "/api/v1/emergency/active") {
            nil
        }
    }

    public func getEmergencyHistory() async throws -> [EmergencyRequest] {
        return try await execute(path: "/api/v1/emergency/history") {
            [
                EmergencyRequest(
                    id: "emg-past-01",
                    patientId: MockData.patientSarah.id,
                    patientName: MockData.patientSarah.fullName,
                    patientPhone: MockData.patientSarah.phoneNumber,
                    emergencyType: "Severe Asthma Flare",
                    address: "742 Evergreen Terrace, Metro City",
                    status: "RESOLVED",
                    etaMinutes: 0,
                    createdAt: "2026-08-10T14:30:00Z"
                )
            ]
        }
    }

    public func cancelEmergency(id: String, reason: String) async throws -> EmergencyRequest {
        struct CancelPayload: Codable {
            let reason: String
        }
        let body = try? JSONEncoder().encode(CancelPayload(reason: reason))
        return try await execute(path: "/api/v1/emergency/\(id)/cancel", method: "POST", body: body) {
            EmergencyRequest(
                id: id,
                patientId: MockData.patientSarah.id,
                patientName: MockData.patientSarah.fullName,
                patientPhone: MockData.patientSarah.phoneNumber,
                emergencyType: "Medical Emergency",
                cancelledAt: ISO8601DateFormatter().string(from: Date()),
                cancellationReason: reason,
                address: "742 Evergreen Terrace",
                status: "CANCELLED"
            )
        }
    }

    // MARK: - Notifications

    public func getNotifications() async throws -> [AppNotification] {
        return try await execute(path: "/api/v1/notifications") {
            MockData.notifications
        }
    }

    public func markNotificationRead(id: String) async throws -> AppNotification {
        return try await execute(path: "/api/v1/notifications/\(id)/read", method: "PATCH") {
            var n = MockData.notifications.first(where: { $0.id == id }) ?? MockData.notifications[0]
            n.read = true
            return n
        }
    }

    public func markAllNotificationsRead() async throws -> [AppNotification] {
        return try await execute(path: "/api/v1/notifications/mark-all-read", method: "POST") {
            MockData.notifications.map {
                var item = $0
                item.read = true
                return item
            }
        }
    }

    // MARK: - Hospitals & Blood Banks

    public func getHospitals(specialization: String? = nil, emergencyOnly: Bool = false, icuOnly: Bool = false, search: String? = nil) async throws -> [Hospital] {
        var queryItems: [String] = []
        if let s = specialization, s != "ALL" { queryItems.append("specialization=\(s)") }
        if emergencyOnly { queryItems.append("emergencyOnly=true") }
        if icuOnly { queryItems.append("icuOnly=true") }
        if let q = search, !q.isEmpty { queryItems.append("search=\(q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? q)") }
        let queryString = queryItems.isEmpty ? "" : "?" + queryItems.joined(separator: "&")

        return try await execute(path: "/api/v1/hospitals\(queryString)") {
            var list = MockData.hospitals
            if emergencyOnly { list = list.filter { $0.hasEmergency } }
            if icuOnly { list = list.filter { $0.bedAvailability.icuAvailable > 0 } }
            if let q = search, !q.isEmpty {
                list = list.filter { $0.name.localizedCaseInsensitiveContains(q) || $0.address.localizedCaseInsensitiveContains(q) }
            }
            return list
        }
    }

    public func getBloodBanks(bloodGroup: String? = nil, openOnly: Bool = false, search: String? = nil) async throws -> [BloodBank] {
        var queryItems: [String] = []
        if let bg = bloodGroup, bg != "ALL" { queryItems.append("bloodGroup=\(bg)") }
        if openOnly { queryItems.append("openOnly=true") }
        if let q = search, !q.isEmpty { queryItems.append("searchQuery=\(q.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? q)") }
        let queryString = queryItems.isEmpty ? "" : "?" + queryItems.joined(separator: "&")

        return try await execute(path: "/api/v1/blood-banks\(queryString)") {
            var list = MockData.bloodBanks
            if openOnly { list = list.filter { $0.isOpen24x7 } }
            if let bg = bloodGroup, bg != "ALL" {
                list = list.filter { bank in
                    bank.inventory.contains { $0.bloodGroup == bg && $0.unitsAvailable > 0 }
                }
            }
            if let q = search, !q.isEmpty {
                list = list.filter { $0.name.localizedCaseInsensitiveContains(q) || $0.address.localizedCaseInsensitiveContains(q) }
            }
            return list
        }
    }

    // MARK: - Insurance

    public func getInsurancePolicies() async throws -> [InsurancePolicy] {
        return try await execute(path: "/api/v1/insurance/policies") {
            [MockData.insurancePolicy]
        }
    }

    public func getInsuranceClaims() async throws -> [InsuranceClaim] {
        return try await execute(path: "/api/v1/insurance/claims") {
            MockData.insuranceClaims
        }
    }

    public func submitInsuranceClaim(claim: InsuranceClaim) async throws -> InsuranceClaim {
        let body = try? JSONEncoder().encode(claim)
        return try await execute(path: "/api/v1/insurance/claims", method: "POST", body: body) {
            claim
        }
    }

    // MARK: - NFC & Consents

    public func getNfcCredentials() async throws -> [NfcCredential] {
        return try await execute(path: "/api/v1/nfc/credentials/me") {
            [MockData.nfcCredential]
        }
    }

    public func provisionNfcCredential() async throws -> NfcCredential {
        return try await execute(path: "/api/v1/nfc/credentials", method: "POST") {
            NfcCredential(
                id: "HCNFC1:\(UUID().uuidString.prefix(16))",
                status: "ACTIVE",
                issuedAt: ISO8601DateFormatter().string(from: Date())
            )
        }
    }

    public func revokeNfcCredential(id: String) async throws -> Void {
        let _: String = try await execute(path: "/api/v1/nfc/credentials/\(id)", method: "DELETE") {
            "revoked"
        }
    }

    public func getConsents() async throws -> [Consent] {
        return try await execute(path: "/api/v1/consents") {
            [
                Consent(
                    id: "c-1",
                    provider: "Dr. Evelyn Reed",
                    facility: "Central Metro Hospital",
                    scopes: ["Medical Summary", "Prescriptions", "Diagnostic Reports"],
                    dateGranted: "2026-09-01",
                    expiry: "2027-09-01",
                    status: "ACTIVE"
                ),
                Consent(
                    id: "c-2",
                    provider: "Emergency Access",
                    facility: "Metro Emergency Dispatch Services",
                    scopes: ["Critical Allergies", "Blood Group", "Current Medications", "Emergency Contacts"],
                    dateGranted: "2026-08-15",
                    expiry: "Permanent",
                    status: "ACTIVE"
                )
            ]
        }
    }
}
