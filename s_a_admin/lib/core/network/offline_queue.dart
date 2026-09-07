import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_client.dart';

class OfflineAttendanceQueue {
  static const _queueKey = 'offline_attendance_queue';

  /// Save an attendance batch to local offline queue
  Future<void> enqueueSessionAttendance({
    required String sessionId,
    required List<Map<String, dynamic>> records,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final currentList = prefs.getStringList(_queueKey) ?? [];

    final item = jsonEncode({
      'sessionId': sessionId,
      'records': records,
      'queuedAt': DateTime.now().toIso8601String(),
    });

    currentList.add(item);
    await prefs.setStringList(_queueKey, currentList);
  }

  /// Check number of pending offline sync items
  Future<int> getPendingCount() async {
    final prefs = await SharedPreferences.getInstance();
    final currentList = prefs.getStringList(_queueKey) ?? [];
    return currentList.length;
  }

  /// Process queue by posting to backend API
  Future<Map<String, int>> syncPendingQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final currentList = prefs.getStringList(_queueKey) ?? [];

    if (currentList.isEmpty) {
      return {'synced': 0, 'failed': 0};
    }

    final client = ApiClient().dio;
    int synced = 0;
    int failed = 0;
    final remaining = <String>[];

    for (final rawItem in currentList) {
      try {
        final data = jsonDecode(rawItem) as Map<String, dynamic>;
        final response = await client.post(
          '/api/admin/attendance',
          data: {
            'sessionId': data['sessionId'],
            'records': data['records'],
          },
        );

        if (response.statusCode == 200) {
          synced++;
        } else {
          failed++;
          remaining.add(rawItem);
        }
      } catch (_) {
        failed++;
        remaining.add(rawItem);
      }
    }

    await prefs.setStringList(_queueKey, remaining);
    return {'synced': synced, 'failed': failed};
  }
}
