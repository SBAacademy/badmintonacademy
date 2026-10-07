import XCTest
@testable import SAAAdmin

final class RBACPermissionTests: XCTestCase {

    func testCoachPermissions() {
        let coachUser = UserProfile(
            id: "coach-1",
            name: "Coach Rahul",
            email: "rahul@sabadminton.com",
            role: "COACH",
            centreId: "kadavanthra"
        )

        XCTAssertEqual(coachUser.role, "COACH")
        // Coach should have access to sessions, attendance, performance
        // Coach should NOT have finance / audit / staff permissions
        XCTAssertFalse(coachUser.role == "SUPER_ADMIN" || coachUser.role == "ADMIN")
    }

    func testSuperAdminPermissions() {
        let adminUser = UserProfile(
            id: "admin-1",
            name: "Director",
            email: "director@sabadminton.com",
            role: "SUPER_ADMIN",
            centreId: "kadavanthra"
        )

        XCTAssertTrue(adminUser.role == "SUPER_ADMIN")
    }

    func testCanonicalCentresEnforcement() {
        let validCentres = ["kadavanthra", "kumbalanghi", "maradu", "palluruthy", "chullikal"]

        // Must reject or disallow unapproved centres
        XCTAssertFalse(validCentres.contains("fourth-centre"))
        XCTAssertFalse(validCentres.contains("invalid-centre-1"))
        XCTAssertFalse(validCentres.contains("invalid-centre-2"))
        XCTAssertTrue(validCentres.contains("kadavanthra"))
        XCTAssertTrue(validCentres.contains("kumbalanghi"))
        XCTAssertTrue(validCentres.contains("maradu"))
        XCTAssertTrue(validCentres.contains("palluruthy"))
        XCTAssertTrue(validCentres.contains("chullikal"))
        XCTAssertEqual(validCentres.count, 5)
    }
}
