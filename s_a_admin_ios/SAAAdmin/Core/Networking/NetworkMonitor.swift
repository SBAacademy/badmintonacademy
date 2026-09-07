import Foundation
import Network
import Combine

public final class NetworkMonitor: ObservableObject {
    public static let shared = NetworkMonitor()
    private let monitor = NWPathMonitor()
    private let queue = DispatchQueue(label: "com.sabadmintonacademy.admin.networkmonitor")

    @Published public private(set) var isConnected: Bool = true
    @Published public private(set) var isCellular: Bool = false

    private init() {
        monitor.pathUpdateHandler = { [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
                self?.isCellular = path.isExpensive
            }
        }
        monitor.start(queue: queue)
    }
}
