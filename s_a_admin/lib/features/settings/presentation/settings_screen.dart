import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/auth/auth_provider.dart';
import '../../../core/network/offline_queue.dart';
import '../../../core/network/api_client.dart';
import '../../../core/components/rebel_components.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final OfflineAttendanceQueue _queue = OfflineAttendanceQueue();
  int _pendingSync = 0;
  bool _biometricEnabled = true;

  @override
  void initState() {
    super.initState();
    _refreshQueue();
  }

  Future<void> _refreshQueue() async {
    final count = await _queue.getPendingCount();
    if (mounted) setState(() => _pendingSync = count);
  }

  Future<void> _syncQueue() async {
    final res = await _queue.syncPendingQueue();
    await _refreshQueue();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Sync completed: ${res["synced"]} synced, ${res["failed"]} pending.'),
          backgroundColor: AppTheme.surfaceElevated,
        ),
      );
    }
  }

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: AppTheme.border),
        ),
        title: const Text('S&A Academy Operations OS', style: TextStyle(color: AppTheme.textPrimary, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Version: 1.0.0 (Production Release)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
            const SizedBox(height: 6),
            const Text('Design System: Rebel Admin 2.0 (Volt Obsidian)', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
            const SizedBox(height: 6),
            Text('Server: ${ApiClient().baseUrl}', style: const TextStyle(color: AppTheme.primary, fontSize: 12)),
            const SizedBox(height: 12),
            const Text('© 2026 S&A Badminton Academy. All rights reserved.', style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('OK', style: TextStyle(color: AppTheme.primary)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final name = user?.fullName ?? 'Alex Thomas';
    final email = user?.email ?? 'admin@sabadminton.com';

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title matching Screen 16
              const Text('Settings', style: AppTheme.pageTitle),
              const SizedBox(height: 16),

              // Profile Card matching Screen 16
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
                            style: const TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Settings List matching Screen 16
              RebelCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Column(
                  children: [
                    _buildSettingsRow(
                      icon: Icons.person_outline,
                      title: 'Profile',
                      onTap: () {},
                    ),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildSettingsRow(
                      icon: Icons.shield_outlined,
                      title: 'Security',
                      onTap: () {},
                    ),
                    const Divider(color: AppTheme.border, height: 1),
                    // Biometric Login Switch
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        children: [
                          const Icon(Icons.fingerprint_rounded, size: 20, color: AppTheme.textSecondary),
                          const SizedBox(width: 14),
                          const Expanded(
                            child: Text(
                              'Biometric Login',
                              style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w500),
                            ),
                          ),
                          Switch(
                            value: _biometricEnabled,
                            activeColor: AppTheme.primary,
                            activeTrackColor: AppTheme.primary.withOpacity(0.3),
                            inactiveTrackColor: AppTheme.surfaceElevated,
                            onChanged: (v) => setState(() => _biometricEnabled = v),
                          ),
                        ],
                      ),
                    ),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildSettingsRow(
                      icon: Icons.notifications_none_outlined,
                      title: 'Notifications',
                      onTap: () => context.go('/notifications'),
                    ),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildSettingsRow(
                      icon: Icons.dark_mode_outlined,
                      title: 'Appearance',
                      trailingText: 'Dark',
                      onTap: () {},
                    ),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildSettingsRow(
                      icon: Icons.help_outline,
                      title: 'Help & Support',
                      onTap: () {},
                    ),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildSettingsRow(
                      icon: Icons.info_outline,
                      title: 'About',
                      onTap: _showAboutDialog,
                    ),
                  ],
                ),
              ),

              if (_pendingSync > 0) ...[
                const SizedBox(height: 16),
                RebelCard(
                  padding: const EdgeInsets.all(14),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Offline Attendance', style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 2),
                          Text('$_pendingSync sessions queued', style: const TextStyle(color: AppTheme.statusFollowUp, fontSize: 12)),
                        ],
                      ),
                      RebelSecondaryButton(label: 'Sync Now', onPressed: _syncQueue, height: 36),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 28),

              // Log Out Button matching Screen 16: Red outline button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.danger,
                    side: const BorderSide(color: AppTheme.danger, width: 1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () async {
                    await ref.read(authProvider.notifier).logout();
                    if (context.mounted) {
                      context.go('/login');
                    }
                  },
                  child: const Text(
                    'Log Out',
                    style: TextStyle(color: AppTheme.danger, fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsRow({
    required IconData icon,
    required String title,
    String? trailingText,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 20, color: AppTheme.textSecondary),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w500),
              ),
            ),
            if (trailingText != null) ...[
              Text(trailingText, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
              const SizedBox(width: 6),
            ],
            const Icon(Icons.chevron_right, size: 18, color: AppTheme.textMuted),
          ],
        ),
      ),
    );
  }
}
