import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/utils/launcher_utils.dart';
import '../../../core/components/rebel_components.dart';

class FinanceScreen extends ConsumerStatefulWidget {
  const FinanceScreen({super.key});

  @override
  ConsumerState<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends ConsumerState<FinanceScreen> {
  final ApiClient _client = ApiClient();
  final TextEditingController _searchCtrl = TextEditingController();

  bool _isLoading = true;
  List<dynamic> _invoices = [];
  List<dynamic> _payments = [];
  String _segment = 'Invoices'; // 'Invoices' or 'Payments'
  String _statusFilter = 'ALL';
  dynamic _selectedInvoice; // Non-null renders Screen 12: Payment Detail

  final List<Map<String, String>> _filterPills = [
    {'key': 'ALL', 'label': 'All'},
    {'key': 'OVERDUE', 'label': 'Overdue'},
    {'key': 'PENDING', 'label': 'Pending'},
    {'key': 'PAID', 'label': 'Paid'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchFinanceData();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchFinanceData() async {
    setState(() => _isLoading = true);
    try {
      final invRes = await _client.dio.get(ApiEndpoints.invoices);
      dynamic payRes;
      try {
        payRes = await _client.dio.get(ApiEndpoints.payments);
      } catch (_) {}

      if (mounted) {
        setState(() {
          _invoices = invRes.data['data']?['invoices'] ?? [];
          _payments = payRes?.data['data']?['payments'] ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PAID':
        return AppTheme.statusPresent;
      case 'PENDING':
        return AppTheme.statusFollowUp;
      case 'OVERDUE':
        return AppTheme.statusAbsent;
      case 'PARTIAL':
        return AppTheme.statusLate;
      default:
        return AppTheme.textSecondary;
    }
  }

  void _showRecordPaymentSheet(dynamic invoice) {
    final amountCtrl = TextEditingController(
      text: (invoice['balance_amount'] ?? invoice['amount'] ?? 5000).toString(),
    );
    String method = 'UPI';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Record Payment', style: AppTheme.sectionTitle),
            const SizedBox(height: 6),
            Text('Invoice: ${invoice['invoice_number'] ?? invoice['id']}', style: AppTheme.bodySecondary),
            const SizedBox(height: 16),
            TextField(
              controller: amountCtrl,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(hintText: 'Amount (₹) *'),
            ),
            const SizedBox(height: 14),
            Row(
              children: ['UPI', 'CASH', 'BANK_TRANSFER'].map((m) {
                final isSelected = method == m;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: RebelFilterPill(
                    label: m,
                    isSelected: isSelected,
                    onTap: () {
                      method = m;
                      (ctx as Element).markNeedsBuild();
                    },
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: RebelButton(
                label: 'Confirm Payment Entry',
                onPressed: () async {
                  final amt = double.tryParse(amountCtrl.text.trim()) ?? 0;
                  if (amt <= 0) return;
                  Navigator.pop(ctx);
                  try {
                    await _client.dio.post(ApiEndpoints.payments, data: {
                      'invoiceId': invoice['id'],
                      'studentId': invoice['student_id'],
                      'amount': amt,
                      'paymentMethod': method,
                    });
                    _fetchFinanceData();
                    setState(() {
                      if (_selectedInvoice != null && _selectedInvoice['id'] == invoice['id']) {
                        _selectedInvoice['status'] = 'PAID';
                        _selectedInvoice['balance_amount'] = 0;
                        _selectedInvoice['paid_amount'] = amt;
                      }
                    });
                  } catch (_) {}
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_selectedInvoice != null) {
      return _buildInvoiceDetailView(_selectedInvoice);
    }

    return _buildFinanceListView();
  }

  /// Screen 11: Payments & Invoices List matching reference mockup
  Widget _buildFinanceListView() {
    final filteredInvoices = _invoices.where((inv) {
      if (_statusFilter != 'ALL' && inv['status'] != _statusFilter) return false;
      final q = _searchCtrl.text.trim().toLowerCase();
      if (q.isNotEmpty) {
        final invNum = (inv['invoice_number'] ?? '').toString().toLowerCase();
        final stuName = (inv['student_name'] ?? inv['student'] ?? '').toString().toLowerCase();
        if (!invNum.contains(q) && !stuName.contains(q)) return false;
      }
      return true;
    }).toList();

    final filteredPayments = _payments.where((p) {
      final q = _searchCtrl.text.trim().toLowerCase();
      if (q.isNotEmpty) {
        final payNum = (p['receipt_number'] ?? p['id'] ?? '').toString().toLowerCase();
        final stuName = (p['student_name'] ?? p['student'] ?? '').toString().toLowerCase();
        final method = (p['payment_method'] ?? '').toString().toLowerCase();
        if (!payNum.contains(q) && !stuName.contains(q) && !method.contains(q)) return false;
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title with icon
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Payments', style: AppTheme.pageTitle),
                  IconButton(
                    icon: const Icon(Icons.receipt_long_outlined, color: AppTheme.primary, size: 22),
                    onPressed: () {},
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Segmented Toggle: Invoices vs Payments
              RebelSegmentedControl<String>(
                values: const ['Invoices', 'Payments'],
                selectedValue: _segment,
                labelBuilder: (v) => v,
                onSelected: (v) => setState(() => _segment = v),
              ),

              const SizedBox(height: 12),

              // Search field: Search invoices...
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search invoices...',
                onChanged: (_) => setState(() {}),
                onClear: () => setState(() {}),
              ),

              const SizedBox(height: 12),

              // Filter pills: All, Overdue, Pending, Paid
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _filterPills.map((f) {
                    final isSelected = _statusFilter == f['key'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: RebelFilterPill(
                        label: f['label']!,
                        isSelected: isSelected,
                        onTap: () => setState(() => _statusFilter = f['key']!),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 16),

              // Invoices / Payments list cards matching Screen 11
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
                      )
                    : (_segment == 'Payments' ? filteredPayments.isEmpty : filteredInvoices.isEmpty)
                        ? RebelEmptyState(
                            icon: _segment == 'Payments' ? Icons.payments_outlined : Icons.receipt_outlined,
                            title: _segment == 'Payments' ? 'No payment records' : 'No invoices found',
                            message: _segment == 'Payments'
                                ? 'Completed transactions and receipts will appear here.'
                                : 'Tuition and coaching fee records will appear here.',
                          )
                        : RefreshIndicator(
                            color: AppTheme.primary,
                            backgroundColor: AppTheme.surfaceElevated,
                            onRefresh: _fetchFinanceData,
                            child: _segment == 'Payments'
                                ? ListView.separated(
                                    itemCount: filteredPayments.length,
                                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                                    itemBuilder: (context, index) {
                                      final pay = filteredPayments[index];
                                      final payNum = pay['receipt_number'] ?? 'REC-2025-${(index + 1).toString().padLeft(3, "0")}';
                                      final studentName = pay['student_name'] ?? pay['student'] ?? 'Student';
                                      final method = pay['payment_method'] ?? 'UPI';
                                      final amount = '₹${NumberFormat('#,##,###').format(pay['amount'] ?? 5000)}';

                                      return RebelCard(
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                        child: Row(
                                          children: [
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    payNum,
                                                    style: const TextStyle(
                                                      color: AppTheme.textPrimary,
                                                      fontSize: 15,
                                                      fontWeight: FontWeight.w700,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    studentName,
                                                    style: const TextStyle(
                                                      color: AppTheme.textSecondary,
                                                      fontSize: 13,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    'Method: $method',
                                                    style: const TextStyle(
                                                      color: AppTheme.textMuted,
                                                      fontSize: 11,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.end,
                                              children: [
                                                Text(
                                                  amount,
                                                  style: const TextStyle(
                                                    color: AppTheme.textPrimary,
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                                const SizedBox(height: 6),
                                                const RebelStatusBadge(
                                                  label: 'PAID',
                                                  color: AppTheme.statusPresent,
                                                  isFilled: true,
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                  )
                                : ListView.separated(
                                    itemCount: filteredInvoices.length,
                                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                                    itemBuilder: (context, index) {
                                      final inv = filteredInvoices[index];
                                      final invNum = inv['invoice_number'] ?? 'INV-2025-${(index + 1).toString().padLeft(3, "0")}';
                                      final studentName = inv['student_name'] ?? inv['student'] ?? 'Student';
                                      final month = inv['billing_period'] ?? inv['month'] ?? 'Feb 2025';
                                      final amount = '₹${NumberFormat('#,##,###').format(inv['amount'] ?? 5000)}';
                                      final status = (inv['status'] ?? 'PENDING').toString().toUpperCase();
                                      final statusColor = _getStatusColor(status);

                                      return RebelCard(
                                        onTap: () => setState(() => _selectedInvoice = inv),
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                        child: Row(
                                          children: [
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    invNum,
                                                    style: const TextStyle(
                                                      color: AppTheme.textPrimary,
                                                      fontSize: 15,
                                                      fontWeight: FontWeight.w700,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    studentName,
                                                    style: const TextStyle(
                                                      color: AppTheme.textSecondary,
                                                      fontSize: 13,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    month,
                                                    style: const TextStyle(
                                                      color: AppTheme.textMuted,
                                                      fontSize: 11,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.end,
                                              children: [
                                                Text(
                                                  amount,
                                                  style: const TextStyle(
                                                    color: AppTheme.textPrimary,
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                                const SizedBox(height: 6),
                                                RebelStatusBadge(
                                                  label: status,
                                                  color: statusColor,
                                                  isFilled: status == 'PAID',
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Screen 12: Payment / Invoice Detail matching reference mockup
  Widget _buildInvoiceDetailView(dynamic invoice) {
    final invNum = invoice['invoice_number'] ?? 'INV-2025-002';
    final status = (invoice['status'] ?? 'PENDING').toString().toUpperCase();
    final studentName = invoice['student_name'] ?? invoice['student'] ?? 'Diya P';
    final studentPhone = invoice['phone'] ?? '+91 98765 43210';
    final amount = double.tryParse(invoice['amount']?.toString() ?? '5000') ?? 5000;
    final paid = double.tryParse(invoice['paid_amount']?.toString() ?? '0') ?? 0;
    final balance = double.tryParse(invoice['balance_amount']?.toString() ?? '${amount - paid}') ?? (amount - paid);
    final dueDate = invoice['due_date'] != null ? DateFormat('d MMM y').format(DateTime.parse(invoice['due_date'])) : '10 Feb 2025';
    final billingPeriod = invoice['billing_period'] ?? 'Feb 2025';
    final statusColor = _getStatusColor(status);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: TextButton.icon(
          icon: const Icon(Icons.chevron_left, color: AppTheme.primary, size: 24),
          label: const Text('Back', style: TextStyle(color: AppTheme.primary, fontSize: 15, fontWeight: FontWeight.w600)),
          onPressed: () => setState(() => _selectedInvoice = null),
        ),
        leadingWidth: 90,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header: Invoice Details, Invoice ID, Status Badge
                    const Text(
                      'Invoice Details',
                      style: TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          invNum,
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        RebelStatusBadge(label: status, color: statusColor),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Student Information Card matching Screen 12
                    RebelCard(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          RebelAvatar(name: studentName, radius: 20),
                          const SizedBox(width: 12),
                          Text(
                            studentName,
                            style: const TextStyle(
                              color: AppTheme.textPrimary,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Financial Breakdown matching Screen 12
                    RebelCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Column(
                        children: [
                          _buildDetailRow('Amount', '₹${NumberFormat('#,##,###').format(amount)}'),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Paid', '₹${NumberFormat('#,##,###').format(paid)}'),
                          const Divider(color: AppTheme.border, height: 1),
                          // Prominent red balance text
                          _buildDetailRow(
                            'Balance',
                            '₹${NumberFormat('#,##,###').format(balance)}',
                            valueColor: AppTheme.statusAbsent,
                            isBold: true,
                          ),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Due Date', dueDate),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Billing Period', billingPeriod),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Sticky Bottom Actions matching Screen 12: Record Payment + Send WhatsApp Reminder
            Container(
              padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).padding.bottom + 12),
              decoration: const BoxDecoration(
                color: AppTheme.background,
                border: Border(top: BorderSide(color: AppTheme.border, width: 1)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: RebelButton(
                      label: 'Record Payment',
                      height: 48,
                      onPressed: () => _showRecordPaymentSheet(invoice),
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: RebelSecondaryButton(
                      label: 'Send WhatsApp Reminder',
                      icon: Icons.chat_outlined,
                      height: 46,
                      onPressed: () {
                        final msg = 'Dear Parent, fee invoice $invNum for $studentName is pending. Outstanding balance: ₹${NumberFormat("#,##,###").format(balance)}. Thank you, S&A Badminton Academy.';
                        LauncherUtils.openWhatsApp(studentPhone, msg);
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? valueColor, bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppTheme.textMuted,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? AppTheme.textPrimary,
              fontSize: 14,
              fontWeight: isBold ? FontWeight.w700 : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
