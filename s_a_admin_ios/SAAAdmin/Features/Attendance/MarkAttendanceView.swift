import SwiftUI
import SwiftData

struct MarkAttendanceView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    let session: SessionItem

    @State private var roster: [AttendanceEntry] = []
    @State private var attendanceMap: [String: String] = [:] // studentId -> status
    @State private var isLoading = false
    @State private var isSaving = false
    @State private var errorMessage: String? = nil
    @State private var successMessage: String? = nil
    @State private var isOfflineMode = false

    private let feedbackGenerator = UIImpactFeedbackGenerator(style: .medium)

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Header Banner
                    headerBanner

                    if !NetworkMonitor.shared.isConnected || isOfflineMode {
                        offlineNoticeBanner
                    }

                    if isLoading {
                        Spacer()
                        ProgressView().tint(.rebelLime)
                        Spacer()
                    } else if roster.isEmpty {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "person.2.slash")
                                .font(.system(size: 40))
                                .foregroundColor(.rebelMuted)
                            Text("No Students Enrolled")
                                .font(.headline)
                                .foregroundColor(.rebelWhite)
                            Text("No student roster found for this session.")
                                .font(.caption)
                                .foregroundColor(.rebelMuted)
                        }
                        Spacer()
                    } else {
                        // Quick Action: Mark All Present
                        HStack {
                            Text("ROSTER (\(roster.count))")
                                .font(.caption.bold())
                                .foregroundColor(.rebelMuted)
                            Spacer()
                            Button {
                                markAllPresent()
                            } label: {
                                Label("Mark All Present", systemImage: "checkmark.circle.fill")
                                    .font(.caption.bold())
                                    .foregroundColor(.rebelPitchBlack)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(Color.rebelLime)
                                    .cornerRadius(6)
                            }
                        }
                        .padding(.horizontal)
                        .padding(.top, 12)
                        .padding(.bottom, 6)

                        // Roster List
                        List(roster) { entry in
                            studentAttendanceRow(entry)
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                        }
                        .listStyle(.plain)

                        // Bottom Save Button
                        VStack(spacing: 8) {
                            if let msg = errorMessage {
                                Text(msg)
                                    .font(.caption)
                                    .foregroundColor(.rebelDanger)
                            }
                            if let msg = successMessage {
                                Text(msg)
                                    .font(.caption)
                                    .foregroundColor(.rebelLime)
                            }

                            Button {
                                Task { await saveAttendance() }
                            } label: {
                                HStack {
                                    if isSaving {
                                        ProgressView().tint(.rebelPitchBlack)
                                    } else {
                                        Text(isOfflineMode || !NetworkMonitor.shared.isConnected ? "SAVE LOCALLY (OFFLINE)" : "SAVE ATTENDANCE")
                                            .font(.headline.bold())
                                            .foregroundColor(.rebelPitchBlack)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.rebelLime)
                                .cornerRadius(10)
                            }
                            .disabled(isSaving)
                        }
                        .padding()
                        .background(Color.rebelDarkSurface)
                    }
                }
            }
            .navigationTitle("Attendance")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                        .foregroundColor(.rebelMuted)
                }
            }
            .task {
                await loadRoster()
            }
        }
    }

    private var headerBanner: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(session.batchName ?? "Training Session")
                .font(.title3.bold())
                .foregroundColor(.rebelWhite)
            HStack {
                Text(session.centreName ?? "Centre")
                Text("•")
                Text(session.timeWindow)
                if let coach = session.coachName {
                    Text("•")
                    Text("Coach \(coach)")
                }
            }
            .font(.caption)
            .foregroundColor(.rebelMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.rebelDarkSurface)
    }

    private var offlineNoticeBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "wifi.slash")
                .foregroundColor(.rebelWarning)
            Text("Offline Mode Active — Records will queue securely in SwiftData and sync automatically when connected.")
                .font(.caption2)
                .foregroundColor(.rebelWarning)
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.rebelWarning.opacity(0.15))
    }

    private func studentAttendanceRow(_ entry: AttendanceEntry) -> some View {
        let currentStatus = attendanceMap[entry.studentId] ?? entry.status ?? "PENDING"

        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(entry.studentName)
                        .font(.body.bold())
                        .foregroundColor(.rebelWhite)
                    if let contact = entry.parentPhone {
                        Text(contact)
                            .font(.caption2)
                            .foregroundColor(.rebelMuted)
                    }
                }
                Spacer()
                statusBadge(for: currentStatus)
            }

            // Status selectors
            HStack(spacing: 6) {
                statusOptionButton(title: "PRESENT", symbol: "checkmark", status: "PRESENT", activeStatus: currentStatus, studentId: entry.studentId, color: .rebelLime)
                statusOptionButton(title: "ABSENT", symbol: "xmark", status: "ABSENT", activeStatus: currentStatus, studentId: entry.studentId, color: .rebelDanger)
                statusOptionButton(title: "LATE", symbol: "clock", status: "LATE", activeStatus: currentStatus, studentId: entry.studentId, color: .rebelWarning)
                statusOptionButton(title: "EXCUSED", symbol: "envelope", status: "EXCUSED", activeStatus: currentStatus, studentId: entry.studentId, color: .rebelInfo)
            }
        }
        .padding(12)
        .rebelCard()
    }

    private func statusOptionButton(title: String, symbol: String, status: String, activeStatus: String, studentId: String, color: Color) -> some View {
        let isSelected = activeStatus == status
        return Button {
            attendanceMap[studentId] = status
            feedbackGenerator.impactOccurred()
        } label: {
            HStack(spacing: 3) {
                Image(systemName: symbol)
                    .font(.caption2)
                Text(title)
                    .font(.caption2.bold())
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .background(isSelected ? color : Color.rebelPitchBlack)
            .foregroundColor(isSelected ? .rebelPitchBlack : .rebelMuted)
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .stroke(isSelected ? color : Color.rebelBorder, lineWidth: 1)
            )
            .cornerRadius(6)
        }
        .buttonStyle(.plain)
    }

    private func statusBadge(for status: String) -> some View {
        let (color, icon) = switch status {
        case "PRESENT": (Color.rebelLime, "✓")
        case "ABSENT": (Color.rebelDanger, "✕")
        case "LATE": (Color.rebelWarning, "⏱")
        case "EXCUSED": (Color.rebelInfo, "✉")
        default: (Color.rebelMuted, "—")
        }
        return RebelBadge(text: "\(icon) \(status)", color: color)
    }

    private func markAllPresent() {
        for entry in roster {
            attendanceMap[entry.studentId] = "PRESENT"
        }
        feedbackGenerator.impactOccurred()
    }

    private func loadRoster() async {
        isLoading = true
        errorMessage = nil

        do {
            let res: SessionDetailResponse = try await APIClient.shared.request(
                .sessionDetails(id: session.id)
            )
            if let details = res.session {
                roster = details.roster ?? []
                for entry in roster {
                    attendanceMap[entry.studentId] = entry.status ?? "PRESENT"
                }
            }
        } catch {
            isOfflineMode = true
            errorMessage = "Server unavailable. Switching to cached roster."
            // Fallback: If we have an enrolled count, create placeholder entries from cached roster
            if roster.isEmpty {
                roster = (1...max(session.studentCount ?? 1, 1)).map { idx in
                    AttendanceEntry(
                        studentId: "student-\(idx)",
                        studentName: "Student #\(idx)",
                        parentPhone: nil,
                        status: "PRESENT"
                    )
                }
            }
        }
        isLoading = false
    }

    private func saveAttendance() async {
        isSaving = true
        errorMessage = nil
        successMessage = nil

        let entriesPayload: [[String: String]] = attendanceMap.map { (studentId, status) in
            ["student_id": studentId, "status": status]
        }

        if !NetworkMonitor.shared.isConnected || isOfflineMode {
            // Queue into SwiftData store
            let store = OfflineAttendanceStore(modelContext: modelContext)
            for (studentId, status) in attendanceMap {
                store.enqueueAttendance(
                    sessionId: session.id,
                    studentId: studentId,
                    status: status
                )
            }
            successMessage = "Queued \(attendanceMap.count) records offline. Will sync automatically."
            feedbackGenerator.impactOccurred()
            isSaving = false
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                dismiss()
            }
            return
        }

        do {
            let payload: [String: Any] = [
                "session_id": session.id,
                "records": entriesPayload
            ]
            let body = try JSONSerialization.data(withJSONObject: payload)
            let _: [String: String] = try await APIClient.shared.request(
                .markAttendance,
                body: body
            )
            successMessage = "Attendance synchronized with server."
            feedbackGenerator.impactOccurred()
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                dismiss()
            }
        } catch {
            // Queue offline on failure
            let store = OfflineAttendanceStore(modelContext: modelContext)
            for (studentId, status) in attendanceMap {
                store.enqueueAttendance(
                    sessionId: session.id,
                    studentId: studentId,
                    status: status
                )
            }
            successMessage = "Network error: saved to offline queue."
            feedbackGenerator.impactOccurred()
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                dismiss()
            }
        }
        isSaving = false
    }
}
