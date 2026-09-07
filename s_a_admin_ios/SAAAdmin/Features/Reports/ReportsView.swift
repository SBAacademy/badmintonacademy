import SwiftUI

struct ReportsView: View {
    @State private var reportsData: ReportsData? = nil
    @State private var isLoading = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                if isLoading && reportsData == nil {
                    ProgressView().tint(.rebelLime)
                } else if let err = errorMessage, reportsData == nil {
                    VStack(spacing: 8) {
                        Image(systemName: "exclamationmark.triangle")
                            .font(.system(size: 40))
                            .foregroundColor(.rebelDanger)
                        Text("Failed to Load Reports")
                            .font(.headline)
                            .foregroundColor(.rebelWhite)
                        Text(err)
                            .font(.caption)
                            .foregroundColor(.rebelMuted)
                    }
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            if let overview = reportsData?.overview {
                                Text("ACADEMY REVENUE & ENROLMENT")
                                    .font(.caption.bold())
                                    .foregroundColor(.rebelMuted)
                                    .frame(maxWidth: .infinity, alignment: .leading)

                                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                                    metricBox(title: "TOTAL STUDENTS", value: "\(overview.totalStudents ?? 0)", subtitle: "Active Enrolments", icon: "person.2.fill")
                                    metricBox(title: "TOTAL REVENUE", value: "₹\(Int(overview.totalRevenue?.value ?? 0))", subtitle: "Collected", icon: "indianrupeesign.circle.fill")
                                    metricBox(title: "RECEIVABLES", value: "₹\(Int(overview.outstandingReceivables?.value ?? 0))", subtitle: "Pending / Overdue", icon: "exclamationmark.circle.fill")
                                    metricBox(title: "ACTIVE BATCHES", value: "\(overview.activeBatches ?? 0)", subtitle: "3 Centres", icon: "sportscourt.fill")
                                }
                            }

                            if let funnel = reportsData?.funnel {
                                Text("ADMISSIONS FUNNEL")
                                    .font(.caption.bold())
                                    .foregroundColor(.rebelMuted)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.top, 8)

                                VStack(spacing: 10) {
                                    funnelRow(stage: "Total Enquiries / Leads", count: funnel.leadsCount ?? 0, total: funnel.leadsCount ?? 1, color: .rebelInfo)
                                    funnelRow(stage: "Trials Scheduled & Attended", count: funnel.trialsAttended ?? 0, total: funnel.leadsCount ?? 1, color: .rebelWarning)
                                    funnelRow(stage: "Enrolled & Converted", count: funnel.conversionsCount ?? 0, total: funnel.leadsCount ?? 1, color: .rebelLime)

                                    Divider().background(Color.rebelBorder)

                                    HStack {
                                        Text("Overall Conversion Rate")
                                            .font(.caption)
                                            .foregroundColor(.rebelMuted)
                                        Spacer()
                                        let rate = funnel.conversionRate ?? 0
                                        Text(String(format: "%.1f%%", rate))
                                            .font(.title3.bold())
                                            .foregroundColor(.rebelLime)
                                    }
                                }
                                .padding(16)
                                .rebelCard()
                            }

                            if let attendance = reportsData?.attendance {
                                Text("ATTENDANCE DISCIPLINE")
                                    .font(.caption.bold())
                                    .foregroundColor(.rebelMuted)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.top, 8)

                                VStack(spacing: 12) {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text("Overall Attendance Rate")
                                                .font(.subheadline.bold())
                                                .foregroundColor(.rebelWhite)
                                            Text("Calculated from verified coach submissions")
                                                .font(.caption2)
                                                .foregroundColor(.rebelMuted)
                                        }
                                        Spacer()
                                        Text(String(format: "%.1f%%", attendance.averageRate ?? 88.0))
                                            .font(.title2.bold())
                                            .foregroundColor(.rebelLime)
                                    }

                                    ProgressView(value: min((attendance.averageRate ?? 88.0) / 100.0, 1.0))
                                        .tint(.rebelLime)
                                }
                                .padding(16)
                                .rebelCard()
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Analytics & Reports")
            .task {
                await loadReports()
            }
            .refreshable {
                await loadReports()
            }
        }
    }

    private func metricBox(title: String, value: String, subtitle: String, icon: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(title)
                    .font(.caption2.bold())
                    .foregroundColor(.rebelMuted)
                Spacer()
                Image(systemName: icon)
                    .foregroundColor(.rebelLime)
            }
            Text(value)
                .font(.title2.bold())
                .foregroundColor(.rebelWhite)
            Text(subtitle)
                .font(.caption2)
                .foregroundColor(.rebelMuted)
        }
        .padding(14)
        .rebelCard()
    }

    private func funnelRow(stage: String, count: Int, total: Int, color: Color) -> some View {
        let ratio = total > 0 ? Double(count) / Double(total) : 0
        return VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(stage)
                    .font(.caption)
                    .foregroundColor(.rebelWhite)
                Spacer()
                Text("\(count)")
                    .font(.caption.bold())
                    .foregroundColor(color)
            }
            ProgressView(value: ratio)
                .tint(color)
        }
    }

    private func loadReports() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: ReportsResponse = try await APIClient.shared.request(.reports)
            reportsData = res.reports
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
