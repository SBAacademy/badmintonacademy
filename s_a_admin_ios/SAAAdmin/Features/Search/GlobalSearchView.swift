import SwiftUI

struct GlobalSearchView: View {
    @State private var query = ""
    @State private var searchResults: [SearchResultItem] = []
    @State private var isSearching = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                VStack(spacing: 0) {
                    if isSearching {
                        Spacer()
                        ProgressView().tint(.rebelLime)
                        Spacer()
                    } else if query.isEmpty {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "magnifyingglass")
                                .font(.system(size: 44))
                                .foregroundColor(.rebelMuted)
                            Text("Global Academy Search")
                                .font(.headline)
                                .foregroundColor(.rebelWhite)
                            Text("Search across Leads, Students, Parents, Batches, and Invoices.")
                                .font(.caption)
                                .foregroundColor(.rebelMuted)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 32)
                        }
                        Spacer()
                    } else if searchResults.isEmpty {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "questionmark.folder")
                                .font(.system(size: 44))
                                .foregroundColor(.rebelMuted)
                            Text("No Results Found")
                                .font(.headline)
                                .foregroundColor(.rebelWhite)
                            Text("No records match \"\(query)\".")
                                .font(.caption)
                                .foregroundColor(.rebelMuted)
                        }
                        Spacer()
                    } else {
                        List(searchResults) { item in
                            searchResultRow(item)
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .navigationTitle("Search")
            .searchable(text: $query, prompt: "Search students, leads, parents...")
            .onChange(of: query) { _, newQuery in
                Task {
                    try? await Task.sleep(nanoseconds: 300_000_000) // 300ms debounce
                    if newQuery == query {
                        await performSearch()
                    }
                }
            }
        }
    }

    private func searchResultRow(_ item: SearchResultItem) -> some View {
        HStack(spacing: 12) {
            Image(systemName: iconForType(item.type))
                .foregroundColor(.rebelLime)
                .frame(width: 28, height: 28)
                .background(Color.rebelPitchBlack)
                .cornerRadius(6)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(.subheadline.bold())
                    .foregroundColor(.rebelWhite)
                if let sub = item.subtitle {
                    Text(sub)
                        .font(.caption2)
                        .foregroundColor(.rebelMuted)
                }
            }

            Spacer()

            RebelBadge(text: item.type.uppercased(), color: colorForType(item.type))
        }
        .padding(12)
        .rebelCard()
    }

    private func iconForType(_ type: String) -> String {
        switch type.lowercased() {
        case "student": return "person.fill"
        case "lead": return "person.crop.circle.badge.plus"
        case "parent": return "person.2.fill"
        case "batch": return "sportscourt.fill"
        case "invoice": return "creditcard.fill"
        default: return "doc.text.fill"
        }
    }

    private func colorForType(_ type: String) -> Color {
        switch type.lowercased() {
        case "student": return .rebelLime
        case "lead": return .rebelInfo
        case "parent": return .rebelWarning
        default: return .rebelMuted
        }
    }

    private func performSearch() async {
        guard !query.trimmingCharacters(in: .whitespaces).isEmpty else {
            searchResults = []
            return
        }

        isSearching = true
        errorMessage = nil
        do {
            let res: SearchResponse = try await APIClient.shared.request(.search(query: query))
            searchResults = res.results
        } catch {
            errorMessage = error.localizedDescription
        }
        isSearching = false
    }
}
