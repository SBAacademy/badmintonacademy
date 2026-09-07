import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/auth/auth_provider.dart';
import '../../../core/network/offline_queue.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final OfflineAttendanceQueue _queue = OfflineAttendanceQueue();
  final ApiClient _client = ApiClient();
  int _pendingSync = 0;

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
          content: Text('Sync completed: ${res['synced']} sent, ${res['failed']} remaining.'),
          backgroundColor: AppTheme.surfaceElevated,
        ),
      );
    }
  }

  void _openCreateStaffDialog() {
    final emailCtrl = TextEditingController();
    final passwordCtrl = TextEditingController();
    final nameCtrl = TextEditingController();
    String role = 'COACH';
    String assignedCentre = 'kadavanthra';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: const Text('Add Staff Account', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800)),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 440,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Staff Full Name *'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: emailCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Official Email *'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: passwordCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    obscureText: true,
                    decoration: const InputDecoration(labelText: 'Temporary Password (Min 8 chars) *'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: role,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Staff Role'),
                    items: const [
                      DropdownMenuItem(value: 'COACH', child: Text('COACH (Sessions, Attendance, Performance)')),
                      DropdownMenuItem(value: 'FRONT_DESK', child: Text('FRONT_DESK (CRM, Trials, Payments)')),
                      DropdownMenuItem(value: 'CONTENT_MANAGER', child: Text('CONTENT_MANAGER (Website CMS)')),
                      DropdownMenuItem(value: 'ADMIN', child: Text('ADMIN (Academy Management)')),
                    ],
                    onChanged: (v) => setDialogState(() => role = v!),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: assignedCentre,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Assigned Centre'),
                    items: const [
                      DropdownMenuItem(value: 'kadavanthra', child: Text('Kadavanthra Centre')),
                      DropdownMenuItem(value: 'edappally', child: Text('Edappally Centre')),
                      DropdownMenuItem(value: 'kakkanad', child: Text('Kakkanad Centre')),
                    ],
                    onChanged: (v) => setDialogState(() => assignedCentre = v!),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted)),
            ),
            ElevatedButton(
              onPressed: () async {
                if (nameCtrl.text.isNotEmpty && emailCtrl.text.isNotEmpty && passwordCtrl.text.isNotEmpty) {
                  try {
                    await _client.dio.post(
                      ApiEndpoints.staff,
                      data: {
                        'email': emailCtrl.text.trim(),
                        'password': passwordCtrl.text,
                        'fullName': nameCtrl.text.trim(),
                        'role': role,
                        'assignedCentre': assignedCentre,
                      },
                    );
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Staff account created successfully.'),
                          backgroundColor: AppTheme.success,
                        ),
                      );
                    }
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(content: Text('Failed to create staff member: $e')),
                      );
                    }
                  }
                }
              },
              child: const Text('Create Staff Account'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final isSuperAdmin = user?.isSuperAdmin == true;
    final isAdmin = user?.isAdmin == true;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('ACADEMY SETTINGS & PROFILE'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppTheme.primary.withOpacity(0.15),
                  child: Text(
                    user?.fullName.isNotEmpty == true ? user!.fullName[0] : 'S',
                    style: const TextStyle(color: AppTheme.primary, fontSize: 22, fontWeight: FontWeight.w900),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.fullName ?? 'Staff Member',
                        style: const TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user?.email ?? '',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          user?.role ?? 'STAFF',
                          style: const TextStyle(color: AppTheme.primary, fontSize: 10, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Offline Queue Section
          const Text(
            'OFFLINE ATTENDANCE SYNC',
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$_pendingSync Records Pending Sync',
                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Sessions marked while offline',
                      style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                    ),
                  ],
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.surfaceElevated,
                    foregroundColor: AppTheme.primary,
                    side: const BorderSide(color: AppTheme.primary),
                  ),
                  onPressed: _syncQueue,
                  child: const Text('Sync Now'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Academy Modules
          const Text(
            'ACADEMY DIRECTORIES & SETTINGS',
            style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1),
          ),
          const SizedBox(height: 10),
          _buildSettingsTile(
            title: 'Canonical Training Centres',
            subtitle: 'Kadavanthra, Edappally, Kakkanad facilities',
            icon: Icons.location_on_outlined,
            onTap: () => context.push('/centres'),
          ),
          _buildSettingsTile(
            title: 'Training Programs & Curricula',
            subtitle: 'Kids, Junior, Adult, Elite coaching specifications',
            icon: Icons.sports_tennis,
            onTap: () => context.push('/programs'),
          ),
          _buildSettingsTile(
            title: 'Verified Coaching Staff',
            subtitle: 'Credentials, specializations & active cohorts',
            icon: Icons.sports,
            onTap: () => context.push('/coaches'),
          ),
          if (isAdmin) ...[
            _buildSettingsTile(
              title: 'Reports & Analytics',
              subtitle: 'Admissions funnel, fee collection & attendance rate',
              icon: Icons.analytics_outlined,
              onTap: () => context.push('/reports'),
            ),
            _buildSettingsTile(
              title: 'Immutable Audit Trail',
              subtitle: 'Full historical log of administrative modifications',
              icon: Icons.history_edu,
              onTap: () => context.push('/audit'),
            ),
          ],
          if (isAdmin || user?.isContentManager == true) ...[
            _buildSettingsTile(
              title: 'Website CMS Gateway',
              subtitle: 'Manage testimonials, achievements, announcements & blog',
              icon: Icons.edit_note,
              onTap: () => context.push('/cms'),
            ),
          ],

          if (isSuperAdmin) ...[
            const SizedBox(height: 24),
            const Text(
              'SUPER ADMIN ADMINISTRATION',
              style: TextStyle(color: AppTheme.warning, fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 1),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.warning.withOpacity(0.4)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Academy Staff Accounts',
                        style: TextStyle(color: AppTheme.textPrimary, fontSize: 15, fontWeight: FontWeight.w700),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Create and manage role permissions for staff',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.warning,
                      foregroundColor: const Color(0xFF07090D),
                    ),
                    onPressed: _openCreateStaffDialog,
                    icon: const Icon(Icons.person_add, size: 16),
                    label: const Text('Add Staff'),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 32),

          // Logout Button
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.danger,
              side: const BorderSide(color: AppTheme.danger),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            icon: const Icon(Icons.logout, size: 18),
            label: const Text('Log Out of Academy OS', style: TextStyle(fontWeight: FontWeight.w700)),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildSettingsTile({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: ListTile(
        leading: Icon(icon, color: AppTheme.primary),
        title: Text(title, style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle, style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, color: AppTheme.textMuted, size: 18),
        onTap: onTap,
      ),
    );
  }
}
