import SwiftUI

public struct LeadsListView: View {
    @State private var isLoading = true
    @State private var leads: [LeadItem] = []
    @State private var selectedStatus = "ALL"
    @State private var selectedCentre = "ALL"
    @State private var searchText = ""
    @State private var showAddLead = false
    @State private var selectedLeadForDetail: LeadItem?

    private let statusTabs = ["ALL", "NEW", "CONTACTED", "FOLLOW_UP", "TRIAL_SCHEDULED", "TRIAL_ATTENDED", "CONVERTED", "LOST"]

    public init() {}

    public var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelBackground.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Search & Centre Filter Bar
                    VStack(spacing: 10) {
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.rebelTextSecondary)
                            TextField("Search candidate name, phone or email...", text: $searchText)
                                .foregroundColor(.rebelTextPrimary)
                                .autocapitalization(.none)
                                .onSubmit { Task { await fetchLeads() } }

                            if !searchText.isEmpty {
                                Button {
                                    searchText = ""
                                    Task { await fetchLeads() }
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

                        // Centre Selector
                        Picker("Centre", selection: $selectedCentre) {
                            Text("All Centres").tag("ALL")
                            Text("Kadavanthra").tag("kadavanthra")
                            Text("Edappally").tag("edappally")
                            Text("Kakkanad").tag("kakkanad")
                        }
                        .pickerStyle(.segmented)
                        .onChange(of: selectedCentre) { _ in
                            Task { await fetchLeads() }
                        }
                    }
                    .padding(16)

                    // Status Tabs
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(statusTabs, id: \.self) { tab in
                                Button {
                                    selectedStatus = tab
                                    Task { await fetchLeads() }
                                } label: {
                                    Text(tab)
                                        .font(RebelTypography.badge)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 8)
                                        .background(selectedStatus == tab ? Color.rebelPrimary : Color.rebelSurface)
                                        .foregroundColor(selectedStatus == tab ? .black : .rebelTextSecondary)
                                        .clipShape(RoundedRectangle(cornerRadius: 6))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 6)
                                                .stroke(selectedStatus == tab ? Color.rebelPrimary : Color.rebelBorder, lineWidth: 1)
                                        )
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                    .padding(.bottom, 12)

                    Divider().background(Color.rebelBorder)

                    // Leads List
                    if isLoading {
                        Spacer()
                        ProgressView().progressViewStyle(CircularProgressViewStyle(tint: .rebelPrimary))
                        Spacer()
                    } else if leads.isEmpty {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "person.crop.circle.badge.questionmark")
                                .font(.system(size: 40))
                                .foregroundColor(.rebelTextSecondary.opacity(0.4))
                            Text("No Leads Found")
                                .font(RebelTypography.bodyBold)
                                .foregroundColor(.rebelTextPrimary)
                            Text("New inbound enquiries from the website will automatically appear here.")
                                .font(RebelTypography.caption)
                                .foregroundColor(.rebelTextSecondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(32)
                        Spacer()
                    } else {
                        List(leads) { lead in
                            leadCard(lead)
                                .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .onTapGesture {
                                    selectedLeadForDetail = lead
                                }
                        }
                        .listStyle(.plain)
                        .refreshable {
                            await fetchLeads()
                        }
                    }
                }
            }
            .navigationTitle("Leads & Inbound CRM")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showAddLead = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .foregroundColor(.rebelPrimary)
                    }
                }
            }
            .sheet(isPresented: $showAddLead) {
                AddLeadView {
                    Task { await fetchLeads() }
                }
            }
            .sheet(item: $selectedLeadForDetail) { lead in
                LeadDetailView(lead: lead) {
                    Task { await fetchLeads() }
                }
            }
            .task {
                await fetchLeads()
            }
        }
    }

    private func fetchLeads() async {
        isLoading = true
        do {
            let res: APIResponse<LeadsData> = try await APIClient.shared.request(
                endpoint: .leads(status: selectedStatus, centre: selectedCentre, search: searchText)
            )
            self.leads = res.data?.leads ?? []
        } catch {
            AppLogger.ui.error("Failed to load leads: \(error.localizedDescription)")
        }
        isLoading = false
    }

    private func leadCard(_ lead: LeadItem) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(lead.name)
                    .font(RebelTypography.bodyBold)
                    .foregroundColor(.rebelTextPrimary)
                Spacer()
                RebelBadge(lead.status, color: statusColor(lead.status))
            }

            Text("\(lead.phone) • \(lead.branch?.capitalized ?? "Centre") • \(lead.program ?? "")")
                .font(RebelTypography.caption)
                .foregroundColor(.rebelTextSecondary)

            HStack {
                Text("Tap for timeline & conversion →")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.rebelTextSecondary)
                Spacer()
                Button {
                    ExternalLauncher.launchWhatsApp(phone: lead.phone, message: "Hello \(lead.name)! Greetings from S&A Badminton Academy:")
                } label: {
                    Image(systemName: "message.fill")
                        .foregroundColor(RebelColors.emerald)
                        .font(.system(size: 14))
                }
                .buttonStyle(.borderless)

                Button {
                    ExternalLauncher.launchPhone(phone: lead.phone)
                } label: {
                    Image(systemName: "phone.fill")
                        .foregroundColor(.rebelPrimary)
                        .font(.system(size: 14))
                }
                .buttonStyle(.borderless)
                .padding(.leading, 12)
            }
            .padding(.top, 4)
        }
        .rebelCard()
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
