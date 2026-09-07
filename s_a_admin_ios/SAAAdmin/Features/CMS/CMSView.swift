import SwiftUI

struct CMSView: View {
    @State private var items: [CMSItem] = []
    @State private var selectedTab: CMSTab = .testimonials
    @State private var isLoading = false
    @State private var errorMessage: String? = nil

    enum CMSTab: String, CaseIterable, Identifiable {
        case testimonials = "Testimonials"
        case achievements = "Achievements"
        case announcements = "Announcements"
        case blog = "Blog"
        var id: String { rawValue }

        var itemType: String {
            switch self {
            case .testimonials: return "testimonial"
            case .achievements: return "achievement"
            case .announcements: return "announcement"
            case .blog: return "blog"
            }
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                VStack(spacing: 0) {
                    Picker("Category", selection: $selectedTab) {
                        ForEach(CMSTab.allCases) { tab in
                            Text(tab.rawValue).tag(tab)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                    .onChange(of: selectedTab) { _, _ in
                        Task { await loadCMSItems() }
                    }

                    if isLoading && items.isEmpty {
                        Spacer()
                        ProgressView().tint(.rebelLime)
                        Spacer()
                    } else if items.isEmpty {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "doc.richtext")
                                .font(.system(size: 44))
                                .foregroundColor(.rebelMuted)
                            Text("No \(selectedTab.rawValue) Published")
                                .font(.headline)
                                .foregroundColor(.rebelWhite)
                            Text("Published content synchronizes with the public Next.js website.")
                                .font(.caption)
                                .foregroundColor(.rebelMuted)
                        }
                        Spacer()
                    } else {
                        List(items) { item in
                            cmsCard(item)
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .navigationTitle("CMS & Content")
            .task {
                await loadCMSItems()
            }
            .refreshable {
                await loadCMSItems()
            }
        }
    }

    private func cmsCard(_ item: CMSItem) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(item.title)
                    .font(.headline)
                    .foregroundColor(.rebelWhite)
                Spacer()
                RebelBadge(
                    text: item.isPublished ? "PUBLISHED" : "DRAFT",
                    color: item.isPublished ? .rebelLime : .rebelMuted
                )
            }

            if let content = item.content, !content.isEmpty {
                Text(content)
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
                    .lineLimit(3)
            }

            HStack {
                if let author = item.authorName {
                    Label(author, systemImage: "person.fill")
                        .font(.caption2)
                        .foregroundColor(.rebelMuted)
                }
                Spacer()
                if let date = item.publishedAt ?? item.createdAt {
                    Text(date.prefix(10))
                        .font(.caption2)
                        .foregroundColor(.rebelMuted)
                }
            }
        }
        .padding(14)
        .rebelCard()
    }

    private func loadCMSItems() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: CMSResponse = try await APIClient.shared.request(
                .cms(type: selectedTab.itemType)
            )
            items = res.items
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
