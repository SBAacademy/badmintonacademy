import SwiftUI

public struct LeadDetailView: View {
    @Environment(\.dismiss) private var dismiss
    public let lead: LeadItem
    public var onUpdated: (() -> Void)? = nil

    @State private var showConvertSheet = false
    @State private var showScheduleTrial = false
    @State private var isAdvancing = false

    public init(lead: LeadItem, onUpdated: (() -> Void)? = nil) {
        self.lead = lead
        self.onUpdated = onUpdated
    }

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Header
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(lead.name)
                                    .font(RebelTypography.appTitle)
                                    .foregroundColor(.rebelTextPrimary)
                                Spacer()
                                RebelBadge(lead.status, color: statusColor(lead.status))
                            }

                            Text("Enquired for \(lead.program ?? "") at \(lead.branch?.uppercased() ?? "KADAVANTHRA") Centre")
                                .font(RebelTypography.caption)
                                .foregroundColor(.rebelTextSecondary)
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 12)

                        // Communication Buttons
                        HStack(spacing: 12) {
                            Button {
                                ExternalLauncher.launchWhatsApp(
                                    phone: lead.phone,
                                    message: "Hello \(lead.name)! Greetings from S&A Badminton Academy regarding your enquiry for \(lead.program ?? "") at \(lead.branch ?? "") centre:"
                                )
                            } label: {
                                HStack {
                                    Image(systemName: "message.fill")
                                    Text("WhatsApp")
                                }
                                .font(RebelTypography.bodyBold)
                                .foregroundColor(.black)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(RebelColors.emerald)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }

                            Button {
                                ExternalLauncher.launchPhone(phone: lead.phone)
                            } label: {
                                HStack {
                                    Image(systemName: "phone.fill")
                                    Text("Call Phone")
                                }
                                .font(RebelTypography.bodyBold)
                                .foregroundColor(.rebelPrimary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Color.rebelSurface)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.rebelPrimary, lineWidth: 1))
                            }
                        }
                        .padding(.horizontal, 16)

                        // Notes & Timeline
                        VStack(alignment: .leading, spacing: 8) {
                            Text("TIMELINE & INTERNAL STAFF NOTES")
                                .font(RebelTypography.badge)
                                .foregroundColor(.rebelTextSecondary)

                            Text(lead.notes?.isEmpty == false ? lead.notes! : "No staff notes recorded.")
                                .font(RebelTypography.caption)
                                .foregroundColor(.rebelTextPrimary)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .padding(14)
                                .background(Color.rebelSurfaceElevated)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.rebelBorder, lineWidth: 1))
                        }
                        .padding(.horizontal, 16)

                        // Stage Transitions & Actions
                        VStack(alignment: .leading, spacing: 12) {
                            Text("STAGE TRANSITIONS & ADMISSIONS ACTIONS")
                                .font(RebelTypography.badge)
                                .foregroundColor(.rebelTextSecondary)

                            VStack(spacing: 10) {
                                if lead.status != "CONTACTED" {
                                    actionRow(title: "Mark Contacted", icon: "checkmark.bubble", color: RebelColors.skyBlue) {
                                        await advanceStatus("CONTACTED")
                                    }
                                }

                                actionRow(title: "+ Schedule Free Trial Evaluation", icon: "calendar.badge.plus", color: RebelColors.amber) {
                                    showScheduleTrial = true
                                }

                                if lead.status == "TRIAL_SCHEDULED" {
                                    actionRow(title: "Mark Trial Attended on Court", icon: "figure.badminton", color: RebelColors.purple) {
                                        await advanceStatus("TRIAL_ATTENDED")
                                    }
                                }

                                Button {
                                    showConvertSheet = true
                                } label: {
                                    HStack {
                                        Image(systemName: "star.fill")
                                            .foregroundColor(.black)
                                        Text("Convert to Enrolled Student Athlete")
                                            .font(RebelTypography.bodyBold)
                                            .foregroundColor(.black)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .foregroundColor(.black)
                                    }
                                    .padding(14)
                                    .background(Color.rebelPrimary)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                }
                            }
                        }
                        .padding(.horizontal, 16)

                        Spacer(minLength: 24)
                    }
                }
            }
            .navigationTitle("Lead Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundColor(.rebelPrimary)
                }
            }
            .sheet(isPresented: $showScheduleTrial) {
                ScheduleTrialSheet(lead: lead) {
                    onUpdated?()
                    dismiss()
                }
            }
            .sheet(isPresented: $showConvertSheet) {
                ConvertLeadView(lead: lead) {
                    onUpdated?()
                    dismiss()
                }
            }
        }
    }

    private func actionRow(title: String, icon: String, color: Color, action: @escaping () async -> Void) -> some View {
        Button {
            Task { await action() }
        } label: {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Text(title)
                    .font(RebelTypography.bodyBold)
                    .foregroundColor(.rebelTextPrimary)
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(.rebelTextSecondary)
            }
            .padding(14)
            .background(Color.rebelSurface)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.rebelBorder, lineWidth: 1))
        }
    }

    private func advanceStatus(_ newStatus: String) async {
        isAdvancing = true
        struct StatusPayload: Encodable { let status: String }
        do {
            let _: APIResponse<[String: AnyCodable]> = try await APIClient.shared.request(
                endpoint: .leadDetail(lead.id),
                method: "PUT",
                body: StatusPayload(status: newStatus)
            )
            onUpdated?()
            dismiss()
        } catch {
            AppLogger.ui.error("Failed to advance status: \(error.localizedDescription)")
        }
        isAdvancing = false
    }

    private func statusColor(_ status: String) -> Color {
        switch status {
        case "NEW": return RebelColors.acidLime
        case "CONTACTED": return RebelColors.skyBlue
        case "TRIAL_SCHEDULED": return RebelColors.amber
        case "TRIAL_ATTENDED": return RebelColors.purple
        case "CONVERTED", "ENROLLED": return RebelColors.emerald
        case "LOST", "NOT_INTERESTED": return RebelColors.coral
        default: return .rebelTextSecondary
        }
    }
}
