import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';

class CoachesScreen extends ConsumerStatefulWidget {
  const CoachesScreen({super.key});

  @override
  ConsumerState<CoachesScreen> createState() => _CoachesScreenState();
}

class _CoachesScreenState extends ConsumerState<CoachesScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _coaches = [];

  @override
  void initState() {
    super.initState();
    _fetchCoaches();
  }

  Future<void> _fetchCoaches() async {
    setState(() => _isLoading = true);
    try {
      final res = await _client.dio.get('/api/admin/coaches');
      if (mounted) {
        setState(() {
          _coaches = res.data['data']?['coaches'] ?? [];
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
        title: const Text('VERIFIED COACHING STAFF'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchCoaches,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _coaches.length,
              itemBuilder: (ctx, i) {
                final c = _coaches[i];
                final name = c['name'] ?? 'Coach';
                final role = c['role'] ?? 'Badminton Trainer';
                final centre = c['centre_name'] ?? c['primary_centre'] ?? 'Kochi';
                final exp = c['experience_years'] ?? 5;
                final spec = c['specialization'] ?? '';
                final bio = c['bio'] ?? '';

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: AppTheme.surface,
                    borderRadius: BorderRadius.circular(12),
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
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '$exp+ Years Exp',
                              style: const TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$role • $centre',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        spec,
                        style: const TextStyle(color: AppTheme.info, fontSize: 12),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        bio,
                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
