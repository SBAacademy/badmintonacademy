import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/utils/launcher_utils.dart';

class FinanceScreen extends ConsumerStatefulWidget {
  const FinanceScreen({super.key});

  @override
  ConsumerState<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends ConsumerState<FinanceScreen> with SingleTickerProviderStateMixin {
  final ApiClient _client = ApiClient();
  late TabController _tabController;

  bool _isLoading = true;
  List<dynamic> _invoices = [];
  List<dynamic> _reminders = [];
  Map<String, dynamic> _summary = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchFinanceData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchFinanceData() async {
    setState(() => _isLoading = true);
    try {
      final invRes = await _client.dio.get(ApiEndpoints.invoices);
      final remRes = await _client.dio.get(ApiEndpoints.paymentReminders);
      dynamic repRes;
      try {
        repRes = await _client.dio.get(ApiEndpoints.reportsSummary);
      } catch (_) {}

      if (mounted) {
        setState(() {
          _invoices = invRes.data['data']?['invoices'] ?? [];
          _reminders = remRes.data['data']?['reminders'] ?? [];
          if (repRes != null && repRes.data?['data']?['finance'] != null) {
            _summary = repRes.data['data']['finance'];
          }
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _openRecordPaymentDialog([String? initialInvoiceId, String? studentId, double? balance]) {
    final amountCtrl = TextEditingController(text: balance != null ? balance.toStringAsFixed(0) : '');
    final refCtrl = TextEditingController();
    String method = 'UPI';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: const Text('Record Fee Payment', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800)),
          content: SizedBox(
            width: 440,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: amountCtrl,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(labelText: 'Amount Paid (₹) *'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: method,
                  dropdownColor: AppTheme.surface,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(labelText: 'Payment Method'),
                  items: const [
                    DropdownMenuItem(value: 'UPI', child: Text('UPI / QR Code')),
                    DropdownMenuItem(value: 'CASH', child: Text('Cash at Front Desk')),
                    DropdownMenuItem(value: 'BANK_TRANSFER', child: Text('Bank Transfer (NEFT/IMPS)')),
                    DropdownMenuItem(value: 'CARD', child: Text('Debit / Credit Card POS')),
                    DropdownMenuItem(value: 'CHEQUE', child: Text('Cheque')),
                  ],
                  onChanged: (v) => setDialogState(() => method = v!),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: refCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(labelText: 'UTR / Transaction Reference (Optional)'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted)),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(amountCtrl.text);
                if (amount != null && amount > 0) {
                  try {
                    await _client.dio.post(
                      ApiEndpoints.payments,
                      data: {
                        'studentId': studentId ?? (_invoices.isNotEmpty ? _invoices.first['student_id'] : ''),
                        'amountPaid': amount,
                        'paymentMethod': method,
                        'referenceNumber': refCtrl.text.trim(),
                        'invoiceId': initialInvoiceId,
                      },
                    );
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Payment allocated successfully against open invoice.'),
                          backgroundColor: AppTheme.success,
                        ),
                      );
                    }
                    _fetchFinanceData();
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(content: Text('Payment failed: $e')),
                      );
                    }
                  }
                }
              },
              child: const Text('Confirm & Allocate'),
            ),
          ],
        ),
      ),
    );
  }

  void _openCreateInvoiceDialog() async {
    final amountCtrl = TextEditingController(text: '3500');
    final periodCtrl = TextEditingController(
      text: '${DateTime.now().year}-${DateTime.now().month.toString().padLeft(2, '0')}',
    );
    final dueCtrl = TextEditingController(
      text: DateTime.now().add(const Duration(days: 7)).toIso8601String().split('T')[0],
    );

    List<dynamic> studentsList = [];
    try {
      final sRes = await _client.dio.get(ApiEndpoints.students);
      studentsList = sRes.data['data']?['students'] ?? [];
    } catch (_) {}

    if (studentsList.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No students enrolled to invoice.')),
        );
      }
      return;
    }

    String selectedStudentId = studentsList.first['id'];

    if (!mounted) return;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: const Text('Generate Fee Invoice', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800)),
          content: SizedBox(
            width: 460,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedStudentId,
                  dropdownColor: AppTheme.surface,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(labelText: 'Student Athlete'),
                  items: studentsList.map<DropdownMenuItem<String>>((s) {
                    return DropdownMenuItem<String>(
                      value: s['id'],
                      child: Text('${s['full_name']} (${s['student_code'] ?? s['id']})'),
                    );
                  }).toList(),
                  onChanged: (v) => setDialogState(() => selectedStudentId = v!),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: amountCtrl,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(labelText: 'Monthly Fee Amount (₹) *'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: periodCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(labelText: 'Billing Period (YYYY-MM) *'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: dueCtrl,
                  style: const TextStyle(color: AppTheme.textPrimary),
                  decoration: const InputDecoration(labelText: 'Due Date (YYYY-MM-DD) *'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted)),
            ),
            ElevatedButton(
              onPressed: () async {
                final amount = double.tryParse(amountCtrl.text);
                if (amount != null && amount > 0) {
                  try {
                    await _client.dio.post(
                      ApiEndpoints.invoices,
                      data: {
                        'studentId': selectedStudentId,
                        'amountDue': amount,
                        'billingPeriod': periodCtrl.text.trim(),
                        'dueDate': dueCtrl.text.trim(),
                      },
                    );
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Fee invoice generated successfully.')),
                      );
                    }
                    _fetchFinanceData();
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(content: Text('Failed to create invoice: $e')),
                      );
                    }
                  }
                }
              },
              child: const Text('Issue Invoice'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final billed = (_summary['total_invoiced'] ?? 0).toString().split('.')[0];
    final collected = (_summary['total_collected'] ?? 0).toString().split('.')[0];
    final receivables = (_summary['total_receivables'] ?? 0).toString().split('.')[0];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('FINANCIAL LEDGER & FEES'),
        actions: [
          IconButton(
            icon: const Icon(Icons.post_add, color: AppTheme.primary),
            tooltip: 'Generate Invoice',
            onPressed: _openCreateInvoiceDialog,
          ),
          IconButton(
            icon: const Icon(Icons.receipt_long, color: AppTheme.primary),
            tooltip: 'Record Payment',
            onPressed: () => _openRecordPaymentDialog(),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchFinanceData,
          ),
          const SizedBox(width: 8),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          tabs: [
            Tab(text: 'ALL INVOICES (${_invoices.length})'),
            Tab(text: 'OVERDUE REMINDERS (${_reminders.length})'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : Column(
              children: [
                // KPI Metric Summary Cards
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      _buildMetricBox('BILLED', '₹$billed', AppTheme.textPrimary),
                      const SizedBox(width: 8),
                      _buildMetricBox('COLLECTED', '₹$collected', AppTheme.success),
                      const SizedBox(width: 8),
                      _buildMetricBox('RECEIVABLES', '₹$receivables', AppTheme.warning),
                    ],
                  ),
                ),
                const Divider(color: AppTheme.border, height: 1),
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      // Invoices Tab
                      _invoices.isEmpty
                          ? const Center(child: Text('No fee invoices found.', style: TextStyle(color: AppTheme.textMuted)))
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _invoices.length,
                              itemBuilder: (ctx, i) => _buildInvoiceCard(_invoices[i]),
                            ),

                      // Reminders Tab
                      _reminders.isEmpty
                          ? const Center(
                              child: Text('All student accounts are currently settled! 🎉', style: TextStyle(color: AppTheme.success)))
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _reminders.length,
                              itemBuilder: (ctx, i) => _buildReminderCard(_reminders[i]),
                            ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildMetricBox(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.w900)),
          ],
        ),
      ),
    );
  }

  Widget _buildInvoiceCard(dynamic inv) {
    final invId = inv['id'] ?? '';
    final studentName = inv['student_name'] ?? 'Student';
    final billingPeriod = inv['billing_period'] ?? '';
    final amountDue = double.tryParse('${inv['amount_due']}') ?? 0.0;
    final paidAmount = double.tryParse('${inv['paid_amount']}') ?? 0.0;
    final balanceDue = double.tryParse('${inv['balance_due']}') ?? 0.0;
    final status = inv['status'] ?? 'UNPAID';

    Color statusColor = AppTheme.warning;
    if (status == 'PAID') statusColor = AppTheme.success;
    if (status == 'PARTIAL') statusColor = AppTheme.info;
    if (status == 'OVERDUE') statusColor = AppTheme.danger;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                studentName,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  status,
                  style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Billing Period: $billingPeriod • Due Date: ${inv['due_date'] ?? ""}',
            style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Balance: ₹${balanceDue.toStringAsFixed(0)}',
                    style: TextStyle(
                      color: balanceDue > 0 ? AppTheme.warning : AppTheme.success,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    'Paid: ₹${paidAmount.toStringAsFixed(0)} / ₹${amountDue.toStringAsFixed(0)}',
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                  ),
                ],
              ),
              if (balanceDue > 0)
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: const Color(0xFF07090D),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  onPressed: () => _openRecordPaymentDialog(invId, inv['student_id'], balanceDue),
                  child: const Text('Record Payment', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReminderCard(dynamic rem) {
    final studentName = rem['student_name'] ?? 'Student';
    final parentName = rem['parent_name'] ?? 'Parent';
    final parentPhone = rem['parent_phone'] ?? '';
    final balance = rem['balance_due'] ?? 0;
    final period = rem['billing_period'] ?? '';
    final whatsappUrl = rem['whatsappUrl'] ?? '';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.danger.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                studentName,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
              ),
              Text(
                '₹$balance DUE',
                style: const TextStyle(color: AppTheme.danger, fontSize: 14, fontWeight: FontWeight.w900),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Parent: $parentName ($period)',
            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
                onPressed: () async {
                  if (whatsappUrl.isNotEmpty) {
                    final uri = Uri.parse(whatsappUrl);
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                      return;
                    }
                  }
                  if (parentPhone.isNotEmpty) {
                    LauncherUtils.launchWhatsApp(
                      context: context,
                      phone: parentPhone,
                      message:
                          'Dear $parentName, friendly reminder from S&A Badminton Academy: The fee of ₹$balance for $studentName for period $period is pending. Thank you!',
                    );
                  }
                },
                icon: const Icon(Icons.chat, size: 14),
                label: const Text('Send WhatsApp Reminder', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
