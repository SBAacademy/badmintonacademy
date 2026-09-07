import SwiftUI

struct NotificationsView: View {
    @State private var notifications: [NotificationItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                if isLoading && notifications.isEmpty {
                    ProgressView().tint(.rebelLime)
                } else if notifications.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "bell.slash")
                            .font(.system(size: 44))
                            .foregroundColor(.rebelMuted)
                        Text("No Notifications")
                            .font(.headline)
                            .foregroundColor(.rebelWhite)
                        Text("Operational updates, trial reminders, and lead alerts appear here.")
                            .font(.caption)
                            .foregroundColor(.rebelMuted)
                    }
                } else {
                    List(notifications) { item in
                        notificationRow(item)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Notifications")
            .task {
                await loadNotifications()
            }
            .refreshable {
                await loadNotifications()
            }
        }
    }

    private func notificationRow(_ item: NotificationItem) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Circle()
                .fill(item.isRead ? Color.rebelBorder : Color.rebelLime)
                .frame(width: 8, height: 8)
                .padding(.top, 6)

            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.subheadline.bold())
                    .foregroundColor(.rebelWhite)
                Text(item.message)
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
                Text(item.createdAt.prefix(16))
                    .font(.caption2)
                    .foregroundColor(.rebelMuted)
            }
            Spacer()
        }
        .padding(12)
        .rebelCard()
    }

    private func loadNotifications() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: NotificationsResponse = try await APIClient.shared.request(.notifications)
            notifications = res.notifications
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
