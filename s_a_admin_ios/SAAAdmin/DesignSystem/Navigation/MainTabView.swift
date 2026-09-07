import SwiftUI

struct MainTabView: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @State private var selectedTab: TabDestination = .today
    @State private var selectedSidebarItem: TabDestination? = .today

    var profile: UserProfile? {
        AuthManager.shared.currentUser
    }

    var userRole: String {
        profile?.role.uppercased() ?? "ADMIN"
    }

    enum TabDestination: String, CaseIterable, Identifiable {
        case today = "Today"
        case leads = "Leads"
        case students = "Students"
        case schedule = "Schedule"
        case finance = "Finance"
        case performance = "Performance"
        case reports = "Reports"
        case cms = "CMS"
        case coaches = "Coaches"
        case centres = "Centres"
        case programs = "Programs"
        case search = "Search"
        case notifications = "Notifications"
        case auditLogs = "Audit Logs"
        case settings = "Settings"
        case more = "More"

        var id: String { rawValue }

        var icon: String {
            switch self {
            case .today: return "sparkles"
            case .leads: return "person.crop.circle.badge.plus"
            case .students: return "person.2.fill"
            case .schedule: return "calendar"
            case .finance: return "indianrupeesign.circle.fill"
            case .performance: return "chart.bar.xaxis"
            case .reports: return "chart.pie.fill"
            case .cms: return "doc.richtext"
            case .coaches: return "person.3.fill"
            case .centres: return "building.2.fill"
            case .programs: return "figure.badminton"
            case .search: return "magnifyingglass"
            case .notifications: return "bell.fill"
            case .auditLogs: return "shield.checkered"
            case .settings: return "gearshape.fill"
            case .more: return "ellipsis.circle.fill"
            }
        }
    }

    var body: some View {
        if horizontalSizeClass == .regular {
            // iPad Split View
            NavigationSplitView {
                sidebarList
                    .navigationTitle("S&A Academy")
            } detail: {
                detailView(for: selectedSidebarItem ?? .today)
            }
            .tint(.rebelLime)
        } else {
            // iPhone Tab Bar
            TabView(selection: $selectedTab) {
                TodayDashboardView()
                    .tabItem {
                        Label("Today", systemImage: TabDestination.today.icon)
                    }
                    .tag(TabDestination.today)

                if userRole != "COACH" {
                    LeadsListView()
                        .tabItem {
                            Label("Leads", systemImage: TabDestination.leads.icon)
                        }
                        .tag(TabDestination.leads)
                }

                StudentsListView()
                    .tabItem {
                        Label("Students", systemImage: TabDestination.students.icon)
                    }
                    .tag(TabDestination.students)

                ScheduleView()
                    .tabItem {
                        Label("Schedule", systemImage: TabDestination.schedule.icon)
                    }
                    .tag(TabDestination.schedule)

                MoreMenuView()
                    .tabItem {
                        Label("More", systemImage: TabDestination.more.icon)
                    }
                    .tag(TabDestination.more)
            }
            .tint(.rebelLime)
        }
    }

    // MARK: - iPad Sidebar
    private var sidebarList: some View {
        List(selection: $selectedSidebarItem) {
            Section("Operations") {
                sidebarRow(.today)
                if userRole != "COACH" {
                    sidebarRow(.leads)
                }
                sidebarRow(.students)
                sidebarRow(.schedule)
                sidebarRow(.performance)
            }

            if userRole == "SUPER_ADMIN" || userRole == "ADMIN" {
                Section("Finance & Intelligence") {
                    sidebarRow(.finance)
                    sidebarRow(.reports)
                }
            }

            if userRole == "SUPER_ADMIN" || userRole == "ADMIN" || userRole == "CONTENT_MANAGER" {
                Section("Academy & Marketing") {
                    sidebarRow(.cms)
                    sidebarRow(.coaches)
                    sidebarRow(.centres)
                    sidebarRow(.programs)
                }
            }

            Section("Utilities & Account") {
                sidebarRow(.search)
                sidebarRow(.notifications)
                if userRole == "SUPER_ADMIN" || userRole == "ADMIN" {
                    sidebarRow(.auditLogs)
                }
                sidebarRow(.settings)
            }
        }
        .listStyle(.sidebar)
    }

    private func sidebarRow(_ destination: TabDestination) -> some View {
        NavigationLink(value: destination) {
            Label(destination.rawValue, systemImage: destination.icon)
        }
    }

    @ViewBuilder
    private func detailView(for destination: TabDestination) -> some View {
        switch destination {
        case .today: TodayDashboardView()
        case .leads: LeadsListView()
        case .students: StudentsListView()
        case .schedule: ScheduleView()
        case .finance: FinanceView()
        case .performance: PerformanceView()
        case .reports: ReportsView()
        case .cms: CMSView()
        case .coaches: CoachesListView()
        case .centres: CentresListView()
        case .programs: ProgramsListView()
        case .search: GlobalSearchView()
        case .notifications: NotificationsView()
        case .auditLogs: AuditLogsView()
        case .settings: SettingsView()
        case .more: MoreMenuView()
        }
    }
}

// MARK: - iPhone "More" Navigation Hub
struct MoreMenuView: View {
    var role: String {
        AuthManager.shared.currentUser?.role.uppercased() ?? "ADMIN"
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                List {
                    if role == "SUPER_ADMIN" || role == "ADMIN" {
                        Section("Financial Administration") {
                            NavigationLink {
                                FinanceView()
                            } label: {
                                Label("Invoices & Payments", systemImage: "indianrupeesign.circle.fill")
                                    .foregroundColor(.rebelWhite)
                            }
                            NavigationLink {
                                ReportsView()
                            } label: {
                                Label("Reports & Analytics", systemImage: "chart.pie.fill")
                                    .foregroundColor(.rebelWhite)
                            }
                        }
                        .listRowBackground(Color.rebelDarkSurface)
                    }

                    Section("Athlete Operations") {
                        NavigationLink {
                            PerformanceView()
                        } label: {
                            Label("Athlete Assessments", systemImage: "chart.bar.xaxis")
                                .foregroundColor(.rebelWhite)
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    if role == "SUPER_ADMIN" || role == "ADMIN" || role == "CONTENT_MANAGER" {
                        Section("Content & Directory") {
                            NavigationLink {
                                CMSView()
                            } label: {
                                Label("CMS & Website Content", systemImage: "doc.richtext")
                                    .foregroundColor(.rebelWhite)
                            }
                            NavigationLink {
                                CoachesListView()
                            } label: {
                                Label("Coaching Directory", systemImage: "person.3.fill")
                                    .foregroundColor(.rebelWhite)
                            }
                            NavigationLink {
                                CentresListView()
                            } label: {
                                Label("Academy Centres", systemImage: "building.2.fill")
                                    .foregroundColor(.rebelWhite)
                            }
                            NavigationLink {
                                ProgramsListView()
                            } label: {
                                Label("Training Programs", systemImage: "figure.badminton")
                                    .foregroundColor(.rebelWhite)
                            }
                        }
                        .listRowBackground(Color.rebelDarkSurface)
                    }

                    Section("Tools & Security") {
                        NavigationLink {
                            GlobalSearchView()
                        } label: {
                            Label("Global Search", systemImage: "magnifyingglass")
                                .foregroundColor(.rebelWhite)
                        }
                        NavigationLink {
                            NotificationsView()
                        } label: {
                            Label("Notifications", systemImage: "bell.fill")
                                .foregroundColor(.rebelWhite)
                        }
                        if role == "SUPER_ADMIN" || role == "ADMIN" {
                            NavigationLink {
                                AuditLogsView()
                            } label: {
                                Label("Audit Trail", systemImage: "shield.checkered")
                                    .foregroundColor(.rebelWhite)
                            }
                        }
                        NavigationLink {
                            SettingsView()
                        } label: {
                            Label("Settings & Sync", systemImage: "gearshape.fill")
                                .foregroundColor(.rebelWhite)
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("More Operations")
        }
    }
}
