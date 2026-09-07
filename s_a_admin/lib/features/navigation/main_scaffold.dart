import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

class MainScaffold extends ConsumerWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  int _calculateSelectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/crm') || location.startsWith('/leads')) return 0;
    if (location.startsWith('/gallery')) return 1;
    if (location.startsWith('/articles')) return 2;
    return 3; // More (or sub-routes /coaches, /track-records, /reviews, /settings)
  }

  void _onBottomNavTapped(int index, BuildContext context) {
    switch (index) {
      case 0:
        context.go('/crm');
        break;
      case 1:
        context.go('/gallery');
        break;
      case 2:
        context.go('/articles');
        break;
      case 3:
        context.go('/more');
        break;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = _calculateSelectedIndex(context);

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.background,
          border: Border(
            top: BorderSide(color: AppTheme.border, width: 1),
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.leaderboard_outlined, Icons.leaderboard, 'CRM', selectedIndex, context),
                _buildNavItem(1, Icons.photo_library_outlined, Icons.photo_library, 'Gallery', selectedIndex, context),
                _buildNavItem(2, Icons.article_outlined, Icons.article, 'Articles', selectedIndex, context),
                _buildNavItem(3, Icons.more_horiz_rounded, Icons.more_horiz_rounded, 'More', selectedIndex, context),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData outlineIcon,
    IconData filledIcon,
    String label,
    int selectedIndex,
    BuildContext context,
  ) {
    final isSelected = index == selectedIndex;

    return GestureDetector(
      onTap: () => _onBottomNavTapped(index, context),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 70,
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
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
