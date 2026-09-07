import Foundation

public final class APIClient {
    public static let shared = APIClient()

    public var baseURL: URL = URL(string: "http://172.20.10.9:3000")!
    private let session: URLSession

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 15.0
        config.timeoutIntervalForResource = 30.0
        self.session = URLSession(configuration: config)
    }

    public func setBaseURLString(_ urlString: String) {
        if let url = URL(string: urlString) {
            self.baseURL = url
        }
    }

    // MARK: - Overloaded Request Runner for Positional Endpoint and Raw Data
    public func request<T: Decodable>(
        _ endpoint: APIEndpoint,
        method: String? = nil,
        body: Data? = nil,
        retryOn401: Bool = true
    ) async throws -> T {
        var components = URLComponents(url: baseURL.appendingPathComponent(endpoint.path), resolvingAgainstBaseURL: true)
        components?.queryItems = endpoint.queryItems

        guard let requestURL = components?.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: requestURL)
        let resolvedMethod: String
        if let method {
            resolvedMethod = method
        } else if body != nil {
            resolvedMethod = "POST"
        } else {
            resolvedMethod = "GET"
        }
        request.httpMethod = resolvedMethod
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let accessToken = KeychainManager.shared.getAccessToken(), !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = body
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.networkError(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("Invalid HTTP response.")
        }

        if httpResponse.statusCode == 401 && retryOn401 && endpoint.path != APIEndpoint.login.path && endpoint.path != APIEndpoint.refresh.path {
            let refreshed = await attemptTokenRefresh()
            if refreshed {
                return try await self.request(endpoint, method: method, body: body, retryOn401: false)
            } else {
                KeychainManager.shared.clearAll()
                throw APIError.tokenRefreshFailed
            }
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            if httpResponse.statusCode == 401 { throw APIError.unauthorized }
            if httpResponse.statusCode == 403 { throw APIError.forbidden }
            if httpResponse.statusCode == 404 { throw APIError.notFound }
            let errorMsg = String(data: data, encoding: .utf8) ?? "HTTP \(httpResponse.statusCode)"
            throw APIError.serverError(errorMsg)
        }

        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw APIError.decodingError("Decode failure for \(T.self): \(error.localizedDescription)")
        }
    }

    // MARK: - Generic Request Runner
    public func request<T: Decodable>(
        endpoint: APIEndpoint,
        method: String = "GET",
        body: (any Encodable)? = nil,
        retryOn401: Bool = true
    ) async throws -> T {
        var components = URLComponents(url: baseURL.appendingPathComponent(endpoint.path), resolvingAgainstBaseURL: true)
        components?.queryItems = endpoint.queryItems

        guard let requestURL = components?.url else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: requestURL)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        // Attach Access Token from Keychain
        if let accessToken = KeychainManager.shared.getAccessToken(), !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        // Attach Body
        if let body = body {
            do {
                request.httpBody = try JSONEncoder().encode(body)
            } catch {
                throw APIError.decodingError("Failed to encode request payload: \(error.localizedDescription)")
            }
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.networkError(error.localizedDescription)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("Invalid HTTP response.")
        }

        // Handle 401 with Refresh Token Rotation
        if httpResponse.statusCode == 401 && retryOn401 && endpoint.path != APIEndpoint.login.path && endpoint.path != APIEndpoint.refresh.path {
            let refreshed = await attemptTokenRefresh()
            if refreshed {
                // Retry request with fresh token
                return try await self.request(endpoint: endpoint, method: method, body: body, retryOn401: false)
            } else {
                KeychainManager.shared.clearAll()
                throw APIError.unauthorized
            }
        }

        if httpResponse.statusCode == 403 {
            throw APIError.forbidden
        }

        if httpResponse.statusCode == 404 {
            throw APIError.notFound
        }

        if httpResponse.statusCode == 409 {
            let msg = extractErrorMessage(from: data) ?? "Resource conflict."
            throw APIError.conflict(msg)
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            let serverMsg = extractErrorMessage(from: data) ?? "HTTP \(httpResponse.statusCode)"
            throw APIError.serverError(serverMsg)
        }

        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .useDefaultKeys
            return try decoder.decode(T.self, from: data)
        } catch {
            AppLogger.network.error("Decoding error for \(endpoint.path, privacy: .public): \(error.localizedDescription, privacy: .public)")
            throw APIError.decodingError("Could not decode response from \(endpoint.path): \(error.localizedDescription)")
        }
    }

    // MARK: - Refresh Token Rotation
    private func attemptTokenRefresh() async -> Bool {
        guard let refreshToken = KeychainManager.shared.getRefreshToken(), !refreshToken.isEmpty else {
            return false
        }

        var request = URLRequest(url: baseURL.appendingPathComponent(APIEndpoint.refresh.path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = ["refreshToken": refreshToken]
        guard let httpBody = try? JSONSerialization.data(withJSONObject: payload) else { return false }
        request.httpBody = httpBody

        do {
            let (data, response) = try await session.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
                return false
            }

            struct RefreshResponse: Decodable {
                let success: Bool
                let data: TokenData
                struct TokenData: Decodable {
                    let accessToken: String
                    let refreshToken: String
                }
            }

            let result = try JSONDecoder().decode(RefreshResponse.self, from: data)
            if result.success {
                KeychainManager.shared.saveAccessToken(result.data.accessToken)
                KeychainManager.shared.saveRefreshToken(result.data.refreshToken)
                AppLogger.auth.info("Successfully rotated JWT tokens.")
                return true
            }
            return false
        } catch {
            AppLogger.auth.error("Token refresh failed: \(error.localizedDescription, privacy: .public)")
            return false
        }
    }

    private func extractErrorMessage(from data: Data) -> String? {
        if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
            if let errorStr = json["error"] as? String { return errorStr }
            if let errorObj = json["error"] as? [String: Any], let msg = errorObj["message"] as? String { return msg }
            if let msg = json["message"] as? String { return msg }
        }
        return nil
    }
}
