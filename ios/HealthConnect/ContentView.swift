import SwiftUI

public enum AppTab: Hashable {
    case home, care, records, emergency, profile
}

public struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @State private var selection: AppTab = .home

    public init() {}

    public var body: some View {
        TabView(selection: $selection) {
            HomeScreen(selection: $selection)
                .tabItem { Label("Home", systemImage: "house") }
                .tag(AppTab.home)

            CareScreen()
                .tabItem { Label("Care", systemImage: "cross.case") }
                .tag(AppTab.care)

            RecordsScreen()
                .tabItem { Label("Records", systemImage: "doc.text") }
                .tag(AppTab.records)

            EmergencyScreen()
                .tabItem { Label("Emergency", systemImage: "cross.circle") }
                .tag(AppTab.emergency)
                .badge(appState.activeEmergency != nil ? "SOS" : nil)

            ProfileScreen()
                .tabItem { Label("Profile", systemImage: "person.crop.circle") }
                .tag(AppTab.profile)
                .badge(appState.unreadNotificationsCount > 0 ? "\(appState.unreadNotificationsCount)" : nil)
        }
        .background(HealthConnectStyle.canvas)
        .tint(HealthConnectStyle.teal)
        .preferredColorScheme(.light)
    }
}

// MARK: - Home Screen

public struct HomeScreen: View {
    @EnvironmentObject var appState: AppState
    @Binding var selection: AppTab

    @State private var appointmentToReschedule: Appointment? = nil
    @State private var showCancelPrompt = false
    @State private var cancelReasonText = ""

    public var upcomingAppointment: Appointment? {
        appState.appointments.first(where: { $0.status == .confirmed })
    }

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    // MARK: - Header
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Welcome back,")
                                .font(.subheadline)
                                .foregroundStyle(HealthConnectStyle.muted)
                            Text(appState.currentUser.fullName)
                                .font(.title.bold())
                                .foregroundStyle(HealthConnectStyle.ink)
                        }
                        Spacer()
                        AsyncImage(url: URL(string: appState.currentUser.avatarUrl ?? "")) { phase in
                            if let img = phase.image {
                                img.resizable().scaledToFill()
                            } else {
                                Image(systemName: "person.crop.circle.fill")
                                    .font(.system(size: 40))
                                    .foregroundStyle(HealthConnectStyle.teal)
                            }
                        }
                        .frame(width: 44, height: 44)
                        .clipShape(Circle())
                    }

                    // MARK: - Active Emergency Banner (If Active)
                    if let emergency = appState.activeEmergency {
                        Button {
                            selection = .emergency
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .font(.title2)
                                    .foregroundStyle(.white)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("EMERGENCY DISPATCH ACTIVE")
                                        .font(.subheadline.bold())
                                        .foregroundStyle(.white)
                                    Text("\(emergency.emergencyType) • Ambulance en route")
                                        .font(.caption)
                                        .foregroundStyle(.white.opacity(0.9))
                                }
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundStyle(.white)
                            }
                            .padding(14)
                            .background(Color.red, in: RoundedRectangle(cornerRadius: 16))
                        }
                    }

                    // MARK: - Promotional Hero Card
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text("Universal Healthcare Platform")
                                .font(.caption.bold())
                                .foregroundStyle(HealthConnectStyle.teal)
                            Spacer()
                            Text(appState.isDemoMode ? "DEMO MODE" : "LIVE CONNECTED")
                                .font(.caption2.bold())
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(HealthConnectStyle.teal.opacity(0.2), in: Capsule())
                                .foregroundStyle(HealthConnectStyle.teal)
                        }
                        Text("Unified Care, Consultations & Emergency Support")
                            .font(.headline)
                            .foregroundStyle(HealthConnectStyle.ink)
                        Text("Instant doctor visits, prescription medicine delivery, certified lab diagnostics, and encrypted health records.")
                            .font(.footnote)
                            .foregroundStyle(HealthConnectStyle.muted)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(HealthConnectStyle.teal.opacity(0.08), in: RoundedRectangle(cornerRadius: 16))

                    // MARK: - Quick Actions
                    Text("Quick services")
                        .font(.title3.bold())
                        .foregroundStyle(HealthConnectStyle.ink)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ActionTile(
                            title: "Find a Doctor",
                            subtitle: "Specialists & visits",
                            icon: "stethoscope",
                            color: HealthConnectStyle.teal
                        ) {
                            selection = .care
                        }

                        ActionTile(
                            title: "Medical Records",
                            subtitle: "\(appState.medicalRecords.count) documents saved",
                            icon: "doc.text.fill",
                            color: .blue
                        ) {
                            selection = .records
                        }

                        ActionTile(
                            title: "Pharmacy Store",
                            subtitle: "Medicines & refills",
                            icon: "pills.fill",
                            color: .purple
                        ) {
                            selection = .care
                        }

                        ActionTile(
                            title: "Emergency SOS",
                            subtitle: "Immediate dispatch",
                            icon: "cross.circle.fill",
                            color: .red
                        ) {
                            selection = .emergency
                        }
                    }

                    // MARK: - Upcoming Visit Card
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Upcoming Appointment")
                                .font(.headline)
                                .foregroundStyle(HealthConnectStyle.ink)
                            Spacer()
                            if upcomingAppointment != nil {
                                Text("Confirmed")
                                    .font(.caption2.bold())
                                    .padding(.horizontal, 6)
                                    .padding(.vertical, 2)
                                    .background(Color.green.opacity(0.15), in: Capsule())
                                    .foregroundStyle(.green)
                            }
                        }

                        if let apt = upcomingAppointment {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack(spacing: 12) {
                                    Image(systemName: apt.consultationType.icon)
                                        .font(.title2)
                                        .foregroundStyle(HealthConnectStyle.teal)
                                        .frame(width: 44, height: 44)
                                        .background(HealthConnectStyle.teal.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(apt.doctorName)
                                            .font(.subheadline.bold())
                                        Text(apt.doctorSpecialization + " • " + apt.hospitalName)
                                            .font(.caption)
                                            .foregroundStyle(HealthConnectStyle.muted)
                                    }
                                }

                                HStack(spacing: 16) {
                                    Label(apt.appointmentDate, systemImage: "calendar")
                                    Label(apt.appointmentTime, systemImage: "clock")
                                    Label(apt.consultationType.title, systemImage: apt.consultationType.icon)
                                }
                                .font(.caption2.bold())
                                .foregroundStyle(HealthConnectStyle.ink)

                                if let link = apt.meetingLink, apt.consultationType == .video {
                                    HStack {
                                        Image(systemName: "video.badge.waveform")
                                            .foregroundStyle(.blue)
                                        Text("Telehealth consultation room ready")
                                            .font(.caption2.bold())
                                            .foregroundStyle(.blue)
                                    }
                                }

                                Divider()

                                HStack {
                                    Button {
                                        appointmentToReschedule = apt
                                    } label: {
                                        Text("Reschedule")
                                            .font(.caption.bold())
                                    }
                                    .buttonStyle(.bordered)
                                    .tint(HealthConnectStyle.teal)

                                    Spacer()

                                    Button(role: .destructive) {
                                        showCancelPrompt = true
                                    } label: {
                                        Text("Cancel Visit")
                                            .font(.caption.bold())
                                    }
                                    .buttonStyle(.bordered)
                                    .tint(.red)
                                }
                            }
                        } else {
                            EmptyState(
                                icon: "calendar.badge.clock",
                                title: "No upcoming visits",
                                message: "When you book a doctor consultation, details will appear here."
                            )
                            Button {
                                selection = .care
                            } label: {
                                Label("Find doctors & book appointment", systemImage: "arrow.right")
                                    .font(.subheadline.weight(.semibold))
                            }
                            .tint(HealthConnectStyle.teal)
                        }
                    }
                    .padding(16)
                    .cardSurface()

                    // MARK: - Active Prescriptions Quick View
                    if let rx = appState.prescriptions.first(where: { $0.status == "ACTIVE" }) {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack {
                                Label("Active Medications", systemImage: "pill")
                                    .font(.headline)
                                Spacer()
                                Text("Valid till \(rx.validUntil.prefix(10))")
                                    .font(.caption2)
                                    .foregroundStyle(HealthConnectStyle.muted)
                            }

                            ForEach(rx.medications.prefix(2)) { med in
                                HStack {
                                    VStack(alignment: .leading, spacing: 1) {
                                        Text(med.name + " (" + med.dosage + ")")
                                            .font(.subheadline.bold())
                                        Text(med.frequency)
                                            .font(.caption2)
                                            .foregroundStyle(HealthConnectStyle.muted)
                                    }
                                    Spacer()
                                    Text("\(med.remainingRefills ?? 0) refills left")
                                        .font(.caption2.bold())
                                        .foregroundStyle(HealthConnectStyle.teal)
                                }
                                .padding(.vertical, 2)
                            }
                        }
                        .padding(16)
                        .cardSurface()
                    }

                    // MARK: - Health Vitals Summary
                    VStack(alignment: .leading, spacing: 12) {
                        Label("Health Metrics Summary", systemImage: "heart.text.square.fill")
                            .font(.headline)
                            .foregroundStyle(HealthConnectStyle.ink)

                        HStack(spacing: 12) {
                            MetricBox(title: "Heart Rate", value: "72 bpm", icon: "heart.fill", color: .red)
                            MetricBox(title: "Blood Pressure", value: "118/76", icon: "waveform.path.ecg", color: .blue)
                            MetricBox(title: "Glucose", value: "92 mg/dL", icon: "drop.fill", color: .orange)
                        }
                    }
                    .padding(16)
                    .cardSurface()
                }
                .padding(16)
            }
            .background(HealthConnectStyle.canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
            .sheet(item: $appointmentToReschedule) { apt in
                RescheduleAppointmentSheet(appointment: apt)
                    .environmentObject(appState)
            }
            .alert("Cancel Appointment", isPresented: $showCancelPrompt) {
                TextField("Reason for cancellation", text: $cancelReasonText)
                Button("Confirm Cancel", role: .destructive) {
                    if let apt = upcomingAppointment {
                        Task {
                            _ = await appState.cancelAppointment(
                                id: apt.id,
                                reason: cancelReasonText.isEmpty ? "Patient cancelled from home" : cancelReasonText
                            )
                            cancelReasonText = ""
                        }
                    }
                }
                Button("Keep Visit", role: .cancel) {}
            } message: {
                Text("Are you sure you want to cancel your upcoming appointment?")
            }
        }
    }
}

public struct MetricBox: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    public var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundStyle(color)
            Text(value)
                .font(.headline)
                .foregroundStyle(HealthConnectStyle.ink)
            Text(title)
                .font(.caption2)
                .foregroundStyle(HealthConnectStyle.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(HealthConnectStyle.canvas, in: RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Shared UI Components

public struct ActionTile: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let action: () -> Void

    public var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 10) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(color)
                    .frame(width: 40, height: 40)
                    .background(color.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))

                Text(title)
                    .font(.headline)
                    .foregroundStyle(HealthConnectStyle.ink)

                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(HealthConnectStyle.muted)
            }
            .frame(maxWidth: .infinity, minHeight: 110, alignment: .leading)
            .padding(14)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(HealthConnectStyle.border, lineWidth: 1))
            .contentShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}

public struct EmptyState: View {
    let icon: String
    let title: String
    let message: String

    public var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(HealthConnectStyle.teal)
            Text(title)
                .font(.headline)
                .foregroundStyle(HealthConnectStyle.ink)
            Text(message)
                .font(.subheadline)
                .foregroundStyle(HealthConnectStyle.muted)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .accessibilityElement(children: .combine)
    }
}

public extension View {
    func cardSurface() -> some View {
        background(Color.white, in: RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(HealthConnectStyle.border, lineWidth: 1))
    }
}
