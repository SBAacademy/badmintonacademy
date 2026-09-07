import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _notifications = [];
  int _unreadCount = 0;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    setState(() => _isLoading = true);
    try {
      final res = await _client.dio.get(ApiEndpoints.notifications);
      if (mounted) {
        setState(() {
          _notifications = res.data['data']?['notifications'] ?? [];
          _unreadCount = res.data['data']?['unreadCount'] ?? 0;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await _client.dio.put(
        ApiEndpoints.notifications,
        data: {'markAllAsRead': true},
      );
      _fetchNotifications();
    } catch (_) {}
  }

  Future<void> _markOneAsRead(String id, String? link) async {
    try {
      await _client.dio.put(
        ApiEndpoints.notifications,
        data: {'id': id},
      );
      if (link != null && link.isNotEmpty && mounted) {
        context.go(link);
      } else {
        _fetchNotifications();
      }
    } catch (_) {}
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'NEW_LEAD':
        return Icons.flash_on;
      case 'TRIAL_TODAY':
        return Icons.sports_tennis;
      case 'PAYMENT_OVERDUE':
        return Icons.warning_amber_rounded;
      case 'FOLLOW_UP_DUE':
        return Icons.phone_callback;
      default:
        return Icons.notifications;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'NEW_LEAD':
        return AppTheme.primary;
      case 'TRIAL_TODAY':
        return AppTheme.info;
      case 'PAYMENT_OVERDUE':
        return AppTheme.danger;
      case 'FOLLOW_UP_DUE':
        return AppTheme.warning;
      default:
        return AppTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Row(
          children: [
            const Text('NOTIFICATIONS'),
            if (_unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.danger,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$_unreadCount NEW',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white),
                ),
              ),
            ],
          ],
        ),
        actions: [
          if (_unreadCount > 0)
            TextButton.icon(
              onPressed: _markAllAsRead,
              icon: const Icon(Icons.done_all, size: 16, color: AppTheme.primary),
              label: const Text('Mark all read', style: TextStyle(color: AppTheme.primary, fontSize: 13)),
            ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchNotifications,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.notifications_none, size: 50, color: AppTheme.textMuted.withOpacity(0.4)),
                      const SizedBox(height: 12),
                      const Text(
                        'No notifications yet',
                        style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'New inbound enquiries and academy alerts will appear here.',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  color: AppTheme.primary,
                  onRefresh: _fetchNotifications,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _notifications.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (ctx, i) {
                      final n = _notifications[i];
                      final id = n['id'] ?? '';
                      final type = n['type'] ?? 'SYSTEM';
                      final title = n['title'] ?? 'Notification';
                      final message = n['message'] ?? '';
                      final isRead = n['is_read'] == true;
                      final link = n['link'];
                      final createdAt = n['created_at'] != null
                          ? n['created_at'].toString().split('T')[0]
                          : '';

                      final typeColor = _colorForType(type);

                      return Container(
                        decoration: BoxDecoration(
                          color: isRead ? AppTheme.surface : AppTheme.surfaceElevated,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isRead ? AppTheme.border : typeColor.withOpacity(0.5),
                          ),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          leading: CircleAvatar(
                            backgroundColor: typeColor.withOpacity(0.15),
                            child: Icon(_iconForType(type), color: typeColor, size: 18),
                          ),
                          title: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  title,
                                  style: TextStyle(
                                    color: isRead ? AppTheme.textPrimary : AppTheme.textPrimary,
                                    fontWeight: isRead ? FontWeight.w600 : FontWeight.w800,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                              if (!isRead)
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: const BoxDecoration(
                                    color: AppTheme.primary,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                            ],
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(
                                message,
                                style: TextStyle(
                                  color: isRead ? AppTheme.textMuted : AppTheme.textSecondary,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                createdAt,
                                style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                              ),
                            ],
                          ),
                          onTap: () => _markOneAsRead(id, link),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
