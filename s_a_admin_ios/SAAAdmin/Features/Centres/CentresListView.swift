import SwiftUI

struct CentresListView: View {
    @State private var centres: [CentreItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                if isLoading && centres.isEmpty {
                    ProgressView().tint(.rebelLime)
                } else if centres.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "building.2.fill")
                            .font(.system(size: 44))
                            .foregroundColor(.rebelMuted)
                        Text("No Centres Found")
                            .font(.headline)
                            .foregroundColor(.rebelWhite)
                    }
                } else {
                    List(centres) { centre in
                        centreCard(centre)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Centres")
            .task {
                await loadCentres()
            }
            .refreshable {
                await loadCentres()
            }
        }
    }

    private func centreCard(_ centre: CentreItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(centre.name)
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                    Text(centre.slug.uppercased())
                        .font(.caption2.bold())
                        .foregroundColor(.rebelLime)
                }
                Spacer()
                RebelBadge(
                    text: centre.isActive ? "ACTIVE" : "INACTIVE",
                    color: centre.isActive ? .rebelLime : .rebelMuted
                )
            }

            if let addr = centre.address {
                Label(addr, systemImage: "mappin.and.ellipse")
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
            }

            HStack {
                Label("\(centre.courtsCount ?? 4) BWF-Grade Courts", systemImage: "sportscourt.fill")
                    .font(.caption)
                    .foregroundColor(.rebelWhite)
                Spacer()
                if let phone = centre.phone {
                    Button {
                        ExternalLauncher.makePhoneCall(phone: phone)
                    } label: {
                        Label(phone, systemImage: "phone.fill")
                            .font(.caption.bold())
                            .foregroundColor(.rebelLime)
                    }
                }
            }
        }
        .padding(14)
        .rebelCard()
    }

    private func loadCentres() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: CentresResponse = try await APIClient.shared.request(.centres)
            centres = res.centres
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

struct ProgramsListView: View {
    @State private var programs: [ProgramItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                if isLoading && programs.isEmpty {
                    ProgressView().tint(.rebelLime)
                } else if programs.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "figure.badminton")
                            .font(.system(size: 44))
                            .foregroundColor(.rebelMuted)
                        Text("No Programs Found")
                            .font(.headline)
                            .foregroundColor(.rebelWhite)
                    }
                } else {
                    List(programs) { program in
                        programCard(program)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Training Programs")
            .task {
                await loadPrograms()
            }
            .refreshable {
                await loadPrograms()
            }
        }
    }

    private func programCard(_ program: ProgramItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(program.name)
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                    if let age = program.ageRange {
                        Text("Age: \(age)")
                            .font(.caption)
                            .foregroundColor(.rebelLime)
                    }
                }
                Spacer()
                RebelBadge(
                    text: program.isActive ? "ACTIVE" : "INACTIVE",
                    color: program.isActive ? .rebelLime : .rebelMuted
                )
            }

            if let desc = program.description {
                Text(desc)
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
                    .lineLimit(2)
            }

            HStack {
                if let skill = program.skillLevel {
                    Label(skill, systemImage: "trophy.fill")
                        .font(.caption2)
                        .foregroundColor(.rebelMuted)
                }
                Spacer()
                if let ratio = program.coachStudentRatio {
                    Text("Ratio: \(ratio)")
                        .font(.caption2.bold())
                        .foregroundColor(.rebelWhite)
                }
            }
        }
        .padding(14)
        .rebelCard()
    }

    private func loadPrograms() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: ProgramsResponse = try await APIClient.shared.request(.programs)
            programs = res.programs
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
