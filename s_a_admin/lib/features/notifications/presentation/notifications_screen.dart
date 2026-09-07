import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _notifications = [];
  String _selectedTab = 'All'; // 'All', 'Unread', 'System'

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
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatRelativeTime(dynamic dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr.toString());
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 30) return '${diff.inDays}d ago';
      return DateFormat('d MMM').format(dt);
    } catch (_) {
      return '';
    }
  }

  Map<String, dynamic> _getCategoryStyle(String type) {
    switch (type.toUpperCase()) {
      case 'NEW_LEAD':
        return {'icon': Icons.person_add_alt_1_outlined, 'color': AppTheme.statusNew};
      case 'TRIAL_TODAY':
      case 'TRIAL':
        return {'icon': Icons.star_outline_rounded, 'color': AppTheme.statusTrial};
      case 'PAYMENT_OVERDUE':
      case 'INVOICE':
        return {'icon': Icons.receipt_long_outlined, 'color': AppTheme.statusAbsent};
      case 'FOLLOW_UP':
        return {'icon': Icons.replay_rounded, 'color': AppTheme.statusFollowUp};
      case 'ANNOUNCEMENT':
      case 'SYSTEM':
      default:
        return {'icon': Icons.campaign_outlined, 'color': AppTheme.primary};
    }
  }

  Future<void> _handleNotificationTap(dynamic notif) async {
    try {
      if (notif['id'] != null) {
        await _client.dio.put(
          ApiEndpoints.notifications,
          data: {'id': notif['id']},
        );
      }
    } catch (_) {}

    final link = notif['deep_link'] ?? notif['deepLink'];
    if (link != null && link.toString().isNotEmpty && mounted) {
      context.go(link.toString());
    } else {
      _fetchNotifications();
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _notifications.where((n) {
      final isRead = n['is_read'] == true;
      if (_selectedTab == 'Unread') return !isRead;
      if (_selectedTab == 'System') return n['type'] == 'SYSTEM' || n['type'] == 'ANNOUNCEMENT';
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title matching Screen 15
              const Text('Notifications', style: AppTheme.pageTitle),
              const SizedBox(height: 12),

              // Filter Tabs matching Screen 15: All, Unread, System
              Row(
                children: ['All', 'Unread', 'System'].map((t) {
                  final isSelected = _selectedTab == t;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: RebelFilterPill(
                      label: t,
                      isSelected: isSelected,
                      onTap: () => setState(() => _selectedTab = t),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 16),

              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary))
                    : filtered.isEmpty
                        ? const RebelEmptyState(
                            icon: Icons.notifications_none_outlined,
                            title: 'No notifications',
                            message: 'Operational alerts and messages will appear here.',
                          )
                        : RefreshIndicator(
                            color: AppTheme.primary,
                            backgroundColor: AppTheme.surfaceElevated,
                            onRefresh: _fetchNotifications,
                            child: ListView.separated(
                              itemCount: filtered.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 10),
                              itemBuilder: (context, index) {
                                final notif = filtered[index];
                                final title = notif['title'] ?? 'Notification';
                                final body = notif['body'] ?? '';
                                final type = notif['type'] ?? 'SYSTEM';
                                final isRead = notif['is_read'] == true;
                                final timeAgo = _formatRelativeTime(notif['created_at']);
                                final style = _getCategoryStyle(type);
                                final color = style['color'] as Color;
                                final icon = style['icon'] as IconData;

                                return RebelCard(
                                  onTap: () => _handleNotificationTap(notif),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: color.withOpacity(0.12),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(icon, color: color, size: 18),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              title,
                                              style: const TextStyle(
                                                color: AppTheme.textPrimary,
                                                fontSize: 14,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              body,
                                              style: const TextStyle(
                                                color: AppTheme.textSecondary,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            timeAgo,
                                            style: const TextStyle(
                                              color: AppTheme.textMuted,
                                              fontSize: 11,
                                            ),
                                          ),
                                          const SizedBox(height: 6),
                                          if (!isRead)
                                            Container(
                                              width: 7,
                                              height: 7,
                                              decoration: const BoxDecoration(
                                                color: AppTheme.primary,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                        ],
                                      ),
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
