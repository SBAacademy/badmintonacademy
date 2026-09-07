import SwiftUI

struct CoachesListView: View {
    @State private var coaches: [CoachItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                if isLoading && coaches.isEmpty {
                    ProgressView().tint(.rebelLime)
                } else if coaches.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "person.3.fill")
                            .font(.system(size: 44))
                            .foregroundColor(.rebelMuted)
                        Text("No Coaches Found")
                            .font(.headline)
                            .foregroundColor(.rebelWhite)
                        Text("Verified coaching staff will be listed here.")
                            .font(.caption)
                            .foregroundColor(.rebelMuted)
                    }
                } else {
                    List(coaches) { coach in
                        coachCard(coach)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Coaching Staff")
            .task {
                await loadCoaches()
            }
            .refreshable {
                await loadCoaches()
            }
        }
    }

    private func coachCard(_ coach: CoachItem) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(coach.name)
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                    Text(coach.specialization ?? "Head Badminton Coach")
                        .font(.subheadline)
                        .foregroundColor(.rebelLime)
                }
                Spacer()
                RebelBadge(text: coach.status.uppercased(), color: coach.status.lowercased() == "active" ? .rebelLime : .rebelMuted)
            }

            if let exp = coach.experienceYears {
                Text("\(exp) years professional coaching experience")
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
            }

            if let certs = coach.certifications, !certs.isEmpty {
                HStack {
                    ForEach(certs, id: \.self) { cert in
                        Text(cert)
                            .font(.caption2)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.rebelPitchBlack)
                            .cornerRadius(4)
                            .foregroundColor(.rebelWhite)
                    }
                }
            }

            HStack(spacing: 12) {
                if let phone = coach.phone {
                    Button {
                        ExternalLauncher.makePhoneCall(phone: phone)
                    } label: {
                        Label("Call", systemImage: "phone.fill")
                            .font(.caption.bold())
                            .foregroundColor(.rebelWhite)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.rebelDarkSurface)
                            .cornerRadius(6)
                    }
                }

                if let email = coach.email {
                    Button {
                        ExternalLauncher.sendEmail(email: email)
                    } label: {
                        Label("Email", systemImage: "envelope.fill")
                            .font(.caption.bold())
                            .foregroundColor(.rebelWhite)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.rebelDarkSurface)
                            .cornerRadius(6)
                    }
                }
            }
        }
        .padding(14)
        .rebelCard()
    }

    private func loadCoaches() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: CoachesResponse = try await APIClient.shared.request(.coaches)
            coaches = res.coaches
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
