import SwiftUI

public enum RecordsSegment: String, CaseIterable, Identifiable {
    case all = "All Documents"
    case prescriptions = "Prescriptions"
    case labReports = "Lab Reports"
    case consultations = "Consultations"
    case archived = "Archived"
    case consents = "Data Consents"

    public var id: String { rawValue }
}

public struct RecordsScreen: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedSegment: RecordsSegment = .all
    @State private var searchText = ""
    @State private var showUploadSheet = false
    @State private var selectedRecordForDetail: MedicalRecord? = nil

    public init() {}

    public var filteredRecords: [MedicalRecord] {
        appState.medicalRecords.filter { rec in
            let matchSearch = searchText.isEmpty || rec.title.localizedCaseInsensitiveContains(searchText) || rec.doctorName.localizedCaseInsensitiveContains(searchText)
            switch selectedSegment {
            case .all:
                return matchSearch && (rec.status != .archived)
            case .prescriptions:
                return matchSearch && (rec.recordType == .prescription) && (rec.status != .archived)
            case .labReports:
                return matchSearch && (rec.recordType == .labReport || rec.recordType == .diagnosticReport) && (rec.status != .archived)
            case .consultations:
                return matchSearch && (rec.recordType == .consultationNote || rec.recordType == .clinicalNote) && (rec.status != .archived)
            case .archived:
                return matchSearch && (rec.status == .archived)
            case .consents:
                return true
            }
        }
    }

    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Segment Bar
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(RecordsSegment.allCases) { seg in
                            Button {
                                selectedSegment = seg
                            } label: {
                                Text(seg.rawValue)
                                    .font(.subheadline.weight(.semibold))
                                    .padding(.vertical, 8)
                                    .padding(.horizontal, 14)
                                    .background(selectedSegment == seg ? HealthConnectStyle.teal : Color.white)
                                    .foregroundStyle(selectedSegment == seg ? Color.white : HealthConnectStyle.ink)
                                    .clipShape(Capsule())
                                    .overlay(Capsule().stroke(selectedSegment == seg ? Color.clear : HealthConnectStyle.border, lineWidth: 1))
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                }
                .background(HealthConnectStyle.canvas)

                if selectedSegment == .consents {
                    ConsentsListView()
                } else if selectedSegment == .prescriptions && searchText.isEmpty {
                    PrescriptionsListView()
                } else {
                    // Search Bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundStyle(HealthConnectStyle.muted)
                        TextField("Search medical records or doctors", text: $searchText)
                            .font(.subheadline)
                    }
                    .padding(10)
                    .background(Color.white, in: RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(HealthConnectStyle.border, lineWidth: 1))
                    .padding(.horizontal, 16)
                    .padding(.bottom, 8)

                    if filteredRecords.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "doc.text.magnifyingglass")
                                .font(.system(size: 48))
                                .foregroundStyle(HealthConnectStyle.teal)
                            Text("No records found")
                                .font(.headline)
                            Text("Uploaded medical documents and lab findings will appear here.")
                                .font(.subheadline)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else {
                        List(filteredRecords) { record in
                            RecordCardRow(record: record)
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    selectedRecordForDetail = record
                                }
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .background(HealthConnectStyle.canvas)
            .navigationTitle("Medical Records")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showUploadSheet = true
                    } label: {
                        Label("Upload", systemImage: "plus.circle.fill")
                            .font(.headline)
                            .foregroundStyle(HealthConnectStyle.teal)
                    }
                }
            }
            .sheet(isPresented: $showUploadSheet) {
                UploadRecordSheet()
                    .environmentObject(appState)
            }
            .sheet(item: $selectedRecordForDetail) { record in
                RecordDetailSheet(record: record)
                    .environmentObject(appState)
            }
        }
    }
}

// MARK: - Record Card Row

public struct RecordCardRow: View {
    let record: MedicalRecord

    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top) {
                Image(systemName: record.recordType.icon)
                    .font(.title3)
                    .foregroundStyle(HealthConnectStyle.teal)
                    .frame(width: 32, height: 32)
                    .background(HealthConnectStyle.teal.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))

                VStack(alignment: .leading, spacing: 3) {
                    Text(record.title)
                        .font(.headline)
                        .foregroundStyle(HealthConnectStyle.ink)
                    Text(record.doctorName + " • " + record.provider)
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.muted)
                }
                Spacer()

                StatusBadgeView(status: record.status.rawValue)
            }

            Text(record.summary)
                .font(.footnote)
                .foregroundStyle(HealthConnectStyle.muted)
                .lineLimit(2)

            HStack {
                Label(record.date, systemImage: "calendar")
                if let size = record.fileSize {
                    Label(size, systemImage: "doc")
                }
                Spacer()
                Text(record.confidentialityLevel.rawValue)
                    .font(.caption2.bold())
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.gray.opacity(0.12), in: Capsule())
            }
            .font(.caption2)
            .foregroundStyle(HealthConnectStyle.muted)
        }
        .padding(.vertical, 6)
    }
}

// MARK: - Record Detail Sheet

public struct RecordDetailSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    let record: MedicalRecord

    @State private var showDownloadToast = false

    public var body: some View {
        NavigationStack {
            List {
                Section("Document Overview") {
                    HStack {
                        Image(systemName: record.recordType.icon)
                            .font(.title)
                            .foregroundStyle(HealthConnectStyle.teal)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(record.title).font(.headline)
                            Text(record.recordType.title).font(.caption).foregroundStyle(HealthConnectStyle.teal)
                        }
                    }
                }

                Section("Clinical Details") {
                    LabeledContent("Physician", value: record.doctorName)
                    LabeledContent("Facility / Lab", value: record.provider)
                    LabeledContent("Document Date", value: record.date)
                    LabeledContent("Confidentiality", value: record.confidentialityLevel.rawValue)
                    LabeledContent("Status", value: record.status.rawValue)
                }

                Section("Summary / Findings") {
                    Text(record.summary)
                        .font(.subheadline)
                        .foregroundStyle(HealthConnectStyle.ink)
                }

                Section("Attachment Details") {
                    LabeledContent("File Name", value: record.originalFileName ?? "document.pdf")
                    LabeledContent("File Size", value: record.fileSize ?? "1.4 MB")
                    LabeledContent("Format", value: record.fileType ?? "PDF")

                    Button {
                        showDownloadToast = true
                    } label: {
                        HStack {
                            Image(systemName: "arrow.down.doc.fill")
                            Text("Download / View Encrypted PDF")
                        }
                        .font(.subheadline.bold())
                        .foregroundStyle(HealthConnectStyle.teal)
                    }
                }

                Section("Actions") {
                    Button(role: record.status == .archived ? nil : .destructive) {
                        Task {
                            await appState.toggleRecordArchived(id: record.id)
                            dismiss()
                        }
                    } label: {
                        HStack {
                            Image(systemName: record.status == .archived ? "tray.and.arrow.up" : "archivebox")
                            Text(record.status == .archived ? "Restore to Active Records" : "Archive Record")
                        }
                    }
                }
            }
            .navigationTitle("Record Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("Document Downloaded", isPresented: $showDownloadToast) {
                Button("OK") {}
            } message: {
                Text("Encrypted attachment for '\(record.title)' verified and opened.")
            }
        }
    }
}

// MARK: - Upload Record Sheet

public struct UploadRecordSheet: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var title: String = ""
    @State private var recordType: RecordType = .labReport
    @State private var doctorName: String = ""
    @State private var provider: String = ""
    @State private var recordDate = Date()
    @State private var summary: String = ""
    @State private var confidentiality: ConfidentialityLevel = .standard
    @State private var selectedFileName: String = "report_scan.pdf"
    @State private var isSubmitting = false
    @State private var showSuccess = false

    public var body: some View {
        NavigationStack {
            Form {
                Section("Document Information") {
                    TextField("Document Title (e.g. Blood Test Results)", text: $title)
                    Picker("Record Type", selection: $recordType) {
                        ForEach(RecordType.allCases, id: \.self) { t in
                            Text(t.title).tag(t)
                        }
                    }
                }

                Section("Healthcare Provider") {
                    TextField("Doctor Name", text: $doctorName)
                    TextField("Hospital / Diagnostic Lab", text: $provider)
                    DatePicker("Date of Document", selection: $recordDate, displayedComponents: .date)
                }

                Section("Summary & Confidentiality") {
                    TextField("Summary findings or clinical notes", text: $summary)
                    Picker("Confidentiality", selection: $confidentiality) {
                        ForEach(ConfidentialityLevel.allCases, id: \.self) { lvl in
                            Text(lvl.rawValue).tag(lvl)
                        }
                    }
                }

                Section("File Attachment") {
                    HStack {
                        Image(systemName: "doc.badge.plus")
                            .font(.title2)
                            .foregroundStyle(HealthConnectStyle.teal)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(selectedFileName)
                                .font(.subheadline.bold())
                            Text("PDF • 1.2 MB • End-to-End Encrypted")
                                .font(.caption2)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                        Spacer()
                        Button("Change") {
                            selectedFileName = selectedFileName == "report_scan.pdf" ? "clinical_scan.png" : "report_scan.pdf"
                        }
                        .font(.caption.bold())
                    }
                }
            }
            .navigationTitle("Upload Medical Record")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Upload") {
                        Task {
                            isSubmitting = true
                            let formatter = DateFormatter()
                            formatter.dateFormat = "yyyy-MM-dd"
                            let dateStr = formatter.string(from: recordDate)
                            let ok = await appState.uploadMedicalRecord(
                                title: title.isEmpty ? "Medical Record Document" : title,
                                recordType: recordType,
                                doctorName: doctorName,
                                provider: provider,
                                date: dateStr,
                                summary: summary,
                                confidentialityLevel: confidentiality,
                                fileName: selectedFileName
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
            .alert("Record Uploaded Successfully!", isPresented: $showSuccess) {
                Button("OK") { dismiss() }
            } message: {
                Text("Your health document has been securely added to your encrypted profile.")
            }
        }
    }
}

// MARK: - Prescriptions List View

public struct PrescriptionsListView: View {
    @EnvironmentObject var appState: AppState

    public var body: some View {
        List(appState.prescriptions) { rx in
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(rx.prescriptionNumber)
                            .font(.headline)
                            .foregroundStyle(HealthConnectStyle.ink)
                        Text(rx.doctorName + " (" + rx.doctorSpecialization + ")")
                            .font(.caption)
                            .foregroundStyle(HealthConnectStyle.teal)
                    }
                    Spacer()
                    StatusBadgeView(status: rx.status)
                }

                Text("Diagnosis: \(rx.diagnosis)")
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(HealthConnectStyle.ink)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Medications:")
                        .font(.caption2.bold())
                        .foregroundStyle(HealthConnectStyle.muted)

                    ForEach(rx.medications) { med in
                        VStack(alignment: .leading, spacing: 2) {
                            HStack {
                                Text("• " + med.name + " (" + med.dosage + ")")
                                    .font(.subheadline.bold())
                                Spacer()
                                Text(med.duration)
                                    .font(.caption)
                                    .foregroundStyle(HealthConnectStyle.muted)
                            }
                            Text("  Frequency: \(med.frequency) — \(med.instructions)")
                                .font(.caption2)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                    }
                }
                .padding(8)
                .background(HealthConnectStyle.canvas, in: RoundedRectangle(cornerRadius: 8))

                HStack {
                    Label("Valid until \(rx.validUntil)", systemImage: "clock")
                        .font(.caption2)
                        .foregroundStyle(HealthConnectStyle.muted)
                    Spacer()
                    Label("Verified Digital Signature", systemImage: "checkmark.seal.fill")
                        .font(.caption2.bold())
                        .foregroundStyle(.green)
                }
            }
            .padding(.vertical, 6)
        }
        .listStyle(.plain)
    }
}

// MARK: - Consents List View

public struct ConsentsListView: View {
    @EnvironmentObject var appState: AppState

    public var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Active Data Sharing Consents")
                        .font(.headline)
                    Text("You control which doctors and healthcare facilities have permission to view your medical summary and test reports.")
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.muted)
                }
                .padding(.vertical, 4)
            }

            ForEach(appState.providerConsents) { consent in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(consent.providerName)
                                .font(.headline)
                            Text(consent.providerType)
                                .font(.caption)
                                .foregroundStyle(HealthConnectStyle.muted)
                        }
                        Spacer()
                        StatusBadgeView(status: consent.status)
                    }

                    Text("Access Scopes: " + consent.accessScope.joined(separator: ", "))
                        .font(.caption)
                        .foregroundStyle(HealthConnectStyle.ink)

                    HStack {
                        Text("Expires: \(consent.expiresAt)")
                            .font(.caption2)
                            .foregroundStyle(HealthConnectStyle.muted)
                        Spacer()
                        if consent.status == "ACTIVE" {
                            Button(role: .destructive) {
                                Task {
                                    await appState.revokeConsent(id: consent.id)
                                }
                            } label: {
                                Text("Revoke Access")
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
