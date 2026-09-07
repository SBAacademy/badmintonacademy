import Foundation
import SwiftUI
import Combine

@MainActor
public final class AuthManager: ObservableObject {
    public static let shared = AuthManager()

    @Published public var isAuthenticated: Bool = false
    @Published public var isLoading: Bool = true
    @Published public var currentUser: UserProfile?
    @Published public var errorMessage: String?
    @Published public var biometricsEnabled: Bool = false

    private init() {
        self.biometricsEnabled = UserDefaults.standard.bool(forKey: "saa_biometrics_enabled")
    }

    public func checkInitialSession() async {
        isLoading = true
        errorMessage = nil

        let token = KeychainManager.shared.getAccessToken()
        let profileData = KeychainManager.shared.getUserProfileData()

        if let token, !token.isEmpty, let profileData {
            do {
                let profile = try JSONDecoder().decode(UserProfile.self, from: profileData)
                self.currentUser = profile
                self.isAuthenticated = true
                self.isLoading = false
                return
            } catch {
                KeychainManager.shared.clearAll()
            }
        }

        self.currentUser = nil
        self.isAuthenticated = false
        self.isLoading = false
    }

    public func login(email: String, password: String) async -> Bool {
        isLoading = true
        errorMessage = nil

        struct LoginPayload: Encodable {
            let email: String
            let password: String
        }

        do {
            let response: APIResponse<LoginResponseData> = try await APIClient.shared.request(
                endpoint: .login,
                method: "POST",
                body: LoginPayload(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password)
            )

            guard response.success, let data = response.data else {
                self.errorMessage = response.error ?? "Invalid credentials. Please verify."
                self.isLoading = false
                return false
            }

            KeychainManager.shared.saveAccessToken(data.accessToken)
            KeychainManager.shared.saveRefreshToken(data.refreshToken)

            if let profileData = try? JSONEncoder().encode(data.user) {
                KeychainManager.shared.saveUserProfileData(profileData)
            }

            self.currentUser = data.user
            self.isAuthenticated = true
            self.isLoading = false
            return true
        } catch {
            self.errorMessage = error.localizedDescription
            self.isLoading = false
            return false
        }
    }

    public func loginWithBiometrics() async -> Bool {
        guard biometricsEnabled else { return false }
        let (success, _) = await BiometricAuthManager.shared.authenticate(reason: "Log in to S&A Badminton Academy Admin")
        if success {
            await checkInitialSession()
            return isAuthenticated
        }
        return false
    }

    public func toggleBiometrics(_ enable: Bool) async -> Bool {
        if enable {
            let (success, _) = await BiometricAuthManager.shared.authenticate(reason: "Enable Biometric Login")
            if success {
                self.biometricsEnabled = true
                UserDefaults.standard.set(true, forKey: "saa_biometrics_enabled")
                return true
            }
            return false
        } else {
            self.biometricsEnabled = false
            UserDefaults.standard.set(false, forKey: "saa_biometrics_enabled")
            return true
        }
    }

    public func logout() {
        Task {
            await logoutAsync()
        }
    }

    public func logoutAsync() async {
        isLoading = true

        if let refreshToken = KeychainManager.shared.getRefreshToken() {
            struct LogoutPayload: Encodable {
                let refreshToken: String
            }
            let _: APIResponse<[String: String]>? = try? await APIClient.shared.request(
                endpoint: .logout,
                method: "POST",
                body: LogoutPayload(refreshToken: refreshToken)
            )
        }

        KeychainManager.shared.clearAll()
        self.currentUser = nil
        self.isAuthenticated = false
        self.isLoading = false
    }
}
