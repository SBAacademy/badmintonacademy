import Foundation
import LocalAuthentication

public final class BiometricAuthManager {
    public static let shared = BiometricAuthManager()

    private let biometricsEnabledKey = "saa_biometrics_enabled"

    private init() {}

    public var isBiometricEnabled: Bool {
        get {
            UserDefaults.standard.bool(forKey: biometricsEnabledKey)
        }
        set {
            UserDefaults.standard.set(newValue, forKey: biometricsEnabledKey)
        }
    }

    public enum BiometricType {
        case none
        case touchID
        case faceID
        case opticID
    }

    public var biometricType: BiometricType {
        let context = LAContext()
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return .none
        }

        switch context.biometryType {
        case .touchID: return .touchID
        case .faceID: return .faceID
        case .opticID: return .opticID
        @unknown default: return .none
        }
    }

    public var isBiometricsAvailable: Bool {
        let context = LAContext()
        var error: NSError?
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
    }

    public func authenticate(reason: String = "Unlock S&A Academy Admin") async -> (success: Bool, error: String?) {
        let context = LAContext()
        context.localizedCancelTitle = "Use Password"

        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return (false, error?.localizedDescription ?? "Biometrics unavailable.")
        }

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )
            return (success, nil)
        } catch let laError {
            return (false, laError.localizedDescription)
        }
    }
}
