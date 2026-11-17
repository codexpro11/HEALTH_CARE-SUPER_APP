import SwiftUI

public struct EmergencyScreen: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedEmergencyType = "Cardiac Arrest / Heart Attack"
    @State private var addressText = "742 Evergreen Terrace, Metro City"
    @State private var showConfirmDialog = false
    @State private var showCancelDialog = false
    @State private var cancelReason = ""
    @State private var isTriggering = false

    private let emergencyTypes = [
        "Cardiac Arrest / Heart Attack",
        "Severe Trauma / Road Accident",
        "Severe Breathing Difficulty",
        "Stroke Symptoms / Paralysis",
        "Severe Uncontrolled Bleeding",
        "Other Acute Emergency"
    ]

    public init() {}

    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    if let active = appState.activeEmergency {
                        // MARK: - Active Emergency Tracker
                        ActiveEmergencyCardView(
                            emergency: active,
                            onCancel: {
                                showCancelDialog = true
                            }
                        )
                    } else {
                        // MARK: - SOS Trigger Section
                        VStack(spacing: 16) {
                            // Pulsing SOS Trigger Button
                            VStack(spacing: 12) {
                                Button {
                                    showConfirmDialog = true
                                } label: {
                                    ZStack {
                                        Circle()
                                            .fill(Color.red.opacity(0.15))
                                            .frame(width: 170, height: 170)
                                        Circle()
                                            .fill(Color.red.opacity(0.35))
                                            .frame(width: 140, height: 140)
                                        Circle()
                                            .fill(Color.red)
                                            .frame(width: 110, height: 110)
                                            .shadow(color: .red.opacity(0.5), radius: 10, y: 5)
                                        VStack(spacing: 4) {
                                            Image(systemName: "cross.circle.fill")
                                                .font(.system(size: 38))
                                            Text("SOS")
                                                .font(.title2.bold())
                                        }
                                        .foregroundStyle(.white)
                                    }
                                }
                                .accessibilityLabel("Trigger Emergency SOS")

                                Text("Tap to dispatch emergency medical services")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(HealthConnectStyle.ink)
                                Text("Shares your real-time GPS coordinates, blood group (\(appState.currentUser.bloodGroup ?? "O+")) and emergency contacts.")
                                    .font(.caption)
                                    .foregroundStyle(HealthConnectStyle.muted)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 24)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.white, in: RoundedRectangle(cornerRadius: 20))
                            .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.red.opacity(0.3), lineWidth: 1))

                            // Emergency Type Selection
                            VStack(alignment: .leading, spacing: 10) {
                                Text("Select Emergency Nature")
                                    .font(.headline)
                                    .foregroundStyle(HealthConnectStyle.ink)

                                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                                    ForEach(emergencyTypes, id: \.self) { type in
                                        Button {
                                            selectedEmergencyType = type
                                        } label: {
                                            Text(type)
                                                .font(.caption.weight(.semibold))
                                                .multilineTextAlignment(.center)
                                                .frame(maxWidth: .infinity, minHeight: 44)
                                                .padding(6)
                                                .background(selectedEmergencyType == type ? Color.red : Color.white)
                                                .foregroundStyle(selectedEmergencyType == type ? Color.white : HealthConnectStyle.ink)
                                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(selectedEmergencyType == type ? Color.red : HealthConnectStyle.border, lineWidth: 1))
                                        }
                                    }
                                }
                            }

                            // Location Information
                            VStack(alignment: .leading, spacing: 10) {
                                Label("Incident Location", systemImage: "location.fill")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(HealthConnectStyle.teal)

                                HStack {
                                    Image(systemName: "mappin.and.ellipse")
                                        .foregroundStyle(.red)
                                    TextField("Enter or verify incident address", text: $addressText)
                                        .font(.subheadline)
                                }
                                .padding(12)
                                .background(Color.white, in: RoundedRectangle(cornerRadius: 12))
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(HealthConnectStyle.border, lineWidth: 1))

                                HStack {
                                    Image(systemName: "antenna.radiowaves.left.and.right")
                                        .font(.caption)
                                        .foregroundStyle(.green)
                                    Text("GPS Coordinates: 37.7749° N, 122.4194° W (Accuracy: ±10m)")
                                        .font(.caption2)
                                        .foregroundStyle(HealthConnectStyle.muted)
                                }
                            }
                        }
                    }

                    // Emergency History Section
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Emergency Event History")
                            .font(.headline)
                            .foregroundStyle(HealthConnectStyle.ink)

                        if appState.emergencyHistory.isEmpty {
                            Text("No past emergency requests recorded on this device.")
                                .font(.footnote)
                                .foregroundStyle(HealthConnectStyle.muted)
                                .padding(.vertical, 8)
                        } else {
                            ForEach(appState.emergencyHistory) { req in
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack {
                                        Text(req.emergencyType)
                                            .font(.subheadline.bold())
                                        Spacer()
                                        StatusBadgeView(status: req.status)
                                    }
                                    Text(req.address)
                                        .font(.caption)
                                        .foregroundStyle(HealthConnectStyle.muted)
                                    HStack {
                                        Text("Date: \(req.createdAt.prefix(10))")
                                        Spacer()
                                        if let cancelReason = req.cancellationReason {
                                            Text("Reason: \(cancelReason)").foregroundStyle(.red)
                                        }
                                    }
                                    .font(.caption2)
                                    .foregroundStyle(HealthConnectStyle.muted)
                                }
                                .padding(12)
                                .background(Color.white, in: RoundedRectangle(cornerRadius: 12))
                                .overlay(RoundedRectangle(cornerRadius: 12).stroke(HealthConnectStyle.border, lineWidth: 1))
                            }
                        }
                    }
                }
                .padding(16)
            }
            .background(HealthConnectStyle.canvas)
            .navigationTitle("Emergency SOS")
            .confirmationDialog(
                "Confirm Emergency Dispatch",
                isPresented: $showConfirmDialog,
                titleVisibility: .visible
            ) {
                Button("Dispatch Immediate Medical Help", role: .destructive) {
                    Task {
                        isTriggering = true
                        _ = await appState.triggerEmergency(
                            emergencyType: selectedEmergencyType,
                            address: addressText
                        )
                        isTriggering = false
                    }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This will immediately send your location, medical profile and contacts to emergency dispatch.")
            }
            .alert("Cancel Emergency Dispatch", isPresented: $showCancelDialog) {
                TextField("Cancellation reason (e.g. Created in error)", text: $cancelReason)
                Button("Confirm Cancel", role: .destructive) {
                    if let id = appState.activeEmergency?.id {
                        Task {
                            _ = await appState.cancelEmergency(
                                id: id,
                                reason: cancelReason.isEmpty ? "Created in error" : cancelReason
                            )
                            cancelReason = ""
                        }
                    }
                }
                Button("Keep Help Coming", role: .cancel) {}
            } message: {
                Text("Are you sure you want to cancel the emergency response?")
            }
        }
    }
}

// MARK: - Active Emergency Card View

public struct ActiveEmergencyCardView: View {
    let emergency: EmergencyRequest
    let onCancel: () -> Void

    public var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            // Live Status Banner
            HStack {
                Circle()
                    .fill(Color.red)
                    .frame(width: 12, height: 12)
                Text("LIVE DISPATCH: \(emergency.status)")
                    .font(.headline)
                    .foregroundStyle(.red)
                Spacer()
                Text("ETA ~\(emergency.etaMinutes ?? 8) mins")
                    .font(.subheadline.bold())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.red.opacity(0.12), in: Capsule())
                    .foregroundStyle(.red)
            }

            Text("Nature: \(emergency.emergencyType)")
                .font(.subheadline.weight(.semibold))

            Text("Incident Location: \(emergency.address)")
                .font(.caption)
                .foregroundStyle(HealthConnectStyle.muted)

            // Assigned Ambulance Card
            if let amb = emergency.ambulance {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Image(systemName: "cross.fill")
                            .foregroundStyle(.red)
                        Text("Ambulance Dispatched: \(amb.vehicleNumber)")
                            .font(.subheadline.bold())
                    }
                    Text("Paramedic: \(amb.paramedicName) • \(amb.assignedHospital)")
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.muted)

                    if let phoneURL = URL(string: "tel:\(amb.paramedicContact.filter { $0.isNumber })") {
                        Link(destination: phoneURL) {
                            Label("Call Paramedic: \(amb.paramedicContact)", systemImage: "phone.fill")
                                .font(.caption.bold())
                                .foregroundStyle(HealthConnectStyle.teal)
                        }
                        .padding(.top, 2)
                    }
                }
                .padding(12)
                .background(Color.red.opacity(0.06), in: RoundedRectangle(cornerRadius: 12))
            }

            // Nearby Emergency Hospitals
            if !emergency.nearbyHospitals.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Receiving Emergency Centers Alerted:")
                        .font(.caption.bold())
                        .foregroundStyle(HealthConnectStyle.muted)

                    ForEach(emergency.nearbyHospitals) { hosp in
                        HStack {
                            VStack(alignment: .leading, spacing: 1) {
                                Text(hosp.name).font(.caption.bold())
                                Text("\(String(format: "%.1f", hosp.distanceKm)) km away • Emergency Beds: \(hosp.emergencyBeds)")
                                    .font(.caption2)
                                    .foregroundStyle(HealthConnectStyle.muted)
                            }
                            Spacer()
                            if let phoneURL = URL(string: "tel:\(hosp.phone.filter { $0.isNumber })") {
                                Link(destination: phoneURL) {
                                    Image(systemName: "phone.circle.fill")
                                        .font(.title3)
                                        .foregroundStyle(.red)
                                }
                            }
                        }
                        .padding(.vertical, 2)
                    }
                }
            }

            Divider()

            Button(role: .destructive, action: onCancel) {
                HStack {
                    Image(systemName: "xmark.octagon.fill")
                    Text("Cancel Emergency Response")
                }
                .font(.subheadline.bold())
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.red.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                .foregroundStyle(.red)
            }
        }
        .padding(16)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.red, lineWidth: 2))
    }
}
