import Foundation
import SwiftData

@Model
public final class OfflineAttendanceRecord {
    public var id: UUID
    public var operationId: String
    public var sessionId: String
    public var studentId: String
    public var status: String
    public var coachNote: String
    public var timestamp: Date
    public var retryCount: Int
    public var syncStatus: String // "PENDING", "SYNCING", "SYNCED", "FAILED"
    public var errorMessage: String?

    public init(
        id: UUID = UUID(),
        operationId: String = UUID().uuidString,
        sessionId: String,
        studentId: String,
        status: String,
        coachNote: String = "",
        timestamp: Date = Date(),
        retryCount: Int = 0,
        syncStatus: String = "PENDING",
        errorMessage: String? = nil
    ) {
        self.id = id
        self.operationId = operationId
        self.sessionId = sessionId
        self.studentId = studentId
        self.status = status
        self.coachNote = coachNote
        self.timestamp = timestamp
        self.retryCount = retryCount
        self.syncStatus = syncStatus
        self.errorMessage = errorMessage
    }
}

public final class OfflineAttendanceStore {
    public static let shared = OfflineAttendanceStore()
    public let modelContainer: ModelContainer?
    private var explicitContext: ModelContext?

    public init(modelContext: ModelContext? = nil) {
        self.explicitContext = modelContext
        if modelContext != nil {
            self.modelContainer = nil
        } else {
            do {
                let schema = Schema([OfflineAttendanceRecord.self])
                let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
                self.modelContainer = try ModelContainer(for: schema, configurations: [config])
            } catch {
                AppLogger.attendance.error("Failed to initialize SwiftData modelContainer: \(error.localizedDescription, privacy: .public)")
                self.modelContainer = nil
            }
        }
    }

    @MainActor
    private var currentContext: ModelContext? {
        explicitContext ?? modelContainer?.mainContext
    }

    @MainActor
    public func enqueueAttendance(sessionId: String, studentId: String, status: String, coachNote: String = "") {
        guard let context = currentContext else { return }

        // Deduplicate if already queued for this session and student
        let descriptor = FetchDescriptor<OfflineAttendanceRecord>(
            predicate: #Predicate { $0.sessionId == sessionId && $0.studentId == studentId && ($0.syncStatus == "PENDING" || $0.syncStatus == "FAILED") }
        )

        if let existing = try? context.fetch(descriptor), let first = existing.first {
            first.status = status
            first.coachNote = coachNote
            first.timestamp = Date()
            try? context.save()
            return
        }

        let record = OfflineAttendanceRecord(
            sessionId: sessionId,
            studentId: studentId,
            status: status,
            coachNote: coachNote
        )
        context.insert(record)
        try? context.save()
        AppLogger.attendance.info("Enqueued offline attendance for student \(studentId) in session \(sessionId).")
    }

    @MainActor
    public func fetchPendingRecords() -> [OfflineAttendanceRecord] {
        guard let context = currentContext else { return [] }
        let descriptor = FetchDescriptor<OfflineAttendanceRecord>(
            predicate: #Predicate { $0.syncStatus == "PENDING" || $0.syncStatus == "FAILED" }
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    @MainActor
    public func pendingCount() -> Int {
        return fetchPendingRecords().count
    }

    @MainActor
    @discardableResult
    public func syncPendingRecords() async -> Int {
        let (synced, _) = await syncPendingRecordsDetailed()
        return synced
    }

    @MainActor
    public func syncPendingRecordsDetailed() async -> (synced: Int, failed: Int) {
        guard let context = currentContext else { return (0, 0) }

        let records = fetchPendingRecords()
        guard !records.isEmpty else { return (0, 0) }

        let grouped = Dictionary(grouping: records, by: { $0.sessionId })
        var totalSynced = 0
        var totalFailed = 0

        struct RecordPayload: Encodable {
            let student_id: String
            let status: String
            let coach_note: String
        }

        struct AttendancePayload: Encodable {
            let session_id: String
            let records: [RecordPayload]
        }

        for (sessionId, sessionRecords) in grouped {
            let payloadRecords = sessionRecords.map {
                RecordPayload(student_id: $0.studentId, status: $0.status, coach_note: $0.coachNote)
            }

            do {
                let _: APIResponse<[String: String]> = try await APIClient.shared.request(
                    endpoint: .markAttendance,
                    method: "POST",
                    body: AttendancePayload(session_id: sessionId, records: payloadRecords)
                )

                for r in sessionRecords {
                    context.delete(r) // Successfully synced and removed from queue
                }
                totalSynced += sessionRecords.count
            } catch {
                for r in sessionRecords {
                    r.syncStatus = "FAILED"
                    r.retryCount += 1
                    r.errorMessage = error.localizedDescription
                }
                totalFailed += sessionRecords.count
            }
        }

        try? context.save()
        return (totalSynced, totalFailed)
    }
}
