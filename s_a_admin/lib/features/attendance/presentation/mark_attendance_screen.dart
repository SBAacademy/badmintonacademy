import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/offline_queue.dart';
import '../../../core/components/rebel_components.dart';

class MarkAttendanceScreen extends ConsumerStatefulWidget {
  final String? sessionId;

  const MarkAttendanceScreen({super.key, this.sessionId});

  @override
  ConsumerState<MarkAttendanceScreen> createState() => _MarkAttendanceScreenState();
}

class _MarkAttendanceScreenState extends ConsumerState<MarkAttendanceScreen> {
  final ApiClient _client = ApiClient();
  final OfflineAttendanceQueue _offlineQueue = OfflineAttendanceQueue();

  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _currentSessionId;
  String _batchName = 'Junior Batch';
  String _centreName = 'Kadavanthra';
  String _sessionTime = '5:30 PM';
  List<Map<String, dynamic>> _roster = [];
  int _pendingSyncCount = 0;

  @override
  void initState() {
    super.initState();
    _currentSessionId = widget.sessionId;
    _checkPendingSync();
    _loadSessionRoster();
  }

  Future<void> _checkPendingSync() async {
    final count = await _offlineQueue.getPendingCount();
    if (mounted) setState(() => _pendingSyncCount = count);
  }

  Future<void> _loadSessionRoster() async {
    setState(() => _isLoading = true);

    try {
      final res = await _client.dio.get('/api/admin/sessions/today');
      final sessions = res.data['data']?['sessions'] as List<dynamic>? ?? [];

      dynamic targetSession;
      if (_currentSessionId != null && _currentSessionId!.isNotEmpty) {
        targetSession = sessions.firstWhere(
          (s) => s['id'] == _currentSessionId,
          orElse: () => sessions.isNotEmpty ? sessions.first : null,
        );
      } else if (sessions.isNotEmpty) {
        targetSession = sessions.first;
      }

      if (targetSession != null) {
        _currentSessionId = targetSession['id'];
        _batchName = targetSession['batchName'] ?? targetSession['name'] ?? 'Junior Batch';
        _centreName = targetSession['centreName'] ?? targetSession['centre_slug'] ?? 'Kadavanthra';
        _sessionTime = targetSession['startTime'] ?? targetSession['start_time'] ?? '5:30 PM';

        final rawRoster = targetSession['roster'] as List<dynamic>? ?? [];
        _roster = rawRoster.map((r) => {
          'studentId': r['studentId'] ?? r['id'] ?? 'STU-01',
          'fullName': r['fullName'] ?? r['full_name'] ?? 'Student',
          'status': (r['attendanceStatus'] ?? r['status'] ?? 'PRESENT').toString().toUpperCase(),
        }).toList();
      }

      // If roster is empty, populate default students from active students
      if (_roster.isEmpty) {
        final studentsRes = await _client.dio.get('/api/admin/students');
        final students = studentsRes.data['data']?['students'] as List<dynamic>? ?? [];
        _roster = students.take(12).map((s) => {
          'studentId': s['id'],
          'fullName': s['name'] ?? s['full_name'] ?? 'Student',
          'status': 'PRESENT',
        }).toList();
      }

      if (mounted) setState(() => _isLoading = false);
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _markAllPresent() {
    setState(() {
      for (final r in _roster) {
        r['status'] = 'PRESENT';
      }
    });
  }

  void _cycleStatus(int index) {
    setState(() {
      final current = _roster[index]['status'];
      if (current == 'PRESENT') {
        _roster[index]['status'] = 'ABSENT';
      } else if (current == 'ABSENT') {
        _roster[index]['status'] = 'LATE';
      } else {
        _roster[index]['status'] = 'PRESENT';
      }
    });
  }

  Future<void> _saveAttendance() async {
    if (_currentSessionId == null) return;
    setState(() => _isSubmitting = true);

    final records = _roster.map((r) => {
      'studentId': r['studentId'],
      'status': r['status'],
    }).toList();

    try {
      await _client.dio.post('/api/admin/attendance', data: {
        'sessionId': _currentSessionId,
        'records': records,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Attendance saved successfully!'),
            backgroundColor: AppTheme.statusPresent,
          ),
        );
        context.pop();
      }
    } catch (e) {
      // Offline fallback: enqueue into OfflineAttendanceQueue
      await _offlineQueue.enqueueSessionAttendance(
        sessionId: _currentSessionId!,
        records: records,
      );
      await _checkPendingSync();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Offline: attendance queued for background sync.'),
            backgroundColor: AppTheme.statusFollowUp,
          ),
        );
        context.pop();
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat('EEE, d MMM y').format(DateTime.now());

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: TextButton.icon(
          icon: const Icon(Icons.chevron_left, color: AppTheme.primary, size: 24),
          label: const Text('Attendance', style: TextStyle(color: AppTheme.primary, fontSize: 15, fontWeight: FontWeight.w600)),
          onPressed: () => context.pop(),
        ),
        leadingWidth: 125,
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppTheme.textPrimary, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Offline sync indicator
            if (_pendingSyncCount > 0)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: AppTheme.statusFollowUp.withOpacity(0.15),
                child: Row(
                  children: [
                    const Icon(Icons.cloud_upload_outlined, color: AppTheme.statusFollowUp, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      '$_pendingSyncCount offline session(s) pending sync',
                      style: const TextStyle(color: AppTheme.statusFollowUp, fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),

            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
                    )
                  : SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Top Session Card matching Screen 8
                          RebelCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _batchName,
                                  style: const TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _centreName,
                                  style: const TextStyle(
                                    color: AppTheme.textSecondary,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  '$formattedDate • $_sessionTime',
                                  style: const TextStyle(
                                    color: AppTheme.textMuted,
                                    fontSize: 12,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  '${_roster.length} students',
                                  style: const TextStyle(
                                    color: AppTheme.primary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 20),

                          // Student Rows matching Screen 8 (1. Aarav S -> Present)
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _roster.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final student = _roster[index];
                              final name = student['fullName'] ?? 'Student';
                              final status = (student['status'] ?? 'PRESENT').toString();

                              return RebelCard(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                onTap: () => _cycleStatus(index),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        '${index + 1}. $name',
                                        style: const TextStyle(
                                          color: AppTheme.textPrimary,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ),
                                    _buildStatusTogglePill(status),
                                    const SizedBox(width: 8),
                                    const Icon(Icons.chevron_right, size: 16, color: AppTheme.textMuted),
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

            // Sticky Bottom Actions matching Screen 8: Mark All Present + Save Attendance
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
                    child: RebelSecondaryButton(
                      label: 'Mark All Present',
                      height: 44,
                      onPressed: _markAllPresent,
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: RebelButton(
                      label: 'Save Attendance',
                      height: 48,
                      isLoading: _isSubmitting,
                      onPressed: _saveAttendance,
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

  Widget _buildStatusTogglePill(String status) {
    Color bg;
    Color fg;
    IconData icon;
    String label;

    switch (status) {
      case 'ABSENT':
        bg = AppTheme.statusAbsent.withOpacity(0.14);
        fg = AppTheme.statusAbsent;
        icon = Icons.close_rounded;
        label = 'Absent';
        break;
      case 'LATE':
        bg = AppTheme.statusLate.withOpacity(0.14);
        fg = AppTheme.statusLate;
        icon = Icons.access_time_rounded;
        label = 'Late';
        break;
      case 'PRESENT':
      default:
        bg = AppTheme.statusPresent.withOpacity(0.14);
        fg = AppTheme.statusPresent;
        icon = Icons.check_rounded;
        label = 'Present';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: fg.withOpacity(0.4), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: fg),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: fg,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
