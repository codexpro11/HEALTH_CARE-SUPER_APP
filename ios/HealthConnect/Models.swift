import Foundation

// MARK: - User & Auth Models

public enum UserRole: String, Codable, CaseIterable {
    case patient = "PATIENT"
    case doctor = "DOCTOR"
    case hospital = "HOSPITAL"
    case pharmacy = "PHARMACY"
    case diagnosticCenter = "DIAGNOSTIC_CENTER"
    case ambulanceProvider = "AMBULANCE_PROVIDER"
    case bloodBank = "BLOOD_BANK"
    case admin = "ADMIN"
}

public struct UserAddress: Codable, Hashable {
    public var street: String
    public var city: String
    public var state: String
    public var postalCode: String

    public init(street: String = "", city: String = "", state: String = "", postalCode: String = "") {
        self.street = street
        self.city = city
        self.state = state
        self.postalCode = postalCode
    }
}

public struct EmergencyContact: Codable, Hashable {
    public var name: String
    public var relationship: String
    public var phone: String

    public init(name: String = "", relationship: String = "", phone: String = "") {
        self.name = name
        self.relationship = relationship
        self.phone = phone
    }
}

public struct User: Identifiable, Codable, Hashable {
    public var id: String
    public var fullName: String
    public var email: String
    public var phoneNumber: String
    public var dateOfBirth: String?
    public var gender: String?
    public var role: UserRole
    public var avatarUrl: String?
    public var bloodGroup: String?
    public var allergies: [String]?
    public var chronicConditions: [String]?
    public var emergencyContact: EmergencyContact?
    public var address: UserAddress?
    public var createdAt: String

    public init(
        id: String,
        fullName: String,
        email: String,
        phoneNumber: String,
        dateOfBirth: String? = nil,
        gender: String? = "FEMALE",
        role: UserRole = .patient,
        avatarUrl: String? = nil,
        bloodGroup: String? = nil,
        allergies: [String]? = nil,
        chronicConditions: [String]? = nil,
        emergencyContact: EmergencyContact? = nil,
        address: UserAddress? = nil,
        createdAt: String = ISO8601DateFormatter().string(from: Date())
    ) {
        self.id = id
        self.fullName = fullName
        self.email = email
        self.phoneNumber = phoneNumber
        self.dateOfBirth = dateOfBirth
        self.gender = gender
        self.role = role
        self.avatarUrl = avatarUrl
        self.bloodGroup = bloodGroup
        self.allergies = allergies
        self.chronicConditions = chronicConditions
        self.emergencyContact = emergencyContact
        self.address = address
        self.createdAt = createdAt
    }
}

public struct AuthResponse: Codable {
    public let accessToken: String
    public let refreshToken: String
    public let expiresIn: Int
    public let user: User
}

public struct LoginRequest: Codable {
    public let email: String
    public let password: String
    public let rememberMe: Bool?
}

public struct RegisterRequest: Codable {
    public let fullName: String
    public let email: String
    public let phoneNumber: String
    public let password: String
    public let dateOfBirth: String
    public let gender: String
    public let role: UserRole
}

// MARK: - Doctor & Appointment Models

public enum ConsultationType: String, Codable, CaseIterable {
    case inPerson = "IN_PERSON"
    case video = "VIDEO"
    case audio = "AUDIO"

    public var title: String {
        switch self {
        case .inPerson: return "In-Person"
        case .video: return "Video Call"
        case .audio: return "Audio Call"
        }
    }

    public var icon: String {
        switch self {
        case .inPerson: return "person.fill"
        case .video: return "video.fill"
        case .audio: return "phone.fill"
        }
    }
}

public struct TimeSlot: Identifiable, Codable, Hashable {
    public var id: String
    public var date: String
    public var time: String
    public var available: Bool

    public init(id: String, date: String, time: String, available: Bool) {
        self.id = id
        self.date = date
        self.time = time
        self.available = available
    }
}

public struct Doctor: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var photoUrl: String
    public var specialization: String
    public var qualification: String
    public var experienceYears: Int
    public var rating: Double
    public var reviewCount: Int
    public var location: String
    public var hospitalAffiliation: String
    public var consultationFee: Double
    public var consultationTypes: [ConsultationType]
    public var about: String
    public var availableDays: [String]
    public var nextAvailableSlot: String
    public var languages: [String]
    public var timeSlots: [TimeSlot]

    public init(
        id: String,
        name: String,
        photoUrl: String,
        specialization: String,
        qualification: String,
        experienceYears: Int,
        rating: Double,
        reviewCount: Int,
        location: String,
        hospitalAffiliation: String,
        consultationFee: Double,
        consultationTypes: [ConsultationType],
        about: String,
        availableDays: [String],
        nextAvailableSlot: String,
        languages: [String],
        timeSlots: [TimeSlot]
    ) {
        self.id = id
        self.name = name
        self.photoUrl = photoUrl
        self.specialization = specialization
        self.qualification = qualification
        self.experienceYears = experienceYears
        self.rating = rating
        self.reviewCount = reviewCount
        self.location = location
        self.hospitalAffiliation = hospitalAffiliation
        self.consultationFee = consultationFee
        self.consultationTypes = consultationTypes
        self.about = about
        self.availableDays = availableDays
        self.nextAvailableSlot = nextAvailableSlot
        self.languages = languages
        self.timeSlots = timeSlots
    }
}

public enum AppointmentStatus: String, Codable, CaseIterable {
    case available = "AVAILABLE"
    case booked = "BOOKED"
    case confirmed = "CONFIRMED"
    case inProgress = "IN_PROGRESS"
    case completed = "COMPLETED"
    case cancelled = "CANCELLED"
    case noShow = "NO_SHOW"
    case expired = "EXPIRED"

    public var title: String {
        switch self {
        case .available: return "Available"
        case .booked: return "Booked"
        case .confirmed: return "Confirmed"
        case .inProgress: return "In Progress"
        case .completed: return "Completed"
        case .cancelled: return "Cancelled"
        case .noShow: return "No Show"
        case .expired: return "Expired"
        }
    }
}

public struct Appointment: Identifiable, Codable, Hashable {
    public var id: String
    public var doctorId: String
    public var doctorName: String
    public var doctorSpecialization: String
    public var doctorPhotoUrl: String
    public var hospitalName: String
    public var patientId: String
    public var patientName: String
    public var appointmentDate: String
    public var appointmentTime: String
    public var consultationType: ConsultationType
    public var consultationFee: Double
    public var status: AppointmentStatus
    public var reasonForVisit: String
    public var meetingLink: String?
    public var roomNumber: String?
    public var notes: String?
    public var createdAt: String
    public var updatedAt: String?

    public init(
        id: String,
        doctorId: String,
        doctorName: String,
        doctorSpecialization: String,
        doctorPhotoUrl: String,
        hospitalName: String,
        patientId: String,
        patientName: String,
        appointmentDate: String,
        appointmentTime: String,
        consultationType: ConsultationType,
        consultationFee: Double,
        status: AppointmentStatus,
        reasonForVisit: String,
        meetingLink: String? = nil,
        roomNumber: String? = nil,
        notes: String? = nil,
        createdAt: String = ISO8601DateFormatter().string(from: Date()),
        updatedAt: String? = nil
    ) {
        self.id = id
        self.doctorId = doctorId
        self.doctorName = doctorName
        self.doctorSpecialization = doctorSpecialization
        self.doctorPhotoUrl = doctorPhotoUrl
        self.hospitalName = hospitalName
        self.patientId = patientId
        self.patientName = patientName
        self.appointmentDate = appointmentDate
        self.appointmentTime = appointmentTime
        self.consultationType = consultationType
        self.consultationFee = consultationFee
        self.status = status
        self.reasonForVisit = reasonForVisit
        self.meetingLink = meetingLink
        self.roomNumber = roomNumber
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

public struct CreateAppointmentRequest: Codable {
    public let doctorId: String
    public let slotDate: String
    public let slotTime: String
    public let consultationType: ConsultationType
    public let reasonForVisit: String

    public init(doctorId: String, slotDate: String, slotTime: String, consultationType: ConsultationType, reasonForVisit: String) {
        self.doctorId = doctorId
        self.slotDate = slotDate
        self.slotTime = slotTime
        self.consultationType = consultationType
        self.reasonForVisit = reasonForVisit
    }
}

// MARK: - Medical Records & Prescriptions

public enum RecordType: String, Codable, CaseIterable {
    case consultationNote = "CONSULTATION_NOTE"
    case prescription = "PRESCRIPTION"
    case diagnosticReport = "DIAGNOSTIC_REPORT"
    case allergy = "ALLERGY"
    case vaccination = "VACCINATION"
    case surgicalHistory = "SURGICAL_HISTORY"
    case document = "DOCUMENT"
    case labReport = "LAB_REPORT"
    case radiology = "RADIOLOGY"
    case dischargeSummary = "DISCHARGE_SUMMARY"
    case clinicalNote = "CLINICAL_NOTE"

    public var title: String {
        switch self {
        case .consultationNote: return "Consultation Note"
        case .prescription: return "Prescription"
        case .diagnosticReport: return "Diagnostic Report"
        case .allergy: return "Allergy Record"
        case .vaccination: return "Vaccination"
        case .surgicalHistory: return "Surgical History"
        case .document: return "Document"
        case .labReport: return "Lab Report"
        case .radiology: return "Radiology"
        case .dischargeSummary: return "Discharge Summary"
        case .clinicalNote: return "Clinical Note"
        }
    }

    public var icon: String {
        switch self {
        case .prescription: return "pill.fill"
        case .labReport, .diagnosticReport: return "testtube.2"
        case .radiology: return "waveform.path.ecg"
        case .vaccination: return "cross.case.fill"
        case .surgicalHistory: return "heart.text.square"
        default: return "doc.text.fill"
        }
    }
}

public enum RecordStatus: String, Codable, CaseIterable {
    case verified = "VERIFIED"
    case pending = "PENDING"
    case archived = "ARCHIVED"
}

public enum ConfidentialityLevel: String, Codable, CaseIterable {
    case standard = "STANDARD"
    case restricted = "RESTRICTED"
    case confidential = "CONFIDENTIAL"
}

public struct MedicalRecord: Identifiable, Codable, Hashable {
    public var id: String
    public var patientId: String
    public var title: String
    public var recordType: RecordType
    public var doctorName: String
    public var provider: String
    public var date: String
    public var summary: String
    public var status: RecordStatus
    public var fileUrl: String?
    public var fileSize: String?
    public var fileType: String?
    public var originalFileName: String?
    public var tags: [String]
    public var confidentialityLevel: ConfidentialityLevel

    public init(
        id: String,
        patientId: String,
        title: String,
        recordType: RecordType,
        doctorName: String,
        provider: String,
        date: String,
        summary: String,
        status: RecordStatus = .verified,
        fileUrl: String? = nil,
        fileSize: String? = nil,
        fileType: String? = "application/pdf",
        originalFileName: String? = nil,
        tags: [String] = [],
        confidentialityLevel: ConfidentialityLevel = .standard
    ) {
        self.id = id
        self.patientId = patientId
        self.title = title
        self.recordType = recordType
        self.doctorName = doctorName
        self.provider = provider
        self.date = date
        self.summary = summary
        self.status = status
        self.fileUrl = fileUrl
        self.fileSize = fileSize
        self.fileType = fileType
        self.originalFileName = originalFileName
        self.tags = tags
        self.confidentialityLevel = confidentialityLevel
    }
}

public struct PrescriptionMedication: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var dosage: String
    public var frequency: String
    public var duration: String
    public var instructions: String
    public var remainingRefills: Int?

    public init(id: String, name: String, dosage: String, frequency: String, duration: String, instructions: String, remainingRefills: Int? = 0) {
        self.id = id
        self.name = name
        self.dosage = dosage
        self.frequency = frequency
        self.duration = duration
        self.instructions = instructions
        self.remainingRefills = remainingRefills
    }
}

public struct Prescription: Identifiable, Codable, Hashable {
    public var id: String
    public var prescriptionNumber: String
    public var doctorName: String
    public var doctorSpecialization: String
    public var clinicOrHospital: String
    public var dateIssued: String
    public var validUntil: String
    public var diagnosis: String
    public var status: String
    public var medications: [PrescriptionMedication]
    public var digitalSignatureId: String
    public var notes: String?

    public init(
        id: String,
        prescriptionNumber: String,
        doctorName: String,
        doctorSpecialization: String,
        clinicOrHospital: String,
        dateIssued: String,
        validUntil: String,
        diagnosis: String,
        status: String = "ACTIVE",
        medications: [PrescriptionMedication],
        digitalSignatureId: String,
        notes: String? = nil
    ) {
        self.id = id
        self.prescriptionNumber = prescriptionNumber
        self.doctorName = doctorName
        self.doctorSpecialization = doctorSpecialization
        self.clinicOrHospital = clinicOrHospital
        self.dateIssued = dateIssued
        self.validUntil = validUntil
        self.diagnosis = diagnosis
        self.status = status
        self.medications = medications
        self.digitalSignatureId = digitalSignatureId
        self.notes = notes
    }
}

public struct ProviderConsent: Identifiable, Codable, Hashable {
    public var id: String
    public var providerName: String
    public var providerType: String
    public var accessScope: [String]
    public var grantedAt: String
    public var expiresAt: String
    public var status: String

    public init(id: String, providerName: String, providerType: String, accessScope: [String], grantedAt: String, expiresAt: String, status: String = "ACTIVE") {
        self.id = id
        self.providerName = providerName
        self.providerType = providerType
        self.accessScope = accessScope
        self.grantedAt = grantedAt
        self.expiresAt = expiresAt
        self.status = status
    }
}

public struct RecordActivity: Identifiable, Codable, Hashable {
    public var id: String
    public var recordId: String
    public var documentTitle: String
    public var action: String
    public var timestamp: String

    public init(id: String = UUID().uuidString, recordId: String, documentTitle: String, action: String, timestamp: String = ISO8601DateFormatter().string(from: Date())) {
        self.id = id
        self.recordId = recordId
        self.documentTitle = documentTitle
        self.action = action
        self.timestamp = timestamp
    }
}

// MARK: - Diagnostics Models

public struct DiagnosticTest: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var code: String
    public var category: String
    public var description: String
    public var price: Double
    public var discountedPrice: Double?
    public var turnaroundTime: String
    public var preparationNotes: String
    public var isHomeCollectionAvailable: Bool
    public var fastingRequired: Bool?
    public var fastingHours: Int?

    public init(
        id: String,
        name: String,
        code: String,
        category: String,
        description: String,
        price: Double,
        discountedPrice: Double? = nil,
        turnaroundTime: String,
        preparationNotes: String,
        isHomeCollectionAvailable: Bool,
        fastingRequired: Bool? = false,
        fastingHours: Int? = nil
    ) {
        self.id = id
        self.name = name
        self.code = code
        self.category = category
        self.description = description
        self.price = price
        self.discountedPrice = discountedPrice
        self.turnaroundTime = turnaroundTime
        self.preparationNotes = preparationNotes
        self.isHomeCollectionAvailable = isHomeCollectionAvailable
        self.fastingRequired = fastingRequired
        self.fastingHours = fastingHours
    }
}

public struct DiagnosticCenter: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var address: String
    public var distanceKm: Double
    public var rating: Double
    public var reviewCount: Int
    public var contactNumber: String
    public var availableTests: [DiagnosticTest]
    public var accreditation: String
    public var openingHours: String

    public init(
        id: String,
        name: String,
        address: String,
        distanceKm: Double,
        rating: Double,
        reviewCount: Int,
        contactNumber: String,
        availableTests: [DiagnosticTest] = [],
        accreditation: String,
        openingHours: String
    ) {
        self.id = id
        self.name = name
        self.address = address
        self.distanceKm = distanceKm
        self.rating = rating
        self.reviewCount = reviewCount
        self.contactNumber = contactNumber
        self.availableTests = availableTests
        self.accreditation = accreditation
        self.openingHours = openingHours
    }
}

public struct DiagnosticBooking: Identifiable, Codable, Hashable {
    public var id: String
    public var bookingRef: String
    public var centerId: String
    public var centerName: String
    public var testId: String
    public var testName: String
    public var collectionType: String // "HOME_COLLECTION" | "CENTER_VISIT"
    public var scheduledDate: String
    public var scheduledTime: String
    public var status: String // "BOOKED", "SAMPLE_COLLECTION", "PROCESSING", "REPORT_READY", "CANCELLED"
    public var price: Double
    public var patientAddress: String?
    public var createdAt: String

    public init(
        id: String,
        bookingRef: String,
        centerId: String,
        centerName: String,
        testId: String,
        testName: String,
        collectionType: String,
        scheduledDate: String,
        scheduledTime: String,
        status: String = "BOOKED",
        price: Double,
        patientAddress: String? = nil,
        createdAt: String = ISO8601DateFormatter().string(from: Date())
    ) {
        self.id = id
        self.bookingRef = bookingRef
        self.centerId = centerId
        self.centerName = centerName
        self.testId = testId
        self.testName = testName
        self.collectionType = collectionType
        self.scheduledDate = scheduledDate
        self.scheduledTime = scheduledTime
        self.status = status
        self.price = price
        self.patientAddress = patientAddress
        self.createdAt = createdAt
    }
}

public struct DiagnosticBookingRequest: Codable {
    public let centerId: String
    public let testId: String
    public let collectionType: String
    public let scheduledDate: String
    public let scheduledTime: String
    public let patientAddress: String?

    public init(centerId: String, testId: String, collectionType: String, scheduledDate: String, scheduledTime: String, patientAddress: String? = nil) {
        self.centerId = centerId
        self.testId = testId
        self.collectionType = collectionType
        self.scheduledDate = scheduledDate
        self.scheduledTime = scheduledTime
        self.patientAddress = patientAddress
    }
}

// MARK: - Pharmacy Models

public enum MedicineCategory: String, Codable, CaseIterable {
    case antibiotic = "ANTIBIOTIC"
    case analgesic = "ANALGESIC"
    case cardiology = "CARDIOLOGY"
    case diabetes = "DIABETES"
    case vitamins = "VITAMINS"
    case firstAid = "FIRST_AID"
    case respiratory = "RESPIRATORY"

    public var title: String {
        switch self {
        case .antibiotic: return "Antibiotics"
        case .analgesic: return "Pain Relief"
        case .cardiology: return "Cardiology"
        case .diabetes: return "Diabetes Care"
        case .vitamins: return "Vitamins & Supplements"
        case .firstAid: return "First Aid"
        case .respiratory: return "Respiratory"
        }
    }
}

public struct Medicine: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var genericName: String
    public var manufacturer: String
    public var category: MedicineCategory
    public var price: Double
    public var discountPrice: Double?
    public var dosageForm: String
    public var strength: String
    public var inStock: Bool
    public var stockCount: Int
    public var requiresPrescription: Bool
    public var description: String
    public var sideEffects: [String]?
    public var imageUrl: String

    public init(
        id: String,
        name: String,
        genericName: String,
        manufacturer: String,
        category: MedicineCategory,
        price: Double,
        discountPrice: Double? = nil,
        dosageForm: String,
        strength: String,
        inStock: Bool,
        stockCount: Int,
        requiresPrescription: Bool,
        description: String,
        sideEffects: [String]? = nil,
        imageUrl: String
    ) {
        self.id = id
        self.name = name
        self.genericName = genericName
        self.manufacturer = manufacturer
        self.category = category
        self.price = price
        self.discountPrice = discountPrice
        self.dosageForm = dosageForm
        self.strength = strength
        self.inStock = inStock
        self.stockCount = stockCount
        self.requiresPrescription = requiresPrescription
        self.description = description
        self.sideEffects = sideEffects
        self.imageUrl = imageUrl
    }
}

public struct CartItem: Identifiable, Codable, Hashable {
    public var id: String { medicine.id }
    public var medicine: Medicine
    public var quantity: Int

    public init(medicine: Medicine, quantity: Int = 1) {
        self.medicine = medicine
        self.quantity = quantity
    }
}

public struct OrderTimelineStep: Codable, Hashable {
    public var status: String
    public var timestamp: String
    public var description: String

    public init(status: String, timestamp: String, description: String) {
        self.status = status
        self.timestamp = timestamp
        self.description = description
    }
}

public struct PharmacyOrder: Identifiable, Codable, Hashable {
    public var id: String
    public var orderNumber: String
    public var patientId: String
    public var items: [CartItem]
    public var totalAmount: Double
    public var discountAmount: Double
    public var deliveryFee: Double
    public var finalAmount: Double
    public var deliveryAddress: String
    public var prescriptionUploaded: Bool?
    public var prescriptionRecordId: String?
    public var status: String // "CONFIRMED", "PHARMACY_PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"
    public var paymentMethod: String
    public var createdAt: String
    public var estimatedDeliveryTime: String
    public var timeline: [OrderTimelineStep]

    public init(
        id: String,
        orderNumber: String,
        patientId: String,
        items: [CartItem],
        totalAmount: Double,
        discountAmount: Double = 0,
        deliveryFee: Double = 5.0,
        finalAmount: Double,
        deliveryAddress: String,
        prescriptionUploaded: Bool? = false,
        prescriptionRecordId: String? = nil,
        status: String = "CONFIRMED",
        paymentMethod: String = "CASH_ON_DELIVERY",
        createdAt: String = ISO8601DateFormatter().string(from: Date()),
        estimatedDeliveryTime: String = "Today, 5:00 PM",
        timeline: [OrderTimelineStep] = []
    ) {
        self.id = id
        self.orderNumber = orderNumber
        self.patientId = patientId
        self.items = items
        self.totalAmount = totalAmount
        self.discountAmount = discountAmount
        self.deliveryFee = deliveryFee
        self.finalAmount = finalAmount
        self.deliveryAddress = deliveryAddress
        self.prescriptionUploaded = prescriptionUploaded
        self.prescriptionRecordId = prescriptionRecordId
        self.status = status
        self.paymentMethod = paymentMethod
        self.createdAt = createdAt
        self.estimatedDeliveryTime = estimatedDeliveryTime
        self.timeline = timeline
    }
}

// MARK: - Hospitals & Blood Banks

public struct BedAvailability: Codable, Hashable {
    public var icuAvailable: Int
    public var icuTotal: Int
    public var generalAvailable: Int
    public var generalTotal: Int
    public var emergencyAvailable: Int
    public var emergencyTotal: Int

    public init(icuAvailable: Int, icuTotal: Int, generalAvailable: Int, generalTotal: Int, emergencyAvailable: Int, emergencyTotal: Int) {
        self.icuAvailable = icuAvailable
        self.icuTotal = icuTotal
        self.generalAvailable = generalAvailable
        self.generalTotal = generalTotal
        self.emergencyAvailable = emergencyAvailable
        self.emergencyTotal = emergencyTotal
    }
}

public struct Hospital: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var distanceKm: Double
    public var address: String
    public var phone: String
    public var emergencyPhone: String
    public var rating: Double
    public var specializations: [String]
    public var hasEmergency: Bool
    public var hasICU: Bool
    public var bedAvailability: BedAvailability

    public init(
        id: String,
        name: String,
        distanceKm: Double,
        address: String,
        phone: String,
        emergencyPhone: String,
        rating: Double,
        specializations: [String],
        hasEmergency: Bool,
        hasICU: Bool,
        bedAvailability: BedAvailability
    ) {
        self.id = id
        self.name = name
        self.distanceKm = distanceKm
        self.address = address
        self.phone = phone
        self.emergencyPhone = emergencyPhone
        self.rating = rating
        self.specializations = specializations
        self.hasEmergency = hasEmergency
        self.hasICU = hasICU
        self.bedAvailability = bedAvailability
    }
}

public struct BloodInventory: Codable, Hashable {
    public var bloodGroup: String
    public var unitsAvailable: Int
    public var status: String

    public init(bloodGroup: String, unitsAvailable: Int, status: String) {
        self.bloodGroup = bloodGroup
        self.unitsAvailable = unitsAvailable
        self.status = status
    }
}

public struct BloodBank: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var distanceKm: Double
    public var address: String
    public var contactNumber: String
    public var operatingHours: String
    public var isOpen24x7: Bool
    public var inventory: [BloodInventory]

    public init(
        id: String,
        name: String,
        distanceKm: Double,
        address: String,
        contactNumber: String,
        operatingHours: String,
        isOpen24x7: Bool,
        inventory: [BloodInventory]
    ) {
        self.id = id
        self.name = name
        self.distanceKm = distanceKm
        self.address = address
        self.contactNumber = contactNumber
        self.operatingHours = operatingHours
        self.isOpen24x7 = isOpen24x7
        self.inventory = inventory
    }
}

// MARK: - Emergency & SOS Models

public struct AmbulanceInfo: Codable, Hashable {
    public var vehicleNumber: String
    public var paramedicName: String
    public var paramedicContact: String
    public var currentSpeedKmh: Int
    public var assignedHospital: String

    public init(vehicleNumber: String, paramedicName: String, paramedicContact: String, currentSpeedKmh: Int, assignedHospital: String) {
        self.vehicleNumber = vehicleNumber
        self.paramedicName = paramedicName
        self.paramedicContact = paramedicContact
        self.currentSpeedKmh = currentSpeedKmh
        self.assignedHospital = assignedHospital
    }
}

public struct EmergencyHospital: Identifiable, Codable, Hashable {
    public var id: String
    public var name: String
    public var distanceKm: Double
    public var emergencyBeds: Int
    public var icuBeds: Int
    public var phone: String

    public init(id: String, name: String, distanceKm: Double, emergencyBeds: Int, icuBeds: Int, phone: String) {
        self.id = id
        self.name = name
        self.distanceKm = distanceKm
        self.emergencyBeds = emergencyBeds
        self.icuBeds = icuBeds
        self.phone = phone
    }
}

public struct EmergencyRequest: Identifiable, Codable, Hashable {
    public var id: String
    public var clientRequestId: String?
    public var patientId: String
    public var patientName: String
    public var patientPhone: String
    public var emergencyType: String
    public var latitude: Double?
    public var longitude: Double?
    public var locationSource: String? // "GPS" | "MANUAL"
    public var accuracyMeters: Double?
    public var locationCapturedAt: String?
    public var cancelledAt: String?
    public var cancellationReason: String?
    public var address: String
    public var status: String // "PENDING", "DISPATCHED", "EN_ROUTE", "ARRIVED", "CANCELLED", "RESOLVED"
    public var etaMinutes: Int?
    public var ambulance: AmbulanceInfo?
    public var nearbyHospitals: [EmergencyHospital]
    public var createdAt: String

    public init(
        id: String,
        clientRequestId: String? = UUID().uuidString,
        patientId: String,
        patientName: String,
        patientPhone: String,
        emergencyType: String,
        latitude: Double? = nil,
        longitude: Double? = nil,
        locationSource: String? = "GPS",
        accuracyMeters: Double? = nil,
        locationCapturedAt: String? = nil,
        cancelledAt: String? = nil,
        cancellationReason: String? = nil,
        address: String,
        status: String = "PENDING",
        etaMinutes: Int? = 8,
        ambulance: AmbulanceInfo? = nil,
        nearbyHospitals: [EmergencyHospital] = [],
        createdAt: String = ISO8601DateFormatter().string(from: Date())
    ) {
        self.id = id
        self.clientRequestId = clientRequestId
        self.patientId = patientId
        self.patientName = patientName
        self.patientPhone = patientPhone
        self.emergencyType = emergencyType
        self.latitude = latitude
        self.longitude = longitude
        self.locationSource = locationSource
        self.accuracyMeters = accuracyMeters
        self.locationCapturedAt = locationCapturedAt
        self.cancelledAt = cancelledAt
        self.cancellationReason = cancellationReason
        self.address = address
        self.status = status
        self.etaMinutes = etaMinutes
        self.ambulance = ambulance
        self.nearbyHospitals = nearbyHospitals
        self.createdAt = createdAt
    }
}

public struct SosInput: Codable {
    public let clientRequestId: String
    public let emergencyType: String
    public let address: String
    public let locationSource: String
    public let latitude: Double?
    public let longitude: Double?
    public let accuracyMeters: Double?
    public let locationCapturedAt: String?

    public init(
        clientRequestId: String = UUID().uuidString,
        emergencyType: String,
        address: String,
        locationSource: String = "GPS",
        latitude: Double? = nil,
        longitude: Double? = nil,
        accuracyMeters: Double? = nil,
        locationCapturedAt: String? = ISO8601DateFormatter().string(from: Date())
    ) {
        self.clientRequestId = clientRequestId
        self.emergencyType = emergencyType
        self.address = address
        self.locationSource = locationSource
        self.latitude = latitude
        self.longitude = longitude
        self.accuracyMeters = accuracyMeters
        self.locationCapturedAt = locationCapturedAt
    }
}

// MARK: - Notifications

public struct AppNotification: Identifiable, Codable, Hashable {
    public var id: String
    public var type: String
    public var title: String
    public var message: String
    public var read: Bool
    public var createdAt: String
    public var actionUrl: String?

    public init(
        id: String = UUID().uuidString,
        type: String,
        title: String,
        message: String,
        read: Bool = false,
        createdAt: String = ISO8601DateFormatter().string(from: Date()),
        actionUrl: String? = nil
    ) {
        self.id = id
        self.type = type
        self.title = title
        self.message = message
        self.read = read
        self.createdAt = createdAt
        self.actionUrl = actionUrl
    }
}

// MARK: - Insurance Models

public struct InsuranceCoverageItem: Codable, Hashable {
    public var name: String
    public var limit: String
    public var description: String

    public init(name: String, limit: String, description: String) {
        self.name = name
        self.limit = limit
        self.description = description
    }
}

public struct InsurancePolicy: Identifiable, Codable, Hashable {
    public var id: String
    public var provider: String
    public var plan: String
    public var policyNumber: String
    public var memberId: String
    public var coverage: Double
    public var status: String // "ACTIVE" | "EXPIRED" | "PENDING"
    public var startDate: String
    public var endDate: String
    public var coverages: [InsuranceCoverageItem]

    public init(
        id: String,
        provider: String,
        plan: String,
        policyNumber: String,
        memberId: String,
        coverage: Double,
        status: String = "ACTIVE",
        startDate: String,
        endDate: String,
        coverages: [InsuranceCoverageItem] = []
    ) {
        self.id = id
        self.provider = provider
        self.plan = plan
        self.policyNumber = policyNumber
        self.memberId = memberId
        self.coverage = coverage
        self.status = status
        self.startDate = startDate
        self.endDate = endDate
        self.coverages = coverages
    }
}

public struct InsuranceClaim: Identifiable, Codable, Hashable {
    public var id: String
    public var hospital: String
    public var amount: Double
    public var approvedAmount: Double
    public var date: String
    public var status: String // "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "PARTIALLY_APPROVED" | "REJECTED" | "SETTLED"
    public var type: String // "Cashless" | "Reimbursement"
    public var description: String?
    public var rejectionReason: String?

    public init(
        id: String,
        hospital: String,
        amount: Double,
        approvedAmount: Double = 0,
        date: String,
        status: String = "UNDER_REVIEW",
        type: String = "Cashless",
        description: String? = nil,
        rejectionReason: String? = nil
    ) {
        self.id = id
        self.hospital = hospital
        self.amount = amount
        self.approvedAmount = approvedAmount
        self.date = date
        self.status = status
        self.type = type
        self.description = description
        self.rejectionReason = rejectionReason
    }
}

// MARK: - NFC & Consent Models

public struct NfcCredential: Identifiable, Codable, Hashable {
    public var id: String
    public var status: String // "ACTIVE" | "REVOKED" | "EXPIRED"
    public var issuedAt: String
    public var lastUsedAt: String?

    public init(id: String, status: String = "ACTIVE", issuedAt: String, lastUsedAt: String? = nil) {
        self.id = id
        self.status = status
        self.issuedAt = issuedAt
        self.lastUsedAt = lastUsedAt
    }
}

public struct Consent: Identifiable, Codable, Hashable {
    public var id: String
    public var provider: String
    public var facility: String
    public var scopes: [String]
    public var dateGranted: String
    public var expiry: String
    public var status: String

    public init(id: String, provider: String, facility: String, scopes: [String], dateGranted: String, expiry: String, status: String = "ACTIVE") {
        self.id = id
        self.provider = provider
        self.facility = facility
        self.scopes = scopes
        self.dateGranted = dateGranted
        self.expiry = expiry
        self.status = status
    }
}

// MARK: - Envelopes & Responses

public struct ApiResponse<T: Codable>: Codable {
    public let success: Bool?
    public let data: T?
    public let message: String?
    public let timestamp: String?
}
