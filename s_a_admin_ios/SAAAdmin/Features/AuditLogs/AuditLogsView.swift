import SwiftUI

struct AuditLogsView: View {
    @State private var logs: [AuditLogItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                if isLoading && logs.isEmpty {
                    ProgressView().tint(.rebelLime)
                } else if logs.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "shield.checkered")
                            .font(.system(size: 44))
                            .foregroundColor(.rebelMuted)
                        Text("No Audit Records")
                            .font(.headline)
                            .foregroundColor(.rebelWhite)
                        Text("All administrative mutations and access actions are recorded immutably on the server.")
                            .font(.caption)
                            .foregroundColor(.rebelMuted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                } else {
                    List(logs) { log in
                        logCard(log)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Audit Logs")
            .task {
                await loadLogs()
            }
            .refreshable {
                await loadLogs()
            }
        }
    }

    private func logCard(_ log: AuditLogItem) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(log.action.uppercased())
                    .font(.caption.bold())
                    .foregroundColor(.rebelLime)
                Spacer()
                Text(log.createdAt.prefix(19))
                    .font(.caption2)
                    .foregroundColor(.rebelMuted)
            }

            HStack {
                Text("Entity: ")
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
                Text("\(log.entityType) (\(log.entityId ?? "N/A"))")
                    .font(.caption.bold())
                    .foregroundColor(.rebelWhite)
            }

            if let user = log.userName ?? log.userEmail {
                HStack {
                    Text("By: ")
                        .font(.caption)
                        .foregroundColor(.rebelMuted)
                    Text(user)
                        .font(.caption)
                        .foregroundColor(.rebelLime)
                }
            }
        }
        .padding(12)
        .rebelCard()
    }

    private func loadLogs() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: AuditLogsResponse = try await APIClient.shared.request(.auditLogs)
            logs = res.logs
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
