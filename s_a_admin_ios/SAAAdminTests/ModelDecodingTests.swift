import XCTest
@testable import SAAAdmin

final class ModelDecodingTests: XCTestCase {

    func testDecodeSessionsResponse() throws {
        let json = """
        {
            "success": true,
            "sessions": [
                {
                    "id": "session-101",
                    "batch_name": "Junior Development",
                    "centre_name": "Kadavanthra",
                    "program_name": "Kids Academy",
                    "coach_name": "Coach Sooraj",
                    "session_date": "2026-09-08",
                    "start_time": "16:00",
                    "end_time": "17:30",
                    "student_count": 14,
                    "status": "SCHEDULED"
                }
            ]
        }
        """.data(using: .utf8)!

        let decoded = try JSONDecoder().decode(SessionsResponse.self, from: json)
        XCTAssertTrue(decoded.success)
        XCTAssertEqual(decoded.sessions.count, 1)

        let s = decoded.sessions[0]
        XCTAssertEqual(s.id, "session-101")
        XCTAssertEqual(s.batchName, "Junior Development")
        XCTAssertEqual(s.studentCount, 14)
        XCTAssertEqual(s.timeWindow, "16:00 - 17:30")
    }

    func testDecodeLeadsResponse() throws {
        let json = """
        {
            "success": true,
            "leads": [
                {
                    "id": "lead-201",
                    "name": "Rohan Sharma",
                    "phone": "9847012345",
                    "email": "rohan@example.com",
                    "status": "TRIAL_SCHEDULED",
                    "preferred_centre": "kumbalanghi",
                    "centre_name": "Kumbalanghi Centre",
                    "program_id": "juniors",
                    "program_name": "Junior Development",
                    "created_at": "2026-09-08T09:00:00.000Z"
                }
            ],
            "total": 1
        }
        """.data(using: .utf8)!

        let decoded = try JSONDecoder().decode(LeadsResponse.self, from: json)
        XCTAssertTrue(decoded.success)
        XCTAssertEqual(decoded.leads.count, 1)
        XCTAssertEqual(decoded.leads[0].name, "Rohan Sharma")
        XCTAssertEqual(decoded.leads[0].status, "TRIAL_SCHEDULED")
    }

    func testDecodeInvoicesResponseWithFlexibleDecimal() throws {
        // Test numeric string decimal decoding
        let json = """
        {
            "success": true,
            "invoices": [
                {
                    "id": "inv-501",
                    "invoice_number": "INV-2026-001",
                    "student_name": "Aditya Varma",
                    "total_amount": "4500.00",
                    "paid_amount": 2500,
                    "balance_amount": "2000.00",
                    "status": "PARTIAL",
                    "due_date": "2026-09-15",
                    "created_at": "2026-09-01T10:00:00.000Z"
                }
            ]
        }
        """.data(using: .utf8)!

        let decoded = try JSONDecoder().decode(InvoicesResponse.self, from: json)
        XCTAssertTrue(decoded.success)
        XCTAssertEqual(decoded.invoices.count, 1)
        XCTAssertEqual(decoded.invoices[0].invoiceNumber, "INV-2026-001")
        XCTAssertEqual(decoded.invoices[0].totalAmount, 4500.0)
        XCTAssertEqual(decoded.invoices[0].balanceAmount, 2000.0)
        XCTAssertEqual(decoded.invoices[0].status, "PARTIAL")
    }

    func testDecodePerformanceResponse() throws {
        let json = """
        {
            "success": true,
            "assessments": [
                {
                    "id": "perf-301",
                    "student_id": "stu-10",
                    "student_name": "Kavya Menon",
                    "assessment_date": "2026-09-05",
                    "footwork_score": 8.5,
                    "technique_score": 9.0,
                    "fitness_score": 7.5,
                    "tactical_score": 8.0,
                    "consistency_score": 8.0,
                    "overall_score": 8.2,
                    "coach_notes": "Rapid improvement in cross-court drops"
                }
            ]
        }
        """.data(using: .utf8)!

        let decoded = try JSONDecoder().decode(PerformanceResponse.self, from: json)
        XCTAssertTrue(decoded.success)
        XCTAssertEqual(decoded.assessments.count, 1)
        XCTAssertEqual(decoded.assessments[0].studentName, "Kavya Menon")
        XCTAssertEqual(decoded.assessments[0].overallScore, 8.2)
    }
}
