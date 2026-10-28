import SwiftUI

public enum CareTabSelection: String, CaseIterable, Identifiable {
    case doctors = "Doctors"
    case diagnostics = "Diagnostics"
    case pharmacy = "Pharmacy"
    case facilities = "Hospitals & Blood Banks"

    public var id: String { rawValue }

    public var icon: String {
        switch self {
        case .doctors: return "stethoscope"
        case .diagnostics: return "testtube.2"
        case .pharmacy: return "pills"
        case .facilities: return "building.2"
        }
    }
}

public struct CareScreen: View {
    @EnvironmentObject var appState: AppState
    @State private var careTab: CareTabSelection = .doctors
    @State private var showAppointmentsSheet = false
    @State private var showCartSheet = false

    public init() {}

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Care segmented bar
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(CareTabSelection.allCases) { tab in
                            Button {
                                careTab = tab
                            } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: tab.icon)
                                    Text(tab.rawValue)
                                        .font(.subheadline.weight(.semibold))
                                }
                                .padding(.vertical, 8)
                                .padding(.horizontal, 14)
                                .background(careTab == tab ? HealthConnectStyle.teal : Color.white)
                                .foregroundStyle(careTab == tab ? Color.white : HealthConnectStyle.ink)
                                .clipShape(Capsule())
                                .overlay(Capsule().stroke(careTab == tab ? Color.clear : HealthConnectStyle.border, lineWidth: 1))
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                }
                .background(HealthConnectStyle.canvas)

                // Sub-screen content
                Group {
                    switch careTab {
                    case .doctors:
                        DoctorsCareView(showAppointmentsSheet: $showAppointmentsSheet)
                    case .diagnostics:
                        DiagnosticsCareView()
                    case .pharmacy:
                        PharmacyCareView(showCartSheet: $showCartSheet)
                    case .facilities:
                        FacilitiesCareView()
                    }
                }
            }
            .background(HealthConnectStyle.canvas)
            .navigationTitle("Care")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    HStack(spacing: 12) {
                        if careTab == .doctors {
                            Button {
                                showAppointmentsSheet = true
                            } label: {
                                Label("My Visits", systemImage: "calendar")
                                    .font(.subheadline.weight(.medium))
                            }
                        } else if careTab == .pharmacy {
                            Button {
                                showCartSheet = true
                            } label: {
                                ZStack(alignment: .topTrailing) {
                                    Image(systemName: "cart.fill")
                                        .font(.title3)
                                    if appState.cartItemCount > 0 {
                                        Text("\(appState.cartItemCount)")
                                            .font(.caption2.bold())
                                            .foregroundStyle(.white)
                                            .padding(4)
                                            .background(Color.red, in: Circle())
                                            .offset(x: 8, y: -8)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .sheet(isPresented: $showAppointmentsSheet) {
                AppointmentsListView()
                    .environmentObject(appState)
            }
            .sheet(isPresented: $showCartSheet) {
                CartSheetView()
                    .environmentObject(appState)
            }
        }
    }
}

// MARK: - Doctors Section

public struct DoctorsCareView: View {
    @EnvironmentObject var appState: AppState
    @Binding var showAppointmentsSheet: Bool
    @State private var searchText = ""
    @State private var selectedSpecialty: String = "All"
    @State private var selectedDoctorForBooking: Doctor? = nil

    private let specialties = ["All", "Cardiology", "Neurologist", "Dermatologist", "General Physician"]

    public var filteredDoctors: [Doctor] {
        appState.doctors.filter { doc in
            let matchSpecialty = (selectedSpecialty == "All") || doc.specialization.localizedCaseInsensitiveContains(selectedSpecialty)
            let matchSearch = searchText.isEmpty || doc.name.localizedCaseInsensitiveContains(searchText) || doc.specialization.localizedCaseInsensitiveContains(searchText)
            return matchSpecialty && matchSearch
        }
    }

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                // Search Field
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(HealthConnectStyle.muted)
                    TextField("Search doctor, specialty or hospital", text: $searchText)
                        .font(.subheadline)
                    if !searchText.isEmpty {
                        Button { searchText = "" } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                    }
                }
                .padding(12)
                .background(Color.white, in: RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(HealthConnectStyle.border, lineWidth: 1))
                .padding(.horizontal, 16)

                // Specialty filter chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(specialties, id: \.self) { spec in
                            Button {
                                selectedSpecialty = spec
                            } label: {
                                Text(spec)
                                    .font(.caption.weight(.semibold))
                                    .padding(.vertical, 6)
                                    .padding(.horizontal, 12)
                                    .background(selectedSpecialty == spec ? HealthConnectStyle.teal.opacity(0.15) : Color.white)
                                    .foregroundStyle(selectedSpecialty == spec ? HealthConnectStyle.teal : HealthConnectStyle.ink)
                                    .clipShape(Capsule())
                                    .overlay(Capsule().stroke(selectedSpecialty == spec ? HealthConnectStyle.teal : HealthConnectStyle.border, lineWidth: 1))
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }

                // Doctor Cards List
                LazyVStack(spacing: 12) {
                    ForEach(filteredDoctors) { doctor in
                        DoctorCardView(doctor: doctor) {
                            selectedDoctorForBooking = doctor
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
            .padding(.vertical, 12)
        }
        .sheet(item: $selectedDoctorForBooking) { doctor in
            BookAppointmentSheet(doctor: doctor)
                .environmentObject(appState)
        }
    }
}

public struct DoctorCardView: View {
    let doctor: Doctor
    let onBook: () -> Void

    public var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 14) {
                // Doctor Photo or avatar placeholder
                AsyncImage(url: URL(string: doctor.photoUrl)) { phase in
                    if let image = phase.image {
                        image.resizable().scaledToFill()
                    } else {
                        ZStack {
                            Color.teal.opacity(0.15)
                            Image(systemName: "person.fill")
                                .font(.title2)
                                .foregroundStyle(HealthConnectStyle.teal)
                        }
                    }
                }
                .frame(width: 64, height: 64)
                .clipShape(RoundedRectangle(cornerRadius: 14))

                VStack(alignment: .leading, spacing: 4) {
                    Text(doctor.name)
                        .font(.headline)
                        .foregroundStyle(HealthConnectStyle.ink)
                    Text(doctor.specialization)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(HealthConnectStyle.teal)
                    Text(doctor.qualification)
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.muted)
                        .lineLimit(1)
                }
                Spacer()

                HStack(spacing: 3) {
                    Image(systemName: "star.fill")
                        .font(.caption)
                        .foregroundStyle(.orange)
                    Text(String(format: "%.1f", doctor.rating))
                        .font(.subheadline.bold())
                }
            }

            Text(doctor.about)
                .font(.footnote)
                .foregroundStyle(HealthConnectStyle.muted)
                .lineLimit(2)

            Divider()

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Consultation Fee")
                        .font(.caption2)
                        .foregroundStyle(HealthConnectStyle.muted)
                    Text("$\(Int(doctor.consultationFee))")
                        .font(.subheadline.bold())
                        .foregroundStyle(HealthConnectStyle.ink)
                }

                Spacer()

                HStack(spacing: 6) {
                    ForEach(doctor.consultationTypes, id: \.self) { cType in
                        Image(systemName: cType.icon)
                            .font(.caption)
                            .foregroundStyle(HealthConnectStyle.muted)
                    }
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(HealthConnectStyle.canvas, in: Capsule())

                Button(action: onBook) {
                    Text("Book Visit")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 16)
                        .background(HealthConnectStyle.teal, in: RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .padding(14)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(HealthConnectStyle.border, lineWidth: 1))
    }
}

// MARK: - Book Appointment Sheet

public struct BookAppointmentSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    let doctor: Doctor

    @State private var selectedDate = Date()
    @State private var selectedTime: String = "10:00 AM"
    @State private var selectedType: ConsultationType = .inPerson
    @State private var reason: String = ""
    @State private var isSubmitting = false
    @State private var showSuccessAlert = false

    private let availableTimes = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:00 PM"]

    public var body: some View {
        NavigationStack {
            Form {
                Section("Doctor Information") {
                    HStack(spacing: 12) {
                        Image(systemName: "stethoscope")
                            .font(.title2)
                            .foregroundStyle(HealthConnectStyle.teal)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(doctor.name)
                                .font(.headline)
                            Text(doctor.specialization + " • " + doctor.hospitalAffiliation)
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                    }
                }

                Section("Consultation Type") {
                    Picker("Type", selection: $selectedType) {
                        ForEach(doctor.consultationTypes, id: \.self) { type in
                            Text(type.title).tag(type)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Date & Time Slot") {
                    DatePicker("Consultation Date", selection: $selectedDate, in: Date()..., displayedComponents: .date)
                    Picker("Time Slot", selection: $selectedTime) {
                        ForEach(availableTimes, id: \.self) { t in
                            Text(t).tag(t)
                        }
                    }
                }

                Section("Reason for Visit") {
                    TextField("E.g. Routine checkup, chest discomfort", text: $reason)
                }

                Section("Summary") {
                    HStack {
                        Text("Consultation Fee")
                        Spacer()
                        Text("$\(Int(doctor.consultationFee))")
                            .bold()
                    }
                }
            }
            .navigationTitle("Book Consultation")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Confirm") {
                        Task {
                            isSubmitting = true
                            let formatter = DateFormatter()
                            formatter.dateFormat = "yyyy-MM-dd"
                            let dateStr = formatter.string(from: selectedDate)
                            let ok = await appState.bookAppointment(
                                doctorId: doctor.id,
                                date: dateStr,
                                time: selectedTime,
                                type: selectedType,
                                reason: reason.isEmpty ? "General Consultation" : reason
                            )
                            isSubmitting = false
                            if ok {
                                showSuccessAlert = true
                            }
                        }
                    }
                    .disabled(isSubmitting)
                }
            }
            .alert("Appointment Confirmed!", isPresented: $showSuccessAlert) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your visit with \(doctor.name) has been scheduled.")
            }
        }
    }
}

// MARK: - Appointments List View

public struct AppointmentsListView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var filterStatus: String = "ALL"
    @State private var appointmentToReschedule: Appointment? = nil
    @State private var appointmentToCancel: Appointment? = nil
    @State private var cancelReasonText: String = ""
    @State private var showCancelAlert = false

    public var filtered: [Appointment] {
        if filterStatus == "ALL" { return appState.appointments }
        return appState.appointments.filter { $0.status.rawValue == filterStatus }
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Status Filter", selection: $filterStatus) {
                    Text("All").tag("ALL")
                    Text("Confirmed").tag("CONFIRMED")
                    Text("Completed").tag("COMPLETED")
                    Text("Cancelled").tag("CANCELLED")
                }
                .pickerStyle(.segmented)
                .padding()

                if filtered.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "calendar.badge.clock")
                            .font(.system(size: 48))
                            .foregroundStyle(HealthConnectStyle.teal)
                        Text("No appointments found")
                            .font(.headline)
                        Text("Bookings you make will show up right here.")
                            .font(.subheadline)
                            .foregroundStyle(HealthConnectStyle.muted)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(filtered) { apt in
                            VStack(alignment: .leading, spacing: 10) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(apt.doctorName)
                                            .font(.headline)
                                        Text(apt.doctorSpecialization + " • " + apt.hospitalName)
                                            .font(.caption)
                                            .foregroundStyle(HealthConnectStyle.muted)
                                    }
                                    Spacer()
                                    StatusBadgeView(status: apt.status.rawValue)
                                }

                                HStack(spacing: 16) {
                                    Label(apt.appointmentDate, systemImage: "calendar")
                                    Label(apt.appointmentTime, systemImage: "clock")
                                }
                                .font(.footnote)
                                .foregroundStyle(HealthConnectStyle.ink)

                                if let link = apt.meetingLink, apt.status == .confirmed {
                                    HStack {
                                        Image(systemName: "video.fill")
                                            .foregroundStyle(.blue)
                                        Text("Telehealth Link Ready")
                                            .font(.caption.bold())
                                            .foregroundStyle(.blue)
                                    }
                                    .padding(.vertical, 4)
                                }

                                if let room = apt.roomNumber, apt.status == .confirmed {
                                    HStack {
                                        Image(systemName: "door.left.hand.open")
                                            .foregroundStyle(.purple)
                                        Text(room)
                                            .font(.caption.bold())
                                            .foregroundStyle(.purple)
                                    }
                                }

                                Text("Reason: \(apt.reasonForVisit)")
                                    .font(.caption)
                                    .foregroundStyle(HealthConnectStyle.muted)

                                if apt.status == .confirmed {
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
                                            appointmentToCancel = apt
                                            showCancelAlert = true
                                        } label: {
                                            Text("Cancel Visit")
                                                .font(.caption.bold())
                                        }
                                        .buttonStyle(.bordered)
                                        .tint(.red)
                                    }
                                }
                            }
                            .padding(.vertical, 6)
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("My Appointments")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("Cancel Appointment", isPresented: $showCancelAlert) {
                TextField("Reason for cancellation", text: $cancelReasonText)
                Button("Confirm Cancel", role: .destructive) {
                    if let apt = appointmentToCancel {
                        Task {
                            _ = await appState.cancelAppointment(
                                id: apt.id,
                                reason: cancelReasonText.isEmpty ? "Patient request" : cancelReasonText
                            )
                            cancelReasonText = ""
                        }
                    }
                }
                Button("Keep Appointment", role: .cancel) {}
            } message: {
                Text("Are you sure you want to cancel this visit?")
            }
            .sheet(item: $appointmentToReschedule) { apt in
                RescheduleAppointmentSheet(appointment: apt)
                    .environmentObject(appState)
            }
        }
    }
}

public struct RescheduleAppointmentSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    let appointment: Appointment

    @State private var newDate = Date()
    @State private var newTime = "11:30 AM"
    private let availableTimes = ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:00 PM"]

    public var body: some View {
        NavigationStack {
            Form {
                Section("Doctor") {
                    Text(appointment.doctorName).bold()
                    Text(appointment.doctorSpecialization)
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.muted)
                }
                Section("New Date & Time") {
                    DatePicker("Select Date", selection: $newDate, in: Date()..., displayedComponents: .date)
                    Picker("Select Slot", selection: $newTime) {
                        ForEach(availableTimes, id: \.self) { t in
                            Text(t).tag(t)
                        }
                    }
                }
            }
            .navigationTitle("Reschedule Visit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            let formatter = DateFormatter()
                            formatter.dateFormat = "yyyy-MM-dd"
                            let dateStr = formatter.string(from: newDate)
                            _ = await appState.rescheduleAppointment(id: appointment.id, date: dateStr, time: newTime)
                            dismiss()
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Diagnostics Section

public struct DiagnosticsCareView: View {
    @EnvironmentObject var appState: AppState
    @State private var searchText = ""
    @State private var selectedCategory = "All"
    @State private var testToBook: DiagnosticTest? = nil
    @State private var showMyBookingsSheet = false

    private let categories = ["All", "Blood Tests", "Cardiology", "Diabetes", "Imaging"]

    public var filteredTests: [DiagnosticTest] {
        appState.diagnosticTests.filter { test in
            let matchCat = (selectedCategory == "All") || test.category.localizedCaseInsensitiveContains(selectedCategory)
            let matchSearch = searchText.isEmpty || test.name.localizedCaseInsensitiveContains(searchText) || test.description.localizedCaseInsensitiveContains(searchText)
            return matchCat && matchSearch
        }
    }

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                // Header with "My Bookings" button
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Lab Tests & Diagnostics")
                            .font(.headline)
                        Text("NABL & CAP Accredited Partner Labs")
                            .font(.caption)
                            .foregroundStyle(HealthConnectStyle.muted)
                    }
                    Spacer()
                    Button {
                        showMyBookingsSheet = true
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "list.clipboard")
                            Text("My Bookings (\(appState.diagnosticBookings.count))")
                        }
                        .font(.caption.bold())
                    }
                    .buttonStyle(.bordered)
                    .tint(HealthConnectStyle.teal)
                }
                .padding(.horizontal, 16)

                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(HealthConnectStyle.muted)
                    TextField("Search tests by name, pathology or code", text: $searchText)
                        .font(.subheadline)
                }
                .padding(12)
                .background(Color.white, in: RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(HealthConnectStyle.border, lineWidth: 1))
                .padding(.horizontal, 16)

                // Category chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(categories, id: \.self) { cat in
                            Button {
                                selectedCategory = cat
                            } label: {
                                Text(cat)
                                    .font(.caption.weight(.semibold))
                                    .padding(.vertical, 6)
                                    .padding(.horizontal, 12)
                                    .background(selectedCategory == cat ? HealthConnectStyle.teal.opacity(0.15) : Color.white)
                                    .foregroundStyle(selectedCategory == cat ? HealthConnectStyle.teal : HealthConnectStyle.ink)
                                    .clipShape(Capsule())
                                    .overlay(Capsule().stroke(selectedCategory == cat ? HealthConnectStyle.teal : HealthConnectStyle.border, lineWidth: 1))
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }

                // Partner Centers Highlight
                VStack(alignment: .leading, spacing: 8) {
                    Text("Partner Diagnostic Centers")
                        .font(.subheadline.bold())
                        .foregroundStyle(HealthConnectStyle.ink)
                        .padding(.horizontal, 16)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(appState.diagnosticCenters) { center in
                                VStack(alignment: .leading, spacing: 6) {
                                    HStack {
                                        Text(center.name)
                                            .font(.subheadline.bold())
                                            .lineLimit(1)
                                        Spacer()
                                        HStack(spacing: 2) {
                                            Image(systemName: "star.fill").font(.caption2).foregroundStyle(.orange)
                                            Text(String(format: "%.1f", center.rating)).font(.caption2.bold())
                                        }
                                    }
                                    Text(center.address)
                                        .font(.caption2)
                                        .foregroundStyle(HealthConnectStyle.muted)
                                        .lineLimit(1)
                                    HStack {
                                        Text("\(String(format: "%.1f", center.distanceKm)) km away")
                                            .font(.caption2.bold())
                                            .foregroundStyle(HealthConnectStyle.teal)
                                        Spacer()
                                        Text(center.accreditation)
                                            .font(.caption2)
                                            .foregroundStyle(.blue)
                                    }
                                }
                                .padding(12)
                                .frame(width: 250)
                                .background(Color.white, in: RoundedRectangle(cornerRadius: 14))
                                .overlay(RoundedRectangle(cornerRadius: 14).stroke(HealthConnectStyle.border, lineWidth: 1))
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                }

                // Tests List
                Text("Available Diagnostic Tests")
                    .font(.subheadline.bold())
                    .padding(.horizontal, 16)

                LazyVStack(spacing: 12) {
                    ForEach(filteredTests) { test in
                        DiagnosticTestCardView(test: test) {
                            testToBook = test
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
            .padding(.vertical, 12)
        }
        .sheet(item: $testToBook) { test in
            BookDiagnosticSheet(test: test)
                .environmentObject(appState)
        }
        .sheet(isPresented: $showMyBookingsSheet) {
            DiagnosticBookingsListView()
                .environmentObject(appState)
        }
    }
}

public struct DiagnosticTestCardView: View {
    let test: DiagnosticTest
    let onBook: () -> Void

    public var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(test.name)
                        .font(.headline)
                        .foregroundStyle(HealthConnectStyle.ink)
                    Text(test.code + " • " + test.category)
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.teal)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    if let disc = test.discountedPrice {
                        Text("$\(Int(disc))")
                            .font(.title3.bold())
                            .foregroundStyle(HealthConnectStyle.ink)
                        Text("$\(Int(test.price))")
                            .font(.caption)
                            .strikethrough()
                            .foregroundStyle(HealthConnectStyle.muted)
                    } else {
                        Text("$\(Int(test.price))")
                            .font(.title3.bold())
                            .foregroundStyle(HealthConnectStyle.ink)
                    }
                }
            }

            Text(test.description)
                .font(.footnote)
                .foregroundStyle(HealthConnectStyle.muted)

            HStack(spacing: 12) {
                Label(test.turnaroundTime, systemImage: "clock")
                if test.isHomeCollectionAvailable {
                    Label("Home Sample Pickup", systemImage: "house")
                        .foregroundStyle(.green)
                }
            }
            .font(.caption2.bold())
            .foregroundStyle(HealthConnectStyle.muted)

            if let prep = test.preparationNotes as String?, !prep.isEmpty {
                Text("Note: \(prep)")
                    .font(.caption2)
                    .foregroundStyle(.orange)
                    .padding(6)
                    .background(Color.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 6))
            }

            Divider()

            HStack {
                Spacer()
                Button(action: onBook) {
                    Text("Book Test")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                        .padding(.vertical, 8)
                        .padding(.horizontal, 20)
                        .background(HealthConnectStyle.teal, in: RoundedRectangle(cornerRadius: 10))
                }
            }
        }
        .padding(14)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(HealthConnectStyle.border, lineWidth: 1))
    }
}

public struct BookDiagnosticSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    let test: DiagnosticTest

    @State private var selectedCenterId: String = ""
    @State private var collectionType: String = "HOME_COLLECTION"
    @State private var scheduledDate = Date()
    @State private var scheduledTime = "08:00 AM"
    @State private var addressText: String = "742 Evergreen Terrace, Metro City"
    @State private var isSubmitting = false
    @State private var showSuccess = false

    private let timeSlots = ["07:00 AM", "08:00 AM", "09:30 AM", "11:00 AM", "02:00 PM"]

    public var body: some View {
        NavigationStack {
            Form {
                Section("Selected Diagnostic Test") {
                    Text(test.name).bold()
                    Text(test.category + " • Turnaround: " + test.turnaroundTime)
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.muted)
                }

                Section("Select Diagnostic Center") {
                    Picker("Center", selection: $selectedCenterId) {
                        ForEach(appState.diagnosticCenters) { center in
                            Text(center.name).tag(center.id)
                        }
                    }
                }

                Section("Sample Collection Method") {
                    Picker("Collection", selection: $collectionType) {
                        if test.isHomeCollectionAvailable {
                            Text("Home Sample Collection").tag("HOME_COLLECTION")
                        }
                        Text("Center Visit").tag("CENTER_VISIT")
                    }
                    .pickerStyle(.segmented)

                    if collectionType == "HOME_COLLECTION" {
                        TextField("Home Address", text: $addressText)
                    }
                }

                Section("Schedule") {
                    DatePicker("Date", selection: $scheduledDate, in: Date()..., displayedComponents: .date)
                    Picker("Time", selection: $scheduledTime) {
                        ForEach(timeSlots, id: \.self) { slot in
                            Text(slot).tag(slot)
                        }
                    }
                }

                Section("Total Amount") {
                    HStack {
                        Text("Total to Pay")
                        Spacer()
                        Text("$\(Int(test.discountedPrice ?? test.price))")
                            .bold()
                    }
                }
            }
            .navigationTitle("Schedule Diagnostic")
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                if selectedCenterId.isEmpty, let first = appState.diagnosticCenters.first {
                    selectedCenterId = first.id
                }
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Confirm") {
                        Task {
                            isSubmitting = true
                            let formatter = DateFormatter()
                            formatter.dateFormat = "yyyy-MM-dd"
                            let dateStr = formatter.string(from: scheduledDate)
                            let ok = await appState.bookDiagnostic(
                                centerId: selectedCenterId,
                                testId: test.id,
                                collectionType: collectionType,
                                date: dateStr,
                                time: scheduledTime,
                                address: collectionType == "HOME_COLLECTION" ? addressText : nil
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
            .alert("Test Booked Successfully!", isPresented: $showSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your lab appointment has been booked. A confirmation notification was created.")
            }
        }
    }
}

public struct DiagnosticBookingsListView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    public var body: some View {
        NavigationStack {
            List {
                if appState.diagnosticBookings.isEmpty {
                    Text("No diagnostic bookings yet.")
                        .font(.subheadline)
                        .foregroundStyle(HealthConnectStyle.muted)
                } else {
                    ForEach(appState.diagnosticBookings) { booking in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(booking.testName)
                                        .font(.headline)
                                    Text(booking.centerName)
                                        .font(.caption)
                                        .foregroundStyle(HealthConnectStyle.muted)
                                }
                                Spacer()
                                StatusBadgeView(status: booking.status)
                            }

                            HStack(spacing: 12) {
                                Label(booking.scheduledDate, systemImage: "calendar")
                                Label(booking.scheduledTime, systemImage: "clock")
                                Label(booking.collectionType == "HOME_COLLECTION" ? "Home Pickup" : "Center", systemImage: "house")
                            }
                            .font(.caption2)
                            .foregroundStyle(HealthConnectStyle.muted)

                            if let addr = booking.patientAddress, !addr.isEmpty {
                                Text("Pickup: \(addr)")
                                    .font(.caption2)
                                    .foregroundStyle(HealthConnectStyle.muted)
                            }

                            if booking.status == "BOOKED" {
                                Divider()
                                HStack {
                                    Spacer()
                                    Button(role: .destructive) {
                                        Task {
                                            _ = await appState.cancelDiagnosticBooking(id: booking.id)
                                        }
                                    } label: {
                                        Text("Cancel Booking")
                                            .font(.caption.bold())
                                    }
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("My Lab Bookings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Pharmacy Section

public struct PharmacyCareView: View {
    @EnvironmentObject var appState: AppState
    @Binding var showCartSheet: Bool
    @State private var searchText = ""
    @State private var selectedCategory = "All"
    @State private var showOrdersSheet = false

    private let categories = ["All", "Antibiotics", "Pain Relief", "Cardiology", "Diabetes", "Vitamins", "First Aid"]

    public var filteredMedicines: [Medicine] {
        appState.medicines.filter { med in
            let matchCat = (selectedCategory == "All") || med.category.title.localizedCaseInsensitiveContains(selectedCategory)
            let matchSearch = searchText.isEmpty || med.name.localizedCaseInsensitiveContains(searchText) || med.genericName.localizedCaseInsensitiveContains(searchText)
            return matchCat && matchSearch
        }
    }

    public var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                // Header with orders button
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Online Pharmacy")
                            .font(.headline)
                        Text("Genuine medicines delivered to your doorstep")
                            .font(.caption)
                            .foregroundStyle(HealthConnectStyle.muted)
                    }
                    Spacer()
                    Button {
                        showOrdersSheet = true
                    } label: {
                        HStack(spacing: 4) {
                            Image(systemName: "box.truck")
                            Text("My Orders (\(appState.pharmacyOrders.count))")
                        }
                        .font(.caption.bold())
                    }
                    .buttonStyle(.bordered)
                    .tint(HealthConnectStyle.teal)
                }
                .padding(.horizontal, 16)

                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(HealthConnectStyle.muted)
                    TextField("Search medicines, generic salt or brands", text: $searchText)
                        .font(.subheadline)
                }
                .padding(12)
                .background(Color.white, in: RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(HealthConnectStyle.border, lineWidth: 1))
                .padding(.horizontal, 16)

                // Categories
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(categories, id: \.self) { cat in
                            Button {
                                selectedCategory = cat
                            } label: {
                                Text(cat)
                                    .font(.caption.weight(.semibold))
                                    .padding(.vertical, 6)
                                    .padding(.horizontal, 12)
                                    .background(selectedCategory == cat ? HealthConnectStyle.teal.opacity(0.15) : Color.white)
                                    .foregroundStyle(selectedCategory == cat ? HealthConnectStyle.teal : HealthConnectStyle.ink)
                                    .clipShape(Capsule())
                                    .overlay(Capsule().stroke(selectedCategory == cat ? HealthConnectStyle.teal : HealthConnectStyle.border, lineWidth: 1))
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }

                // Medicines Grid
                LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                    ForEach(filteredMedicines) { med in
                        MedicineCardView(medicine: med) {
                            appState.addToCart(medicine: med, quantity: 1)
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
            .padding(.vertical, 12)
        }
        .sheet(isPresented: $showOrdersSheet) {
            PharmacyOrdersListView()
                .environmentObject(appState)
        }
    }
}

public struct MedicineCardView: View {
    let medicine: Medicine
    let onAddToCart: () -> Void

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Medicine Image
            AsyncImage(url: URL(string: medicine.imageUrl)) { phase in
                if let img = phase.image {
                    img.resizable().scaledToFill()
                } else {
                    ZStack {
                        Color.teal.opacity(0.1)
                        Image(systemName: "pills.fill")
                            .font(.title2)
                            .foregroundStyle(HealthConnectStyle.teal)
                    }
                }
            }
            .frame(height: 100)
            .frame(maxWidth: .infinity)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            if medicine.requiresPrescription {
                HStack(spacing: 3) {
                    Image(systemName: "doc.text.fill").font(.caption2)
                    Text("Rx Required").font(.caption2.bold())
                }
                .foregroundStyle(.purple)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color.purple.opacity(0.1), in: Capsule())
            }

            Text(medicine.name)
                .font(.subheadline.bold())
                .foregroundStyle(HealthConnectStyle.ink)
                .lineLimit(1)

            Text(medicine.genericName + " • " + medicine.strength)
                .font(.caption2)
                .foregroundStyle(HealthConnectStyle.muted)
                .lineLimit(1)

            HStack {
                if let disc = medicine.discountPrice {
                    Text("$\(String(format: "%.2f", disc))")
                        .font(.subheadline.bold())
                    Text("$\(String(format: "%.2f", medicine.price))")
                        .font(.caption2)
                        .strikethrough()
                        .foregroundStyle(HealthConnectStyle.muted)
                } else {
                    Text("$\(String(format: "%.2f", medicine.price))")
                        .font(.subheadline.bold())
                }
                Spacer()
            }

            Button(action: onAddToCart) {
                HStack(spacing: 4) {
                    Image(systemName: "cart.badge.plus")
                    Text("Add")
                }
                .font(.caption.bold())
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
                .background(HealthConnectStyle.teal, in: RoundedRectangle(cornerRadius: 8))
                .foregroundStyle(.white)
            }
        }
        .padding(10)
        .background(Color.white, in: RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(HealthConnectStyle.border, lineWidth: 1))
    }
}

// MARK: - Cart & Checkout

public struct CartSheetView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var deliveryAddress = "742 Evergreen Terrace, Metro City"
    @State private var paymentMethod = "CASH_ON_DELIVERY"
    @State private var selectedPrescriptionId: String = ""
    @State private var isSubmitting = false
    @State private var showSuccessAlert = false

    public var requiresPrescription: Bool {
        appState.cart.contains { $0.medicine.requiresPrescription }
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if appState.cart.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "cart")
                            .font(.system(size: 54))
                            .foregroundStyle(HealthConnectStyle.muted)
                        Text("Your cart is empty")
                            .font(.headline)
                        Text("Browse our pharmacy and add essential medicines to your cart.")
                            .font(.subheadline)
                            .foregroundStyle(HealthConnectStyle.muted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        Section("Cart Items (\(appState.cartItemCount))") {
                            ForEach(appState.cart) { item in
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(item.medicine.name)
                                            .font(.subheadline.bold())
                                        Text("$\(String(format: "%.2f", item.medicine.discountPrice ?? item.medicine.price)) each")
                                            .font(.caption)
                                            .foregroundStyle(HealthConnectStyle.muted)
                                    }
                                    Spacer()
                                    HStack(spacing: 8) {
                                        Button {
                                            appState.updateCartQuantity(medicineId: item.medicine.id, quantity: item.quantity - 1)
                                        } label: {
                                            Image(systemName: "minus.circle.fill")
                                                .font(.title3)
                                                .foregroundStyle(HealthConnectStyle.teal)
                                        }
                                        Text("\(item.quantity)").bold()
                                        Button {
                                            appState.updateCartQuantity(medicineId: item.medicine.id, quantity: item.quantity + 1)
                                        } label: {
                                            Image(systemName: "plus.circle.fill")
                                                .font(.title3)
                                                .foregroundStyle(HealthConnectStyle.teal)
                                        }
                                    }
                                }
                            }
                        }

                        if requiresPrescription {
                            Section("Prescription Document") {
                                VStack(alignment: .leading, spacing: 6) {
                                    Text("Items in your cart require a valid prescription.")
                                        .font(.caption)
                                        .foregroundStyle(.purple)
                                    Picker("Choose Prescription", selection: $selectedPrescriptionId) {
                                        Text("Select active Rx").tag("")
                                        ForEach(appState.prescriptions) { rx in
                                            Text(rx.prescriptionNumber + " (\(rx.doctorName))").tag(rx.id)
                                        }
                                    }
                                }
                            }
                        }

                        Section("Delivery Details") {
                            TextField("Delivery Address", text: $deliveryAddress)
                            Picker("Payment Method", selection: $paymentMethod) {
                                Text("Cash on Delivery").tag("CASH_ON_DELIVERY")
                                Text("Credit/Debit Card").tag("CARD")
                                Text("UPI / Instant Transfer").tag("UPI")
                                Text("Health Insurance").tag("INSURANCE")
                            }
                        }

                        Section("Order Summary") {
                            HStack {
                                Text("Subtotal")
                                Spacer()
                                Text("$\(String(format: "%.2f", appState.cartSubtotal))")
                            }
                            HStack {
                                Text("Delivery Fee")
                                Spacer()
                                Text("$\(String(format: "%.2f", appState.cartDeliveryFee))")
                            }
                            HStack {
                                Text("Total Amount")
                                    .bold()
                                Spacer()
                                Text("$\(String(format: "%.2f", appState.cartTotal))")
                                    .bold()
                                    .foregroundStyle(HealthConnectStyle.teal)
                            }
                        }
                    }

                    // Place Order Button
                    VStack {
                        Button {
                            Task {
                                isSubmitting = true
                                let ok = await appState.placePharmacyOrder(
                                    deliveryAddress: deliveryAddress,
                                    paymentMethod: paymentMethod,
                                    prescriptionRecordId: selectedPrescriptionId.isEmpty ? nil : selectedPrescriptionId
                                )
                                isSubmitting = false
                                if ok {
                                    showSuccessAlert = true
                                }
                            }
                        } label: {
                            HStack {
                                if isSubmitting {
                                    ProgressView().tint(.white)
                                } else {
                                    Text("Place Order • $\(String(format: "%.2f", appState.cartTotal))")
                                        .font(.headline)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(HealthConnectStyle.teal, in: RoundedRectangle(cornerRadius: 14))
                            .foregroundStyle(.white)
                        }
                        .disabled(isSubmitting)
                    }
                    .padding(16)
                    .background(Color.white)
                }
            }
            .navigationTitle("Checkout Cart")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
            .alert("Order Placed!", isPresented: $showSuccessAlert) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your pharmacy order has been confirmed and scheduled for delivery.")
            }
        }
    }
}

public struct PharmacyOrdersListView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    public var body: some View {
        NavigationStack {
            List {
                if appState.pharmacyOrders.isEmpty {
                    Text("No past pharmacy orders.")
                        .font(.subheadline)
                        .foregroundStyle(HealthConnectStyle.muted)
                } else {
                    ForEach(appState.pharmacyOrders) { order in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(order.orderNumber)
                                    .font(.headline)
                                Spacer()
                                StatusBadgeView(status: order.status)
                            }
                            Text("Placed: \(order.createdAt.prefix(10)) • \(order.paymentMethod)")
                                .font(.caption2)
                                .foregroundStyle(HealthConnectStyle.muted)

                            ForEach(order.items) { item in
                                Text("• \(item.medicine.name) x \(item.quantity)")
                                    .font(.caption)
                            }

                            HStack {
                                Text("Total: $\(String(format: "%.2f", order.finalAmount))")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(HealthConnectStyle.teal)
                                Spacer()
                                if order.status == "CONFIRMED" || order.status == "PHARMACY_PROCESSING" {
                                    Button(role: .destructive) {
                                        Task {
                                            _ = await appState.cancelPharmacyOrder(id: order.id)
                                        }
                                    } label: {
                                        Text("Cancel Order")
                                            .font(.caption.bold())
                                    }
                                }
                            }
                        }
                        .padding(.vertical, 6)
                    }
                }
            }
            .navigationTitle("Order History")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Facilities (Hospitals & Blood Banks)

public struct FacilitiesCareView: View {
    @EnvironmentObject var appState: AppState
    @State private var subSelection: Int = 0
    @State private var searchText = ""
    @State private var emergencyOnly = false
    @State private var icuOnly = false
    @State private var open24x7Only = false
    @State private var selectedBloodGroup = "All"

    private let bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

    public var filteredHospitals: [Hospital] {
        appState.hospitals.filter { h in
            let matchSearch = searchText.isEmpty || h.name.localizedCaseInsensitiveContains(searchText) || h.address.localizedCaseInsensitiveContains(searchText)
            let matchEmergency = !emergencyOnly || h.hasEmergency
            let matchICU = !icuOnly || (h.bedAvailability.icuAvailable > 0)
            return matchSearch && matchEmergency && matchICU
        }
    }

    public var filteredBloodBanks: [BloodBank] {
        appState.bloodBanks.filter { b in
            let matchSearch = searchText.isEmpty || b.name.localizedCaseInsensitiveContains(searchText) || b.address.localizedCaseInsensitiveContains(searchText)
            let match24 = !open24x7Only || b.isOpen24x7
            let matchBg = (selectedBloodGroup == "All") || b.inventory.contains { $0.bloodGroup == selectedBloodGroup && $0.unitsAvailable > 0 }
            return matchSearch && match24 && matchBg
        }
    }

    public var body: some View {
        VStack(spacing: 0) {
            Picker("Facility Type", selection: $subSelection) {
                Text("Hospitals").tag(0)
                Text("Blood Banks").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)

            // Search
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(HealthConnectStyle.muted)
                TextField(subSelection == 0 ? "Search hospitals by name or area" : "Search blood banks by name or location", text: $searchText)
                    .font(.subheadline)
            }
            .padding(10)
            .background(Color.white, in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(HealthConnectStyle.border, lineWidth: 1))
            .padding(.horizontal, 16)
            .padding(.bottom, 8)

            if subSelection == 0 {
                // Filters for Hospitals
                HStack(spacing: 8) {
                    Toggle("Emergency 24x7", isOn: $emergencyOnly)
                        .toggleStyle(.button)
                        .font(.caption2.bold())
                        .tint(HealthConnectStyle.teal)
                    Toggle("ICU Available", isOn: $icuOnly)
                        .toggleStyle(.button)
                        .font(.caption2.bold())
                        .tint(HealthConnectStyle.teal)
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 6)

                List(filteredHospitals) { hosp in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(hosp.name)
                                .font(.headline)
                            Spacer()
                            Text("\(String(format: "%.1f", hosp.distanceKm)) km")
                                .font(.caption.bold())
                                .foregroundStyle(HealthConnectStyle.teal)
                        }

                        Text(hosp.address)
                            .font(.caption)
                            .foregroundStyle(HealthConnectStyle.muted)

                        HStack(spacing: 12) {
                            BadgeItem(title: "ICU Beds", value: "\(hosp.bedAvailability.icuAvailable)/\(hosp.bedAvailability.icuTotal)", color: hosp.bedAvailability.icuAvailable > 0 ? .green : .red)
                            BadgeItem(title: "Emergency", value: "\(hosp.bedAvailability.emergencyAvailable)", color: .orange)
                            BadgeItem(title: "General", value: "\(hosp.bedAvailability.generalAvailable)", color: .blue)
                        }

                        HStack {
                            if let phoneURL = URL(string: "tel:\(hosp.emergencyPhone.filter { $0.isNumber })") {
                                Link(destination: phoneURL) {
                                    Label("Emergency: \(hosp.emergencyPhone)", systemImage: "phone.fill")
                                        .font(.caption2.bold())
                                        .foregroundStyle(.red)
                                }
                            }
                            Spacer()
                            if let phoneURL = URL(string: "tel:\(hosp.phone.filter { $0.isNumber })") {
                                Link(destination: phoneURL) {
                                    Label("Call", systemImage: "phone")
                                        .font(.caption2.bold())
                                        .foregroundStyle(HealthConnectStyle.teal)
                                }
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                .listStyle(.plain)
            } else {
                // Filters for Blood Banks
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        Toggle("24x7 Open", isOn: $open24x7Only)
                            .toggleStyle(.button)
                            .font(.caption2.bold())
                            .tint(HealthConnectStyle.teal)

                        ForEach(bloodGroups, id: \.self) { bg in
                            Button {
                                selectedBloodGroup = bg
                            } label: {
                                Text(bg)
                                    .font(.caption2.bold())
                                    .padding(.vertical, 6)
                                    .padding(.horizontal, 10)
                                    .background(selectedBloodGroup == bg ? HealthConnectStyle.teal : Color.white)
                                    .foregroundStyle(selectedBloodGroup == bg ? Color.white : HealthConnectStyle.ink)
                                    .clipShape(Capsule())
                                    .overlay(Capsule().stroke(selectedBloodGroup == bg ? Color.clear : HealthConnectStyle.border, lineWidth: 1))
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }
                .padding(.bottom, 6)

                List(filteredBloodBanks) { bank in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(bank.name)
                                .font(.headline)
                            Spacer()
                            Text(bank.isOpen24x7 ? "24x7 OPEN" : "HOURS")
                                .font(.caption2.bold())
                                .foregroundStyle(bank.isOpen24x7 ? .green : .orange)
                        }

                        Text(bank.address + " • \(String(format: "%.1f", bank.distanceKm)) km")
                            .font(.caption)
                            .foregroundStyle(HealthConnectStyle.muted)

                        // Blood Inventory Badges
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                ForEach(bank.inventory, id: \.bloodGroup) { inv in
                                    VStack(spacing: 2) {
                                        Text(inv.bloodGroup).font(.caption2.bold())
                                        Text("\(inv.unitsAvailable) U").font(.caption2)
                                    }
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(inv.status == "ADEQUATE" ? Color.green.opacity(0.12) : Color.red.opacity(0.12), in: RoundedRectangle(cornerRadius: 6))
                                    .foregroundStyle(inv.status == "ADEQUATE" ? Color.green : Color.red)
                                }
                            }
                        }

                        if let phoneURL = URL(string: "tel:\(bank.contactNumber.filter { $0.isNumber })") {
                            Link(destination: phoneURL) {
                                Label("Contact: \(bank.contactNumber)", systemImage: "phone.fill")
                                    .font(.caption2.bold())
                                    .foregroundStyle(HealthConnectStyle.teal)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                .listStyle(.plain)
            }
        }
    }
}

// MARK: - Helper Badges

public struct BadgeItem: View {
    let title: String
    let value: String
    let color: Color

    public var body: some View {
        HStack(spacing: 4) {
            Text(title + ":").font(.caption2).foregroundStyle(HealthConnectStyle.muted)
            Text(value).font(.caption2.bold()).foregroundStyle(color)
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 3)
        .background(color.opacity(0.1), in: RoundedRectangle(cornerRadius: 6))
    }
}

public struct StatusBadgeView: View {
    let status: String

    public var color: Color {
        switch status.uppercased() {
        case "CONFIRMED", "ACTIVE", "VERIFIED", "DELIVERED", "APPROVED": return .green
        case "BOOKED", "UNDER_REVIEW", "PHARMACY_PROCESSING", "SAMPLE_COLLECTION": return .blue
        case "PENDING", "DRAFT": return .orange
        case "CANCELLED", "REVOKED", "EXPIRED", "REJECTED": return .red
        default: return .gray
        }
    }

    public var body: some View {
        Text(status.replacingOccurrences(of: "_", with: " "))
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.15), in: Capsule())
            .foregroundStyle(color)
    }
}
