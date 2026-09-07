import Foundation

// MARK: - Flexible Numeric Type for PostgreSQL Decimals
public enum StringOrDouble: Codable, Equatable {
    case string(String)
    case double(Double)

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let d = try? container.decode(Double.self) {
            self = .double(d)
        } else if let s = try? container.decode(String.self) {
            self = .string(s)
        } else if let i = try? container.decode(Int.self) {
            self = .double(Double(i))
        } else {
            self = .double(0.0)
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let s): try container.encode(s)
        case .double(let d): try container.encode(d)
        }
    }

    public var value: Double {
        switch self {
        case .double(let d): return d
        case .string(let s): return Double(s) ?? 0.0
        }
    }
}

// MARK: - Generic API Wrapper
public struct APIResponse<T: Decodable>: Decodable {
    public let success: Bool
    public let data: T?
    public let message: String?
    public let error: String?

    public init(success: Bool, data: T? = nil, message: String? = nil, error: String? = nil) {
        self.success = success
        self.data = data
        self.message = message
        self.error = error
    }
}

public struct LoginResponseData: Codable {
    public let accessToken: String
    public let refreshToken: String
    public let user: UserProfile
}

public struct AnyCodable: Codable, Equatable {
    public let value: String

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let s = try? container.decode(String.self) {
            self.value = s
        } else if let i = try? container.decode(Int.self) {
            self.value = String(i)
        } else if let b = try? container.decode(Bool.self) {
            self.value = String(b)
        } else if let d = try? container.decode(Double.self) {
            self.value = String(d)
        } else {
            self.value = ""
        }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(value)
    }

    public static func == (lhs: AnyCodable, rhs: AnyCodable) -> Bool {
        lhs.value == rhs.value
    }
}

// MARK: - User & Auth
public struct UserProfile: Identifiable, Codable, Equatable {
    public let id: String
    public let name: String
    public let email: String
    public let role: String
    public let centreId: String?

    public init(id: String, name: String, email: String, role: String, centreId: String? = nil) {
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.centreId = centreId
    }

    enum CodingKeys: String, CodingKey {
        case id, name, email, role
        case centreId = "centre_id"
        case fullName = "fullName"
        case userId = "userId"
        case assignedCentre = "assignedCentre"
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let idVal = try? container.decode(String.self, forKey: .id)
        let userIdVal = try? container.decode(String.self, forKey: .userId)
        self.id = idVal ?? userIdVal ?? UUID().uuidString

        let nameVal = try? container.decode(String.self, forKey: .name)
        let fullNameVal = try? container.decode(String.self, forKey: .fullName)
        self.name = nameVal ?? fullNameVal ?? "User"

        self.email = (try? container.decode(String.self, forKey: .email)) ?? ""
        self.role = (try? container.decode(String.self, forKey: .role)) ?? "ADMIN"
        self.centreId = (try? container.decodeIfPresent(String.self, forKey: .centreId)) ?? (try? container.decodeIfPresent(String.self, forKey: .assignedCentre))
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encode(email, forKey: .email)
        try container.encode(role, forKey: .role)
        try container.encodeIfPresent(centreId, forKey: .centreId)
    }

    public var userId: String { id }
    public var fullName: String { name }
    public var assignedCentre: String? { centreId }
}

public struct LoginResponse: Decodable {
    public let success: Bool
    public let accessToken: String?
    public let refreshToken: String?
    public let user: UserProfile?
    public let message: String?
}

// MARK: - Sessions & Timetable
public struct SessionsResponse: Decodable {
    public let success: Bool
    public let sessions: [SessionItem]
}

public struct SessionItem: Identifiable, Codable, Equatable {
    public let id: String
    public let batchName: String?
    public let centreName: String?
    public let programName: String?
    public let coachName: String?
    public let sessionDate: String?
    public let startTime: String?
    public let endTime: String?
    public let studentCount: Int?
    public let status: String

    enum CodingKeys: String, CodingKey {
        case id, status
        case batchName = "batch_name"
        case centreName = "centre_name"
        case programName = "program_name"
        case coachName = "coach_name"
        case sessionDate = "session_date"
        case startTime = "start_time"
        case endTime = "end_time"
        case studentCount = "student_count"
    }

    public var timeWindow: String {
        "\(startTime ?? "06:00") - \(endTime ?? "07:30")"
    }

    public var batch_name: String? { batchName }
    public var centre_name: String? { centreName }
    public var coach_name: String? { coachName }
    public var start_time: String? { startTime }
    public var end_time: String? { endTime }
    public var total_students: Int? { studentCount }
    public var marked_students: Int? { studentCount }
    public var isCompleted: Bool { status.uppercased() == "COMPLETED" }
}

public struct SessionDetailResponse: Decodable {
    public let success: Bool
    public let session: SessionDetail?
}

public struct SessionDetail: Identifiable, Codable {
    public let id: String
    public let roster: [AttendanceEntry]?
}

public struct AttendanceEntry: Identifiable, Codable, Equatable {
    public var id: String { studentId }
    public let studentId: String
    public let studentName: String
    public let parentPhone: String?
    public var status: String?

    enum CodingKeys: String, CodingKey {
        case studentId = "student_id"
        case studentName = "student_name"
        case parentPhone = "parent_phone"
        case status
    }

    public init(studentId: String, studentName: String, parentPhone: String?, status: String?) {
        self.studentId = studentId
        self.studentName = studentName
        self.parentPhone = parentPhone
        self.status = status
    }
}

public struct TodaySessionsData: Codable {
    public let date: String?
    public let dayOfWeek: String?
    public let totalSessions: Int?
    public let sessions: [SessionItem]
}

// MARK: - Leads & Inbound CRM
public struct LeadsData: Codable {
    public let total: Int?
    public let leads: [LeadItem]
}

public struct LeadsResponse: Decodable {
    public let success: Bool
    public let leads: [LeadItem]
    public let total: Int?
}

public struct LeadItem: Identifiable, Codable, Equatable {
    public let id: String
    public let name: String
    public let phone: String
    public let email: String?
    public var status: String
    public let preferredCentre: String?
    public let centreName: String?
    public let programId: String?
    public let programName: String?
    public let assignedStaff: String?
    public let followUpDate: String?
    public let notes: String?
    public let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, name, phone, email, status, notes
        case preferredCentre = "preferred_centre"
        case centreName = "centre_name"
        case programId = "program_id"
        case programName = "program_name"
        case assignedStaff = "assigned_staff"
        case followUpDate = "follow_up_date"
        case createdAt = "created_at"
    }

    public var branch: String? { preferredCentre }
    public var program: String? { programName ?? programId }
}

public struct LeadDetailResponse: Decodable {
    public let success: Bool
    public let lead: LeadItem?
    public let timeline: [LeadTimelineItem]?
}

public struct LeadTimelineItem: Identifiable, Codable, Equatable {
    public var id: String { "\(action)_\(createdAt ?? "")" }
    public let action: String
    public let note: String?
    public let createdBy: String?
    public let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case action, note
        case createdBy = "created_by"
        case createdAt = "created_at"
    }
}

// MARK: - Students
public struct StudentsData: Codable {
    public let total: Int?
    public let students: [StudentItem]
}

public struct StudentsResponse: Decodable {
    public let success: Bool
    public let students: [StudentItem]
    public let total: Int?
}

public struct StudentItem: Identifiable, Codable, Equatable {
    public let id: String
    public let studentCode: String?
    public let name: String
    public let parentName: String?
    public let parentPhone: String?
    public let centreName: String?
    public let programName: String?
    public let batchName: String?
    public let status: String

    enum CodingKeys: String, CodingKey {
        case id, name, status
        case studentCode = "student_code"
        case parentName = "parent_name"
        case parentPhone = "parent_phone"
        case centreName = "centre_name"
        case programName = "program_name"
        case batchName = "batch_name"
    }

    public var full_name: String { name }
    public var student_code: String? { studentCode }
    public var centre_name: String? { centreName }
    public var primary_centre: String? { centreName }
    public var program_name: String? { programName }
    public var primary_program: String? { programName }
    public var parent_name: String? { parentName }
    public var parent_phone: String? { parentPhone }
    public var monthly_fee: Double? { nil }
    public var gender: String? { nil }
}

public struct StudentDetailResponse: Decodable {
    public let success: Bool
    public let student: StudentDetail?
    public let payments: [StudentPaymentItem]?
    public let attendance: [StudentAttendanceItem]?
}

public struct StudentDetail: Identifiable, Codable {
    public let id: String
    public let studentCode: String?
    public let name: String
    public let gender: String?
    public let dateOfBirth: String?
    public let parentName: String?
    public let parentPhone: String?
    public let parentEmail: String?
    public let centreName: String?
    public let programName: String?
    public let batchName: String?
    public let status: String

    enum CodingKeys: String, CodingKey {
        case id, name, gender, status
        case studentCode = "student_code"
        case dateOfBirth = "date_of_birth"
        case parentName = "parent_name"
        case parentPhone = "parent_phone"
        case parentEmail = "parent_email"
        case centreName = "centre_name"
        case programName = "program_name"
        case batchName = "batch_name"
    }
}

public struct StudentPaymentItem: Identifiable, Codable {
    public let id: String
    public let invoiceNumber: String
    public let amount: StringOrDouble
    public let status: String
    public let dueDate: String?

    enum CodingKeys: String, CodingKey {
        case id, status
        case invoiceNumber = "invoice_number"
        case amount = "total_amount"
        case dueDate = "due_date"
    }

    public var amountValue: Double { amount.value }
}

public struct StudentAttendanceItem: Identifiable, Codable {
    public var id: String { "\(date)_\(status)" }
    public let date: String
    public let status: String
}

// MARK: - Batches
public struct BatchesResponse: Decodable {
    public let success: Bool
    public let batches: [BatchItem]
}

public struct BatchItem: Identifiable, Codable, Equatable {
    public let id: String
    public let name: String
    public let centreName: String?
    public let programName: String?
    public let coachName: String?
    public let startTime: String?
    public let endTime: String?
    public let daysOfWeek: [String]?
    public let capacity: Int
    public let currentEnrolment: Int?
    public let isActive: Bool

    enum CodingKeys: String, CodingKey {
        case id, name
        case centreName = "centre_name"
        case programName = "program_name"
        case coachName = "coach_name"
        case startTime = "start_time"
        case endTime = "end_time"
        case daysOfWeek = "days_of_week"
        case capacity
        case currentEnrolment = "current_enrolment"
        case isActive = "is_active"
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.centreName = try? container.decodeIfPresent(String.self, forKey: .centreName)
        self.programName = try? container.decodeIfPresent(String.self, forKey: .programName)
        self.coachName = try? container.decodeIfPresent(String.self, forKey: .coachName)
        self.startTime = try? container.decodeIfPresent(String.self, forKey: .startTime)
        self.endTime = try? container.decodeIfPresent(String.self, forKey: .endTime)
        self.daysOfWeek = try? container.decodeIfPresent([String].self, forKey: .daysOfWeek)
        self.capacity = (try? container.decode(Int.self, forKey: .capacity)) ?? 16
        self.currentEnrolment = try? container.decodeIfPresent(Int.self, forKey: .currentEnrolment)
        self.isActive = (try? container.decode(Bool.self, forKey: .isActive)) ?? true
    }
}

// MARK: - Invoices & Payments
public struct InvoicesResponse: Decodable {
    public let success: Bool
    public let invoices: [InvoiceItem]
}

public struct InvoiceItem: Identifiable, Codable, Equatable {
    public let id: String
    public let invoiceNumber: String
    public let studentName: String?
    public let total: StringOrDouble
    public let paid: StringOrDouble?
    public let balance: StringOrDouble
    public let status: String
    public let dueDate: String?
    public let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, status
        case invoiceNumber = "invoice_number"
        case studentName = "student_name"
        case total = "total_amount"
        case paid = "paid_amount"
        case balance = "balance_amount"
        case dueDate = "due_date"
        case createdAt = "created_at"
    }

    public var totalAmount: Double { total.value }
    public var paidAmount: Double { paid?.value ?? 0 }
    public var balanceAmount: Double { balance.value }
}

// MARK: - Coaching Staff
public struct CoachesResponse: Decodable {
    public let success: Bool
    public let coaches: [CoachItem]
}

public struct CoachItem: Identifiable, Codable, Equatable {
    public let id: String
    public let name: String
    public let email: String?
    public let phone: String?
    public let specialization: String?
    public let experienceYears: Int?
    public let certifications: [String]?
    public let status: String

    enum CodingKeys: String, CodingKey {
        case id, name, email, phone, specialization, status, certifications
        case experienceYears = "experience_years"
    }
}

// MARK: - Centres
public struct CentresResponse: Decodable {
    public let success: Bool
    public let centres: [CentreItem]
}

public struct CentreItem: Identifiable, Codable, Equatable {
    public let id: String
    public let name: String
    public let slug: String
    public let address: String?
    public let phone: String?
    public let courtsCount: Int?
    public let isActive: Bool

    enum CodingKeys: String, CodingKey {
        case id, name, slug, address, phone
        case courtsCount = "courts_count"
        case isActive = "is_active"
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.slug = try container.decode(String.self, forKey: .slug)
        self.address = try? container.decodeIfPresent(String.self, forKey: .address)
        self.phone = try? container.decodeIfPresent(String.self, forKey: .phone)
        self.courtsCount = try? container.decodeIfPresent(Int.self, forKey: .courtsCount)
        self.isActive = (try? container.decode(Bool.self, forKey: .isActive)) ?? true
    }
}

// MARK: - Programs
public struct ProgramsResponse: Decodable {
    public let success: Bool
    public let programs: [ProgramItem]
}

public struct ProgramItem: Identifiable, Codable, Equatable {
    public let id: String
    public let name: String
    public let description: String?
    public let ageRange: String?
    public let skillLevel: String?
    public let coachStudentRatio: String?
    public let isActive: Bool

    enum CodingKeys: String, CodingKey {
        case id, name, description
        case ageRange = "age_range"
        case skillLevel = "skill_level"
        case coachStudentRatio = "coach_student_ratio"
        case isActive = "is_active"
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.name = try container.decode(String.self, forKey: .name)
        self.description = try? container.decodeIfPresent(String.self, forKey: .description)
        self.ageRange = try? container.decodeIfPresent(String.self, forKey: .ageRange)
        self.skillLevel = try? container.decodeIfPresent(String.self, forKey: .skillLevel)
        self.coachStudentRatio = try? container.decodeIfPresent(String.self, forKey: .coachStudentRatio)
        self.isActive = (try? container.decode(Bool.self, forKey: .isActive)) ?? true
    }
}

// MARK: - Performance Assessments
public struct PerformanceResponse: Decodable {
    public let success: Bool
    public let assessments: [PerformanceItem]
}

public struct PerformanceItem: Identifiable, Codable, Equatable {
    public let id: String
    public let studentId: String?
    public let studentName: String?
    public let assessmentDate: String
    public let footworkScore: Double?
    public let techniqueScore: Double?
    public let fitnessScore: Double?
    public let tacticalScore: Double?
    public let consistencyScore: Double?
    public let overallScore: Double?
    public let coachNotes: String?

    enum CodingKeys: String, CodingKey {
        case id
        case studentId = "student_id"
        case studentName = "student_name"
        case assessmentDate = "assessment_date"
        case footworkScore = "footwork_score"
        case techniqueScore = "technique_score"
        case fitnessScore = "fitness_score"
        case tacticalScore = "tactical_score"
        case consistencyScore = "consistency_score"
        case overallScore = "overall_score"
        case coachNotes = "coach_notes"
    }
}

// MARK: - Reports & Analytics
public struct ReportsResponse: Decodable {
    public let success: Bool
    public let reports: ReportsData?
}

public struct ReportsData: Codable {
    public let overview: ReportOverview?
    public let funnel: AdmissionsFunnel?
    public let attendance: AttendanceReport?
}

public struct ReportOverview: Codable {
    public let totalStudents: Int?
    public let totalRevenue: StringOrDouble?
    public let outstandingReceivables: StringOrDouble?
    public let activeBatches: Int?

    enum CodingKeys: String, CodingKey {
        case totalStudents = "total_students"
        case totalRevenue = "total_revenue"
        case outstandingReceivables = "outstanding_receivables"
        case activeBatches = "active_batches"
    }
}

public struct AdmissionsFunnel: Codable {
    public let leadsCount: Int?
    public let trialsAttended: Int?
    public let conversionsCount: Int?
    public let conversionRate: Double?

    enum CodingKeys: String, CodingKey {
        case leadsCount = "leads_count"
        case trialsAttended = "trials_attended"
        case conversionsCount = "conversions_count"
        case conversionRate = "conversion_rate"
    }
}

public struct AttendanceReport: Codable {
    public let averageRate: Double?
    public let totalMarked: Int?

    enum CodingKeys: String, CodingKey {
        case averageRate = "average_rate"
        case totalMarked = "total_marked"
    }
}

// MARK: - CMS & Content
public struct CMSResponse: Decodable {
    public let success: Bool
    public let items: [CMSItem]
}

public struct CMSItem: Identifiable, Codable, Equatable {
    public let id: String
    public let title: String
    public let content: String?
    public let category: String?
    public let authorName: String?
    public let isPublished: Bool
    public let publishedAt: String?
    public let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, title, content, category
        case authorName = "author_name"
        case isPublished = "is_published"
        case publishedAt = "published_at"
        case createdAt = "created_at"
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.title = try container.decode(String.self, forKey: .title)
        self.content = try? container.decodeIfPresent(String.self, forKey: .content)
        self.category = try? container.decodeIfPresent(String.self, forKey: .category)
        self.authorName = try? container.decodeIfPresent(String.self, forKey: .authorName)
        self.isPublished = (try? container.decode(Bool.self, forKey: .isPublished)) ?? true
        self.publishedAt = try? container.decodeIfPresent(String.self, forKey: .publishedAt)
        self.createdAt = try? container.decodeIfPresent(String.self, forKey: .createdAt)
    }
}

// MARK: - Notifications
public struct NotificationsResponse: Decodable {
    public let success: Bool
    public let notifications: [NotificationItem]
}

public struct NotificationItem: Identifiable, Codable, Equatable {
    public let id: String
    public let title: String
    public let message: String
    public let isRead: Bool
    public let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, title, message
        case isRead = "is_read"
        case createdAt = "created_at"
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.id = try container.decode(String.self, forKey: .id)
        self.title = try container.decode(String.self, forKey: .title)
        self.message = try container.decode(String.self, forKey: .message)
        self.isRead = (try? container.decode(Bool.self, forKey: .isRead)) ?? false
        self.createdAt = (try? container.decode(String.self, forKey: .createdAt)) ?? ""
    }
}

// MARK: - Global Search
public struct SearchResponse: Decodable {
    public let success: Bool
    public let results: [SearchResultItem]
}

public struct SearchResultItem: Identifiable, Codable, Equatable {
    public let id: String
    public let title: String
    public let subtitle: String?
    public let type: String
}

// MARK: - Audit Logs
public struct AuditLogsResponse: Decodable {
    public let success: Bool
    public let logs: [AuditLogItem]
}

public struct AuditLogItem: Identifiable, Codable, Equatable {
    public let id: String
    public let action: String
    public let entityType: String
    public let entityId: String?
    public let userEmail: String?
    public let userName: String?
    public let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, action
        case entityType = "entity_type"
        case entityId = "entity_id"
        case userEmail = "user_email"
        case userName = "user_name"
        case createdAt = "created_at"
    }
}

// MARK: - Staff Management
public struct StaffResponse: Decodable {
    public let success: Bool
    public let staff: [StaffItem]
}

public struct StaffItem: Identifiable, Codable, Equatable {
    public let id: String
    public let name: String
    public let email: String
    public let role: String
    public let centreName: String?

    enum CodingKeys: String, CodingKey {
        case id, name, email, role
        case centreName = "centre_name"
    }
}
