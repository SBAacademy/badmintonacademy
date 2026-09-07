import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/auth/auth_provider.dart';
import '../../../core/components/rebel_components.dart';

class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final name = user?.fullName ?? 'Alex Thomas';
    final email = user?.email ?? 'admin@sabadminton.com';
    final role = user?.role == 'SUPER_ADMIN' ? 'Super Admin' : 'Website Admin';

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('More', style: AppTheme.pageTitle),
              const SizedBox(height: 4),
              const Text(
                'Website content, faculty & operational settings',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 20),

              // User Profile Summary Card
              RebelCard(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    RebelAvatar(name: name, radius: 26),
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
                          ),
                          const SizedBox(height: 2),
                          Text(
                            email,
                            style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                          ),
                          const SizedBox(height: 4),
                          RebelStatusBadge(label: role, color: AppTheme.primary),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text('WEBSITE MODULES', style: AppTheme.caption),
              const SizedBox(height: 10),

              // Coaches Hub Card
              _buildNavCard(
                context,
                title: 'Coaches',
                subtitle: 'Manage faculty profiles shown on website',
                icon: Icons.sports_tennis_rounded,
                iconColor: AppTheme.statusNew,
                onTap: () => context.push('/coaches'),
              ),
              const SizedBox(height: 10),

              // Track Records Hub Card
              _buildNavCard(
                context,
                title: 'Track Records',
                subtitle: 'Tournament achievements & athlete records',
                icon: Icons.emoji_events_rounded,
                iconColor: AppTheme.statusFollowUp,
                onTap: () => context.push('/track-records'),
              ),
              const SizedBox(height: 10),

              // Reviews Hub Card
              _buildNavCard(
                context,
                title: 'Website Reviews',
                subtitle: 'Customer testimonials moderation',
                icon: Icons.rate_review_rounded,
                iconColor: AppTheme.statusPresent,
                onTap: () => context.push('/reviews'),
              ),
              const SizedBox(height: 24),

              const Text('APP SETTINGS', style: AppTheme.caption),
              const SizedBox(height: 10),

              // Minimal Settings Card
              _buildNavCard(
                context,
                title: 'Settings / Account',
                subtitle: 'Profile, appearance & version info',
                icon: Icons.tune_rounded,
                iconColor: AppTheme.textSecondary,
                onTap: () => context.push('/settings'),
              ),
              const SizedBox(height: 24),

              // Quick Logout Button
              RebelSecondaryButton(
                label: 'Log Out',
                icon: Icons.logout_rounded,
                onPressed: () async {
                  final confirm = await RebelConfirmationDialog.show(
                    context,
                    title: 'Log out?',
                    message: 'Are you sure you want to end your admin session?',
                    confirmLabel: 'Log Out',
                    isDestructive: true,
                  );
                  if (confirm == true) {
                    await ref.read(authProvider.notifier).logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return RebelCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, size: 20, color: AppTheme.textMuted),
        ],
      ),
    );
  }
}
