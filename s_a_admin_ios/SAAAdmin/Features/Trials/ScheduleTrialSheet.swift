import SwiftUI

public struct ScheduleTrialSheet: View {
    @Environment(\.dismiss) private var dismiss
    public let lead: LeadItem?
    public var onScheduled: (() -> Void)? = nil

    @State private var candidateName: String
    @State private var parentPhone: String
    @State private var centreSlug: String
    @State private var trialDate = Date().addingTimeInterval(86400) // tomorrow
    @State private var isSubmitting = false
    @State private var errorMessage: String?

    public init(lead: LeadItem? = nil, onScheduled: (() -> Void)? = nil) {
        self.lead = lead
        self.onScheduled = onScheduled
        _candidateName = State(initialValue: lead?.name ?? "")
        _parentPhone = State(initialValue: lead?.phone ?? "")
        _centreSlug = State(initialValue: lead?.branch ?? "kadavanthra")
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                Form {
                    Section("Candidate Info") {
                        TextField("Candidate Name *", text: $candidateName)
                        TextField("Parent Phone Number *", text: $parentPhone)
                            .keyboardType(.phonePad)
                    }
                    .listRowBackground(Color.rebelSurface)

                    Section("Evaluation Schedule") {
                        Picker("Court Centre", selection: $centreSlug) {
                            Text("Kadavanthra Centre").tag("kadavanthra")
                            Text("Edappally Centre").tag("edappally")
                            Text("Kakkanad Centre").tag("kakkanad")
                        }

                        DatePicker("Evaluation Date & Time", selection: $trialDate, in: Date()..., displayedComponents: [.date, .hourAndMinute])
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
            .navigationTitle("Schedule Free Trial")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.rebelTextSecondary)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Confirm Trial") {
                        Task { await scheduleTrial() }
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.rebelPrimary)
                    .disabled(candidateName.isEmpty || parentPhone.isEmpty || isSubmitting)
                }
            }
        }
    }

    private func scheduleTrial() async {
        isSubmitting = true
        errorMessage = nil

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateStr = formatter.string(from: trialDate)

        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"
        let timeStr = timeFormatter.string(from: trialDate)

        struct TrialPayload: Encodable {
            let leadId: String?
            let studentName: String
            let parentPhone: String
            let centreSlug: String
            let trialDate: String
            let trialTime: String
        }

        do {
            let _: APIResponse<[String: AnyCodable]> = try await APIClient.shared.request(
                endpoint: .trials,
                method: "POST",
                body: TrialPayload(
                    leadId: lead?.id,
                    studentName: candidateName.trimmingCharacters(in: .whitespacesAndNewlines),
                    parentPhone: parentPhone.trimmingCharacters(in: .whitespacesAndNewlines),
                    centreSlug: centreSlug,
                    trialDate: dateStr,
                    trialTime: timeStr
                )
            )
            onScheduled?()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}
