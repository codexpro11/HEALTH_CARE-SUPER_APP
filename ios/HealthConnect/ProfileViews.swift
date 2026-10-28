import SwiftUI

public struct ProfileScreen: View {
    @EnvironmentObject var appState: AppState

    @State private var showEditProfileSheet = false
    @State private var showInsuranceSheet = false
    @State private var showInboxSheet = false
    @State private var showNfcSheet = false
    @State private var showSettingsSheet = false

    public init() {}

    public var body: some View {
        NavigationStack {
            List {
                // MARK: - User Header
                Section {
                    HStack(spacing: 16) {
                        AsyncImage(url: URL(string: appState.currentUser.avatarUrl ?? "")) { phase in
                            if let img = phase.image {
                                img.resizable().scaledToFill()
                            } else {
                                Image(systemName: "person.crop.circle.fill")
                                    .font(.system(size: 64))
                                    .foregroundStyle(HealthConnectStyle.teal)
                            }
                        }
                        .frame(width: 64, height: 64)
                        .clipShape(Circle())

                        VStack(alignment: .leading, spacing: 4) {
                            Text(appState.currentUser.fullName)
                                .font(.title3.bold())
                                .foregroundStyle(HealthConnectStyle.ink)

                            Text(appState.currentUser.email)
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.muted)

                            HStack(spacing: 6) {
                                Text(appState.currentUser.role.rawValue)
                                    .font(.caption2.bold())
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(HealthConnectStyle.teal.opacity(0.15), in: Capsule())
                                    .foregroundStyle(HealthConnectStyle.teal)

                                if let bg = appState.currentUser.bloodGroup {
                                    Text("Blood: \(bg)")
                                        .font(.caption2.bold())
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color.red.opacity(0.12), in: Capsule())
                                        .foregroundStyle(.red)
                                }
                            }
                        }

                        Spacer()

                        Button {
                            showEditProfileSheet = true
                        } label: {
                            Image(systemName: "pencil.circle.fill")
                                .font(.title2)
                                .foregroundStyle(HealthConnectStyle.teal)
                        }
                    }
                    .padding(.vertical, 4)
                }

                // MARK: - Demo Personas Switcher
                Section("Demo Personas") {
                    Picker("Active Profile", selection: $appState.selectedPersona) {
                        Text("Sarah Jenkins (Patient)").tag("Sarah Jenkins (Patient)")
                        Text("Dr. Evelyn Reed (Doctor)").tag("Dr. Evelyn Reed (Doctor)")
                        Text("John Doe (Patient 2)").tag("John Doe (Patient 2)")
                    }
                    .pickerStyle(.menu)
                    .onChange(of: appState.selectedPersona) { newValue in
                        appState.switchPersona(newValue)
                    }
                }

                // MARK: - Core Features Menu
                Section("Health & Services") {
                    // Inbox / Notifications
                    Button {
                        showInboxSheet = true
                    } label: {
                        HStack {
                            Label("Inbox & Notifications", systemImage: "bell.fill")
                                .foregroundStyle(HealthConnectStyle.ink)
                            Spacer()
                            if appState.unreadNotificationsCount > 0 {
                                Text("\(appState.unreadNotificationsCount) new")
                                    .font(.caption2.bold())
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 2)
                                    .background(Color.red, in: Capsule())
                            }
                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                    }

                    // Insurance & Claims
                    Button {
                        showInsuranceSheet = true
                    } label: {
                        HStack {
                            Label("Insurance & Claims", systemImage: "shield.fill")
                                .foregroundStyle(HealthConnectStyle.ink)
                            Spacer()
                            Text("Active Policy")
                                .font(.caption)
                                .foregroundStyle(.green)
                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                    }

                    // NFC Health Card
                    Button {
                        showNfcSheet = true
                    } label: {
                        HStack {
                            Label("NFC Digital Health Card", systemImage: "wave.3.forward.circle.fill")
                                .foregroundStyle(HealthConnectStyle.ink)
                            Spacer()
                            Text(appState.nfcCredentials.first?.status ?? "Issued")
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.teal)
                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                    }

                    // Backend Connection & Settings
                    Button {
                        showSettingsSheet = true
                    } label: {
                        HStack {
                            Label("Server & Network Settings", systemImage: "network")
                                .foregroundStyle(HealthConnectStyle.ink)
                            Spacer()
                            Text(appState.isDemoMode ? "Demo Mode" : "Live API")
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.muted)
                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                    }
                }

                // MARK: - Allergies & Conditions Preview
                if let allergies = appState.currentUser.allergies, !allergies.isEmpty {
                    Section("Recorded Allergies") {
                        ForEach(allergies, id: \.self) { allergy in
                            HStack {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundStyle(.orange)
                                Text(allergy)
                                    .font(.subheadline)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle("Profile")
            .sheet(isPresented: $showEditProfileSheet) {
                EditProfileSheet()
                    .environmentObject(appState)
            }
            .sheet(isPresented: $showInsuranceSheet) {
                InsuranceDashboardSheet()
                    .environmentObject(appState)
            }
            .sheet(isPresented: $showInboxSheet) {
                InboxNotificationsSheet()
                    .environmentObject(appState)
            }
            .sheet(isPresented: $showNfcSheet) {
                NfcCardSheet()
                    .environmentObject(appState)
            }
            .sheet(isPresented: $showSettingsSheet) {
                NetworkSettingsSheet()
                    .environmentObject(appState)
            }
        }
    }
}

// MARK: - Edit Profile Sheet

public struct EditProfileSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var fullName: String = ""
    @State private var phone: String = ""
    @State private var bloodGroup: String = ""
    @State private var street: String = ""
    @State private var city: String = ""
    @State private var emergencyName: String = ""
    @State private var emergencyPhone: String = ""

    public var body: some View {
        NavigationStack {
            Form {
                Section("Personal Details") {
                    TextField("Full Name", text: $fullName)
                    TextField("Phone Number", text: $phone)
                    TextField("Blood Group (e.g. O+, A-)", text: $bloodGroup)
                }

                Section("Residential Address") {
                    TextField("Street Address", text: $street)
                    TextField("City", text: $city)
                }

                Section("Emergency Contact") {
                    TextField("Contact Name", text: $emergencyName)
                    TextField("Contact Phone", text: $emergencyPhone)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                fullName = appState.currentUser.fullName
                phone = appState.currentUser.phoneNumber
                bloodGroup = appState.currentUser.bloodGroup ?? ""
                street = appState.currentUser.address?.street ?? ""
                city = appState.currentUser.address?.city ?? ""
                emergencyName = appState.currentUser.emergencyContact?.name ?? ""
                emergencyPhone = appState.currentUser.emergencyContact?.phone ?? ""
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        appState.currentUser.fullName = fullName
                        appState.currentUser.phoneNumber = phone
                        appState.currentUser.bloodGroup = bloodGroup.isEmpty ? nil : bloodGroup
                        if appState.currentUser.address == nil {
                            appState.currentUser.address = UserAddress()
                        }
                        appState.currentUser.address?.street = street
                        appState.currentUser.address?.city = city

                        if appState.currentUser.emergencyContact == nil {
                            appState.currentUser.emergencyContact = EmergencyContact()
                        }
                        appState.currentUser.emergencyContact?.name = emergencyName
                        appState.currentUser.emergencyContact?.phone = emergencyPhone

                        Task {
                            _ = try? await APIService.shared.updateCurrentUser(updates: appState.currentUser)
                        }
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Insurance Dashboard Sheet

public struct InsuranceDashboardSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var showNewClaimSheet = false

    public var body: some View {
        NavigationStack {
            List {
                // Active Policy Card
                if let policy = appState.insurancePolicies.first {
                    Section("Active Policy") {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Text(policy.provider)
                                    .font(.headline)
                                Spacer()
                                StatusBadgeView(status: policy.status)
                            }
                            Text(policy.plan)
                                .font(.subheadline)
                                .foregroundStyle(HealthConnectStyle.teal)

                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Policy Number").font(.caption2).foregroundStyle(HealthConnectStyle.muted)
                                    Text(policy.policyNumber).font(.caption.bold())
                                }
                                Spacer()
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text("Member ID").font(.caption2).foregroundStyle(HealthConnectStyle.muted)
                                    Text(policy.memberId).font(.caption.bold())
                                }
                            }

                            Divider()

                            HStack {
                                Text("Total Sum Insured")
                                Spacer()
                                Text("$\(Int(policy.coverage))")
                                    .font(.headline)
                                    .foregroundStyle(HealthConnectStyle.ink)
                            }

                            Text("Coverage: \(policy.startDate) to \(policy.endDate)")
                                .font(.caption2)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                        .padding(.vertical, 4)
                    }

                    Section("Coverage Benefits") {
                        ForEach(policy.coverages, id: \.name) { cov in
                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    Text(cov.name).font(.subheadline.bold())
                                    Spacer()
                                    Text(cov.limit).font(.caption.bold()).foregroundStyle(HealthConnectStyle.teal)
                                }
                                Text(cov.description)
                                    .font(.caption2)
                                    .foregroundStyle(HealthConnectStyle.muted)
                            }
                            .padding(.vertical, 2)
                        }
                    }
                }

                // Claims Section
                Section("Filed Claims (\(appState.insuranceClaims.count))") {
                    ForEach(appState.insuranceClaims) { claim in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(claim.hospital)
                                    .font(.subheadline.bold())
                                Spacer()
                                StatusBadgeView(status: claim.status)
                            }
                            HStack {
                                Text("Claim ID: \(claim.id) • \(claim.type)")
                                    .font(.caption2)
                                    .foregroundStyle(HealthConnectStyle.muted)
                                Spacer()
                                Text("Amount: $\(Int(claim.amount))")
                                    .font(.caption.bold())
                            }
                            if let desc = claim.description {
                                Text(desc)
                                    .font(.caption2)
                                    .foregroundStyle(HealthConnectStyle.muted)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("Health Insurance")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showNewClaimSheet = true
                    } label: {
                        Label("File Claim", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $showNewClaimSheet) {
                FileClaimSheet()
                    .environmentObject(appState)
            }
        }
    }
}

public struct FileClaimSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var hospital = "Central Metro Super Specialty Hospital"
    @State private var amount = "1200"
    @State private var claimType = "Cashless"
    @State private var description = "Outpatient diagnostic imaging and specialized consultation."
    @State private var isSubmitting = false
    @State private var showSuccess = false

    public var body: some View {
        NavigationStack {
            Form {
                Section("Claim Information") {
                    TextField("Hospital / Clinic Name", text: $hospital)
                    TextField("Claim Amount ($)", text: $amount)
                        .keyboardType(.decimalPad)
                    Picker("Claim Mode", selection: $claimType) {
                        Text("Cashless Network Claim").tag("Cashless")
                        Text("Direct Reimbursement").tag("Reimbursement")
                    }
                    .pickerStyle(.segmented)
                }

                Section("Medical Justification") {
                    TextField("Reason and treatment details", text: $description)
                }
            }
            .navigationTitle("File Insurance Claim")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Submit") {
                        Task {
                            isSubmitting = true
                            let amtVal = Double(amount) ?? 500.0
                            let ok = await appState.submitInsuranceClaim(
                                hospital: hospital,
                                amount: amtVal,
                                claimType: claimType,
                                description: description
                            )
                            isSubmitting = false
                            if ok {
                                showSuccess = true
                            }
                        }
                    }
                    .disabled(isSubmitting)
                }
            }
            .alert("Claim Submitted!", isPresented: $showSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your claim draft has been securely submitted for insurer pre-authorization.")
            }
        }
    }
}

// MARK: - Inbox & Notifications Sheet

public struct InboxNotificationsSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var unreadOnly = false

    public var filteredNotifications: [AppNotification] {
        if unreadOnly {
            return appState.notifications.filter { !$0.read }
        }
        return appState.notifications
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                HStack {
                    Toggle("Unread Only", isOn: $unreadOnly)
                        .font(.subheadline)
                    Spacer()
                    Button("Mark All as Read") {
                        Task {
                            await appState.markAllNotificationsRead()
                        }
                    }
                    .font(.caption.bold())
                    .tint(HealthConnectStyle.teal)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.white)

                List {
                    if filteredNotifications.isEmpty {
                        Text("No notifications to show.")
                            .font(.subheadline)
                            .foregroundStyle(HealthConnectStyle.muted)
                    } else {
                        ForEach(filteredNotifications) { item in
                            HStack(alignment: .top, spacing: 12) {
                                Image(systemName: iconForType(item.type))
                                    .font(.title3)
                                    .foregroundStyle(item.type.contains("Emergency") ? .red : HealthConnectStyle.teal)
                                    .frame(width: 28)

                                VStack(alignment: .leading, spacing: 3) {
                                    HStack {
                                        Text(item.title)
                                            .font(.subheadline.bold())
                                            .foregroundStyle(HealthConnectStyle.ink)
                                        Spacer()
                                        if !item.read {
                                            Circle()
                                                .fill(HealthConnectStyle.teal)
                                                .frame(width: 8, height: 8)
                                        }
                                    }
                                    Text(item.message)
                                        .font(.caption)
                                        .foregroundStyle(HealthConnectStyle.muted)
                                    Text(item.createdAt.prefix(10))
                                        .font(.caption2)
                                        .foregroundStyle(HealthConnectStyle.muted)
                                }
                            }
                            .padding(.vertical, 4)
                            .contentShape(Rectangle())
                            .onTapGesture {
                                Task {
                                    await appState.markNotificationRead(id: item.id)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Inbox Notifications")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func iconForType(_ type: String) -> String {
        switch type {
        case "AppointmentBooked", "AppointmentCancelled": return "calendar"
        case "PrescriptionCreated": return "pill.fill"
        case "LabReportReady": return "testtube.2"
        case "MedicineOrderShipped": return "box.truck.fill"
        case "EmergencyRequestCreated", "EmergencyRequestCancelled": return "cross.circle.fill"
        default: return "bell.fill"
        }
    }
}

// MARK: - NFC Digital Health Card Sheet

public struct NfcCardSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var isSimulatingScan = false
    @State private var scanResultText = ""
    @State private var showScanModal = false

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Virtual Digital Health Card Graphic
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("HealthConnect")
                                    .font(.headline.bold())
                                    .foregroundStyle(.white)
                                Text("Universal NFC Health Identifier")
                                    .font(.caption2)
                                    .foregroundStyle(.white.opacity(0.8))
                            }
                            Spacer()
                            Image(systemName: "wave.3.forward.circle.fill")
                                .font(.title)
                                .foregroundStyle(.white)
                        }

                        Spacer()

                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(appState.currentUser.fullName.uppercased())
                                    .font(.subheadline.bold())
                                    .foregroundStyle(.white)
                                Text(appState.nfcCredentials.first?.id ?? "HC-8472-••••-9123")
                                    .font(.caption2.monospaced())
                                    .foregroundStyle(.white.opacity(0.85))
                            }
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text("BLOOD GROUP")
                                    .font(.caption2)
                                    .foregroundStyle(.white.opacity(0.7))
                                Text(appState.currentUser.bloodGroup ?? "O+")
                                    .font(.headline.bold())
                                    .foregroundStyle(.white)
                            }
                        }
                    }
                    .padding(20)
                    .frame(height: 200)
                    .background(
                        LinearGradient(
                            colors: [HealthConnectStyle.teal, Color(red: 0.05, green: 0.35, blue: 0.45)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        in: RoundedRectangle(cornerRadius: 20)
                    )
                    .shadow(color: HealthConnectStyle.teal.opacity(0.3), radius: 10, y: 5)
                    .padding(.horizontal, 16)

                    // Card Actions
                    VStack(spacing: 10) {
                        Button {
                            Task {
                                await appState.issueNewNfcCard()
                            }
                        } label: {
                            HStack {
                                Image(systemName: "arrow.clockwise.circle")
                                Text("Replace / Issue New Card ID")
                            }
                            .font(.subheadline.bold())
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(HealthConnectStyle.teal, in: RoundedRectangle(cornerRadius: 12))
                            .foregroundStyle(.white)
                        }

                        Button(role: .destructive) {
                            if let id = appState.nfcCredentials.first?.id {
                                Task {
                                    await appState.revokeNfcCard(id: id)
                                }
                            }
                        } label: {
                            HStack {
                                Image(systemName: "lock.shield")
                                Text("Revoke Digital Card Access")
                            }
                            .font(.subheadline.bold())
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.red.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
                            .foregroundStyle(.red)
                        }
                    }
                    .padding(.horizontal, 16)

                    // Local 1-Hour Consent Toggle
                    VStack(alignment: .leading, spacing: 8) {
                        Toggle("One-Hour Emergency Access Consent", isOn: $appState.localConsentGranted)
                            .font(.subheadline.bold())
                        Text("Allows verified healthcare providers and EMT personnel to scan your NFC card and view critical allergies and emergency contacts.")
                            .font(.caption)
                            .foregroundStyle(HealthConnectStyle.muted)
                    }
                    .padding(14)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(HealthConnectStyle.border, lineWidth: 1))
                    .padding(.horizontal, 16)

                    // Doctor Scan Simulation
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Healthcare Provider Simulator")
                            .font(.headline)
                        Text("Simulate a doctor or emergency responder tapping an NFC terminal against this device.")
                            .font(.caption)
                            .foregroundStyle(HealthConnectStyle.muted)

                        Button {
                            isSimulatingScan = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                                isSimulatingScan = false
                                if appState.localConsentGranted && !appState.nfcCredentials.isEmpty {
                                    scanResultText = "Access Authorized!\n\nPatient: \(appState.currentUser.fullName)\nBlood Group: \(appState.currentUser.bloodGroup ?? "O+")\nEmergency Contact: \(appState.currentUser.emergencyContact?.name ?? "David Jenkins") (\(appState.currentUser.emergencyContact?.phone ?? "+1-555-876-5432"))\nRecords Verified: \(appState.medicalRecords.count) active documents."
                                } else {
                                    scanResultText = "Access Rejected: Local consent is disabled or card was revoked."
                                }
                                showScanModal = true
                            }
                        } label: {
                            HStack {
                                if isSimulatingScan {
                                    ProgressView().tint(HealthConnectStyle.teal)
                                } else {
                                    Image(systemName: "wave.3.right")
                                    Text("Simulate Provider Terminal Scan")
                                }
                            }
                            .font(.subheadline.bold())
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                            .background(Color.white, in: RoundedRectangle(cornerRadius: 12))
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(HealthConnectStyle.teal, lineWidth: 1))
                            .foregroundStyle(HealthConnectStyle.teal)
                        }
                    }
                    .padding(14)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(HealthConnectStyle.border, lineWidth: 1))
                    .padding(.horizontal, 16)
                }
                .padding(.vertical, 16)
            }
            .background(HealthConnectStyle.canvas)
            .navigationTitle("NFC Health Card")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("NFC Provider Scan", isPresented: $showScanModal) {
                Button("OK") {}
            } message: {
                Text(scanResultText)
            }
        }
    }
}

// MARK: - Network Settings Sheet

public struct NetworkSettingsSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    public var body: some View {
        NavigationStack {
            Form {
                Section("API Mode") {
                    Toggle("Offline Demo Mode", isOn: $appState.isDemoMode)
                    Text("In Demo Mode, network calls safely fall back to realistic mock datasets and local state.")
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.muted)
                }

                Section("Spring Boot Backend URL") {
                    TextField("API Base URL", text: $appState.apiBaseURL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled(true)

                    Button("Test Server Connection") {
                        Task {
                            await appState.testBackendConnection()
                        }
                    }
                    .font(.subheadline.bold())
                    .tint(HealthConnectStyle.teal)

                    Text("Status: \(appState.backendStatusText)")
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.muted)
                }

                Section("Connected Endpoints") {
                    Text("• Auth: /api/v1/auth/login, register, me\n• Users: /api/v1/users/me\n• Doctors: /api/v1/doctors, /api/v1/appointments\n• Diagnostics: /api/v1/diagnostics/centers, /tests, /bookings\n• Pharmacy: /api/v1/pharmacy/medicines, /orders\n• Records: /api/v1/medical-records, /prescriptions\n• Emergency SOS: /api/v1/emergency/sos, /active\n• Notifications: /api/v1/notifications\n• Hospitals: /api/v1/hospitals, /api/v1/blood-banks\n• Insurance: /api/v1/insurance/policies, /claims\n• NFC: /api/v1/nfc/access, /credentials")
                        .font(.caption2.monospaced())
                        .foregroundStyle(HealthConnectStyle.muted)
                }
            }
            .navigationTitle("Network Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}
