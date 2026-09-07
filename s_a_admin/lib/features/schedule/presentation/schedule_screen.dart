import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _sessions = [];
  String _selectedView = 'Today'; // 'Today', 'Day', 'Week'
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _fetchSchedule();
  }

  Future<void> _fetchSchedule() async {
    setState(() => _isLoading = true);
    try {
      final sessionRes = await _client.dio.get(ApiEndpoints.sessionsToday);
      if (sessionRes.data['data'] != null) {
        _sessions = sessionRes.data['data']['sessions'] ?? [];
      }

      // If sessions are empty, fetch active batches to display scheduled slots
      if (_sessions.isEmpty) {
        final batchRes = await _client.dio.get(ApiEndpoints.batches);
        final batches = batchRes.data['data']?['batches'] as List<dynamic>? ?? [];
        _sessions = batches.map((b) => {
          'id': b['id'],
          'batchName': b['name'] ?? 'Training Session',
          'centreName': (b['centre_slug'] ?? 'Kadavanthra').toString().toUpperCase(),
          'startTime': b['start_time'] ?? '04:00 PM',
          'roster': List.filled(b['enrolled_count'] ?? 10, {}),
        }).toList();
      }

      if (mounted) {
        setState(() => _isLoading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat('EEE, d MMM y').format(_selectedDate);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Header with calendar icon
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Schedule', style: AppTheme.pageTitle),
                  IconButton(
                    icon: const Icon(Icons.calendar_month_outlined, color: AppTheme.primary, size: 22),
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _selectedDate,
                        firstDate: DateTime(2025),
                        lastDate: DateTime(2027),
                        builder: (ctx, child) => Theme(
                          data: Theme.of(ctx).copyWith(
                            colorScheme: const ColorScheme.dark(
                              primary: AppTheme.primary,
                              onPrimary: AppTheme.onPrimary,
                              surface: AppTheme.surfaceElevated,
                            ),
                          ),
                          child: child!,
                        ),
                      );
                      if (picked != null) {
                        setState(() => _selectedDate = picked);
                        _fetchSchedule();
                      }
                    },
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Segmented Control: Today, Day, Week matching Screen 7
              RebelSegmentedControl<String>(
                values: const ['Today', 'Day', 'Week'],
                selectedValue: _selectedView,
                labelBuilder: (v) => v,
                onSelected: (v) {
                  setState(() => _selectedView = v);
                  _fetchSchedule();
                },
              ),

              const SizedBox(height: 14),

              // Date Subtitle matching Screen 7
              Text(
                formattedDate,
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),

              const SizedBox(height: 14),

              // Sessions List matching Screen 7
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
                      )
                    : _sessions.isEmpty
                        ? const RebelEmptyState(
                            icon: Icons.event_busy_outlined,
                            title: 'No sessions scheduled',
                            message: 'Sessions for this date will appear here.',
                          )
                        : RefreshIndicator(
                            color: AppTheme.primary,
                            backgroundColor: AppTheme.surfaceElevated,
                            onRefresh: _fetchSchedule,
                            child: ListView.separated(
                              itemCount: _sessions.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 12),
                              itemBuilder: (context, index) {
                                final session = _sessions[index];
                                final startTime = session['startTime'] ?? session['start_time'] ?? '4:00 PM';
                                final batchName = session['batchName'] ?? session['name'] ?? 'Training Session';
                                final centre = session['centreName'] ?? session['centre_slug'] ?? 'Kadavanthra';
                                final studentCount = (session['roster'] as List<dynamic>?)?.length ?? 12;
                                final sessionId = session['id'] ?? 'SES-$index';

                                return RebelCard(
                                  padding: const EdgeInsets.all(16),
                                  onTap: () => context.push('/attendance?sessionId=$sessionId'),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          // Time label
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
                                        '$centre • $studentCount students',
                                        style: const TextStyle(
                                          color: AppTheme.textSecondary,
                                          fontSize: 13,
                                        ),
                                      ),
                                      // First session displays inline Mark Attendance button as in Screen 7
                                      if (index == 0) ...[
                                        const SizedBox(height: 14),
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
}
