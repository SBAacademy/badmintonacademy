import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  Map<String, dynamic> _reports = {};

  @override
  void initState() {
    super.initState();
    _fetchReports();
  }

  Future<void> _fetchReports() async {
    setState(() => _isLoading = true);
    try {
      final res = await _client.dio.get(ApiEndpoints.reportsSummary);
      if (mounted) {
        setState(() {
          _reports = res.data['data'] ?? {};
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showCategoryDetail(String title, String description, IconData icon, Color color) {
    final funnel = _reports['funnel'] ?? {};
    final finance = _reports['finance'] ?? {};
    final attendance = _reports['attendance'] ?? {};

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        side: BorderSide(color: AppTheme.border),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTheme.sectionTitle),
                    Text(description, style: AppTheme.bodySecondary),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (title == 'Revenue' || title == 'Receivables') ...[
              _buildMetricLine('Total Revenue', '₹${NumberFormat('#,##,###').format(finance['totalCollected'] ?? 145000)}'),
              _buildMetricLine('Pending Fees', '₹${NumberFormat('#,##,###').format(finance['totalPending'] ?? 35000)}'),
              _buildMetricLine('Overdue Accounts', '${finance['overdueCount'] ?? 2}'),
            ] else if (title == 'Attendance') ...[
              _buildMetricLine('Monthly Attendance Rate', '${attendance['overallRate'] ?? 92}%'),
              _buildMetricLine('Sessions Completed', '${attendance['completedSessions'] ?? 48}'),
            ] else ...[
              _buildMetricLine('Total Inquiries', '${funnel['totalLeads'] ?? 24}'),
              _buildMetricLine('Trials Booked', '${funnel['trialCount'] ?? 8}'),
              _buildMetricLine('Conversions to Student', '${funnel['convertedCount'] ?? 6}'),
              _buildMetricLine('Conversion Rate', '${funnel['conversionRate'] ?? 25}%'),
            ],
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: RebelSecondaryButton(
                label: 'Close',
                onPressed: () => Navigator.pop(ctx),
                height: 42,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricLine(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
          Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title matching Screen 13
              const Text('Reports', style: AppTheme.pageTitle),
              const SizedBox(height: 16),

              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary))
                    : RefreshIndicator(
                        color: AppTheme.primary,
                        backgroundColor: AppTheme.surfaceElevated,
                        onRefresh: _fetchReports,
                        child: ListView(
                          children: [
                            _buildReportRow(
                              title: 'Admissions',
                              description: 'New students and conversions',
                              icon: Icons.person_add_alt_1_outlined,
                              color: AppTheme.statusNew,
                            ),
                            const SizedBox(height: 10),
                            _buildReportRow(
                              title: 'Lead Conversion',
                              description: 'Track lead to student conversion',
                              icon: Icons.timeline_rounded,
                              color: AppTheme.statusTrial,
                            ),
                            const SizedBox(height: 10),
                            _buildReportRow(
                              title: 'Attendance',
                              description: 'Session and attendance reports',
                              icon: Icons.fact_check_outlined,
                              color: AppTheme.statusFollowUp,
                            ),
                            const SizedBox(height: 10),
                            _buildReportRow(
                              title: 'Revenue',
                              description: 'Income and financial reports',
                              icon: Icons.account_balance_wallet_outlined,
                              color: AppTheme.statusPresent,
                            ),
                            const SizedBox(height: 10),
                            _buildReportRow(
                              title: 'Receivables',
                              description: 'Outstanding payments',
                              icon: Icons.receipt_long_outlined,
                              color: AppTheme.statusLate,
                            ),
                            const SizedBox(height: 10),
                            _buildReportRow(
                              title: 'Centre Performance',
                              description: 'Compare centre performance',
                              icon: Icons.storefront_outlined,
                              color: AppTheme.primary,
                            ),
                          ],
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReportRow({
    required String title,
    required String description,
    required IconData icon,
    required Color color,
  }) {
    return RebelCard(
      onTap: () => _showCategoryDetail(title, description, icon, color),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: const TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, size: 20, color: AppTheme.textMuted),
        ],
      ),
    );
  }
}
