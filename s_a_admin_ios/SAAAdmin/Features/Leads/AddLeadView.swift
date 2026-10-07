import SwiftUI

public struct AddLeadView: View {
    @Environment(\.dismiss) private var dismiss
    public var onCreated: (() -> Void)? = nil

    @State private var name = ""
    @State private var phone = ""
    @State private var email = ""
    @State private var branch = "kadavanthra"
    @State private var program = "junior-badminton-coaching"
    @State private var notes = ""
    @State private var isSubmitting = false
    @State private var errorMessage: String?

    public init(onCreated: (() -> Void)? = nil) {
        self.onCreated = onCreated
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                Form {
                    Section("Candidate Details") {
                        TextField("Athlete / Student Name *", text: $name)
                        TextField("Phone Number (10 digits) *", text: $phone)
                            .keyboardType(.phonePad)
                        TextField("Email Address (Optional)", text: $email)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    .listRowBackground(Color.rebelSurface)

                    Section("Academy Preferences") {
                        Picker("Preferred Centre", selection: $branch) {
                            Text("Kadavanthra Centre").tag("kadavanthra")
                            Text("Kumbalanghi Centre").tag("kumbalanghi")
                            Text("Maradu Centre").tag("maradu")
                            Text("Palluruthy Centre").tag("palluruthy")
                            Text("Chullikal Centre").tag("chullikal")
                        }

                        Picker("Curriculum", selection: $program) {
                            Text("Kids Badminton Coaching").tag("kids-badminton-coaching")
                            Text("Junior Badminton Coaching").tag("junior-badminton-coaching")
                            Text("Adult Coaching & Fitness").tag("adult-badminton-coaching")
                            Text("Elite High Performance").tag("elite-high-performance-training")
                            Text("Weekend Intensive Coaching").tag("weekend-badminton-batches")
                        }
                    }
                    .listRowBackground(Color.rebelSurface)

                    Section("Staff Inbound Notes") {
                        TextField("Notes on skill level, court preferences...", text: $notes, axis: .vertical)
                            .lineLimit(3...5)
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
            .navigationTitle("Record Inbound Lead")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.rebelTextSecondary)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save Lead") {
                        Task { await saveLead() }
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.rebelPrimary)
                    .disabled(name.isEmpty || phone.isEmpty || isSubmitting)
                }
            }
        }
    }

    private func saveLead() async {
        isSubmitting = true
        errorMessage = nil

        struct LeadPayload: Encodable {
            let name: String
            let phone: String
            let email: String
            let branch: String
            let program: String
            let notes: String
        }

        do {
            let _: APIResponse<[String: AnyCodable]> = try await APIClient.shared.request(
                endpoint: .leads(),
                method: "POST",
                body: LeadPayload(
                    name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                    phone: phone.trimmingCharacters(in: .whitespacesAndNewlines),
                    email: email.trimmingCharacters(in: .whitespacesAndNewlines),
                    branch: branch,
                    program: program,
                    notes: notes.trimmingCharacters(in: .whitespacesAndNewlines)
                )
            )
            onCreated?()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}
