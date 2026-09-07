import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/auth/auth_provider.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';
import '../../core/components/rebel_components.dart';

class MainScaffold extends ConsumerStatefulWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  final ApiClient _client = ApiClient();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  int _unreadNotifications = 3;

  @override
  void initState() {
    super.initState();
    _fetchUnreadNotifications();
  }

  Future<void> _fetchUnreadNotifications() async {
    try {
      final res = await _client.dio.get(ApiEndpoints.notifications);
      if (mounted) {
        setState(() {
          _unreadNotifications = res.data['data']?['unreadCount'] ?? 3;
        });
      }
    } catch (_) {}
  }

  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/today')) return 0;
    if (location.startsWith('/leads')) return 1;
    if (location.startsWith('/students')) return 2;
    if (location.startsWith('/schedule')) return 3;
    return 4; // More
  }

  void _onBottomNavTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/today');
        break;
      case 1:
        context.go('/leads');
        break;
      case 2:
        context.go('/students');
        break;
      case 3:
        context.go('/schedule');
        break;
      case 4:
        _scaffoldKey.currentState?.openDrawer();
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final selectedIndex = _calculateSelectedIndex(context);

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppTheme.background,
      drawer: _buildRebelDrawer(context, user),
      body: widget.child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.background,
          border: Border(
            top: BorderSide(color: AppTheme.border, width: 1),
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.dashboard_outlined, Icons.dashboard, 'Today', selectedIndex),
                _buildNavItem(1, Icons.group_outlined, Icons.group, 'Leads', selectedIndex),
                _buildNavItem(2, Icons.school_outlined, Icons.school, 'Students', selectedIndex),
                _buildNavItem(3, Icons.calendar_today_outlined, Icons.calendar_today, 'Schedule', selectedIndex),
                _buildNavItem(4, Icons.more_horiz_rounded, Icons.more_horiz_rounded, 'More', selectedIndex),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData outlineIcon, IconData filledIcon, String label, int selectedIndex) {
    final isSelected = index == selectedIndex;

    return GestureDetector(
      onTap: () => _onBottomNavTapped(index, context),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? filledIcon : outlineIcon,
              size: 22,
              color: isSelected ? AppTheme.primary : AppTheme.textMuted,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? AppTheme.primary : AppTheme.textMuted,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Screen 4: Side Menu Drawer matching reference mockup
  Widget _buildRebelDrawer(BuildContext context, UserProfile? user) {
    final name = user?.fullName ?? 'Alex Thomas';
    final role = user?.role == 'SUPER_ADMIN'
        ? 'Super Admin'
        : user?.role == 'COACH'
            ? 'Coach'
            : 'Admin';

    return Drawer(
      backgroundColor: AppTheme.surface,
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
              child: Row(
                children: [
                  RebelAvatar(name: name, radius: 24),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: const TextStyle(
                            color: AppTheme.textPrimary,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          role,
                          style: const TextStyle(
                            color: AppTheme.textMuted,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const Divider(color: AppTheme.border, height: 1),

            // Navigation Items matching Screen 4
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                children: [
                  _buildDrawerTile(Icons.dashboard_outlined, 'Today', '/today'),
                  _buildDrawerTile(Icons.group_outlined, 'Leads', '/leads'),
                  _buildDrawerTile(Icons.school_outlined, 'Students', '/students'),
                  _buildDrawerTile(Icons.calendar_today_outlined, 'Schedule', '/schedule'),
                  _buildDrawerTile(Icons.check_circle_outline, 'Attendance', '/attendance'),
                  _buildDrawerTile(Icons.credit_card_outlined, 'Payments', '/finance'),
                  _buildDrawerTile(Icons.bar_chart_outlined, 'Reports', '/reports'),
                  _buildDrawerTile(Icons.web_stories_outlined, 'CMS', '/cms'),
                  _buildDrawerTile(
                    Icons.notifications_none_outlined,
                    'Notifications',
                    '/notifications',
                    badge: _unreadNotifications > 0 ? '$_unreadNotifications' : null,
                  ),
                  _buildDrawerTile(Icons.tune_outlined, 'Settings', '/settings'),
                ],
              ),
            ),

            const Divider(color: AppTheme.border, height: 1),

            // Log Out Button matching Screen 4 (Red exit icon + red text)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: ListTile(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                leading: const Icon(Icons.logout_rounded, color: AppTheme.danger, size: 20),
                title: const Text(
                  'Log Out',
                  style: TextStyle(
                    color: AppTheme.danger,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                onTap: () async {
                  Navigator.pop(context);
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerTile(IconData icon, String title, String route, {String? badge}) {
    final currentLoc = GoRouterState.of(context).uri.path;
    final isSelected = currentLoc.startsWith(route);

    return ListTile(
      dense: true,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      tileColor: isSelected ? AppTheme.primary.withOpacity(0.08) : Colors.transparent,
      leading: Icon(
        icon,
        size: 20,
        color: isSelected ? AppTheme.primary : AppTheme.textSecondary,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? AppTheme.primary : AppTheme.textPrimary,
          fontSize: 14,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
        ),
      ),
      trailing: badge != null
          ? Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                badge,
                style: const TextStyle(
                  color: AppTheme.onPrimary,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                ),
              ),
            )
          : null,
      onTap: () {
        Navigator.pop(context);
        context.go(route);
      },
    );
  }
}
