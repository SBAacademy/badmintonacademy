import SwiftUI

public struct ConvertLeadView: View {
    @Environment(\.dismiss) private var dismiss
    public let lead: LeadItem
    public var onConverted: (() -> Void)? = nil

    @State private var studentName: String
    @State private var gender = "MALE"
    @State private var parentName: String
    @State private var parentPhone: String
    @State private var parentEmail: String
    @State private var centreSlug: String
    @State private var programSlug: String
    @State private var initialFee = "3500"
    @State private var isSubmitting = false
    @State private var errorMessage: String?

    public init(lead: LeadItem, onConverted: (() -> Void)? = nil) {
        self.lead = lead
        self.onConverted = onConverted
        _studentName = State(initialValue: lead.name)
        _parentName = State(initialValue: "Parent of \(lead.name)")
        _parentPhone = State(initialValue: lead.phone)
        _parentEmail = State(initialValue: lead.email ?? "")
        _centreSlug = State(initialValue: lead.branch ?? "kadavanthra")
        _programSlug = State(initialValue: lead.program ?? "junior-badminton-coaching")
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                Form {
                    Section("Athlete Profile") {
                        TextField("Student Full Name *", text: $studentName)
                        Picker("Gender", selection: $gender) {
                            Text("Male").tag("MALE")
                            Text("Female").tag("FEMALE")
                            Text("Other").tag("OTHER")
                        }
                    }
                    .listRowBackground(Color.rebelSurface)

                    Section("Parent / Guardian Association") {
                        TextField("Parent Full Name *", text: $parentName)
                        TextField("Parent Phone Number *", text: $parentPhone)
                            .keyboardType(.phonePad)
                        TextField("Parent Email", text: $parentEmail)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    .listRowBackground(Color.rebelSurface)

                    Section("Academy Enrollment & Fees") {
                        Picker("Enrolled Centre", selection: $centreSlug) {
                            Text("Kadavanthra Centre").tag("kadavanthra")
                            Text("Kumbalanghi Centre").tag("kumbalanghi")
                            Text("Maradu Centre").tag("maradu")
                            Text("Palluruthy Centre").tag("palluruthy")
                            Text("Chullikal Centre").tag("chullikal")
                        }

                        Picker("Curriculum", selection: $programSlug) {
                            Text("Kids Badminton Coaching").tag("kids-badminton-coaching")
                            Text("Junior Badminton Coaching").tag("junior-badminton-coaching")
                            Text("Adult Coaching & Fitness").tag("adult-badminton-coaching")
                            Text("Elite High Performance").tag("elite-high-performance-training")
                            Text("Weekend Intensive Coaching").tag("weekend-badminton-batches")
                        }

                        TextField("Initial Monthly Fee (₹) *", text: $initialFee)
                            .keyboardType(.numberPad)
                    }
                    .listRowBackground(Color.rebelSurface)

                    if let errorMessage {
                        Section {
                            Text(errorMessage)
                                .foregroundColor(RebelColors.coral)
                                .font(RebelTypography.caption)
                        }
                        .listRowBackground(Color.clear)
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Enroll Athlete")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.rebelTextSecondary)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Confirm & Enroll") {
                        Task { await convertLead() }
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.rebelPrimary)
                    .disabled(studentName.isEmpty || parentPhone.isEmpty || isSubmitting)
                }
            }
        }
    }

    private func convertLead() async {
        isSubmitting = true
        errorMessage = nil

        struct ConvertPayload: Encodable {
            let leadId: String
            let studentName: String
            let gender: String
            let parentName: String
            let parentPhone: String
            let parentEmail: String
            let centreSlug: String
            let programSlug: String
            let initialFee: Double
        }

        do {
            let fee = Double(initialFee) ?? 3500.0
            let _: APIResponse<[String: AnyCodable]> = try await APIClient.shared.request(
                endpoint: .convertLead,
                method: "POST",
                body: ConvertPayload(
                    leadId: lead.id,
                    studentName: studentName.trimmingCharacters(in: .whitespacesAndNewlines),
                    gender: gender,
                    parentName: parentName.trimmingCharacters(in: .whitespacesAndNewlines),
                    parentPhone: parentPhone.trimmingCharacters(in: .whitespacesAndNewlines),
                    parentEmail: parentEmail.trimmingCharacters(in: .whitespacesAndNewlines),
                    centreSlug: centreSlug,
                    programSlug: programSlug,
                    initialFee: fee
                )
            )
            onConverted?()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}
