import SwiftUI

struct FinanceView: View {
    @State private var invoices: [InvoiceItem] = []
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    @State private var statusFilter: String = "ALL"
    @State private var showingCreateInvoice = false
    @State private var selectedInvoiceForPayment: InvoiceItem? = nil

    let statusOptions = ["ALL", "PENDING", "PARTIAL", "OVERDUE", "PAID"]

    var filteredInvoices: [InvoiceItem] {
        if statusFilter == "ALL" {
            return invoices
        }
        return invoices.filter { $0.status.uppercased() == statusFilter }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                VStack(spacing: 0) {
                    // Status Filter Chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(statusOptions, id: \.self) { status in
                                let isSelected = statusFilter == status
                                Button {
                                    statusFilter = status
                                } label: {
                                    Text(status)
                                        .font(.caption.bold())
                                        .padding(.vertical, 6)
                                        .padding(.horizontal, 12)
                                        .background(isSelected ? Color.rebelLime : Color.rebelDarkSurface)
                                        .foregroundColor(isSelected ? .rebelPitchBlack : .rebelMuted)
                                        .cornerRadius(16)
                                }
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                    }

                    if isLoading && invoices.isEmpty {
                        Spacer()
                        ProgressView().tint(.rebelLime)
                        Spacer()
                    } else if filteredInvoices.isEmpty {
                        Spacer()
                        VStack(spacing: 8) {
                            Image(systemName: "creditcard")
                                .font(.system(size: 44))
                                .foregroundColor(.rebelMuted)
                            Text("No Invoices Found")
                                .font(.headline)
                                .foregroundColor(.rebelWhite)
                            Text("No billing records match the selected filter.")
                                .font(.caption)
                                .foregroundColor(.rebelMuted)
                        }
                        Spacer()
                    } else {
                        List(filteredInvoices) { invoice in
                            invoiceCard(invoice)
                                .listRowBackground(Color.clear)
                                .listRowSeparator(.hidden)
                                .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                        }
                        .listStyle(.plain)
                    }
                }
            }
            .navigationTitle("Finance")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingCreateInvoice = true
                    } label: {
                        Image(systemName: "plus")
                            .foregroundColor(.rebelLime)
                    }
                }
            }
            .sheet(isPresented: $showingCreateInvoice) {
                CreateInvoiceSheet {
                    Task { await loadInvoices() }
                }
            }
            .sheet(item: $selectedInvoiceForPayment) { invoice in
                RecordPaymentSheet(invoice: invoice) {
                    Task { await loadInvoices() }
                }
            }
            .task {
                await loadInvoices()
            }
            .refreshable {
                await loadInvoices()
            }
        }
    }

    private func invoiceCard(_ invoice: InvoiceItem) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(invoice.invoiceNumber)
                        .font(.caption.bold())
                        .foregroundColor(.rebelMuted)
                    Text(invoice.studentName ?? "Student")
                        .font(.headline)
                        .foregroundColor(.rebelWhite)
                }
                Spacer()
                statusBadge(invoice.status)
            }

            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Total: ₹\(Int(invoice.totalAmount))")
                        .font(.subheadline)
                        .foregroundColor(.rebelWhite)
                    Text("Balance: ₹\(Int(invoice.balanceAmount))")
                        .font(.subheadline.bold())
                        .foregroundColor(invoice.balanceAmount > 0 ? .rebelDanger : .rebelLime)
                }
                Spacer()
                if let due = invoice.dueDate {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Due Date")
                            .font(.caption2)
                            .foregroundColor(.rebelMuted)
                        Text(due)
                            .font(.caption.bold())
                            .foregroundColor(.rebelWhite)
                    }
                }
            }

            Divider().background(Color.rebelBorder)

            HStack(spacing: 8) {
                if invoice.balanceAmount > 0 {
                    Button {
                        selectedInvoiceForPayment = invoice
                    } label: {
                        Label("Record Payment", systemImage: "plus.circle.fill")
                            .font(.caption.bold())
                            .foregroundColor(.rebelPitchBlack)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.rebelLime)
                            .cornerRadius(6)
                    }

                    Button {
                        sendWhatsAppReminder(invoice)
                    } label: {
                        Label("WhatsApp", systemImage: "message.fill")
                            .font(.caption.bold())
                            .foregroundColor(.rebelWhite)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.rebelDarkSurface)
                            .cornerRadius(6)
                    }
                } else {
                    Label("PAID IN FULL", systemImage: "checkmark.seal.fill")
                        .font(.caption.bold())
                        .foregroundColor(.rebelLime)
                }
            }
        }
        .padding(14)
        .rebelCard()
    }

    private func statusBadge(_ status: String) -> some View {
        let (color, icon) = switch status.uppercased() {
        case "PAID": (Color.rebelLime, "✓")
        case "PENDING": (Color.rebelWarning, "⏱")
        case "PARTIAL": (Color.rebelInfo, "◐")
        case "OVERDUE": (Color.rebelDanger, "!")
        default: (Color.rebelMuted, "—")
        }
        return RebelBadge(text: "\(icon) \(status)", color: color)
    }

    private func sendWhatsAppReminder(_ invoice: InvoiceItem) {
        let student = invoice.studentName ?? "your child"
        let balance = Int(invoice.balanceAmount)
        let invNo = invoice.invoiceNumber
        let message = "Dear Parent, this is a reminder from S&A Badminton Academy regarding outstanding balance of ₹\(balance) for \(student) (Invoice: \(invNo)). Please settle at your earliest convenience. Thank you."

        // If phone is not directly on invoice, prompt with default academy line
        ExternalLauncher.openWhatsApp(phone: "919074558509", message: message)
    }

    private func loadInvoices() async {
        isLoading = true
        errorMessage = nil
        do {
            let res: InvoicesResponse = try await APIClient.shared.request(
                .invoices(status: nil, studentId: nil)
            )
            invoices = res.invoices
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}

struct RecordPaymentSheet: View {
    @Environment(\.dismiss) private var dismiss
    let invoice: InvoiceItem
    var onSaved: () -> Void

    @State private var amount = ""
    @State private var paymentMethod = "UPI"
    @State private var reference = ""
    @State private var notes = ""
    @State private var isSubmitting = false
    @State private var errorMessage: String? = nil

    let methods = ["UPI", "CASH", "CARD", "BANK_TRANSFER"]

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                Form {
                    Section(header: Text("Invoice Details").foregroundColor(.rebelLime)) {
                        HStack {
                            Text("Invoice #")
                            Spacer()
                            Text(invoice.invoiceNumber).foregroundColor(.rebelMuted)
                        }
                        HStack {
                            Text("Student")
                            Spacer()
                            Text(invoice.studentName ?? "—").foregroundColor(.rebelMuted)
                        }
                        HStack {
                            Text("Outstanding Balance")
                            Spacer()
                            Text("₹\(Int(invoice.balanceAmount))").bold().foregroundColor(.rebelDanger)
                        }
                    }
                    .listRowBackground(Color.rebelDarkSurface)

                    Section(header: Text("Payment Entry").foregroundColor(.rebelLime)) {
                        TextField("Amount (₹)", text: $amount)
                            .keyboardType(.decimalPad)

                        Picker("Method", selection: $paymentMethod) {
                            ForEach(methods, id: \.self) { m in
                                Text(m).tag(m)
                            }
                        }

                        TextField("Reference / Transaction ID", text: $reference)
                        TextField("Notes", text: $notes)
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
            .navigationTitle("Record Payment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }.foregroundColor(.rebelMuted)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Record") {
                        Task { await submitPayment() }
                    }
                    .foregroundColor(.rebelLime)
                    .disabled(amount.trimmingCharacters(in: .whitespaces).isEmpty || isSubmitting)
                }
            }
            .onAppear {
                amount = "\(Int(invoice.balanceAmount))"
            }
        }
    }

    private func submitPayment() async {
        isSubmitting = true
        errorMessage = nil

        guard let amt = Double(amount), amt > 0 else {
            errorMessage = "Please enter a valid payment amount."
            isSubmitting = false
            return
        }

        let payload: [String: Any] = [
            "invoice_id": invoice.id,
            "amount": amt,
            "payment_method": paymentMethod,
            "reference_number": reference,
            "notes": notes
        ]

        do {
            let body = try JSONSerialization.data(withJSONObject: payload)
            let _: [String: String] = try await APIClient.shared.request(.recordPayment, body: body)
            onSaved()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}

struct CreateInvoiceSheet: View {
    @Environment(\.dismiss) private var dismiss
    var onCreated: () -> Void

    @State private var studentId = ""
    @State private var title = "Monthly Training Fee"
    @State private var amount = ""
    @State private var dueDate = Date().addingTimeInterval(7 * 86400)
    @State private var isSubmitting = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            ZStack {
                Color.rebelPitchBlack.ignoresSafeArea()

                Form {
                    Section(header: Text("Invoice Details").foregroundColor(.rebelLime)) {
                        TextField("Title / Description", text: $title)
                        TextField("Student ID (e.g. STU-...) ", text: $studentId)
                        TextField("Amount (₹)", text: $amount)
                            .keyboardType(.decimalPad)
                        DatePicker("Due Date", selection: $dueDate, displayedComponents: .date)
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
            .navigationTitle("New Invoice")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }.foregroundColor(.rebelMuted)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Create") {
                        Task { await createInvoice() }
                    }
                    .foregroundColor(.rebelLime)
                    .disabled(amount.isEmpty || isSubmitting)
                }
            }
        }
    }

    private func createInvoice() async {
        isSubmitting = true
        errorMessage = nil

        guard let amt = Double(amount), amt > 0 else {
            errorMessage = "Please enter a valid amount."
            isSubmitting = false
            return
        }

        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"

        let payload: [String: Any] = [
            "title": title,
            "student_id": studentId,
            "total_amount": amt,
            "due_date": formatter.string(from: dueDate)
        ]

        do {
            let body = try JSONSerialization.data(withJSONObject: payload)
            let _: [String: String] = try await APIClient.shared.request(.createInvoice, body: body)
            onCreated()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
        isSubmitting = false
    }
}
