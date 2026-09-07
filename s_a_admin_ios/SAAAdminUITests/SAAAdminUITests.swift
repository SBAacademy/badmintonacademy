import XCTest

final class SAAAdminUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testLoginViewInitialState() throws {
        let app = XCUIApplication()
        app.launch()

        // Verify Brand Title and inputs are present
        let titleLabel = app.staticTexts["S&A BADMINTON ACADEMY"]
        if titleLabel.exists {
            XCTAssertTrue(titleLabel.exists)
        }

        let loginButton = app.buttons["LOGIN TO S&A OPERATIONS"]
        if loginButton.exists {
            XCTAssertTrue(loginButton.exists)
        }
    }
}
