import Foundation
import Security

public final class KeychainManager {
    public static let shared = KeychainManager()
    private let service = "com.sabadmintonacademy.admin.keychain"
    private var memoryFallback: [String: Data] = [:]

    private enum Key {
        static let accessToken = "saa_access_token"
        static let refreshToken = "saa_refresh_token"
        static let userProfile = "saa_user_profile"
    }

    private init() {}

    // MARK: - Access Token
    public func saveAccessToken(_ token: String) {
        save(key: Key.accessToken, data: Data(token.utf8))
    }

    public func getAccessToken() -> String? {
        guard let data = read(key: Key.accessToken) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Refresh Token
    public func saveRefreshToken(_ token: String) {
        save(key: Key.refreshToken, data: Data(token.utf8))
    }

    public func getRefreshToken() -> String? {
        guard let data = read(key: Key.refreshToken) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Batch Token Management
    public func saveTokens(accessToken: String, refreshToken: String) {
        saveAccessToken(accessToken)
        saveRefreshToken(refreshToken)
    }

    public func clearAuthTokens() {
        delete(key: Key.accessToken)
        delete(key: Key.refreshToken)
        delete(key: Key.userProfile)
    }

    // MARK: - User Profile
    public func saveUserProfile(_ profile: UserProfile) {
        if let data = try? JSONEncoder().encode(profile) {
            saveUserProfileData(data)
        }
    }

    public func getUserProfile() -> UserProfile? {
        guard let data = getUserProfileData() else { return nil }
        return try? JSONDecoder().decode(UserProfile.self, from: data)
    }

    public func saveUserProfileData(_ data: Data) {
        save(key: Key.userProfile, data: data)
    }

    public func getUserProfileData() -> Data? {
        return read(key: Key.userProfile)
    }

    public func clearAll() {
        clearAuthTokens()
    }

    // MARK: - Low-Level Keychain Ops with Simulator Fallback
    private func save(key: String, data: Data) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        if status != errSecSuccess {
            // Simulator or headless unit test environment fallback
            memoryFallback[key] = data
        } else {
            memoryFallback.removeValue(forKey: key)
        }
    }

    private func read(key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        if status == errSecSuccess, let data = item as? Data {
            return data
        }
        return memoryFallback[key]
    }

    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
        memoryFallback.removeValue(forKey: key)
    }
}
