import XCTest
@testable import SAAAdmin

final class AuthenticationTests: XCTestCase {

    override func setUpWithError() throws {
        // Clear any existing test tokens
        KeychainManager.shared.clearAuthTokens()
    }

    override func tearDownWithError() throws {
        KeychainManager.shared.clearAuthTokens()
    }

    func testTokenStorageAndRetrieval() {
        let testAccess = "jwt-access-token-test-12345"
        let testRefresh = "jwt-refresh-token-test-67890"

        KeychainManager.shared.saveTokens(accessToken: testAccess, refreshToken: testRefresh)

        XCTAssertEqual(KeychainManager.shared.getAccessToken(), testAccess)
        XCTAssertEqual(KeychainManager.shared.getRefreshToken(), testRefresh)
    }

    func testUserProfileStorage() {
        let testProfile = UserProfile(
            id: "user-admin-01",
            name: "Academy Director",
            email: "director@sabadminton.com",
            role: "SUPER_ADMIN",
            centreId: "kadavanthra"
        )

        KeychainManager.shared.saveUserProfile(testProfile)
        let loaded = KeychainManager.shared.getUserProfile()

        XCTAssertNotNil(loaded)
        XCTAssertEqual(loaded?.id, "user-admin-01")
        XCTAssertEqual(loaded?.name, "Academy Director")
        XCTAssertEqual(loaded?.role, "SUPER_ADMIN")
        XCTAssertEqual(loaded?.centreId, "kadavanthra")
    }

    func testTokenClearingOnLogout() {
        KeychainManager.shared.saveTokens(accessToken: "temp-acc", refreshToken: "temp-ref")
        XCTAssertNotNil(KeychainManager.shared.getAccessToken())

        KeychainManager.shared.clearAuthTokens()
        XCTAssertNil(KeychainManager.shared.getAccessToken())
        XCTAssertNil(KeychainManager.shared.getRefreshToken())
        XCTAssertNil(KeychainManager.shared.getUserProfile())
    }
}
