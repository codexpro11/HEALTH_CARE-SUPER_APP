import SwiftUI

private enum AppTab: Hashable {
    case home, care, records, emergency, profile
}

struct ContentView: View {
    @State private var selection: AppTab = .home

    var body: some View {
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
            ProfileScreen()
                .tabItem { Label("Profile", systemImage: "person.crop.circle") }
                .tag(AppTab.profile)
        }
        .background(HealthConnectStyle.canvas)
        .preferredColorScheme(.light)
    }
}

private struct HomeScreen: View {
    @Binding var selection: AppTab

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("HealthConnect")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(HealthConnectStyle.teal)
                            Text("Your care, connected")
                                .font(.largeTitle.bold())
                                .foregroundStyle(HealthConnectStyle.ink)
                        }
                        Spacer()
                        Image(systemName: "heart.text.square.fill")
                            .font(.system(size: 34))
                            .foregroundStyle(HealthConnectStyle.teal)
                            .accessibilityHidden(true)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Good health starts with a clear view.")
                            .font(.title3.bold())
                        Text("Find care, keep your records together, and manage your health services in one place.")
                            .font(.subheadline)
                            .foregroundStyle(HealthConnectStyle.muted)
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(HealthConnectStyle.teal.opacity(0.10), in: RoundedRectangle(cornerRadius: 18))

                    Text("Quick actions")
                        .font(.title2.bold())
                        .foregroundStyle(HealthConnectStyle.ink)
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ActionTile(title: "Find a doctor", subtitle: "Explore care options", icon: "stethoscope", color: HealthConnectStyle.teal) {
                            selection = .care
                        }
                        ActionTile(title: "Medical records", subtitle: "Your health documents", icon: "doc.text", color: .blue) {
                            selection = .records
                        }
                        ActionTile(title: "Appointments", subtitle: "Manage your visits", icon: "calendar", color: .purple) {
                            selection = .care
                        }
                        ActionTile(title: "Emergency SOS", subtitle: "Review emergency help", icon: "cross.circle", color: .red) {
                            selection = .emergency
                        }
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Upcoming appointment")
                            .font(.headline)
                            .foregroundStyle(HealthConnectStyle.ink)
                        EmptyState(icon: "calendar.badge.clock", title: "No appointments yet", message: "Your upcoming visits will appear here.")
                        Button {
                            selection = .care
                        } label: {
                            Label("Explore care", systemImage: "arrow.right")
                                .font(.subheadline.weight(.semibold))
                        }
                        .tint(HealthConnectStyle.teal)
                    }
                    .padding(16)
                    .cardSurface()

                    VStack(alignment: .leading, spacing: 8) {
                        Label("Your health stats", systemImage: "heart")
                            .font(.headline)
                        Text("Measurements will appear when you connect a supported health data source.")
                            .font(.subheadline)
                            .foregroundStyle(HealthConnectStyle.muted)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(16)
                    .cardSurface()
                }
                .padding(16)
            }
            .background(HealthConnectStyle.canvas.ignoresSafeArea())
            .toolbar(.hidden, for: .navigationBar)
        }
    }
}

private struct CareScreen: View {
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            List {
                Section {
                    TextField("Search doctors or specialties", text: $searchText)
                        .textInputAutocapitalization(.never)
                        .accessibilityLabel("Search doctors or specialties")
                }
                Section("Appointments") {
                    EmptyState(icon: "calendar", title: "No visits to show", message: "Appointments you book will appear here.")
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color.clear)
                }
                Section("Care services") {
                    Label("Doctors and specialists", systemImage: "stethoscope")
                    Label("Diagnostics and lab tests", systemImage: "testtube.2")
                    Label("Pharmacy", systemImage: "pills")
                    Label("Hospitals and blood banks", systemImage: "building.2")
                }
            }
            .scrollContentBackground(.hidden)
            .background(HealthConnectStyle.canvas)
            .navigationTitle("Care")
        }
    }
}

private struct RecordsScreen: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    EmptyState(icon: "doc.text", title: "Your records in one place", message: "Medical documents you add will be organized here.")
                        .padding(24)
                        .cardSurface()
                    Label("PDF, JPG and PNG documents", systemImage: "checkmark.shield")
                        .font(.subheadline)
                        .foregroundStyle(HealthConnectStyle.muted)
                }
                .padding(16)
            }
            .background(HealthConnectStyle.canvas)
            .navigationTitle("Medical records")
        }
    }
}

private struct EmergencyScreen: View {
    @State private var showReview = false

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20) {
                Image(systemName: "cross.circle.fill")
                    .font(.system(size: 54))
                    .foregroundStyle(.red)
                    .accessibilityHidden(true)
                Text("Emergency help")
                    .font(.largeTitle.bold())
                    .foregroundStyle(HealthConnectStyle.ink)
                Text("Review your request before sharing your location or asking for help.")
                    .font(.body)
                    .foregroundStyle(HealthConnectStyle.muted)
                Button {
                    showReview = true
                } label: {
                    Text("Review SOS request")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
                Text("This screen is a UI starter. It does not send an SOS or contact emergency services.")
                    .font(.footnote)
                    .foregroundStyle(HealthConnectStyle.muted)
                Spacer()
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(HealthConnectStyle.canvas)
            .navigationTitle("Emergency")
            .alert("SOS request review", isPresented: $showReview) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("No request was sent. Live SOS submission will be added with the authenticated backend integration.")
            }
        }
    }
}

private struct ProfileScreen: View {
    var body: some View {
        NavigationStack {
            List {
                Section {
                    Label("Personal details", systemImage: "person")
                    Label("Insurance", systemImage: "shield")
                    Label("Notifications", systemImage: "bell")
                    Label("Privacy and consent", systemImage: "hand.raised")
                }
                Section {
                    Text("Sign-in and account settings will be connected in a future iOS integration step.")
                        .font(.footnote)
                        .foregroundStyle(HealthConnectStyle.muted)
                }
            }
            .scrollContentBackground(.hidden)
            .background(HealthConnectStyle.canvas)
            .navigationTitle("Profile")
        }
    }
}

private struct ActionTile: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 12) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(color)
                Text(title)
                    .font(.headline)
                    .foregroundStyle(HealthConnectStyle.ink)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(HealthConnectStyle.muted)
            }
            .frame(maxWidth: .infinity, minHeight: 110, alignment: .leading)
            .padding(14)
            .background(.white, in: RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(HealthConnectStyle.border, lineWidth: 1))
            .contentShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}

private struct EmptyState: View {
    let icon: String
    let title: String
    let message: String

    var body: some View {
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

private extension View {
    func cardSurface() -> some View {
        background(.white, in: RoundedRectangle(cornerRadius: 16))
            .overlay(RoundedRectangle(cornerRadius: 16).stroke(HealthConnectStyle.border, lineWidth: 1))
    }
}
