import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/offline_queue.dart';

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
  String _batchName = 'Training Session';
  List<Map<String, dynamic>> _roster = [];
  int _pendingSyncCount = 0;

  void _markAllPresent() {
    setState(() {
      for (final r in _roster) {
        r['status'] = 'PRESENT';
      }
    });
  }

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
        _batchName = targetSession['batch_name'] ?? 'Training Session';
        final rawRoster = targetSession['roster'] as List<dynamic>? ?? [];

        _roster = rawRoster.map((item) {
          return {
            'studentId': item['studentId'] ?? '',
            'fullName': item['fullName'] ?? 'Athlete',
            'status': item['attendanceStatus'] ?? 'PRESENT',
            'coachNote': '',
          };
        }).toList();
      }

      if (mounted) setState(() => _isLoading = false);
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveAttendance() async {
    if (_currentSessionId == null || _isSubmitting) return;

    setState(() => _isSubmitting = true);

    final records = _roster.map((r) => {
      'studentId': r['studentId'],
      'status': r['status'],
      'coachNote': r['coachNote'],
    }).toList();

    try {
      final res = await _client.dio.post(
        '/api/admin/attendance',
        data: {
          'sessionId': _currentSessionId,
          'records': records,
        },
      );

      if (res.statusCode == 200 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✓ Attendance successfully recorded and synced to cloud.'),
            backgroundColor: AppTheme.success,
          ),
        );
        context.pop();
      }
    } catch (_) {
      // Offline fallback: Enqueue locally!
      await _offlineQueue.enqueueSessionAttendance(
        sessionId: _currentSessionId!,
        records: records,
      );
      await _checkPendingSync();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Network offline: Saved to local offline queue. Will sync automatically.'),
            backgroundColor: AppTheme.warning,
          ),
        );
        context.pop();
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _triggerSync() async {
    final result = await _offlineQueue.syncPendingQueue();
    await _checkPendingSync();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Sync completed: ${result['synced']} synced, ${result['failed']} failed.'),
          backgroundColor: AppTheme.surfaceElevated,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('MARK ATTENDANCE'),
            Text(
              _batchName,
              style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
            ),
          ],
        ),
        actions: [
          if (_roster.isNotEmpty)
            TextButton.icon(
              onPressed: _isSubmitting ? null : _markAllPresent,
              icon: const Icon(Icons.done_all, size: 16, color: AppTheme.primary),
              label: const Text('All Present', style: TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w700)),
            ),
          if (_pendingSyncCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: ActionChip(
                backgroundColor: AppTheme.warning.withOpacity(0.2),
                side: const BorderSide(color: AppTheme.warning),
                label: Text(
                  '$_pendingSyncCount Queued (Sync)',
                  style: const TextStyle(color: AppTheme.warning, fontSize: 11, fontWeight: FontWeight.w700),
                ),
                onPressed: _triggerSync,
              ),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _roster.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.group_off_outlined, size: 48, color: AppTheme.textMuted),
                        const SizedBox(height: 16),
                        const Text(
                          'No Athletes Enrolled in this Batch',
                          style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Please assign students to this batch in the Students module.',
                          style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 20),
                        OutlinedButton(
                          onPressed: () => context.go('/students'),
                          child: const Text('Go to Student Roster'),
                        ),
                      ],
                    ),
                  ),
                )
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _roster.length,
                        itemBuilder: (ctx, i) {
                          final item = _roster[i];
                          final name = item['fullName'];
                          final currentStatus = item['status'];

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppTheme.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppTheme.border),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    _buildStatusToggle(i, 'PRESENT', AppTheme.success, currentStatus == 'PRESENT'),
                                    const SizedBox(width: 8),
                                    _buildStatusToggle(i, 'LATE', AppTheme.warning, currentStatus == 'LATE'),
                                    const SizedBox(width: 8),
                                    _buildStatusToggle(i, 'ABSENT', AppTheme.danger, currentStatus == 'ABSENT'),
                                    const SizedBox(width: 8),
                                    _buildStatusToggle(i, 'EXCUSED', AppTheme.info, currentStatus == 'EXCUSED'),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(
                        color: AppTheme.surface,
                        border: Border(top: BorderSide(color: AppTheme.border)),
                      ),
                      child: SafeArea(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            minimumSize: const Size.fromHeight(48),
                          ),
                          onPressed: _isSubmitting ? null : _saveAttendance,
                          child: _isSubmitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF07090D)),
                                )
                              : const Text('SUBMIT & CONFIRM ATTENDANCE →'),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildStatusToggle(int index, String status, Color color, bool isSelected) {
    IconData icon;
    switch (status) {
      case 'PRESENT':
        icon = Icons.check_circle_outline;
        break;
      case 'LATE':
        icon = Icons.access_time;
        break;
      case 'ABSENT':
        icon = Icons.cancel_outlined;
        break;
      case 'EXCUSED':
        icon = Icons.flag_outlined;
        break;
      default:
        icon = Icons.circle_outlined;
    }

    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() {
            _roster[index]['status'] = status;
          });
        },
        borderRadius: BorderRadius.circular(6),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.18) : AppTheme.surfaceElevated,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isSelected ? color : AppTheme.border,
              width: isSelected ? 1.5 : 1,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 14, color: isSelected ? color : AppTheme.textMuted),
              const SizedBox(height: 2),
              Text(
                status,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: isSelected ? color : AppTheme.textMuted,
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
