import Foundation
import SwiftUI
import Combine

@MainActor
public final class AppState: ObservableObject {
    // MARK: - User & Session
    @Published public var currentUser: User = MockData.patientSarah
    @Published public var selectedPersona: String = "Sarah Jenkins (Patient)"
    @Published public var isDemoMode: Bool = true {
        didSet {
            APIService.shared.isDemoMode = isDemoMode
        }
    }
    @Published public var apiBaseURL: String = "http://localhost:8080" {
        didSet {
            APIService.shared.baseURL = apiBaseURL
        }
    }
    @Published public var backendStatusText: String = "Offline Demo Mode"

    // MARK: - Domain Data
    @Published public var doctors: [Doctor] = MockData.doctors
    @Published public var appointments: [Appointment] = MockData.appointments
    @Published public var diagnosticCenters: [DiagnosticCenter] = MockData.diagnosticCenters
    @Published public var diagnosticTests: [DiagnosticTest] = MockData.diagnosticTests
    @Published public var diagnosticBookings: [DiagnosticBooking] = MockData.diagnosticBookings
    @Published public var medicines: [Medicine] = MockData.medicines
    @Published public var cart: [CartItem] = []
    @Published public var pharmacyOrders: [PharmacyOrder] = MockData.pharmacyOrders
    @Published public var medicalRecords: [MedicalRecord] = MockData.medicalRecords
    @Published public var prescriptions: [Prescription] = MockData.prescriptions
    @Published public var providerConsents: [ProviderConsent] = MockData.providerConsents
    @Published public var hospitals: [Hospital] = MockData.hospitals
    @Published public var bloodBanks: [BloodBank] = MockData.bloodBanks
    @Published public var activeEmergency: EmergencyRequest? = nil
    @Published public var emergencyHistory: [EmergencyRequest] = []
    @Published public var notifications: [AppNotification] = MockData.notifications
    @Published public var insurancePolicies: [InsurancePolicy] = [MockData.insurancePolicy]
    @Published public var insuranceClaims: [InsuranceClaim] = MockData.insuranceClaims
    @Published public var nfcCredentials: [NfcCredential] = [MockData.nfcCredential]
    @Published public var userConsents: [Consent] = []
    @Published public var localConsentGranted: Bool = true

    public init() {
        APIService.shared.isDemoMode = true
        APIService.shared.baseURL = "http://localhost:8080"
        Task {
            await self.loadInitialData()
        }
    }

    public func loadInitialData() async {
        do {
            doctors = try await APIService.shared.getDoctors()
            appointments = try await APIService.shared.getAppointments()
            diagnosticCenters = try await APIService.shared.getDiagnosticCenters()
            diagnosticTests = try await APIService.shared.getDiagnosticTests()
            diagnosticBookings = try await APIService.shared.getDiagnosticBookings()
            medicines = try await APIService.shared.getMedicines()
            pharmacyOrders = try await APIService.shared.getPharmacyOrders()
            medicalRecords = try await APIService.shared.getMedicalRecords()
            prescriptions = try await APIService.shared.getPrescriptions()
            providerConsents = try await APIService.shared.getProviderConsents()
            hospitals = try await APIService.shared.getHospitals()
            bloodBanks = try await APIService.shared.getBloodBanks()
            activeEmergency = try await APIService.shared.getActiveEmergency()
            emergencyHistory = try await APIService.shared.getEmergencyHistory()
            notifications = try await APIService.shared.getNotifications()
            insurancePolicies = try await APIService.shared.getInsurancePolicies()
            insuranceClaims = try await APIService.shared.getInsuranceClaims()
            nfcCredentials = try await APIService.shared.getNfcCredentials()
            userConsents = try await APIService.shared.getConsents()
        } catch {
            // Keep existing state
        }
    }

    // MARK: - Personas
    public func switchPersona(_ name: String) {
        selectedPersona = name
        if name.contains("Evelyn") {
            currentUser = MockData.doctorEvelyn
        } else if name.contains("John") {
            currentUser = MockData.patientJohn
        } else {
            currentUser = MockData.patientSarah
        }
    }

    // MARK: - Cart Calculations
    public var cartItemCount: Int {
        cart.reduce(0) { $0 + $1.quantity }
    }

    public var cartSubtotal: Double {
        cart.reduce(0.0) { $0 + ($1.medicine.discountPrice ?? $1.medicine.price) * Double($1.quantity) }
    }

    public var cartDeliveryFee: Double {
        cart.isEmpty ? 0.0 : 5.0
    }

    public var cartTotal: Double {
        cart.isEmpty ? 0.0 : cartSubtotal + cartDeliveryFee
    }

    public func addToCart(medicine: Medicine, quantity: Int = 1) {
        if let idx = cart.firstIndex(where: { $0.medicine.id == medicine.id }) {
            cart[idx].quantity += quantity
        } else {
            cart.append(CartItem(medicine: medicine, quantity: quantity))
        }
    }

    public func updateCartQuantity(medicineId: String, quantity: Int) {
        if let idx = cart.firstIndex(where: { $0.medicine.id == medicineId }) {
            if quantity <= 0 {
                cart.remove(at: idx)
            } else {
                cart[idx].quantity = quantity
            }
        }
    }

    public func clearCart() {
        cart.removeAll()
    }

    // MARK: - Appointments Actions
    public func bookAppointment(
        doctorId: String,
        date: String,
        time: String,
        type: ConsultationType,
        reason: String
    ) async -> Bool {
        do {
            let req = CreateAppointmentRequest(
                doctorId: doctorId,
                slotDate: date,
                slotTime: time,
                consultationType: type,
                reasonForVisit: reason
            )
            let newApt = try await APIService.shared.createAppointment(req: req)
            appointments.insert(newApt, at: 0)

            // Add notification
            let notif = AppNotification(
                type: "AppointmentBooked",
                title: "Appointment Confirmed",
                message: "Your appointment with \(newApt.doctorName) on \(newApt.appointmentDate) at \(newApt.appointmentTime) is confirmed."
            )
            notifications.insert(notif, at: 0)
            return true
        } catch {
            return false
        }
    }

    public func rescheduleAppointment(id: String, date: String, time: String) async -> Bool {
        do {
            let updated = try await APIService.shared.rescheduleAppointment(id: id, slotDate: date, slotTime: time)
            if let idx = appointments.firstIndex(where: { $0.id == id }) {
                appointments[idx] = updated
            }
            return true
        } catch {
            return false
        }
    }

    public func cancelAppointment(id: String, reason: String) async -> Bool {
        do {
            let updated = try await APIService.shared.cancelAppointment(id: id, reason: reason)
            if let idx = appointments.firstIndex(where: { $0.id == id }) {
                appointments[idx] = updated
            }
            return true
        } catch {
            return false
        }
    }

    // MARK: - Diagnostic Actions
    public func bookDiagnostic(
        centerId: String,
        testId: String,
        collectionType: String,
        date: String,
        time: String,
        address: String? = nil
    ) async -> Bool {
        do {
            let req = DiagnosticBookingRequest(
                centerId: centerId,
                testId: testId,
                collectionType: collectionType,
                scheduledDate: date,
                scheduledTime: time,
                patientAddress: address
            )
            let newBooking = try await APIService.shared.createDiagnosticBooking(req: req)
            diagnosticBookings.insert(newBooking, at: 0)

            let notif = AppNotification(
                type: "LabReportReady",
                title: "Diagnostic Test Scheduled",
                message: "Your \(newBooking.testName) at \(newBooking.centerName) is scheduled for \(newBooking.scheduledDate)."
            )
            notifications.insert(notif, at: 0)
            return true
        } catch {
            return false
        }
    }

    public func cancelDiagnosticBooking(id: String) async -> Bool {
        do {
            let updated = try await APIService.shared.cancelDiagnosticBooking(id: id)
            if let idx = diagnosticBookings.firstIndex(where: { $0.id == id }) {
                diagnosticBookings[idx] = updated
            }
            return true
        } catch {
            return false
        }
    }

    // MARK: - Pharmacy Actions
    public func placePharmacyOrder(
        deliveryAddress: String,
        paymentMethod: String,
        prescriptionRecordId: String? = nil
    ) async -> Bool {
        guard !cart.isEmpty else { return false }
        do {
            let order = try await APIService.shared.createPharmacyOrder(
                items: cart,
                deliveryAddress: deliveryAddress,
                paymentMethod: paymentMethod,
                prescriptionRecordId: prescriptionRecordId
            )
            pharmacyOrders.insert(order, at: 0)
            clearCart()

            let notif = AppNotification(
                type: "MedicineOrderShipped",
                title: "Order Placed Successfully",
                message: "Order \(order.orderNumber) for \(order.items.count) item(s) has been placed."
            )
            notifications.insert(notif, at: 0)
            return true
        } catch {
            return false
        }
    }

    public func cancelPharmacyOrder(id: String) async -> Bool {
        do {
            let cancelled = try await APIService.shared.cancelPharmacyOrder(id: id)
            if let idx = pharmacyOrders.firstIndex(where: { $0.id == id }) {
                pharmacyOrders[idx] = cancelled
            }
            return true
        } catch {
            return false
        }
    }

    // MARK: - Medical Records Actions
    public func uploadMedicalRecord(
        title: String,
        recordType: RecordType,
        doctorName: String,
        provider: String,
        date: String,
        summary: String,
        confidentialityLevel: ConfidentialityLevel,
        fileName: String?
    ) async -> Bool {
        let newRecord = MedicalRecord(
            id: "rec-\(UUID().uuidString.prefix(8))",
            patientId: currentUser.id,
            title: title.trimmingCharacters(in: .whitespacesAndNewlines),
            recordType: recordType,
            doctorName: doctorName.isEmpty ? "Self Uploaded" : doctorName,
            provider: provider.isEmpty ? "Patient Document" : provider,
            date: date,
            summary: summary.isEmpty ? "Uploaded by patient" : summary,
            status: .verified,
            fileSize: "1.2 MB",
            fileType: "application/pdf",
            originalFileName: fileName ?? "uploaded_document.pdf",
            tags: [recordType.rawValue.lowercased(), "patient-upload"],
            confidentialityLevel: confidentialityLevel
        )
        do {
            let saved = try await APIService.shared.uploadMedicalRecord(record: newRecord)
            medicalRecords.insert(saved, at: 0)
            return true
        } catch {
            return false
        }
    }

    public func toggleRecordArchived(id: String) async {
        guard let idx = medicalRecords.firstIndex(where: { $0.id == id }) else { return }
        let currentlyArchived = (medicalRecords[idx].status == .archived)
        do {
            let updated = try await APIService.shared.setRecordArchived(id: id, archive: !currentlyArchived)
            medicalRecords[idx] = updated
        } catch {
            medicalRecords[idx].status = currentlyArchived ? .verified : .archived
        }
    }

    public func revokeConsent(id: String) async {
        do {
            let updated = try await APIService.shared.revokeProviderConsent(id: id)
            if let idx = providerConsents.firstIndex(where: { $0.id == id }) {
                providerConsents[idx] = updated
            }
        } catch {
            if let idx = providerConsents.firstIndex(where: { $0.id == id }) {
                providerConsents[idx].status = "REVOKED"
            }
        }
    }

    // MARK: - Emergency Actions
    public func triggerEmergency(
        emergencyType: String,
        address: String,
        latitude: Double? = 37.7749,
        longitude: Double? = -122.4194,
        accuracy: Double? = 10.0
    ) async -> Bool {
        let input = SosInput(
            emergencyType: emergencyType,
            address: address.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "742 Evergreen Terrace, Metro City" : address,
            locationSource: "GPS",
            latitude: latitude,
            longitude: longitude,
            accuracyMeters: accuracy
        )
        do {
            let req = try await APIService.shared.triggerSOS(input: input)
            activeEmergency = req
            emergencyHistory.insert(req, at: 0)

            let notif = AppNotification(
                type: "EmergencyRequestCreated",
                title: "EMERGENCY DISPATCH INITIATED",
                message: "Emergency response dispatched for \(req.emergencyType). Ambulance vehicle \(req.ambulance?.vehicleNumber ?? "MEDIC-42") en route."
            )
            notifications.insert(notif, at: 0)
            return true
        } catch {
            return false
        }
    }

    public func cancelEmergency(id: String, reason: String) async -> Bool {
        do {
            let cancelled = try await APIService.shared.cancelEmergency(id: id, reason: reason)
            if activeEmergency?.id == id {
                activeEmergency = nil
            }
            if let idx = emergencyHistory.firstIndex(where: { $0.id == id }) {
                emergencyHistory[idx] = cancelled
            }

            let notif = AppNotification(
                type: "EmergencyRequestCancelled",
                title: "Emergency Request Cancelled",
                message: "Emergency dispatch was cancelled. Reason: \(reason)"
            )
            notifications.insert(notif, at: 0)
            return true
        } catch {
            return false
        }
    }

    // MARK: - Notifications Actions
    public var unreadNotificationsCount: Int {
        notifications.filter { !$0.read }.count
    }

    public func markNotificationRead(id: String) async {
        do {
            let updated = try await APIService.shared.markNotificationRead(id: id)
            if let idx = notifications.firstIndex(where: { $0.id == id }) {
                notifications[idx] = updated
            }
        } catch {
            if let idx = notifications.firstIndex(where: { $0.id == id }) {
                notifications[idx].read = true
            }
        }
    }

    public func markAllNotificationsRead() async {
        do {
            let updated = try await APIService.shared.markAllNotificationsRead()
            notifications = updated
        } catch {
            notifications = notifications.map {
                var item = $0
                item.read = true
                return item
            }
        }
    }

    // MARK: - Insurance Actions
    public func submitInsuranceClaim(
        hospital: String,
        amount: Double,
        claimType: String,
        description: String
    ) async -> Bool {
        let claim = InsuranceClaim(
            id: "CLM-\(Int.random(in: 10000...99999))",
            hospital: hospital,
            amount: amount,
            approvedAmount: 0,
            date: ISO8601DateFormatter().string(from: Date()).prefix(10).description,
            status: "UNDER_REVIEW",
            type: claimType,
            description: description
        )
        do {
            let saved = try await APIService.shared.submitInsuranceClaim(claim: claim)
            insuranceClaims.insert(saved, at: 0)
            return true
        } catch {
            return false
        }
    }

    // MARK: - NFC Actions
    public func issueNewNfcCard() async {
        do {
            let cred = try await APIService.shared.provisionNfcCredential()
            nfcCredentials.insert(cred, at: 0)
        } catch {
            let cred = NfcCredential(
                id: "HCNFC1:\(UUID().uuidString.prefix(16))",
                status: "ACTIVE",
                issuedAt: ISO8601DateFormatter().string(from: Date())
            )
            nfcCredentials.insert(cred, at: 0)
        }
    }

    public func revokeNfcCard(id: String) async {
        do {
            try await APIService.shared.revokeNfcCredential(id: id)
            nfcCredentials.removeAll(where: { $0.id == id })
        } catch {
            nfcCredentials.removeAll(where: { $0.id == id })
        }
    }

    // MARK: - Health Check / Backend Switch
    public func testBackendConnection() async {
        guard !isDemoMode else {
            backendStatusText = "Running in Demo Fallback Mode"
            return
        }
        backendStatusText = "Connecting to \(apiBaseURL)..."
        guard let url = URL(string: apiBaseURL.trimmingCharacters(in: CharacterSet(charactersIn: "/")) + "/api/v1/hospitals") else {
            backendStatusText = "Invalid URL"
            return
        }
        do {
            let (_, resp) = try await URLSession.shared.data(from: url)
            if let http = resp as? HTTPURLResponse, (200...299).contains(http.statusCode) {
                backendStatusText = "Connected to Live Server (\(http.statusCode) OK)"
            } else {
                backendStatusText = "Server replied but returned non-200"
            }
        } catch {
            backendStatusText = "Cannot reach server. Falling back to local state."
        }
    }
}
