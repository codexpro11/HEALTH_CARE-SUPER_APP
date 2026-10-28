import Foundation

public enum MockData {
    // MARK: - Users
    public static let patientSarah = User(
        id: "usr-patient-001",
        fullName: "Sarah Jenkins",
        email: "sarah.jenkins@healthconnect.io",
        phoneNumber: "+1 (555) 234-5678",
        dateOfBirth: "1992-05-14",
        gender: "FEMALE",
        role: .patient,
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        bloodGroup: "O+",
        allergies: ["Penicillin", "Sulfa drugs", "Peanuts (Mild)"],
        chronicConditions: ["Mild Asthma"],
        emergencyContact: EmergencyContact(name: "David Jenkins", relationship: "Spouse", phone: "+1 (555) 876-5432"),
        address: UserAddress(street: "742 Evergreen Terrace", city: "Metro City", state: "CA", postalCode: "94107")
    )

    public static let doctorEvelyn = User(
        id: "usr-doc-001",
        fullName: "Dr. Evelyn Reed",
        email: "dr.reed@healthconnect.io",
        phoneNumber: "+1 (555) 432-1098",
        dateOfBirth: "1982-08-20",
        gender: "FEMALE",
        role: .doctor,
        avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
        bloodGroup: "A+",
        address: UserAddress(street: "100 Medical Center Blvd", city: "Metro City", state: "CA", postalCode: "94102")
    )

    public static let patientJohn = User(
        id: "usr-patient-002",
        fullName: "John Doe",
        email: "second@healthconnect.demo",
        phoneNumber: "+1 (555) 987-6543",
        dateOfBirth: "1988-11-03",
        gender: "MALE",
        role: .patient,
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        bloodGroup: "B+",
        allergies: ["Aspirin"],
        emergencyContact: EmergencyContact(name: "Jane Doe", relationship: "Sister", phone: "+1 (555) 345-6789"),
        address: UserAddress(street: "123 Oak St", city: "Metro City", state: "CA", postalCode: "94103")
    )

    // MARK: - Doctors
    public static let doctors: [Doctor] = [
        Doctor(
            id: "doc-001",
            name: "Dr. Evelyn Reed",
            photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
            specialization: "Cardiologist",
            qualification: "MD, FACC - Harvard Medical School",
            experienceYears: 14,
            rating: 4.9,
            reviewCount: 328,
            location: "Metro Heart Institute, Downtown",
            hospitalAffiliation: "Central Metro Hospital",
            consultationFee: 120,
            consultationTypes: [.inPerson, .video],
            about: "Dr. Evelyn Reed is a board-certified cardiologist specializing in preventive cardiology, coronary artery disease management, and cardiovascular risk evaluation.",
            availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            nextAvailableSlot: "Today, 3:30 PM",
            languages: ["English", "Spanish"],
            timeSlots: [
                TimeSlot(id: "slot-1", date: "2026-10-30", time: "10:00 AM", available: true),
                TimeSlot(id: "slot-2", date: "2026-10-30", time: "11:30 AM", available: true),
                TimeSlot(id: "slot-3", date: "2026-10-30", time: "02:00 PM", available: true),
                TimeSlot(id: "slot-4", date: "2026-10-30", time: "03:30 PM", available: true),
                TimeSlot(id: "slot-5", date: "2026-10-31", time: "09:00 AM", available: true)
            ]
        ),
        Doctor(
            id: "doc-002",
            name: "Dr. Marcus Vance",
            photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
            specialization: "Neurologist",
            qualification: "MD, PhD - Johns Hopkins Medicine",
            experienceYears: 18,
            rating: 4.8,
            reviewCount: 245,
            location: "Advanced Neurosciences Center",
            hospitalAffiliation: "St. Jude Medical Center",
            consultationFee: 150,
            consultationTypes: [.inPerson, .video, .audio],
            about: "Leading neurologist focusing on migraine treatments, neuromuscular conditions, and cognitive neurology with over 18 years of clinical leadership.",
            availableDays: ["Tue", "Wed", "Thu", "Sat"],
            nextAvailableSlot: "Tomorrow, 10:00 AM",
            languages: ["English"],
            timeSlots: [
                TimeSlot(id: "slot-6", date: "2026-10-30", time: "09:30 AM", available: true),
                TimeSlot(id: "slot-7", date: "2026-10-30", time: "02:00 PM", available: true),
                TimeSlot(id: "slot-8", date: "2026-10-31", time: "10:00 AM", available: true)
            ]
        ),
        Doctor(
            id: "doc-003",
            name: "Dr. Priya Sharma",
            photoUrl: "https://images.unsplash.com/photo-1594824813590-781e899b2447?w=300&auto=format&fit=crop&q=80",
            specialization: "Dermatologist",
            qualification: "MD, FAAD - Stanford School of Medicine",
            experienceYears: 9,
            rating: 4.95,
            reviewCount: 412,
            location: "ClearSkin Dermatology Clinic",
            hospitalAffiliation: "City General Hospital",
            consultationFee: 95,
            consultationTypes: [.inPerson, .video],
            about: "Expert in clinical and aesthetic dermatology, acne management, eczema, and skin cancer screenings with state-of-the-art dermatoscopy.",
            availableDays: ["Mon", "Wed", "Thu", "Fri"],
            nextAvailableSlot: "Today, 4:00 PM",
            languages: ["English", "Hindi"],
            timeSlots: [
                TimeSlot(id: "slot-9", date: "2026-10-30", time: "01:00 PM", available: true),
                TimeSlot(id: "slot-10", date: "2026-10-30", time: "04:00 PM", available: true)
            ]
        ),
        Doctor(
            id: "doc-004",
            name: "Dr. James Wilson",
            photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80",
            specialization: "General Physician",
            qualification: "MD - Oxford University",
            experienceYears: 12,
            rating: 4.7,
            reviewCount: 198,
            location: "Metro Community Health Center",
            hospitalAffiliation: "Central Metro Hospital",
            consultationFee: 70,
            consultationTypes: [.inPerson, .video, .audio],
            about: "Compassionate primary care physician dedicated to comprehensive wellness, chronic condition prevention, and family health guidance.",
            availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            nextAvailableSlot: "Tomorrow, 11:00 AM",
            languages: ["English"],
            timeSlots: [
                TimeSlot(id: "slot-11", date: "2026-10-31", time: "11:00 AM", available: true),
                TimeSlot(id: "slot-12", date: "2026-10-31", time: "03:00 PM", available: true)
            ]
        )
    ]

    // MARK: - Appointments
    public static let appointments: [Appointment] = [
        Appointment(
            id: "apt-101",
            doctorId: "doc-001",
            doctorName: "Dr. Evelyn Reed",
            doctorSpecialization: "Cardiologist",
            doctorPhotoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
            hospitalName: "Central Metro Hospital",
            patientId: "usr-patient-001",
            patientName: "Sarah Jenkins",
            appointmentDate: "2026-11-05",
            appointmentTime: "10:00 AM",
            consultationType: .video,
            consultationFee: 120,
            status: .confirmed,
            reasonForVisit: "Routine cardiovascular checkup and cholesterol review",
            meetingLink: "https://telehealth.healthconnect.io/v/meet-847291",
            roomNumber: nil,
            notes: "Fast 8 hours prior if blood lipids will be tested."
        ),
        Appointment(
            id: "apt-102",
            doctorId: "doc-003",
            doctorName: "Dr. Priya Sharma",
            doctorSpecialization: "Dermatologist",
            doctorPhotoUrl: "https://images.unsplash.com/photo-1594824813590-781e899b2447?w=300&auto=format&fit=crop&q=80",
            hospitalName: "ClearSkin Dermatology Clinic",
            patientId: "usr-patient-001",
            patientName: "Sarah Jenkins",
            appointmentDate: "2026-10-15",
            appointmentTime: "02:30 PM",
            consultationType: .inPerson,
            consultationFee: 95,
            status: .completed,
            reasonForVisit: "Seasonal skin allergy consultation",
            roomNumber: "Room 104, West Wing",
            notes: "Prescribed topical cream and antihistamines."
        )
    ]

    // MARK: - Medical Records
    public static let medicalRecords: [MedicalRecord] = [
        MedicalRecord(
            id: "rec-001",
            patientId: "usr-patient-001",
            title: "Comprehensive Lipid Profile & Blood Chemistry",
            recordType: .labReport,
            doctorName: "Dr. Evelyn Reed",
            provider: "Central Metro Labs",
            date: "2026-10-12",
            summary: "Total cholesterol: 188 mg/dL (Normal). HDL: 56 mg/dL. LDL: 110 mg/dL. Triglycerides: 110 mg/dL. Fasting glucose: 92 mg/dL.",
            status: .verified,
            fileSize: "1.4 MB",
            fileType: "application/pdf",
            originalFileName: "lipid_panel_oct2026.pdf",
            tags: ["cardiology", "blood-test", "lipids"],
            confidentialityLevel: .standard
        ),
        MedicalRecord(
            id: "rec-002",
            patientId: "usr-patient-001",
            title: "Cardiology Consultation Note & ECG",
            recordType: .consultationNote,
            doctorName: "Dr. Evelyn Reed",
            provider: "Metro Heart Institute",
            date: "2026-09-20",
            summary: "Regular rhythm, normal axis, no ischemic ST changes detected. Recommended daily walking and continued lipid monitoring.",
            status: .verified,
            fileSize: "2.1 MB",
            fileType: "application/pdf",
            originalFileName: "consult_note_reed_sep.pdf",
            tags: ["cardiology", "ecg", "consultation"],
            confidentialityLevel: .standard
        ),
        MedicalRecord(
            id: "rec-003",
            patientId: "usr-patient-001",
            title: "Brain MRI Scan Report",
            recordType: .radiology,
            doctorName: "Dr. Marcus Vance",
            provider: "St. Jude Imaging Center",
            date: "2026-08-04",
            summary: "Brain parenchyma unremarkable. No mass effect, intracranial hemorrhage or acute infarction. Ventricles normal for age.",
            status: .verified,
            fileSize: "8.6 MB",
            fileType: "application/pdf",
            originalFileName: "brain_mri_aug2026.pdf",
            tags: ["neurology", "mri", "imaging"],
            confidentialityLevel: .restricted
        ),
        MedicalRecord(
            id: "rec-004",
            patientId: "usr-patient-001",
            title: "Current Active Prescription",
            recordType: .prescription,
            doctorName: "Dr. Evelyn Reed",
            provider: "Central Metro Hospital",
            date: "2026-10-12",
            summary: "Atorvastatin 20mg once daily at bedtime. Cetirizine 10mg as needed for allergies.",
            status: .verified,
            fileSize: "0.5 MB",
            fileType: "application/pdf",
            originalFileName: "rx_jenkins_oct2026.pdf",
            tags: ["rx", "prescription", "cardiology"],
            confidentialityLevel: .standard
        )
    ]

    // MARK: - Prescriptions
    public static let prescriptions: [Prescription] = [
        Prescription(
            id: "rx-001",
            prescriptionNumber: "RX-2026-98102",
            doctorName: "Dr. Evelyn Reed",
            doctorSpecialization: "Cardiologist",
            clinicOrHospital: "Central Metro Hospital",
            dateIssued: "2026-10-12",
            validUntil: "2027-04-12",
            diagnosis: "Hyperlipidemia (Mild) & Cardiovascular Risk Prevention",
            status: "ACTIVE",
            medications: [
                PrescriptionMedication(
                    id: "med-01",
                    name: "Atorvastatin Calcium",
                    dosage: "20mg",
                    frequency: "Once daily at bedtime",
                    duration: "90 days",
                    instructions: "Take with or without food. Avoid excessive grapefruit juice.",
                    remainingRefills: 2
                ),
                PrescriptionMedication(
                    id: "med-02",
                    name: "Cetirizine HCl",
                    dosage: "10mg",
                    frequency: "Once daily as needed",
                    duration: "30 days",
                    instructions: "Take at night for seasonal allergy relief.",
                    remainingRefills: 1
                )
            ],
            digitalSignatureId: "DS-HA256-REED-9912",
            notes: "Follow up with a repeat lipid panel in 6 months."
        )
    ]

    // MARK: - Diagnostics
    public static let diagnosticCenters: [DiagnosticCenter] = [
        DiagnosticCenter(
            id: "diag-c-1",
            name: "Metro Central PathLabs",
            address: "142 Innovation Way, Metro City",
            distanceKm: 2.4,
            rating: 4.8,
            reviewCount: 310,
            contactNumber: "+1 (555) 765-4321",
            accreditation: "CAP & NABL Accredited",
            openingHours: "Mon-Sat: 06:30 AM - 08:30 PM"
        ),
        DiagnosticCenter(
            id: "diag-c-2",
            name: "Apex Precision Imaging & Diagnostics",
            address: "88 University Ave, Suite 300, Metro City",
            distanceKm: 4.1,
            rating: 4.9,
            reviewCount: 185,
            contactNumber: "+1 (555) 890-1234",
            accreditation: "Joint Commission Gold Seal",
            openingHours: "Mon-Sun: 24/7"
        )
    ]

    public static let diagnosticTests: [DiagnosticTest] = [
        DiagnosticTest(
            id: "test-001",
            name: "Comprehensive Metabolic Panel (CMP)",
            code: "CMP-14",
            category: "Blood Tests",
            description: "Evaluates kidney and liver status, blood glucose, and electrolyte and fluid balance through 14 essential parameters.",
            price: 65,
            discountedPrice: 49,
            turnaroundTime: "12 Hours",
            preparationNotes: "Fasting required for 10-12 hours prior to sample collection. Water is permitted.",
            isHomeCollectionAvailable: true,
            fastingRequired: true,
            fastingHours: 12
        ),
        DiagnosticTest(
            id: "test-002",
            name: "Complete Lipid Panel with VLDL & Triglycerides",
            code: "LIPID-EXT",
            category: "Cardiology",
            description: "Measures total cholesterol, LDL (bad cholesterol), HDL (good cholesterol), and triglycerides to evaluate cardiovascular risk.",
            price: 55,
            discountedPrice: 42,
            turnaroundTime: "8 Hours",
            preparationNotes: "Strict 12-hour fast before blood draw.",
            isHomeCollectionAvailable: true,
            fastingRequired: true,
            fastingHours: 12
        ),
        DiagnosticTest(
            id: "test-003",
            name: "HbA1c Glycated Hemoglobin",
            code: "HBA1C",
            category: "Diabetes",
            description: "Reflects your average blood glucose levels over the preceding 2 to 3 months without requiring day-of fasting.",
            price: 45,
            discountedPrice: 35,
            turnaroundTime: "6 Hours",
            preparationNotes: "No fasting required.",
            isHomeCollectionAvailable: true,
            fastingRequired: false
        ),
        DiagnosticTest(
            id: "test-004",
            name: "High-Resolution Brain MRI with Contrast",
            code: "MRI-BRN-C",
            category: "Imaging",
            description: "3T MRI scanning providing detailed cross-sectional visualization of brain structures, cranial nerves, and blood vessels.",
            price: 450,
            discountedPrice: 380,
            turnaroundTime: "24 Hours",
            preparationNotes: "Remove all metallic objects, jewelry, and notify staff of any metal implants or pacemakers.",
            isHomeCollectionAvailable: false,
            fastingRequired: false
        )
    ]

    public static let diagnosticBookings: [DiagnosticBooking] = [
        DiagnosticBooking(
            id: "diag-b-1",
            bookingRef: "DB-2026-7819",
            centerId: "diag-c-1",
            centerName: "Metro Central PathLabs",
            testId: "test-001",
            testName: "Comprehensive Metabolic Panel (CMP)",
            collectionType: "HOME_COLLECTION",
            scheduledDate: "2026-11-02",
            scheduledTime: "08:00 AM",
            status: "BOOKED",
            price: 49,
            patientAddress: "742 Evergreen Terrace, Metro City"
        )
    ]

    // MARK: - Pharmacy
    public static let medicines: [Medicine] = [
        Medicine(
            id: "med-001",
            name: "Amoxicillin Trihydrate",
            genericName: "Amoxicillin",
            manufacturer: "Novartis Pharma",
            category: .antibiotic,
            price: 18.50,
            discountPrice: 14.80,
            dosageForm: "Capsules",
            strength: "500mg",
            inStock: true,
            stockCount: 150,
            requiresPrescription: true,
            description: "Broad-spectrum penicillin-type antibiotic used to treat bacterial infections of the ear, nose, throat, and lower respiratory tract.",
            sideEffects: ["Mild nausea", "Headache"],
            imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80"
        ),
        Medicine(
            id: "med-002",
            name: "Paracetamol Extra Relief",
            genericName: "Acetaminophen",
            manufacturer: "GSK Consumer Health",
            category: .analgesic,
            price: 9.20,
            discountPrice: 7.50,
            dosageForm: "Tablets",
            strength: "650mg",
            inStock: true,
            stockCount: 320,
            requiresPrescription: false,
            description: "Fast-acting analgesic and antipyretic for mild-to-moderate pain, headache, dental pain, and fever reduction.",
            sideEffects: ["Rare allergic rash"],
            imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&auto=format&fit=crop&q=80"
        ),
        Medicine(
            id: "med-003",
            name: "Atorvastatin Lipitor",
            genericName: "Atorvastatin Calcium",
            manufacturer: "Pfizer",
            category: .cardiology,
            price: 24.00,
            discountPrice: 19.50,
            dosageForm: "Tablets",
            strength: "20mg",
            inStock: true,
            stockCount: 88,
            requiresPrescription: true,
            description: "HMG-CoA reductase inhibitor (statin) that lowers LDL cholesterol and triglycerides in blood while elevating HDL.",
            sideEffects: ["Mild joint or muscle ache"],
            imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80"
        ),
        Medicine(
            id: "med-004",
            name: "Metformin Extended-Release",
            genericName: "Metformin HCl",
            manufacturer: "Merck Healthcare",
            category: .diabetes,
            price: 15.00,
            discountPrice: 12.00,
            dosageForm: "ER Tablets",
            strength: "500mg",
            inStock: true,
            stockCount: 140,
            requiresPrescription: true,
            description: "First-line oral anti-hyperglycemic agent for managing blood sugar levels in type 2 diabetes.",
            sideEffects: ["Mild GI disturbance"],
            imageUrl: "https://images.unsplash.com/photo-1550572017-ed24058d8442?w=300&auto=format&fit=crop&q=80"
        ),
        Medicine(
            id: "med-005",
            name: "Vitamin D3 5000 IU High Potency",
            genericName: "Cholecalciferol",
            manufacturer: "Nature's Bounty",
            category: .vitamins,
            price: 14.00,
            discountPrice: 11.20,
            dosageForm: "Softgels",
            strength: "5000 IU",
            inStock: true,
            stockCount: 200,
            requiresPrescription: false,
            description: "Supports bone mineral density, neuromuscular health, and immune system resilience with bioavailable Vitamin D3.",
            sideEffects: [],
            imageUrl: "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300&auto=format&fit=crop&q=80"
        ),
        Medicine(
            id: "med-006",
            name: "Emergency First Aid Trauma Kit",
            genericName: "First Aid Kit",
            manufacturer: "Johnson & Johnson",
            category: .firstAid,
            price: 35.00,
            discountPrice: 28.00,
            dosageForm: "Kit",
            strength: "120 Pieces",
            inStock: true,
            stockCount: 45,
            requiresPrescription: false,
            description: "Complete all-purpose trauma response pack containing sterile gauze, elastic wraps, antiseptic wipes, and burn dressing.",
            sideEffects: [],
            imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&auto=format&fit=crop&q=80"
        )
    ]

    public static let pharmacyOrders: [PharmacyOrder] = [
        PharmacyOrder(
            id: "ord-101",
            orderNumber: "HC-ORD-2026-9281",
            patientId: "usr-patient-001",
            items: [
                CartItem(medicine: medicines[1], quantity: 2),
                CartItem(medicine: medicines[4], quantity: 1)
            ],
            totalAmount: 26.20,
            discountAmount: 3.50,
            deliveryFee: 5.00,
            finalAmount: 27.70,
            deliveryAddress: "742 Evergreen Terrace, Metro City",
            prescriptionUploaded: false,
            status: "DELIVERED",
            paymentMethod: "CASH_ON_DELIVERY",
            createdAt: "2026-10-18T14:20:00Z",
            estimatedDeliveryTime: "Delivered on Oct 19, 2026",
            timeline: [
                OrderTimelineStep(status: "CREATED", timestamp: "2026-10-18T14:20:00Z", description: "Order placed by patient"),
                OrderTimelineStep(status: "CONFIRMED", timestamp: "2026-10-18T14:25:00Z", description: "Verified by pharmacy"),
                OrderTimelineStep(status: "DELIVERED", timestamp: "2026-10-19T10:15:00Z", description: "Package delivered")
            ]
        )
    ]

    // MARK: - Hospitals
    public static let hospitals: [Hospital] = [
        Hospital(
            id: "hosp-001",
            name: "Central Metro Super Specialty Hospital",
            distanceKm: 1.8,
            address: "500 Healthcare Blvd, Metro City",
            phone: "+1 (555) 100-2000",
            emergencyPhone: "+1 (555) 911-0001",
            rating: 4.9,
            specializations: ["Emergency & Trauma", "Cardiology", "Neurology", "Oncology", "Orthopedics"],
            hasEmergency: true,
            hasICU: true,
            bedAvailability: BedAvailability(
                icuAvailable: 6,
                icuTotal: 25,
                generalAvailable: 42,
                generalTotal: 150,
                emergencyAvailable: 8,
                emergencyTotal: 20
            )
        ),
        Hospital(
            id: "hosp-002",
            name: "St. Jude University Medical Center",
            distanceKm: 3.5,
            address: "120 University Avenue, Metro City",
            phone: "+1 (555) 200-3000",
            emergencyPhone: "+1 (555) 911-0002",
            rating: 4.8,
            specializations: ["Pediatrics", "Trauma Level 1", "Cardiothoracic Surgery", "Organ Transplant"],
            hasEmergency: true,
            hasICU: true,
            bedAvailability: BedAvailability(
                icuAvailable: 4,
                icuTotal: 30,
                generalAvailable: 31,
                generalTotal: 180,
                emergencyAvailable: 5,
                emergencyTotal: 24
            )
        ),
        Hospital(
            id: "hosp-003",
            name: "City West Community Care Hospital",
            distanceKm: 5.2,
            address: "780 Westside Pkwy, Metro City",
            phone: "+1 (555) 300-4000",
            emergencyPhone: "+1 (555) 911-0003",
            rating: 4.6,
            specializations: ["Internal Medicine", "General Surgery", "Maternity & Obstetrics"],
            hasEmergency: true,
            hasICU: false,
            bedAvailability: BedAvailability(
                icuAvailable: 0,
                icuTotal: 0,
                generalAvailable: 18,
                generalTotal: 60,
                emergencyAvailable: 4,
                emergencyTotal: 12
            )
        )
    ]

    // MARK: - Blood Banks
    public static let bloodBanks: [BloodBank] = [
        BloodBank(
            id: "bb-001",
            name: "Metro Central Regional Blood Center",
            distanceKm: 2.1,
            address: "320 Red Cross Way, Metro City",
            contactNumber: "+1 (555) 888-BLOOD",
            operatingHours: "24 Hours / 7 Days",
            isOpen24x7: true,
            inventory: [
                BloodInventory(bloodGroup: "A+", unitsAvailable: 24, status: "ADEQUATE"),
                BloodInventory(bloodGroup: "A-", unitsAvailable: 6, status: "LOW"),
                BloodInventory(bloodGroup: "B+", unitsAvailable: 18, status: "ADEQUATE"),
                BloodInventory(bloodGroup: "B-", unitsAvailable: 4, status: "LOW"),
                BloodInventory(bloodGroup: "O+", unitsAvailable: 32, status: "ADEQUATE"),
                BloodInventory(bloodGroup: "O-", unitsAvailable: 2, status: "CRITICAL"),
                BloodInventory(bloodGroup: "AB+", unitsAvailable: 10, status: "ADEQUATE"),
                BloodInventory(bloodGroup: "AB-", unitsAvailable: 1, status: "CRITICAL")
            ]
        ),
        BloodBank(
            id: "bb-002",
            name: "St. Jude LifeBank Donor Center",
            distanceKm: 3.5,
            address: "124 University Avenue, Metro City",
            contactNumber: "+1 (555) 777-9000",
            operatingHours: "Mon-Sat: 07:00 AM - 09:00 PM",
            isOpen24x7: false,
            inventory: [
                BloodInventory(bloodGroup: "O+", unitsAvailable: 15, status: "ADEQUATE"),
                BloodInventory(bloodGroup: "O-", unitsAvailable: 3, status: "LOW"),
                BloodInventory(bloodGroup: "A+", unitsAvailable: 12, status: "ADEQUATE"),
                BloodInventory(bloodGroup: "B+", unitsAvailable: 9, status: "ADEQUATE")
            ]
        )
    ]

    // MARK: - Notifications
    public static let notifications: [AppNotification] = [
        AppNotification(
            id: "notif-001",
            type: "AppointmentBooked",
            title: "Appointment Confirmed",
            message: "Your video consultation with Dr. Evelyn Reed is confirmed for Nov 5 at 10:00 AM.",
            read: false,
            createdAt: "2026-10-27T09:00:00Z"
        ),
        AppNotification(
            id: "notif-002",
            type: "LabReportReady",
            title: "Diagnostic Report Ready",
            message: "Your Comprehensive Metabolic Panel results from Metro Central PathLabs are now verified.",
            read: false,
            createdAt: "2026-10-26T16:30:00Z"
        ),
        AppNotification(
            id: "notif-003",
            type: "PrescriptionCreated",
            title: "New Prescription Issued",
            message: "Dr. Evelyn Reed has issued a prescription for Atorvastatin 20mg.",
            read: true,
            createdAt: "2026-10-25T11:15:00Z"
        ),
        AppNotification(
            id: "notif-004",
            type: "EmergencyRequestCreated",
            title: "Emergency Response Log",
            message: "Your demo emergency request was safely created and logged to your device.",
            read: true,
            createdAt: "2026-10-20T18:00:00Z"
        )
    ]

    // MARK: - Insurance
    public static let insurancePolicy = InsurancePolicy(
        id: "pol-1234",
        provider: "SecureHealth Insurance",
        plan: "Comprehensive Family Care",
        policyNumber: "XXXX-XXXX-9482",
        memberId: "MEM-XXXX-712",
        coverage: 500000,
        status: "ACTIVE",
        startDate: "2024-06-01",
        endDate: "2027-05-31",
        coverages: [
            InsuranceCoverageItem(name: "In-Patient Hospitalization", limit: "Up to Sum Insured ($500,000)", description: "Room rent, ICU, surgeon, operating theatre and nursing cover."),
            InsuranceCoverageItem(name: "Room Rent Allowance", limit: "Single Private Room", description: "1% of total sum insured per day."),
            InsuranceCoverageItem(name: "ICU Charges", limit: "No Limit", description: "Actual covered critical care expenses covered."),
            InsuranceCoverageItem(name: "Pre & Post Hospitalization", limit: "60 Days / 90 Days", description: "Consultations, medications and labs prior to admission and recovery."),
            InsuranceCoverageItem(name: "Day Care Surgeries", limit: "All Approved Procedures", description: "Medical treatments requiring under 24 hours hospitalization."),
            InsuranceCoverageItem(name: "Emergency Ambulance", limit: "$500 per hospitalization", description: "Road ambulance dispatch transport cover.")
        ]
    )

    public static let insuranceClaims: [InsuranceClaim] = [
        InsuranceClaim(
            id: "CLM-98213",
            hospital: "Central Metro Super Specialty Hospital",
            amount: 4500,
            approvedAmount: 4500,
            date: "2026-08-15",
            status: "APPROVED",
            type: "Cashless",
            description: "Emergency observation and intravenous medication for acute gastroenteritis."
        ),
        InsuranceClaim(
            id: "CLM-98401",
            hospital: "St. Jude University Medical Center",
            amount: 820,
            approvedAmount: 0,
            date: "2026-09-02",
            status: "UNDER_REVIEW",
            type: "Reimbursement",
            description: "Specialized neuromuscular diagnostics and MRI imaging."
        )
    ]

    // MARK: - NFC & Consents
    public static let nfcCredential = NfcCredential(
        id: "HC-8472-9123",
        status: "ACTIVE",
        issuedAt: "2025-10-15T10:00:00Z",
        lastUsedAt: "2026-09-08T14:30:00Z"
    )

    public static let providerConsents: [ProviderConsent] = [
        ProviderConsent(
            id: "consent-01",
            providerName: "Dr. Evelyn Reed",
            providerType: "Cardiologist (Central Metro Hospital)",
            accessScope: ["Medical Summary", "Prescriptions", "Lab Reports", "ECG Tracings"],
            grantedAt: "2026-09-01",
            expiresAt: "2027-09-01",
            status: "ACTIVE"
        ),
        ProviderConsent(
            id: "consent-02",
            providerName: "Metro Emergency Dispatch Services",
            providerType: "Emergency Medical Responder",
            accessScope: ["Critical Allergies", "Blood Group", "Current Medications", "Emergency Contacts"],
            grantedAt: "2026-08-15",
            expiresAt: "Permanent",
            status: "ACTIVE"
        )
    ]
}
