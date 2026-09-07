import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/auth/auth_provider.dart';
import '../search/presentation/global_search_dialog.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_endpoints.dart';

class MainScaffold extends ConsumerStatefulWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  @override
  ConsumerState<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends ConsumerState<MainScaffold> {
  final ApiClient _client = ApiClient();
  int _unreadNotifications = 0;

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
          _unreadNotifications = res.data['data']?['unreadCount'] ?? 0;
        });
      }
    } catch (_) {}
  }

  int _calculateSelectedIndex(BuildContext context, String role) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/today')) return 0;
    if (location.startsWith('/leads') || (role == 'COACH' && location.startsWith('/performance'))) return 1;
    if (location.startsWith('/students')) return 2;
    if (location.startsWith('/schedule')) return 3;
    return 4; // MORE
  }

  void _onBottomNavTapped(int index, BuildContext context, String role) {
    switch (index) {
      case 0:
        context.go('/today');
        break;
      case 1:
        if (role == 'COACH') {
          context.go('/performance');
        } else {
          context.go('/leads');
        }
        break;
      case 2:
        context.go('/students');
        break;
      case 3:
        context.go('/schedule');
        break;
      case 4:
        _showMoreBottomSheet(context, role);
        break;
    }
  }

  void _showMoreBottomSheet(BuildContext context, String role) {
    final isCoach = role == 'COACH';
    final isContentManager = role == 'CONTENT_MANAGER';
    final isAdmin = role == 'SUPER_ADMIN' || role == 'ADMIN';

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        side: BorderSide(color: AppTheme.border),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: Text(
                  'ACADEMY OPERATIONS & MODULES',
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1),
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  if (!isContentManager) ...[
                    _buildMoreSheetTile(ctx, 'Coaches', Icons.sports, '/coaches'),
                    _buildMoreSheetTile(ctx, 'Centres', Icons.location_on_outlined, '/centres'),
                    _buildMoreSheetTile(ctx, 'Programs', Icons.sports_tennis, '/programs'),
                  ],
                  if (!isCoach && !isContentManager) ...[
                    _buildMoreSheetTile(ctx, 'Payments', Icons.receipt_long, '/finance'),
                  ],
                  if (!isContentManager) ...[
                    _buildMoreSheetTile(ctx, 'Performance', Icons.analytics_outlined, '/performance'),
                  ],
                  if (isAdmin) ...[
                    _buildMoreSheetTile(ctx, 'Reports', Icons.bar_chart, '/reports'),
                    _buildMoreSheetTile(ctx, 'Audit Logs', Icons.history_edu, '/audit'),
                  ],
                  if (isAdmin || isContentManager) ...[
                    _buildMoreSheetTile(ctx, 'Website CMS', Icons.edit_note, '/cms'),
                  ],
                  _buildMoreSheetTile(ctx, 'Notifications', Icons.notifications_none, '/notifications'),
                  _buildMoreSheetTile(ctx, 'Settings', Icons.tune, '/settings'),
                ],
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMoreSheetTile(BuildContext ctx, String label, IconData icon, String route) {
    return SizedBox(
      width: 100,
      child: InkWell(
        onTap: () {
          Navigator.pop(ctx);
          context.go(route);
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: AppTheme.surfaceElevated,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: AppTheme.primary, size: 22),
              const SizedBox(height: 6),
              Text(
                label,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 11, fontWeight: FontWeight.w700),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final role = user?.role ?? 'COACH';
    final isDesktop = MediaQuery.of(context).size.width >= 900;

    if (isDesktop) {
      return Scaffold(
        backgroundColor: AppTheme.background,
        body: Row(
          children: [
            _buildDesktopSidebar(context, user, role),
            const VerticalDivider(color: AppTheme.border, width: 1),
            Expanded(child: widget.child),
          ],
        ),
      );
    }

    // Mobile / Tablet layout
    final selectedIndex = _calculateSelectedIndex(context, role);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppTheme.primary,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Text(
                'S&A',
                style: TextStyle(color: Color(0xFF07090D), fontWeight: FontWeight.w900, fontSize: 12),
              ),
            ),
            const SizedBox(width: 10),
            const Text('ACADEMY OS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppTheme.textPrimary),
            tooltip: 'Search Records',
            onPressed: () => GlobalSearchDialog.show(context),
          ),
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none, color: AppTheme.textPrimary),
                tooltip: 'Notifications',
                onPressed: () {
                  context.go('/notifications');
                  setState(() => _unreadNotifications = 0);
                },
              ),
              if (_unreadNotifications > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: AppTheme.danger, shape: BoxShape.circle),
                    child: Text(
                      '$_unreadNotifications',
                      style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: widget.child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        backgroundColor: AppTheme.surface,
        indicatorColor: AppTheme.primary.withOpacity(0.18),
        surfaceTintColor: Colors.transparent,
        onDestinationSelected: (idx) => _onBottomNavTapped(idx, context, role),
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.dashboard_outlined, color: AppTheme.textMuted),
            selectedIcon: Icon(Icons.dashboard, color: AppTheme.primary),
            label: 'Today',
          ),
          NavigationDestination(
            icon: Icon(role == 'COACH' ? Icons.analytics_outlined : Icons.flash_on_outlined, color: AppTheme.textMuted),
            selectedIcon: Icon(role == 'COACH' ? Icons.analytics : Icons.flash_on, color: AppTheme.primary),
            label: role == 'COACH' ? 'Skills' : 'Leads',
          ),
          const NavigationDestination(
            icon: Icon(Icons.people_outline, color: AppTheme.textMuted),
            selectedIcon: Icon(Icons.people, color: AppTheme.primary),
            label: 'Students',
          ),
          const NavigationDestination(
            icon: Icon(Icons.calendar_today_outlined, color: AppTheme.textMuted),
            selectedIcon: Icon(Icons.calendar_today, color: AppTheme.primary),
            label: 'Schedule',
          ),
          const NavigationDestination(
            icon: Icon(Icons.grid_view_outlined, color: AppTheme.textMuted),
            selectedIcon: Icon(Icons.grid_view, color: AppTheme.primary),
            label: 'More',
          ),
        ],
      ),
    );
  }

  Widget _buildDesktopSidebar(BuildContext context, UserProfile? user, String role) {
    final currentPath = GoRouterState.of(context).uri.path;
    final isCoach = role == 'COACH';
    final isContentManager = role == 'CONTENT_MANAGER';
    final isAdmin = role == 'SUPER_ADMIN' || role == 'ADMIN';

    return Container(
      width: 250,
      color: AppTheme.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Academy Brand Header
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'S&A',
                    style: TextStyle(color: Color(0xFF07090D), fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'ACADEMY OS',
                      style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 0.5),
                    ),
                    Text(
                      role,
                      style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700, fontSize: 10),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Search Button Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: InkWell(
              onTap: () => GlobalSearchDialog.show(context),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.background,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.border),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.search, size: 16, color: AppTheme.textMuted),
                    SizedBox(width: 8),
                    Text('Global search...', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Navigation Links
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _buildSidebarItem(context, 'Today Cockpit', Icons.dashboard, '/today', currentPath.startsWith('/today')),
                if (!isCoach && !isContentManager)
                  _buildSidebarItem(context, 'Leads & Trials', Icons.flash_on, '/leads', currentPath.startsWith('/leads')),
                if (!isContentManager)
                  _buildSidebarItem(context, 'Student Roster', Icons.people, '/students', currentPath.startsWith('/students')),
                if (!isContentManager)
                  _buildSidebarItem(context, 'Schedule & Batches', Icons.calendar_today, '/schedule', currentPath.startsWith('/schedule')),

                const SizedBox(height: 16),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  child: Text(
                    'OPERATIONS',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 1),
                  ),
                ),

                if (!isCoach && !isContentManager)
                  _buildSidebarItem(context, 'Financial Ledger', Icons.receipt_long, '/finance', currentPath.startsWith('/finance')),
                if (!isContentManager)
                  _buildSidebarItem(context, 'Performance', Icons.analytics_outlined, '/performance', currentPath.startsWith('/performance')),
                if (!isContentManager) ...[
                  _buildSidebarItem(context, 'Coaching Staff', Icons.sports, '/coaches', currentPath.startsWith('/coaches')),
                  _buildSidebarItem(context, 'Centres (3)', Icons.location_on_outlined, '/centres', currentPath.startsWith('/centres')),
                  _buildSidebarItem(context, 'Programs', Icons.sports_tennis, '/programs', currentPath.startsWith('/programs')),
                ],
                if (isAdmin) ...[
                  _buildSidebarItem(context, 'Reports', Icons.bar_chart, '/reports', currentPath.startsWith('/reports')),
                  _buildSidebarItem(context, 'Audit Logs', Icons.history_edu, '/audit', currentPath.startsWith('/audit')),
                ],
                if (isAdmin || isContentManager)
                  _buildSidebarItem(context, 'Website CMS', Icons.edit_note, '/cms', currentPath.startsWith('/cms')),

                _buildSidebarItem(
                  context,
                  'Notifications',
                  Icons.notifications_none,
                  '/notifications',
                  currentPath.startsWith('/notifications'),
                  badge: _unreadNotifications > 0 ? '$_unreadNotifications' : null,
                ),
                _buildSidebarItem(context, 'Settings', Icons.tune, '/settings', currentPath.startsWith('/settings')),
              ],
            ),
          ),

          // User Profile Footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppTheme.surfaceElevated,
              border: Border(top: BorderSide(color: AppTheme.border)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: AppTheme.primary.withOpacity(0.15),
                  child: Text(
                    user?.fullName.isNotEmpty == true ? user!.fullName[0] : 'S',
                    style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w800, fontSize: 12),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.fullName ?? 'Staff',
                        style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w700),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        user?.role ?? '',
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.logout, size: 18, color: AppTheme.textMuted),
                  tooltip: 'Logout',
                  onPressed: () async {
                    await ref.read(authProvider.notifier).logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarItem(
    BuildContext context,
    String label,
    IconData icon,
    String route,
    bool isSelected, {
    String? badge,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        dense: true,
        selected: isSelected,
        selectedTileColor: AppTheme.primary.withOpacity(0.12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        leading: Icon(icon, size: 18, color: isSelected ? AppTheme.primary : AppTheme.textMuted),
        title: Text(
          label,
          style: TextStyle(
            color: isSelected ? AppTheme.primary : AppTheme.textSecondary,
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
        trailing: badge != null
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: AppTheme.danger, borderRadius: BorderRadius.circular(10)),
                child: Text(badge, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800)),
              )
            : null,
        onTap: () => context.go(route),
      ),
    );
  }
}
