import SwiftUI

struct PerformanceView: View {
    @State private var assessments: [PerformanceItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    @State private var showingAddAssessment = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                if isLoading && assessments.isEmpty {
                    ProgressView().tint(.rebelLime)
                } else if assessments.isEmpty {
                    VStack(spacing: 8) {
                        Image(systemName: "chart.bar.xaxis")
                            .font(.system(size: 44))
                            .foregroundColor(.rebelMuted)
                        Text("No Performance Assessments")
                            .font(.headline)
                            .foregroundColor(.rebelWhite)
                        Text("Assessments scored across Footwork, Technique, Fitness, Tactical, and Consistency will appear here.")
                            .font(.caption)
                            .foregroundColor(.rebelMuted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                } else {
                    List(assessments) { item in
                        assessmentCard(item)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Performance")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingAddAssessment = true
                    } label: {
                        Image(systemName: "plus")
                            .foregroundColor(.rebelLime)
                    }
                }
            }
            .sheet(isPresented: $showingAddAssessment) {
                AddAssessmentSheet {
                    Task { await loadAssessments() }
                }
            }
            .task {
                await loadAssessments()
            }
            .refreshable {
                await loadAssessments()
            }
        }
    }

    private func assessmentCard(_ item: PerformanceItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(item.studentName ?? "Student Assessment")
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                    Text("Assessed on \(item.assessmentDate)")
                        .font(.caption)
                        .foregroundColor(.rebelMuted)
                }
                Spacer()
                if let ov = item.overallScore {
                    HStack(spacing: 2) {
                        Text(String(format: "%.1f", ov))
                            .font(.title2.bold())
                            .foregroundColor(.rebelLime)
                        Text("/ 10")
                            .font(.caption2)
                            .foregroundColor(.rebelMuted)
                    }
                }
            }

            // 5-Skill rubric bars
            VStack(spacing: 6) {
                skillBar(name: "Footwork", score: item.footworkScore)
                skillBar(name: "Technique", score: item.techniqueScore)
                skillBar(name: "Fitness", score: item.fitnessScore)
                skillBar(name: "Tactical", score: item.tacticalScore)
                skillBar(name: "Consistency", score: item.consistencyScore)
            }

            if let notes = item.coachNotes, !notes.isEmpty {
                Text(notes)
                    .font(.caption)
                    .foregroundColor(.rebelMuted)
                    .padding(.top, 4)
            }
        }
        .padding(14)
        .rebelCard()
    }

    private func skillBar(name: String, score: Double?) -> some View {
        let val = score ?? 5.0
        let ratio = val / 10.0
        return HStack {
            Text(name)
                .font(.caption2)
                .foregroundColor(.rebelMuted)
                .frame(width: 80, alignment: .leading)
            ProgressView(value: ratio)
                .tint(.rebelLime)
            Text(String(format: "%.1f", val))
                .font(.caption2.bold())
                .foregroundColor(.rebelWhite)
                .frame(width: 30, alignment: .trailing)
        }
    }

    private func loadAssessments() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: PerformanceResponse = try await APIClient.shared.request(
                .performance(studentId: nil)
            )
            assessments = res.assessments
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

struct AddAssessmentSheet: View {
    @Environment(\.dismiss) private var dismiss
    var onSaved: () -> Void

    @State private var studentId = ""
    @State private var footwork: Double = 7.0
    @State private var technique: Double = 7.0
    @State private var fitness: Double = 7.0
    @State private var tactical: Double = 7.0
    @State private var consistency: Double = 7.0
    @State private var coachNotes = ""
    @State private var isSubmitting = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                Form {
                    Section(header: Text("Athlete").foregroundColor(.rebelLime)) {
                        TextField("Student ID (e.g. STU-...)", text: $studentId)
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    Section(header: Text("5-Category Evaluation (1-10)").foregroundColor(.rebelLime)) {
                        sliderRow(title: "Footwork", value: $footwork)
                        sliderRow(title: "Technique", value: $technique)
                        sliderRow(title: "Fitness", value: $fitness)
                        sliderRow(title: "Tactical", value: $tactical)
                        sliderRow(title: "Consistency", value: $consistency)
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    Section(header: Text("Coach Notes").foregroundColor(.rebelLime)) {
                        TextField("Evaluation notes and drills recommended", text: $coachNotes)
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
            .navigationTitle("New Assessment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }.foregroundColor(.rebelMuted)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        Task { await saveAssessment() }
                    }
                    .foregroundColor(.rebelLime)
                    .disabled(studentId.isEmpty || isSubmitting)
                }
            }
        }
    }

    private func sliderRow(title: String, value: Binding<Double>) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(title)
                    .font(.caption)
                Spacer()
                Text(String(format: "%.1f", value.wrappedValue))
                    .font(.caption.bold())
                    .foregroundColor(.rebelLime)
            }
            Slider(value: value, in: 1...10, step: 0.5)
                .tint(.rebelLime)
        }
    }

    private func saveAssessment() async {
        isSubmitting = true
        errorMessage = nil

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        let overall = (footwork + technique + fitness + tactical + consistency) / 5.0

        let payload: [String: Any] = [
            "student_id": studentId,
            "assessment_date": formatter.string(from: Date()),
            "footwork_score": footwork,
            "technique_score": technique,
            "fitness_score": fitness,
            "tactical_score": tactical,
            "consistency_score": consistency,
            "overall_score": overall,
            "coach_notes": coachNotes
        ]

        do {
            let body = try JSONSerialization.data(withJSONObject: payload)
            let _: [String: String] = try await APIClient.shared.request(
                .createPerformance,
                body: body
            )
            onSaved()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}
