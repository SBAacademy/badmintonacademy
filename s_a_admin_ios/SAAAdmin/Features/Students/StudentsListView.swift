import SwiftUI

public struct StudentsListView: View {
    @State private var isLoading = true
    @State private var students: [StudentItem] = []
    @State private var selectedCentre = "ALL"
    @State private var selectedStatus = "ALL"
    @State private var searchText = ""
    @State private var showEnrollSheet = false
    @State private var selectedStudentForDetail: StudentItem?

    public init() {}

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Search & Filters
                    VStack(spacing: 10) {
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.rebelTextSecondary)
                            TextField("Search athlete name, ID, or parent phone...", text: $searchText)
                                .foregroundColor(.rebelTextPrimary)
                                .autocapitalization(.none)
                                .onSubmit { Task { await fetchStudents() } }

                            if !searchText.isEmpty {
                                Button {
                                    searchText = ""
                                    Task { await fetchStudents() }
                                } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundColor(.rebelTextSecondary)
                                }
                            }
                        }
                        .padding(10)
                        .background(Color.rebelSurface)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.rebelBorder, lineWidth: 1))

                        HStack(spacing: 8) {
                            Picker("Centre", selection: $selectedCentre) {
                                Text("All Centres").tag("ALL")
                                Text("Kadavanthra").tag("kadavanthra")
                                Text("Edappally").tag("edappally")
                                Text("Kakkanad").tag("kakkanad")
                            }
                            .pickerStyle(.menu)
                            .tint(.rebelPrimary)
                            .padding(.horizontal, 8)
                            .background(Color.rebelSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                            .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.rebelBorder, lineWidth: 1))

                            Picker("Status", selection: $selectedStatus) {
                                Text("All Status").tag("ALL")
                                Text("Active").tag("ACTIVE")
                                Text("Inactive").tag("INACTIVE")
                                Text("Trial").tag("TRIAL")
                            }
                            .pickerStyle(.menu)
                            .tint(.rebelPrimary)
                            .padding(.horizontal, 8)
                            .background(Color.rebelSurface)
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                            .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.rebelBorder, lineWidth: 1))

                            Spacer()
                        }
                    }
                    .padding(16)

                    Divider().background(Color.rebelBorder)

                    if isLoading {
                        Spacer()
                        ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .rebelPrimary))
                        Spacer()
                    } else if students.isEmpty {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "person.3")
                                .font(.system(size: 40))
                                .foregroundColor(.rebelTextSecondary.opacity(0.4))
                            Text("No Athletes Enrolled")
                                .font(RebelTypography.bodyBold)
                                .foregroundColor(.rebelTextPrimary)
                            Text("Converted leads or manually enrolled students will appear here.")
                                .font(RebelTypography.caption)
                                .foregroundColor(.rebelTextSecondary)
                        }
                        .padding(32)
                        Spacer()
                    } else {
                        List(students) { student in
                            studentCard(student)
                                .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .onTapGesture {
                                    selectedStudentForDetail = student
                                }
                        }
                        .listStyle(.plain)
                        .refreshable {
                            await fetchStudents()
                        }
                    }
                }
            }
            .navigationTitle("Student Master Roster")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showEnrollSheet = true
                    } label: {
                        Image(systemName: "person.badge.plus")
                            .foregroundColor(.rebelPrimary)
                    }
                }
            }
            .sheet(isPresented: $showEnrollSheet) {
                EnrollStudentView {
                    Task { await fetchStudents() }
                }
            }
            .sheet(item: $selectedStudentForDetail) { student in
                StudentDetailView(student: student)
            }
            .task {
                await fetchStudents()
            }
        }
    }

    private func fetchStudents() async {
        isLoading = true
        do {
            let res: APIResponse<StudentsData> = try await APIClient.shared.request(
                endpoint: .students(search: searchText, centre: selectedCentre, status: selectedStatus)
            )
            self.students = res.data?.students ?? []
        } catch {
            AppLogger.ui.error("Failed to load students: \(error.localizedDescription)")
        }
        isLoading = false
    }

    private func studentCard(_ s: StudentItem) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(s.full_name)
                    .font(RebelTypography.bodyBold)
                    .foregroundColor(.rebelTextPrimary)
                Spacer()
                RebelBadge(s.status, color: s.status == "ACTIVE" ? RebelColors.emerald : RebelColors.amber)
            }

            Text("\(s.student_code ?? s.id) • \(s.centre_name ?? s.primary_centre ?? "")")
                .font(RebelTypography.caption)
                .fontWeight(.semibold)
                .foregroundColor(.rebelPrimary)

            Text(s.program_name ?? s.primary_program ?? "Curriculum")
                .font(RebelTypography.caption)
                .foregroundColor(.rebelTextSecondary)

            if let parent = s.parent_name {
                Text("Parent: \(parent) (\(s.parent_phone ?? ""))")
                    .font(.system(size: 11))
                    .foregroundColor(.rebelTextSecondary)
            }
        }
        .rebelCard()
    }
}

public struct StudentDetailView: View {
    @Environment(\.dismiss) private var dismiss
    public let student: StudentItem

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Athlete Header
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(student.full_name)
                                    .font(RebelTypography.appTitle)
                                    .foregroundColor(.rebelTextPrimary)
                                Text("Student ID: \(student.student_code ?? student.id)")
                                    .font(RebelTypography.caption)
                                    .foregroundColor(.rebelPrimary)
                            }
                            Spacer()
                            RebelBadge(student.status, color: student.status == "ACTIVE" ? RebelColors.emerald : RebelColors.amber)
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 12)

                        // Parent / Guardian Communication Card
                        if let parentPhone = student.parent_phone, !parentPhone.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("PARENT / GUARDIAN")
                                    .font(RebelTypography.badge)
                                    .foregroundColor(.rebelTextSecondary)

                                Text(student.parent_name ?? "Parent")
                                    .font(RebelTypography.bodyBold)
                                    .foregroundColor(.rebelTextPrimary)

                                HStack(spacing: 12) {
                                    Button {
                                        ExternalLauncher.launchWhatsApp(
                                            phone: parentPhone,
                                            message: "Hello \(student.parent_name ?? "")! Greetings from S&A Badminton Academy regarding \(student.full_name):"
                                        )
                                    } label: {
                                        HStack {
                                            Image(systemName: "message.fill")
                                            Text("WhatsApp Parent")
                                        }
                                        .font(RebelTypography.bodyBold)
                                        .foregroundColor(.black)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 10)
                                        .background(RebelColors.emerald)
                                        .clipShape(RoundedRectangle(cornerRadius: 8))
                                    }

                                    Button {
                                        ExternalLauncher.launchPhone(phone: parentPhone)
                                    } label: {
                                        HStack {
                                            Image(systemName: "phone.fill")
                                            Text("Call")
                                        }
                                        .font(RebelTypography.bodyBold)
                                        .foregroundColor(.rebelPrimary)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 10)
                                        .background(Color.rebelSurface)
                                        .clipShape(RoundedRectangle(cornerRadius: 8))
                                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.rebelPrimary, lineWidth: 1))
                                    }
                                }
                            }
                            .rebelCard()
                            .padding(.horizontal, 16)
                        }

                        // Academy Enrollment Details
                        VStack(alignment: .leading, spacing: 12) {
                            Text("ACADEMY DETAILS")
                                .font(RebelTypography.badge)
                                .foregroundColor(.rebelTextSecondary)

                            VStack(spacing: 10) {
                                detailRow("Training Centre", student.centre_name ?? student.primary_centre ?? "")
                                detailRow("Curriculum", student.program_name ?? student.primary_program ?? "")
                                if let fee = student.monthly_fee {
                                    detailRow("Monthly Fee", "₹\(Int(fee)) / month")
                                }
                                detailRow("Gender", student.gender ?? "Not specified")
                            }
                        }
                        .rebelCard()
                        .padding(.horizontal, 16)

                        Spacer()
                    }
                }
            }
            .navigationTitle("Athlete Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(.rebelPrimary)
                }
            }
        }
    }

    private func detailRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
                .font(RebelTypography.caption)
                .foregroundColor(.rebelTextSecondary)
            Spacer()
            Text(value)
                .font(RebelTypography.bodyBold)
                .foregroundColor(.rebelTextPrimary)
        }
    }
}

public struct EnrollStudentView: View {
    @Environment(\.dismiss) private var dismiss
    public var onEnrolled: (() -> Void)? = nil

    @State private var fullName = ""
    @State private var parentName = ""
    @State private var parentPhone = ""
    @State private var parentEmail = ""
    @State private var centre = "kadavanthra"
    @State private var program = "junior-badminton-coaching"
    @State private var monthlyFee = "3500"
    @State private var isSubmitting = false
    @State private var errorMessage: String?

    public init(onEnrolled: (() -> Void)? = nil) {
        self.onEnrolled = onEnrolled
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                Form {
                    Section("Athlete Details") {
                        TextField("Full Name *", text: $fullName)
                    }
                    .listRowBackground(Color.rebelSurface)

                    Section("Parent / Guardian Association") {
                        TextField("Parent Name *", text: $parentName)
                        TextField("Parent Phone (10 digits) *", text: $parentPhone)
                            .keyboardType(.phonePad)
                        TextField("Parent Email", text: $parentEmail)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    .listRowBackground(Color.rebelSurface)

                    Section("Academy Enrollment") {
                        Picker("Centre", selection: $centre) {
                            Text("Kadavanthra Centre").tag("kadavanthra")
                            Text("Edappally Centre").tag("edappally")
                            Text("Kakkanad Centre").tag("kakkanad")
                        }

                        Picker("Curriculum", selection: $program) {
                            Text("Kids Badminton Coaching").tag("kids-badminton-coaching")
                            Text("Junior Badminton Coaching").tag("junior-badminton-coaching")
                            Text("Adult Coaching & Fitness").tag("adult-badminton-coaching")
                            Text("Elite High Performance").tag("elite-high-performance-training")
                            Text("Weekend Intensive Coaching").tag("weekend-badminton-batches")
                        }

                        TextField("Monthly Fee (₹) *", text: $monthlyFee)
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
                    Button("Confirm Enrollment") {
                        Task { await enrollStudent() }
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.rebelPrimary)
                    .disabled(fullName.isEmpty || parentPhone.isEmpty || isSubmitting)
                }
            }
        }
    }

    private func enrollStudent() async {
        isSubmitting = true
        errorMessage = nil

        struct StudentPayload: Encodable {
            let fullName: String
            let parentName: String
            let parentPhone: String
            let parentEmail: String
            let primaryCentre: String
            let primaryProgram: String
            let monthlyFee: Double
        }

        do {
            let fee = Double(monthlyFee) ?? 3500.0
            let _: APIResponse<[String: AnyCodable]> = try await APIClient.shared.request(
                endpoint: .students(),
                method: "POST",
                body: StudentPayload(
                    fullName: fullName.trimmingCharacters(in: .whitespacesAndNewlines),
                    parentName: parentName.trimmingCharacters(in: .whitespacesAndNewlines),
                    parentPhone: parentPhone.trimmingCharacters(in: .whitespacesAndNewlines),
                    parentEmail: parentEmail.trimmingCharacters(in: .whitespacesAndNewlines),
                    primaryCentre: centre,
                    primaryProgram: program,
                    monthlyFee: fee
                )
            )
            onEnrolled?()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}
