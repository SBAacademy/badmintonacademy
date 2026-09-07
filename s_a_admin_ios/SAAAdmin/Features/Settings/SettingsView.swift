import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var profile: UserProfile? = KeychainManager.shared.getUserProfile()
    @State private var isBiometricsEnabled: Bool = BiometricAuthManager.shared.isBiometricEnabled
    @State private var pendingOfflineCount: Int = 0
    @State private var isSyncingOffline: Bool = false
    @State private var syncStatusMessage: String? = nil

    // Staff Management (Admin/Super Admin)
    @State private var staffList: [StaffItem] = []
    @State private var showingAddStaff = false
    @State private var showingLogoutConfirmation = false

    var isSuperAdmin: Bool {
        profile?.role.uppercased() == "SUPER_ADMIN"
    }

    var isAdmin: Bool {
        let r = profile?.role.uppercased() ?? ""
        return r == "SUPER_ADMIN" || r == "ADMIN"
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                Form {
                    // Profile Section
                    Section(header: Text("Account Profile").foregroundColor(.rebelLime)) {
                        HStack(spacing: 14) {
                            ZStack {
                                Circle()
                                    .fill(Color.rebelLime.opacity(0.15))
                                    .frame(width: 50, height: 50)
                                Text(profile?.name.prefix(1).uppercased() ?? "U")
                                    .font(.title3.bold())
                                    .foregroundColor(.rebelLime)
                            }

                            VStack(alignment: .leading, spacing: 2) {
                                Text(profile?.name ?? "Administrator")
                                    .font(.headline)
                                    .foregroundColor(.rebelWhite)
                                Text(profile?.email ?? "admin@sabadminton.com")
                                    .font(.caption)
                                    .foregroundColor(.rebelMuted)
                                RebelBadge(
                                    text: profile?.role.uppercased() ?? "ADMIN",
                                    color: .rebelLime
                                )
                                .padding(.top, 2)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    // Security & Biometrics
                    Section(header: Text("Security").foregroundColor(.rebelLime)) {
                        Toggle(isOn: $isBiometricsEnabled) {
                            Label("Face ID / Touch ID Re-entry", systemImage: "faceid")
                                .foregroundColor(.rebelWhite)
                        }
                        .tint(.rebelLime)
                        .onChange(of: isBiometricsEnabled) { _, newValue in
                            BiometricAuthManager.shared.isBiometricEnabled = newValue
                        }

                        HStack {
                            Label("Key Storage", systemImage: "lock.shield.fill")
                                .foregroundColor(.rebelWhite)
                            Spacer()
                            Text("Apple Secure Keychain")
                                .font(.caption)
                                .foregroundColor(.rebelMuted)
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    // Offline Sync Engine
                    Section(header: Text("Offline Persistence & Sync").foregroundColor(.rebelLime)) {
                        HStack {
                            Label("Pending Offline Attendance", systemImage: "tray.and.arrow.up.fill")
                                .foregroundColor(.rebelWhite)
                            Spacer()
                            Text("\(pendingOfflineCount)")
                                .font(.subheadline.bold())
                                .foregroundColor(pendingOfflineCount > 0 ? .rebelWarning : .rebelLime)
                        }

                        HStack {
                            Label("Connectivity", systemImage: NetworkMonitor.shared.isConnected ? "wifi" : "wifi.slash")
                                .foregroundColor(.rebelWhite)
                            Spacer()
                            Text(NetworkMonitor.shared.isConnected ? "Online" : "Offline")
                                .font(.caption.bold())
                                .foregroundColor(NetworkMonitor.shared.isConnected ? .rebelLime : .rebelDanger)
                        }

                        Button {
                            Task { await syncOfflineQueue() }
                        } label: {
                            HStack {
                                if isSyncingOffline {
                                    ProgressView().tint(.rebelLime)
                                } else {
                                    Label("Sync Pending Records Now", systemImage: "arrow.triangle.2.circlepath")
                                        .foregroundColor(pendingOfflineCount > 0 ? .rebelLime : .rebelMuted)
                                }
                            }
                        }
                        .disabled(pendingOfflineCount == 0 || isSyncingOffline || !NetworkMonitor.shared.isConnected)

                        if let syncMsg = syncStatusMessage {
                            Text(syncMsg)
                                .font(.caption)
                                .foregroundColor(.rebelLime)
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    // Staff Management (Super Admin / Admin)
                    if isAdmin {
                        Section(header: Text("Staff Administration").foregroundColor(.rebelLime)) {
                            NavigationLink {
                                StaffDirectoryView()
                            } label: {
                                Label("Manage Staff & Roles", systemImage: "person.badge.shield.checkmark.fill")
                                    .foregroundColor(.rebelWhite)
                            }
                        }
                        .listRowBackground(Color.rebelDarkSurface)
                    }

                    // System Info
                    Section(header: Text("System & Version").foregroundColor(.rebelLime)) {
                        HStack {
                            Text("Version")
                                .foregroundColor(.rebelWhite)
                            Spacer()
                            Text("1.0.0 (Native iOS)")
                                .font(.caption)
                                .foregroundColor(.rebelMuted)
                        }
                        HStack {
                            Text("Backend API")
                                .foregroundColor(.rebelWhite)
                            Spacer()
                            Text("Next.js Gateway / Neon")
                                .font(.caption)
                                .foregroundColor(.rebelMuted)
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    // Logout
                    Section {
                        Button(role: .destructive) {
                            showingLogoutConfirmation = true
                        } label: {
                            HStack {
                                Spacer()
                                Label("Log Out of S&A Admin", systemImage: "rectangle.portrait.and.arrow.right")
                                    .font(.headline)
                                    .foregroundColor(.rebelDanger)
                                Spacer()
                            }
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Settings")
            .confirmationDialog("Are you sure you want to log out?", isPresented: $showingLogoutConfirmation, titleVisibility: .visible) {
                Button("Log Out", role: .destructive) {
                    performLogout()
                }
                Button("Cancel", role: .cancel) {}
            }
            .onAppear {
                refreshPendingCount()
            }
        }
    }

    private func refreshPendingCount() {
        let store = OfflineAttendanceStore(modelContext: modelContext)
        pendingOfflineCount = store.fetchPendingRecords().count
    }

    private func syncOfflineQueue() async {
        isSyncingOffline = true
        syncStatusMessage = nil
        let store = OfflineAttendanceStore(modelContext: modelContext)
        let synced = await store.syncPendingRecords()
        syncStatusMessage = "Successfully synchronized \(synced) records."
        refreshPendingCount()
        isSyncingOffline = false
    }

    private func performLogout() {
        AuthManager.shared.logout()
    }
}

struct StaffDirectoryView: View {
    @State private var staff: [StaffItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    @State private var showingAddStaff = false

    var body: some View {
        ZStack {
            Color.rebelPitchBlack.ignoresSafeArea()

            if isLoading && staff.isEmpty {
                ProgressView().tint(.rebelLime)
            } else {
                List(staff) { member in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(member.name)
                                .font(.headline)
                                .foregroundColor(.rebelWhite)
                            Spacer()
                            RebelBadge(text: member.role, color: .rebelLime)
                        }
                        Text(member.email)
                            .font(.caption)
                            .foregroundColor(.rebelMuted)
                        if let centre = member.centreName {
                            Text("Assigned: \(centre)")
                                .font(.caption2)
                                .foregroundColor(.rebelLime)
                        }
                    }
                    .padding(10)
                    .rebelCard()
                    .listRowBackground(Color.clear)
                    .listRowSeparator(.hidden)
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Academy Staff")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showingAddStaff = true
                } label: {
                    Image(systemName: "plus")
                        .foregroundColor(.rebelLime)
                }
            }
        }
        .sheet(isPresented: $showingAddStaff) {
            AddStaffSheet {
                Task { await loadStaff() }
            }
        }
        .task {
            await loadStaff()
        }
    }

    private func loadStaff() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: StaffResponse = try await APIClient.shared.request(.staff)
            staff = res.staff
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

struct AddStaffSheet: View {
    @Environment(\.dismiss) private var dismiss
    var onCreated: () -> Void

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var role = "COACH"
    @State private var centreId = "kadavanthra"
    @State private var isSubmitting = false
    @State private var errorMessage: String? = nil

    let roles = ["SUPER_ADMIN", "ADMIN", "COACH", "FRONT_DESK", "CONTENT_MANAGER"]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                Form {
                    Section(header: Text("Staff Credentials").foregroundColor(.rebelLime)) {
                        TextField("Full Name", text: $name)
                        TextField("Email Address", text: $email)
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                        SecureField("Temporary Password", text: $password)
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    Section(header: Text("Access Control & Role").foregroundColor(.rebelLime)) {
                        Picker("Role", selection: $role) {
                            ForEach(roles, id: \.self) { r in
                                Text(r).tag(r)
                            }
                        }

                        Picker("Assigned Centre", selection: $centreId) {
                            Text("Kadavanthra").tag("kadavanthra")
                            Text("Edappally").tag("edappally")
                            Text("Kakkanad").tag("kakkanad")
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    if let err = errorMessage {
                        Section {
                            Text(err).foregroundColor(.rebelDanger).font(.caption)
                        }
                        .listRowBackground(Color.rebelDarkSurface)
                    }
                }
                .scrollContentBackground(.hidden)
            }
            .navigationTitle("Add Staff")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }.foregroundColor(.rebelMuted)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Create") {
                        Task { await createStaff() }
                    }
                    .foregroundColor(.rebelLime)
                    .disabled(name.isEmpty || email.isEmpty || password.isEmpty || isSubmitting)
                }
            }
        }
    }

    private func createStaff() async {
        isSubmitting = true
        errorMessage = nil

        let payload: [String: Any] = [
            "name": name,
            "email": email,
            "password": password,
            "role": role,
            "centre_id": centreId
        ]

        do {
            let body = try JSONSerialization.data(withJSONObject: payload)
            let _: [String: String] = try await APIClient.shared.request(.createStaff, body: body)
            onCreated()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}
