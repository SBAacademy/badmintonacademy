import Foundation

public enum APIEndpoint {
    // Authentication
    case login
    case refresh
    case logout
    case me

    // Sessions & Attendance
    case sessionsToday(centre: String? = nil)
    case sessions(date: String? = nil, centreId: String? = nil)
    case sessionDetails(id: String)
    case attendance
    case markAttendance
    case attendanceSession(String)

    // Leads & Free Trials
    case leads(status: String? = nil, centre: String? = nil, search: String? = nil)
    case leadDetail(String)
    case trials
    case trialDetail(String)

    // Students & Rosters
    case students(search: String? = nil, centre: String? = nil, status: String? = nil)
    case studentDetail(String)
    case convertLead
    case parents

    // Batches & Schedule
    case batches(centreId: String? = nil, programId: String? = nil)
    case batchDetail(String)
    case createBatch

    // Finance & Ledgers
    case invoices(status: String? = nil, studentId: String? = nil)
    case createInvoice
    case payments
    case recordPayment
    case paymentReminders

    // Academy Directories & Management
    case coaches
    case centres
    case programs
    case performance(studentId: String? = nil)
    case createPerformance
    case studentPerformance(String)

    // Analytics, Content & Operations
    case reports
    case reportsSummary
    case cms(type: String)
    case notifications
    case search(query: String)
    case audit(entity: String? = nil)
    case auditLogs
    case staff
    case createStaff

    public var path: String {
        switch self {
        case .login: return "/api/admin/auth/login"
        case .refresh: return "/api/admin/auth/refresh"
        case .logout: return "/api/admin/auth/logout"
        case .me: return "/api/admin/auth/me"

        case .sessionsToday: return "/api/admin/sessions/today"
        case .sessions: return "/api/admin/sessions"
        case .sessionDetails(let id): return "/api/admin/sessions/\(id)"
        case .attendance, .markAttendance: return "/api/admin/attendance"
        case .attendanceSession(let id): return "/api/admin/attendance/session/\(id)"

        case .leads: return "/api/admin/leads"
        case .leadDetail(let id): return "/api/admin/leads/\(id)"
        case .trials: return "/api/admin/trials"
        case .trialDetail(let id): return "/api/admin/trials/\(id)"

        case .students: return "/api/admin/students"
        case .studentDetail(let id): return "/api/admin/students/\(id)"
        case .convertLead: return "/api/admin/students/convert-lead"
        case .parents: return "/api/admin/parents"

        case .batches, .createBatch: return "/api/admin/batches"
        case .batchDetail(let id): return "/api/admin/batches/\(id)"

        case .invoices, .createInvoice: return "/api/admin/invoices"
        case .payments, .recordPayment: return "/api/admin/payments"
        case .paymentReminders: return "/api/admin/payments/reminders"

        case .coaches: return "/api/admin/coaches"
        case .centres: return "/api/admin/centres"
        case .programs: return "/api/admin/programs"
        case .performance, .createPerformance: return "/api/admin/performance"
        case .studentPerformance(let id): return "/api/admin/performance/student/\(id)"

        case .reports: return "/api/admin/reports"
        case .reportsSummary: return "/api/admin/reports/summary"
        case .cms(let type): return "/api/admin/cms/\(type)"
        case .notifications: return "/api/admin/notifications"
        case .search: return "/api/admin/search"
        case .audit, .auditLogs: return "/api/admin/audit"
        case .staff, .createStaff: return "/api/admin/staff"
        }
    }

    public var queryItems: [URLQueryItem]? {
        switch self {
        case .sessionsToday(let centre):
            if let centre, centre != "ALL" {
                return [URLQueryItem(name: "centre", value: centre)]
            }
            return nil
        case .sessions(let date, let centreId):
            var items: [URLQueryItem] = []
            if let date, !date.isEmpty { items.append(URLQueryItem(name: "date", value: date)) }
            if let centreId, centreId != "ALL" { items.append(URLQueryItem(name: "centre_id", value: centreId)) }
            return items.isEmpty ? nil : items
        case .leads(let status, let centre, let search):
            var items: [URLQueryItem] = []
            if let status, status != "ALL" { items.append(URLQueryItem(name: "status", value: status)) }
            if let centre, centre != "ALL" { items.append(URLQueryItem(name: "centre", value: centre)) }
            if let search, !search.isEmpty { items.append(URLQueryItem(name: "search", value: search)) }
            return items.isEmpty ? nil : items
        case .students(let search, let centre, let status):
            var items: [URLQueryItem] = []
            if let search, !search.isEmpty { items.append(URLQueryItem(name: "search", value: search)) }
            if let centre, centre != "ALL" { items.append(URLQueryItem(name: "centre", value: centre)) }
            if let status, status != "ALL" { items.append(URLQueryItem(name: "status", value: status)) }
            return items.isEmpty ? nil : items
        case .batches(let centreId, let programId):
            var items: [URLQueryItem] = []
            if let centreId, centreId != "ALL" { items.append(URLQueryItem(name: "centre_id", value: centreId)) }
            if let programId, programId != "ALL" { items.append(URLQueryItem(name: "program_id", value: programId)) }
            return items.isEmpty ? nil : items
        case .invoices(let status, let studentId):
            var items: [URLQueryItem] = []
            if let status, status != "ALL" { items.append(URLQueryItem(name: "status", value: status)) }
            if let studentId, !studentId.isEmpty { items.append(URLQueryItem(name: "student_id", value: studentId)) }
            return items.isEmpty ? nil : items
        case .performance(let studentId):
            if let studentId, !studentId.isEmpty {
                return [URLQueryItem(name: "student_id", value: studentId)]
            }
            return nil
        case .search(let query):
            return [URLQueryItem(name: "q", value: query)]
        case .audit(let entity):
            if let entity, entity != "ALL" {
                return [URLQueryItem(name: "entity", value: entity)]
            }
            return nil
        default:
            return nil
        }
    }
}

public enum APIError: LocalizedError, Equatable {
    case invalidURL
    case networkError(String)
    case unauthorized
    case forbidden
    case notFound
    case conflict(String)
    case serverError(String)
    case decodingError(String)
    case tokenRefreshFailed

    public var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid server endpoint URL."
        case .networkError(let msg): return "Network connection failed: \(msg)"
        case .unauthorized: return "Session expired or invalid credentials."
        case .forbidden: return "Access forbidden: insufficient permissions for this operation."
        case .notFound: return "Requested record was not found."
        case .conflict(let msg): return "Constraint conflict: \(msg)"
        case .serverError(let msg): return "Academy server error: \(msg)"
        case .decodingError(let msg): return "Data parsing error: \(msg)"
        case .tokenRefreshFailed: return "Session refresh failed. Please log in again."
        }
    }
}
