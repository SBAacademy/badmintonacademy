import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/utils/launcher_utils.dart';

class CentresScreen extends StatefulWidget {
  const CentresScreen({super.key});

  @override
  State<CentresScreen> createState() => _CentresScreenState();
}

class _CentresScreenState extends State<CentresScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _centres = [];

  @override
  void initState() {
    super.initState();
    _fetchCentres();
  }

  Future<void> _fetchCentres() async {
    setState(() => _isLoading = true);
    try {
      final res = await _client.dio.get(ApiEndpoints.centres);
      if (mounted) {
        setState(() {
          _centres = res.data['data']?['centres'] ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('CANONICAL TRAINING CENTRES'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchCentres,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _centres.isEmpty
              ? const Center(child: Text('No centres found.', style: TextStyle(color: AppTheme.textMuted)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _centres.length,
                  itemBuilder: (ctx, i) {
                    final c = _centres[i];
                    final name = c['name'] ?? '';
                    final address = c['address'] ?? '';
                    final phone = c['phone'] ?? '+91 98950 12345';
                    final email = c['email'] ?? 'info@sabadmintonacademy.com';
                    final batchesCount = c['active_batches_count'] ?? 0;
                    final studentsCount = c['enrolled_students_count'] ?? 0;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppTheme.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                name,
                                style: const TextStyle(
                                  color: AppTheme.textPrimary,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppTheme.success.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'CANONICAL ACTIVE',
                                  style: TextStyle(color: AppTheme.success, fontSize: 10, fontWeight: FontWeight.w800),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.location_on_outlined, size: 16, color: AppTheme.primary),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  address,
                                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              _buildStatBadge('ACTIVE BATCHES', '$batchesCount Cohorts'),
                              const SizedBox(width: 12),
                              _buildStatBadge('ATHLETES', '$studentsCount Enrolled'),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: AppTheme.primary,
                                  side: const BorderSide(color: AppTheme.primary),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                ),
                                onPressed: () => LauncherUtils.launchPhone(context: context, phone: phone),
                                icon: const Icon(Icons.phone, size: 14),
                                label: const Text('Call Centre', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                              ),
                              const SizedBox(width: 10),
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF25D366),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                ),
                                onPressed: () => LauncherUtils.launchWhatsApp(
                                  context: context,
                                  phone: phone,
                                  message: 'Hello S&A Academy $name, regarding court schedule:',
                                ),
                                icon: const Icon(Icons.chat, size: 14),
                                label: const Text('WhatsApp', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                              ),
                              const SizedBox(width: 10),
                              IconButton(
                                tooltip: 'Email Centre',
                                icon: const Icon(Icons.mail_outline, color: AppTheme.textSecondary, size: 20),
                                onPressed: () => LauncherUtils.launchEmail(
                                  context: context,
                                  email: email,
                                  subject: 'Inquiry - S&A Academy $name',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }

  Widget _buildStatBadge(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.surfaceElevated,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 9, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
