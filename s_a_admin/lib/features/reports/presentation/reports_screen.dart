import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';

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
      final res = await _client.dio.get('/api/admin/reports/summary');
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

  @override
  Widget build(BuildContext context) {
    final funnel = _reports['funnel'] ?? {};
    final finance = _reports['finance'] ?? {};
    final attendance = _reports['attendance'] ?? {};

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('ACADEMY PERFORMANCE REPORTS'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchReports,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // 1. Funnel Section
                const Text(
                  'ADMISSIONS CONVERSION FUNNEL',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Column(
                    children: [
                      _buildFunnelRow('New Inbound Enquiries', '${funnel['new_leads'] ?? 0}', AppTheme.primary),
                      const Divider(color: AppTheme.border, height: 20),
                      _buildFunnelRow('Contacted by Admissions', '${funnel['contacted_leads'] ?? 0}', AppTheme.info),
                      const Divider(color: AppTheme.border, height: 20),
                      _buildFunnelRow('Free Trials Scheduled', '${funnel['trial_scheduled_leads'] ?? 0}', AppTheme.warning),
                      const Divider(color: AppTheme.border, height: 20),
                      _buildFunnelRow('Trials Attended on Court', '${funnel['trial_attended_leads'] ?? 0}', AppTheme.info),
                      const Divider(color: AppTheme.border, height: 20),
                      _buildFunnelRow('Officially Enrolled Athletes', '${funnel['enrolled_leads'] ?? 0}', AppTheme.success),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // 2. Financial Overview
                const Text(
                  'REVENUE & FEE COLLECTIONS',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _buildMetricBox('TOTAL BILLED', '₹${finance['total_billed'] ?? 0}', AppTheme.textPrimary),
                    const SizedBox(width: 12),
                    _buildMetricBox('COLLECTED', '₹${finance['total_collected'] ?? 0}', AppTheme.success),
                    const SizedBox(width: 12),
                    _buildMetricBox('RECEIVABLES', '₹${finance['total_receivables'] ?? 0}', AppTheme.danger),
                  ],
                ),
                const SizedBox(height: 24),

                // 3. Attendance Rate
                const Text(
                  'ATTENDANCE COMPLIANCE',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.border),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Overall Attendance Rate',
                            style: TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${attendance['present_marks'] ?? 0} presents out of ${attendance['total_marks'] ?? 0} records',
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                        ],
                      ),
                      Text(
                        '${attendance['attendance_percentage'] ?? 0}%',
                        style: const TextStyle(
                          color: AppTheme.primary,
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildFunnelRow(String label, String value, Color accent) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
        Text(value, style: TextStyle(color: accent, fontSize: 16, fontWeight: FontWeight.w800)),
      ],
    );
  }

  Widget _buildMetricBox(String label, String value, Color accent) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text(
              value.split('.')[0],
              style: TextStyle(color: accent, fontSize: 16, fontWeight: FontWeight.w900),
            ),
          ],
        ),
      ),
    );
  }
}
