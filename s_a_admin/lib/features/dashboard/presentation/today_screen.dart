import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/auth/auth_provider.dart';
import '../../../core/components/rebel_components.dart';

class TodayScreen extends ConsumerStatefulWidget {
  const TodayScreen({super.key});

  @override
  ConsumerState<TodayScreen> createState() => _TodayScreenState();
}

class _TodayScreenState extends ConsumerState<TodayScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _sessions = [];
  int _newLeadsCount = 0;
  int _trialsTodayCount = 0;
  int _followUpsCount = 0;
  int _overduePaymentsCount = 0;
  int _pendingApprovalCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  Future<void> _fetchDashboardData() async {
    setState(() => _isLoading = true);

    try {
      // 1. Fetch Today's Sessions
      final sessionRes = await _client.dio.get(ApiEndpoints.sessionsToday);
      if (sessionRes.data['data'] != null) {
        _sessions = sessionRes.data['data']['sessions'] ?? [];
      }

      // 2. Fetch CRM & Trials Counts
      try {
        final leadsRes = await _client.dio.get('${ApiEndpoints.leads}?status=ALL');
        final leads = leadsRes.data['data']?['leads'] as List<dynamic>? ?? [];
        _newLeadsCount = leads.where((l) => l['status'] == 'NEW').length;
        _followUpsCount = leads.where((l) => l['status'] == 'CONTACTED' || l['status'] == 'FOLLOW_UP').length;
      } catch (_) {}

      try {
        final trialsRes = await _client.dio.get(ApiEndpoints.trials);
        final trials = trialsRes.data['data']?['trials'] as List<dynamic>? ?? [];
        final todayStr = DateFormat('yyyy-MM-dd').format(DateTime.now());
        _trialsTodayCount = trials.where((t) => t['scheduled_date']?.toString().startsWith(todayStr) == true).length;
      } catch (_) {}

      // 3. Fetch Finance Invoices Counts
      try {
        final invoicesRes = await _client.dio.get(ApiEndpoints.invoices);
        final invoices = invoicesRes.data['data']?['invoices'] as List<dynamic>? ?? [];
        _overduePaymentsCount = invoices.where((i) => i['status'] == 'OVERDUE').length;
        _pendingApprovalCount = invoices.where((i) => i['status'] == 'PENDING').length;
      } catch (_) {}

      if (mounted) {
        setState(() => _isLoading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final fullName = user?.fullName ?? 'Alex';
    final firstName = fullName.split(' ').first;
    final formattedDate = DateFormat('EEE, d MMM y').format(DateTime.now());

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: RefreshIndicator(
          color: AppTheme.primary,
          backgroundColor: AppTheme.surfaceElevated,
          onRefresh: _fetchDashboardData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header matching Screen 3: Greeting, Date, Notifications, Avatar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${_getGreeting()},',
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          firstName,
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          formattedDate,
                          style: const TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        // Notification icon with unread dot
                        Stack(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.notifications_none_outlined, size: 24, color: AppTheme.textPrimary),
                              onPressed: () => context.go('/notifications'),
                            ),
                            Positioned(
                              top: 10,
                              right: 10,
                              child: Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: AppTheme.primary,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 4),
                        // Avatar (taps to open Side Drawer)
                        GestureDetector(
                          onTap: () => Scaffold.of(context).openDrawer(),
                          child: RebelAvatar(name: fullName, radius: 18),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // 2x3 Metric Grid matching Screen 3
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 3,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  childAspectRatio: 1.05,
                  children: [
                    RebelMetricCard(
                      title: "Today's Sessions",
                      value: '${_sessions.length}',
                      icon: Icons.sports_tennis_rounded,
                      accentColor: AppTheme.statusNew,
                      onTap: () => context.go('/schedule'),
                    ),
                    RebelMetricCard(
                      title: 'New Leads',
                      value: '$_newLeadsCount',
                      icon: Icons.group_outlined,
                      accentColor: AppTheme.primary,
                      onTap: () => context.go('/leads'),
                    ),
                    RebelMetricCard(
                      title: 'Trials Today',
                      value: '$_trialsTodayCount',
                      icon: Icons.star_outline_rounded,
                      accentColor: AppTheme.statusTrial,
                      onTap: () => context.go('/leads'),
                    ),
                    RebelMetricCard(
                      title: 'Follow-ups',
                      value: '$_followUpsCount',
                      icon: Icons.replay_rounded,
                      accentColor: AppTheme.statusFollowUp,
                      onTap: () => context.go('/leads'),
                    ),
                    RebelMetricCard(
                      title: 'Payments Overdue',
                      value: '$_overduePaymentsCount',
                      icon: Icons.receipt_long_outlined,
                      accentColor: AppTheme.statusAbsent,
                      onTap: () => context.go('/finance'),
                    ),
                    RebelMetricCard(
                      title: 'Pending Approval',
                      value: '$_pendingApprovalCount',
                      icon: Icons.pending_actions_outlined,
                      accentColor: AppTheme.statusLate,
                      onTap: () => context.go('/finance'),
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // Section Header: Upcoming Sessions with See All
                RebelSectionHeader(
                  title: 'Upcoming Sessions',
                  actionLabel: 'See All',
                  onAction: () => context.go('/schedule'),
                ),

                const SizedBox(height: 12),

                // Upcoming Sessions List
                if (_isLoading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(32),
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
                    ),
                  )
                else if (_sessions.isEmpty)
                  RebelCard(
                    padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                    child: Center(
                      child: Column(
                        children: [
                          const Icon(Icons.event_available_outlined, size: 36, color: AppTheme.textMuted),
                          const SizedBox(height: 8),
                          const Text(
                            'No sessions scheduled today',
                            style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Sessions for registered batches will appear here',
                            style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                          const SizedBox(height: 14),
                          RebelSecondaryButton(
                            label: 'View Master Timetable',
                            onPressed: () => context.go('/schedule'),
                            height: 38,
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _sessions.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final session = _sessions[index];
                      final startTime = session['startTime'] ?? session['start_time'] ?? '4:00 PM';
                      final batchName = session['batchName'] ?? session['batch_name'] ?? 'Kids (Beginner)';
                      final centreName = session['centreName'] ?? session['centre_name'] ?? 'Kadavanthra';
                      final rosterCount = (session['roster'] as List<dynamic>?)?.length ?? 12;
                      final sessionId = session['sessionId'] ?? session['id'] ?? 'SES-01';

                      return RebelCard(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                // Time badge matching Screen 3
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.surfaceElevated,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: AppTheme.border),
                                  ),
                                  child: Text(
                                    startTime,
                                    style: const TextStyle(
                                      color: AppTheme.primary,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 20),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              batchName,
                              style: const TextStyle(
                                color: AppTheme.textPrimary,
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$centreName • $rosterCount students',
                              style: const TextStyle(
                                color: AppTheme.textSecondary,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 14),
                            // Primary inline button: Mark Attendance
                            SizedBox(
                              width: double.infinity,
                              child: RebelButton(
                                label: 'Mark Attendance',
                                height: 42,
                                onPressed: () {
                                  context.push('/attendance?sessionId=$sessionId');
                                },
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
