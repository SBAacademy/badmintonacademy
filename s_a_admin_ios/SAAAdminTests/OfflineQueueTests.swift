import XCTest
import SwiftData
@testable import SAAAdmin

@MainActor
final class OfflineQueueTests: XCTestCase {
    var modelContainer: ModelContainer!
    var modelContext: ModelContext!
    var store: OfflineAttendanceStore!

    override func setUpWithError() throws {
        let schema = Schema([OfflineAttendanceRecord.self])
        let config = ModelConfiguration(isStoredInMemoryOnly: true)
        modelContainer = try ModelContainer(for: schema, configurations: [config])
        modelContext = ModelContext(modelContainer)
        store = OfflineAttendanceStore(modelContext: modelContext)
    }

    override func tearDownWithError() throws {
        modelContainer = nil
        modelContext = nil
        store = nil
    }

    func testEnqueueAndFetchPendingAttendance() {
        XCTAssertEqual(store.fetchPendingRecords().count, 0)

        store.enqueueAttendance(
            sessionId: "sess-court-1",
            studentId: "stu-101",
            status: "PRESENT"
        )

        store.enqueueAttendance(
            sessionId: "sess-court-1",
            studentId: "stu-102",
            status: "ABSENT"
        )

        let pending = store.fetchPendingRecords()
        XCTAssertEqual(pending.count, 2)
        XCTAssertEqual(pending[0].syncStatus, "PENDING")
        XCTAssertFalse(pending[0].operationId.isEmpty)
    }

    func testAttendanceStatusUpdateForSameStudentInSession() {
        // Coach marks student PRESENT then changes mind to LATE
        store.enqueueAttendance(
            sessionId: "sess-court-2",
            studentId: "stu-201",
            status: "PRESENT"
        )

        store.enqueueAttendance(
            sessionId: "sess-court-2",
            studentId: "stu-201",
            status: "LATE"
        )

        let pending = store.fetchPendingRecords()
        XCTAssertEqual(pending.count, 1, "Should update the existing pending record rather than duplicate")
        XCTAssertEqual(pending.first?.status, "LATE")
    }
}
