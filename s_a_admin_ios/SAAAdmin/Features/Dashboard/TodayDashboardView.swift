import SwiftUI

public struct TodayDashboardView: View {
    @ObservedObject private var authManager = AuthManager.shared
    @State private var isLoading = true
    @State private var sessions: [SessionItem] = []
    @State private var reportData: [String: Any] = [:]

    // Sheets
    @State private var showAddLead = false
    @State private var showScheduleTrial = false
    @State private var showEnrollStudent = false
    @State private var showRecordPayment = false
    @State private var selectedSessionForAttendance: SessionItem?

    public init() {}

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .rebelPrimary))
                } else {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 22) {
                            // Staff Context Banner
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("TODAY'S OPERATIONS")
                                        .font(RebelTypography.sectionTitle)
                                        .foregroundColor(.rebelTextPrimary)
                                    Text("\(authManager.currentUser?.fullName ?? "Staff") • \(authManager.currentUser?.role ?? "")")
                                        .font(RebelTypography.caption)
                                        .foregroundColor(.rebelTextSecondary)
                                }
                                Spacer()
                                Button {
                                    Task { await loadData() }
                                } label: {
                                    Image(systemName: "arrow.clockwise")
                                        .foregroundColor(.rebelPrimary)
                                        .font(.system(size: 14, weight: .bold))
                                }
                            }
                            .padding(.horizontal, 16)
                            .padding(.top, 8)

                            // Operational Alerts (Role filtered)
                            if authManager.currentUser?.role != "COACH" {
                                let funnel = reportData["funnel"] as? [String: Any] ?? [:]
                                let finance = reportData["finance"] as? [String: Any] ?? [:]

                                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                                    alertCard(
                                        title: "NEW LEADS",
                                        value: "\(funnel["new_leads"] ?? 0)",
                                        color: RebelColors.acidLime,
                                        icon: "bolt.fill"
                                    )
                                    alertCard(
                                        title: "TRIALS TODAY",
                                        value: "\(funnel["trial_scheduled_leads"] ?? 0)",
                                        color: RebelColors.skyBlue,
                                        icon: "figure.badminton"
                                    )
                                    let rec = finance["total_receivables"] ?? 0
                                    alertCard(
                                        title: "RECEIVABLES",
                                        value: "₹\(String(describing: rec).components(separatedBy: ".").first ?? "0")",
                                        color: RebelColors.amber,
                                        icon: "indianrupeesign.circle"
                                    )
                                    let overdue = finance["total_overdue"] ?? 0
                                    alertCard(
                                        title: "OVERDUE FEES",
                                        value: "₹\(String(describing: overdue).components(separatedBy: ".").first ?? "0")",
                                        color: RebelColors.coral,
                                        icon: "exclamationmark.circle"
                                    )
                                }
                                .padding(.horizontal, 16)
                            }

                            // Quick Action Hub
                            VStack(alignment: .leading, spacing: 10) {
                                Text("QUICK ACTIONS")
                                    .font(RebelTypography.badge)
                                    .foregroundColor(.rebelTextSecondary)
                                    .padding(.horizontal, 16)

                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 10) {
                                        if authManager.currentUser?.role != "COACH" {
                                            actionButton("+ Add Lead", icon: "person.badge.plus") { showAddLead = true }
                                            actionButton("+ Schedule Trial", icon: "calendar.badge.plus") { showScheduleTrial = true }
                                            actionButton("+ Enroll Student", icon: "graduationcap") { showEnrollStudent = true }
                                            actionButton("+ Record Payment", icon: "indianrupeesign") { showRecordPayment = true }
                                        }
                                        if let firstSession = sessions.first {
                                            actionButton("Mark Attendance", icon: "checkmark.circle") {
                                                selectedSessionForAttendance = firstSession
                                            }
                                        }
                                    }
                                    .padding(.horizontal, 16)
                                }
                            }

                            // Today's Court Sessions
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Text("COURT TRAINING SESSIONS")
                                        .font(RebelTypography.badge)
                                        .foregroundColor(.rebelTextSecondary)
                                    Spacer()
                                    Text("\(sessions.count) SESSIONS SCHEDULED")
                                        .font(RebelTypography.badge)
                                        .foregroundColor(.rebelPrimary)
                                }
                                .padding(.horizontal, 16)

                                if sessions.isEmpty {
                                    VStack(spacing: 12) {
                                        Image(systemName: "figure.badminton")
                                            .font(.system(size: 36))
                                            .foregroundColor(.rebelTextSecondary.opacity(0.5))
                                        Text("No Sessions Running Today")
                                            .font(RebelTypography.bodyBold)
                                            .foregroundColor(.rebelTextPrimary)
                                        Text("Active batches scheduled for today's weekday will appear here automatically.")
                                            .font(RebelTypography.caption)
                                            .foregroundColor(.rebelTextSecondary)
                                            .multilineTextAlignment(.center)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(32)
                                    .rebelCard()
                                    .padding(.horizontal, 16)
                                } else {
                                    ForEach(sessions) { ses in
                                        sessionCard(ses)
                                    }
                                    .padding(.horizontal, 16)
                                }
                            }
                        }
                        .padding(.vertical, 12)
                    }
                    .refreshable {
                        await loadData()
                    }
                }
            }
            .navigationTitle("S&A Operations")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showAddLead) { AddLeadView() }
            .sheet(isPresented: $showScheduleTrial) { ScheduleTrialSheet() }
            .sheet(isPresented: $showEnrollStudent) { EnrollStudentView() }
            .sheet(isPresented: $showRecordPayment) { FinanceView() }
            .sheet(item: $selectedSessionForAttendance) { ses in
                MarkAttendanceView(session: ses)
            }
            .task {
                await loadData()
            }
        }
    }

    private func loadData() async {
        isLoading = true
        do {
            let sessionRes: APIResponse<TodaySessionsData> = try await APIClient.shared.request(endpoint: .sessionsToday())
            self.sessions = sessionRes.data?.sessions ?? []

            if let repRes: APIResponse<[String: AnyCodable]> = try? await APIClient.shared.request(endpoint: .reportsSummary) {
                if let raw = repRes.data {
                    self.reportData = raw.mapValues { $0.value }
                }
            }
        } catch {
            AppLogger.ui.error("Failed to load today's dashboard: \(error.localizedDescription)")
        }
        isLoading = false
    }

    private func alertCard(title: String, value: String, color: Color, icon: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(RebelTypography.badge)
                    .foregroundColor(.rebelTextSecondary)
                Spacer()
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(color)
            }
            Text(value)
                .font(RebelTypography.metricNumber)
                .foregroundColor(color)
        }
        .rebelCard()
    }

    private func actionButton(_ label: String, icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(.rebelPrimary)
                Text(label)
                    .font(RebelTypography.bodyBold)
                    .foregroundColor(.rebelTextPrimary)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(Color.rebelSurface)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.rebelBorder, lineWidth: 1))
        }
    }

    private func sessionCard(_ ses: SessionItem) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.system(size: 11))
                    Text("\(ses.start_time ?? "") – \(ses.end_time ?? "")")
                        .font(RebelTypography.caption)
                        .fontWeight(.bold)
                }
                .foregroundColor(.rebelPrimary)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.rebelSurfaceElevated)
                .clipShape(RoundedRectangle(cornerRadius: 4))

                Spacer()

                RebelBadge(
                    ses.isCompleted ? "COMPLETED" : "PENDING ATTENDANCE",
                    color: ses.isCompleted ? RebelColors.emerald : RebelColors.amber
                )
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(ses.batch_name ?? "Training Session")
                    .font(RebelTypography.sectionTitle)
                    .foregroundColor(.rebelTextPrimary)
                Text("\(ses.centre_name ?? "Centre") • Coach: \(ses.coach_name ?? "Unassigned")")
                    .font(RebelTypography.caption)
                    .foregroundColor(.rebelTextSecondary)
            }

            HStack {
                Text("Roster: \(ses.marked_students ?? 0) / \(ses.total_students ?? 0) marked")
                    .font(RebelTypography.caption)
                    .foregroundColor(.rebelTextSecondary)

                Spacer()

                Button {
                    selectedSessionForAttendance = ses
                } label: {
                    Text(ses.isCompleted ? "Review Attendance" : "Mark Attendance →")
                        .font(.system(size: 12, weight: .bold))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(ses.isCompleted ? Color.rebelSurfaceElevated : Color.rebelPrimary)
                        .foregroundColor(ses.isCompleted ? .rebelTextPrimary : .black)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
            }
        }
        .rebelCard(borderColor: ses.isCompleted ? RebelColors.emerald.opacity(0.3) : Color.rebelBorder)
    }
}
