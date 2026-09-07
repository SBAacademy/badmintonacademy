import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/auth/auth_provider.dart';

class TodayScreen extends ConsumerStatefulWidget {
  const TodayScreen({super.key});

  @override
  ConsumerState<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends ConsumerState<TodayScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _sessions = [];
  Map<String, dynamic> _reportSummary = {};

  @override
  void initState() {
    super.initState();
    _fetchTodayData();
  }

  Future<void> _fetchTodayData() async {
    setState(() => _isLoading = true);

    try {
      final sessionRes = await _client.dio.get(ApiEndpoints.sessionsToday);
      dynamic reportRes;
      try {
        reportRes = await _client.dio.get(ApiEndpoints.reportsSummary);
      } catch (_) {}

      if (mounted) {
        setState(() {
          _sessions = sessionRes.data['data']?['sessions'] ?? [];
          if (reportRes != null && reportRes.data?['data'] != null) {
            _reportSummary = reportRes.data['data'];
          }
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final role = user?.role ?? 'COACH';
    final isCoach = role == 'COACH';
    final funnel = _reportSummary['funnel'] ?? {};
    final finance = _reportSummary['finance'] ?? {};

    final isWide = MediaQuery.of(context).size.width >= 900;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('TODAY’S OPERATIONS COCKPIT'),
            Text(
              '${user?.fullName ?? "Staff"} • $role ${user?.assignedCentre != null ? "• ${user!.assignedCentre!.toUpperCase()}" : ""}',
              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted, fontWeight: FontWeight.w500),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.primary),
            tooltip: 'Refresh Operations',
            onPressed: _fetchTodayData,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : RefreshIndicator(
              color: AppTheme.primary,
              backgroundColor: AppTheme.surface,
              onRefresh: _fetchTodayData,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // 1. Operational Alerts Row
                  if (!isCoach) ...[
                    Row(
                      children: [
                        _buildAlertMetric(
                          label: 'NEW LEADS',
                          value: '${funnel['new_leads'] ?? 0}',
                          accentColor: AppTheme.primary,
                          icon: Icons.flash_on,
                          onTap: () => context.go('/leads'),
                        ),
                        const SizedBox(width: 12),
                        _buildAlertMetric(
                          label: 'TRIALS TODAY',
                          value: '${funnel['trial_scheduled_leads'] ?? 0}',
                          accentColor: AppTheme.info,
                          icon: Icons.sports_tennis,
                          onTap: () => context.go('/leads'),
                        ),
                        const SizedBox(width: 12),
                        _buildAlertMetric(
                          label: 'RECEIVABLES',
                          value: '₹${(finance['total_receivables'] ?? 0).toString().split('.')[0]}',
                          accentColor: AppTheme.warning,
                          icon: Icons.payments_outlined,
                          onTap: () => context.go('/finance'),
                        ),
                        const SizedBox(width: 12),
                        _buildAlertMetric(
                          label: 'OVERDUE FEES',
                          value: '₹${(finance['total_overdue'] ?? 0).toString().split('.')[0]}',
                          accentColor: AppTheme.danger,
                          icon: Icons.warning_amber_rounded,
                          onTap: () => context.go('/finance'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],

                  // 2. Quick Action Hub (Role filtered)
                  const Text(
                    'QUICK ACTIONS',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      if (!isCoach) ...[
                        _buildQuickActionBtn(
                          label: '+ Add Lead',
                          icon: Icons.person_add_alt_1,
                          onPressed: () => context.go('/leads'),
                        ),
                        _buildQuickActionBtn(
                          label: '+ Schedule Trial',
                          icon: Icons.sports_tennis,
                          onPressed: () => context.go('/leads'),
                        ),
                        _buildQuickActionBtn(
                          label: '+ Enroll Student',
                          icon: Icons.school,
                          onPressed: () => context.go('/students'),
                        ),
                        _buildQuickActionBtn(
                          label: '+ Record Payment',
                          icon: Icons.receipt_long,
                          onPressed: () => context.go('/finance'),
                        ),
                      ],
                      _buildQuickActionBtn(
                        label: 'Mark Attendance',
                        icon: Icons.fact_check_outlined,
                        onPressed: () => context.push('/attendance'),
                      ),
                      if (isCoach) ...[
                        _buildQuickActionBtn(
                          label: '+ Athlete Evaluation',
                          icon: Icons.analytics_outlined,
                          onPressed: () => context.go('/performance'),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 28),

                  // 3. Today's Sessions List
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TODAY’S COURT SESSIONS & ATTENDANCE',
                        style: TextStyle(
                          color: AppTheme.textSecondary,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 1,
                        ),
                      ),
                      Text(
                        '${_sessions.length} SESSIONS ACTIVE',
                        style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  if (_sessions.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(
                        color: AppTheme.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.sports_tennis, size: 48, color: AppTheme.textMuted.withOpacity(0.4)),
                          const SizedBox(height: 14),
                          const Text(
                            'No Court Sessions Scheduled Today',
                            style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800, fontSize: 16),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Batches active on today\'s weekday will appear here automatically with roster attendance.',
                            style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  else if (isWide)
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        mainAxisExtent: 190,
                      ),
                      itemCount: _sessions.length,
                      itemBuilder: (ctx, i) => _buildSessionCard(_sessions[i]),
                    )
                  else
                    ..._sessions.map((ses) => _buildSessionCard(ses)),
                ],
              ),
            ),
    );
  }

  Widget _buildAlertMetric({
    required String label,
    required String value,
    required Color accentColor,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    label,
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 9, fontWeight: FontWeight.w800),
                  ),
                  Icon(icon, size: 14, color: accentColor),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                value,
                style: TextStyle(
                  color: accentColor,
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionBtn({
    required String label,
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppTheme.surface,
        foregroundColor: AppTheme.textPrimary,
        side: const BorderSide(color: AppTheme.border),
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      ),
      onPressed: onPressed,
      icon: Icon(icon, size: 16, color: AppTheme.primary),
      label: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
    );
  }

  Widget _buildSessionCard(dynamic ses) {
    final sessionId = ses['id'] ?? '';
    final batchName = ses['batch_name'] ?? 'Training Cohort';
    final centreName = ses['centre_name'] ?? 'Centre';
    final coachName = ses['coach_name'] ?? 'Coach Unassigned';
    final startTime = ses['start_time'] ?? '';
    final endTime = ses['end_time'] ?? '';
    final isCompleted = ses['status'] == 'COMPLETED';
    final totalStudents = ses['total_students'] ?? 0;
    final markedStudents = ses['marked_students'] ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isCompleted ? AppTheme.success.withOpacity(0.3) : AppTheme.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceElevated,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Text(
                  '$startTime – $endTime',
                  style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isCompleted ? AppTheme.success.withOpacity(0.12) : AppTheme.warning.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isCompleted ? 'COMPLETED' : 'ATTENDANCE PENDING',
                  style: TextStyle(
                    color: isCompleted ? AppTheme.success : AppTheme.warning,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                batchName,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                '$centreName • Coach: $coachName',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Roster: $markedStudents / $totalStudents marked',
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: isCompleted ? AppTheme.surfaceElevated : AppTheme.primary,
                  foregroundColor: isCompleted ? AppTheme.textPrimary : const Color(0xFF07090D),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                ),
                onPressed: () {
                  context.push('/attendance?sessionId=$sessionId');
                },
                child: Text(
                  isCompleted ? 'Review' : 'Mark Attendance →',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
