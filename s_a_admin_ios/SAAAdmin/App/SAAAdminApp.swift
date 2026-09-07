import SwiftUI
import SwiftData
import UserNotifications

@main
struct SAAAdminApp: App {
    @ObservedObject private var authManager = AuthManager.shared

    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            OfflineAttendanceRecord.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    init() {
        configureAppearance()
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if authManager.isAuthenticated {
                    MainTabView()
                        .environmentObject(authManager)
                        .onOpenURL { url in
                            handleDeepLink(url)
                        }
                } else {
                    LoginView()
                        .environmentObject(authManager)
                }
            }
            .preferredColorScheme(.dark)
        }
        .modelContainer(sharedModelContainer)
    }

    private func configureAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(named: "PitchBlack") ?? UIColor(red: 0.027, green: 0.035, blue: 0.051, alpha: 1.0)
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance

        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithOpaqueBackground()
        navAppearance.backgroundColor = UIColor(named: "PitchBlack") ?? UIColor(red: 0.027, green: 0.035, blue: 0.051, alpha: 1.0)
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
    }

    private func handleDeepLink(_ url: URL) {
        AppLogger.network.info("Received deep link URL: \(url.absoluteString, privacy: .public)")
        // Supports: saaadmin://lead/{id}, saaadmin://student/{id}, saaadmin://session/{id}
        guard url.scheme == "saaadmin" else { return }
        let host = url.host
        let pathComponents = url.pathComponents.filter { $0 != "/" }
        AppLogger.network.info("Deep link destination: host=\(host ?? "nil", privacy: .public), path=\(pathComponents.joined(separator: "/"), privacy: .public)")
    }
}
