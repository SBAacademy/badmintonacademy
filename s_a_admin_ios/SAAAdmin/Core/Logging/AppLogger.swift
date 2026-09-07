import Foundation
import OSLog

public struct AppLogger {
    private static let subsystem = "com.sabadmintonacademy.admin"

    public static let network = Logger(subsystem: subsystem, category: "network")
    public static let auth = Logger(subsystem: subsystem, category: "auth")
    public static let attendance = Logger(subsystem: subsystem, category: "attendance")
    public static let sync = Logger(subsystem: subsystem, category: "sync")
    public static let ui = Logger(subsystem: subsystem, category: "ui")

    public static func logError(_ category: Logger, _ message: String, error: Error? = nil) {
        if let error {
            category.error("\(message, privacy: .public): \(error.localizedDescription, privacy: .public)")
        } else {
            category.error("\(message, privacy: .public)")
        }
    }
}
