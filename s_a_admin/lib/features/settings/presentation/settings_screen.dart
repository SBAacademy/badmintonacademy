import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/auth/auth_provider.dart';
import '../../../core/network/api_client.dart';
import '../../../core/components/rebel_components.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final name = user?.fullName ?? 'Alex Thomas';
    final email = user?.email ?? 'admin@sabadminton.com';
    final role = user?.role == 'SUPER_ADMIN' ? 'Super Admin' : 'Website Admin';
    final userId = user?.userId ?? 'ADM-001';
    final baseUrl = ApiClient().dio.options.baseUrl;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: TextButton.icon(
          icon: const Icon(Icons.chevron_left, color: AppTheme.primary, size: 24),
          label: const Text('More', style: TextStyle(color: AppTheme.primary, fontSize: 15, fontWeight: FontWeight.w600)),
          onPressed: () => context.pop(),
        ),
        leadingWidth: 90,
        title: const Text('Settings'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          children: [
            // Account Section
            const Text('ACCOUNT', style: AppTheme.caption),
            const SizedBox(height: 8),
            RebelCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Column(
                children: [
                  Row(
                    children: [
                      RebelAvatar(name: name, radius: 24),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(name, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 2),
                            Text(email, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                          ],
                        ),
                      ),
                      RebelStatusBadge(label: role, color: AppTheme.primary),
                    ],
                  ),
                  const Divider(color: AppTheme.border, height: 24),
                  _buildSettingRow('User ID', userId),
                  const SizedBox(height: 8),
                  _buildSettingRow('Role Access', role),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Appearance Section
            const Text('APPEARANCE', style: AppTheme.caption),
            const SizedBox(height: 8),
            RebelCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.dark_mode_outlined, color: AppTheme.primary, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Theme', style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                        Text('Rebel Dark Obsidian (High-Contrast Athletic)', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                  const RebelStatusBadge(label: 'Active', color: AppTheme.primary),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // App Information Section
            const Text('APP INFORMATION', style: AppTheme.caption),
            const SizedBox(height: 8),
            RebelCard(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Column(
                children: [
                  _buildSettingRow('Application', 'S&A Badminton Academy — Website & CRM Admin'),
                  const Divider(color: AppTheme.border, height: 16),
                  _buildSettingRow('Version', '1.0.0 (Release)'),
                  const Divider(color: AppTheme.border, height: 16),
                  _buildSettingRow('Platform', 'Flutter iOS & Cross-Platform'),
                  const Divider(color: AppTheme.border, height: 16),
                  _buildSettingRow('Backend API', baseUrl.isEmpty ? 'Active' : baseUrl),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Logout Button
            RebelSecondaryButton(
              label: 'Log Out',
              icon: Icons.logout_rounded,
              onPressed: () async {
                final confirm = await RebelConfirmationDialog.show(
                  context,
                  title: 'End Session?',
                  message: 'Are you sure you want to log out of the admin console?',
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
    );
  }

  Widget _buildSettingRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
        Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
