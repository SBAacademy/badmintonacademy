import SwiftUI

struct ScheduleView: View {
    @State private var sessions: [SessionItem] = []
    @State private var batches: [BatchItem] = []
    @State private var selectedTab: ScheduleTab = .sessions
    @State private var selectedDate: Date = Date()
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    @State private var showingAddBatch = false
    @State private var selectedSessionForAttendance: SessionItem? = nil

    enum ScheduleTab: String, CaseIterable, Identifiable {
        case sessions = "Sessions"
        case batches = "Batches"
        var id: String { rawValue }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Segmented picker
                    Picker("View", selection: $selectedTab) {
                        ForEach(ScheduleTab.allCases) { tab in
                            Text(tab.rawValue).tag(tab)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    .padding(.vertical, 8)

                    if selectedTab == .sessions {
                        sessionsContent
                    } else {
                        batchesContent
                    }
                }
            }
            .navigationTitle("Schedule")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if selectedTab == .batches {
                        Button {
                            showingAddBatch = true
                        } label: {
                            Image(systemName: "plus")
                                .foregroundColor(.rebelLime)
                        }
                    }
                }
            }
            .sheet(isPresented: $showingAddBatch) {
                AddBatchSheet {
                    Task { await loadData() }
                }
            }
            .sheet(item: $selectedSessionForAttendance) { session in
                MarkAttendanceView(session: session)
            }
            .task {
                await loadData()
            }
            .refreshable {
                await loadData()
            }
        }
    }

    private var sessionsContent: some View {
        VStack(spacing: 12) {
            DatePicker(
                "Select Date",
                selection: $selectedDate,
                displayedComponents: [.date]
            )
            .datePickerStyle(.compact)
            .colorScheme(.dark)
            .padding(.horizontal)
            .onChange(of: selectedDate) { _, _ in
                Task { await loadSessions() }
            }

            if isLoading && sessions.isEmpty {
                Spacer()
                ProgressView().tint(.rebelLime)
                Spacer()
            } else if sessions.isEmpty {
                Spacer()
                VStack(spacing: 8) {
                    Image(systemName: "calendar.badge.clock")
                        .font(.system(size: 44))
                        .foregroundColor(.rebelMuted)
                    Text("No Sessions Scheduled")
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                    Text("There are no training sessions on this date.")
                        .font(.caption)
                        .foregroundColor(.rebelMuted)
                }
                Spacer()
            } else {
                List(sessions) { session in
                    sessionCard(session)
                        .listRowBackground(Color.clear)
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                }
                .listStyle(.plain)
            }
        }
    }

    private func sessionCard(_ session: SessionItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(session.batchName ?? "Training Session")
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                    Text("\(session.centreName ?? "Centre") • \(session.programName ?? "Program")")
                        .font(.subheadline)
                        .foregroundColor(.rebelMuted)
                }
                Spacer()
                RebelBadge(
                    text: session.status.uppercased(),
                    color: session.status == "COMPLETED" ? .rebelLime : .rebelInfo
                )
            }

            HStack {
                Label(session.timeWindow, systemImage: "clock")
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
                Spacer()
                if let coach = session.coachName {
                    Label(coach, systemImage: "person.fill")
                        .font(.caption)
                        .foregroundColor(.rebelLime)
                }
            }

            HStack {
                Label("\(session.studentCount ?? 0) Enrolled", systemImage: "person.2.fill")
                    .font(.caption2)
                    .foregroundColor(.rebelMuted)
                Spacer()
                Button {
                    selectedSessionForAttendance = session
                } label: {
                    Text("MARK ATTENDANCE")
                        .font(.caption.bold())
                        .foregroundColor(.rebelPitchBlack)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(Color.rebelLime)
                        .cornerRadius(6)
                }
            }
        }
        .padding(14)
        .rebelCard()
    }

    private var batchesContent: some View {
        Group {
            if isLoading && batches.isEmpty {
                Spacer()
                ProgressView().tint(.rebelLime)
                Spacer()
            } else if batches.isEmpty {
                Spacer()
                VStack(spacing: 8) {
                    Image(systemName: "square.grid.2x2")
                        .font(.system(size: 44))
                        .foregroundColor(.rebelMuted)
                    Text("No Batches Found")
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                }
                Spacer()
            } else {
                List(batches) { batch in
                    batchCard(batch)
                        .listRowBackground(Color.clear)
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                }
                .listStyle(.plain)
            }
        }
    }

    private func batchCard(_ batch: BatchItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(batch.name)
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                    Text("\(batch.centreName ?? "Centre") • \(batch.programName ?? "Program")")
                        .font(.subheadline)
                        .foregroundColor(.rebelMuted)
                }
                Spacer()
                RebelBadge(
                    text: batch.isActive ? "ACTIVE" : "INACTIVE",
                    color: batch.isActive ? .rebelLime : .rebelMuted
                )
            }

            HStack {
                if let days = batch.daysOfWeek, !days.isEmpty {
                    Label(days.joined(separator: ", "), systemImage: "calendar")
                        .font(.caption)
                        .foregroundColor(.rebelMuted)
                }
                Spacer()
                Text("\(batch.startTime ?? "") - \(batch.endTime ?? "")")
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
            }

            // Capacity progress bar
            let current = batch.currentEnrolment ?? 0
            let cap = batch.capacity
            let ratio = cap > 0 ? min(Double(current) / Double(cap), 1.0) : 0.0

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Capacity: \(current) / \(cap)")
                        .font(.caption2)
                        .foregroundColor(.rebelMuted)
                    Spacer()
                    Text("\(Int(ratio * 100))%")
                        .font(.caption2.bold())
                        .foregroundColor(ratio >= 1.0 ? .rebelDanger : .rebelLime)
                }
                ProgressView(value: ratio)
                    .tint(ratio >= 1.0 ? .rebelDanger : .rebelLime)
            }
        }
        .padding(14)
        .rebelCard()
    }

    private func loadData() async {
        isLoading = true
        errorMessage = nil
        await loadSessions()
        await loadBatches()
        isLoading = false
    }

    private func loadSessions() async {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateStr = formatter.string(from: selectedDate)

        do {
            let res: SessionsResponse = try await APIClient.shared.request(
                .sessions(date: dateStr, centreId: nil)
            )
            sessions = res.sessions
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func loadBatches() async {
        do {
            let res: BatchesResponse = try await APIClient.shared.request(
                .batches(centreId: nil, programId: nil)
            )
            batches = res.batches
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct AddBatchSheet: View {
    @Environment(\.dismiss) private var dismiss
    var onCreated: () -> Void

    @State private var name = ""
    @State private var centreId = "kadavanthra"
    @State private var programId = "juniors"
    @State private var capacity = "16"
    @State private var startTime = Date()
    @State private var endTime = Date().addingTimeInterval(3600)
    @State private var selectedDays: Set<String> = ["Mon", "Wed", "Fri"]
    @State private var isSubmitting = false
    @State private var errorMessage: String? = nil

    let allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                Form {
                    Section(header: Text("Batch Info").foregroundColor(.rebelLime)) {
                        TextField("Batch Name", text: $name)
                        Picker("Centre", selection: $centreId) {
                            Text("Kadavanthra").tag("kadavanthra")
                            Text("Edappally").tag("edappally")
                            Text("Kakkanad").tag("kakkanad")
                        }
                        Picker("Program", selection: $programId) {
                            Text("Junior Development").tag("juniors")
                            Text("Advanced Squad").tag("advanced")
                            Text("Adult Fitness").tag("adults")
                        }
                        TextField("Capacity", text: $capacity)
                            .keyboardType(.numberPad)
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    Section(header: Text("Timing").foregroundColor(.rebelLime)) {
                        DatePicker("Start Time", selection: $startTime, displayedComponents: .hourAndMinute)
                        DatePicker("End Time", selection: $endTime, displayedComponents: .hourAndMinute)
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    Section(header: Text("Days").foregroundColor(.rebelLime)) {
                        HStack {
                            ForEach(allDays, id: \.self) { day in
                                let isSelected = selectedDays.contains(day)
                                Button {
                                    if isSelected { selectedDays.remove(day) }
                                    else { selectedDays.insert(day) }
                                } label: {
                                    Text(day)
                                        .font(.caption2.bold())
                                        .padding(.vertical, 6)
                                        .padding(.horizontal, 8)
                                        .background(isSelected ? Color.rebelLime : Color.rebelBorder)
                                        .foregroundColor(isSelected ? .rebelPitchBlack : .rebelWhite)
                                        .cornerRadius(4)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    if let err = errorMessage {
                        Section {
                            Text(err).foregroundColor(.rebelDanger).font(.caption)
                        }
                        .listRowBackground(Color.rebelDarkSurface)
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("New Batch")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }.foregroundColor(.rebelMuted)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        Task { await saveBatch() }
                    }
                    .foregroundColor(.rebelLime)
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isSubmitting)
                }
            }
        }
    }

    private func saveBatch() async {
        isSubmitting = true
        errorMessage = nil

        let timeFmt = DateFormatter()
        timeFmt.dateFormat = "HH:mm"

        let payload: [String: Any] = [
            "name": name,
            "centre_id": centreId,
            "program_id": programId,
            "capacity": Int(capacity) ?? 16,
            "start_time": timeFmt.string(from: startTime),
            "end_time": timeFmt.string(from: endTime),
            "days_of_week": Array(selectedDays)
        ]

        do {
            let body = try JSONSerialization.data(withJSONObject: payload)
            let _: [String: String] = try await APIClient.shared.request(.createBatch, body: body)
            onCreated()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}
