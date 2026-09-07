import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class ProgramsScreen extends StatefulWidget {
  const ProgramsScreen({super.key});

  @override
  State<ProgramsScreen> createState() => _ProgramsScreenState();
}

class _ProgramsScreenState extends State<ProgramsScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _programs = [];

  @override
  void initState() {
    super.initState();
    _fetchPrograms();
  }

  Future<void> _fetchPrograms() async {
    setState(() => _isLoading = true);
    try {
      final res = await _client.dio.get(ApiEndpoints.programs);
      if (mounted) {
        setState(() {
          _programs = res.data['data']?['programs'] ?? [];
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
        title: const Text('TRAINING PROGRAMS & CURRICULA'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchPrograms,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _programs.isEmpty
              ? const Center(child: Text('No programs found.', style: TextStyle(color: AppTheme.textMuted)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _programs.length,
                  itemBuilder: (ctx, i) {
                    final p = _programs[i];
                    final name = p['name'] ?? '';
                    final targetAge = p['target_age'] ?? 'All Ages';
                    final skillLevel = p['skill_level'] ?? 'All Levels';
                    final duration = p['duration_minutes'] ?? 90;
                    final coachRatio = p['coach_ratio'] ?? '1:8';
                    final fee = p['fee_monthly'] ?? 3500;
                    final activeBatches = p['active_batches_count'] ?? 0;
                    final enrolledStudents = p['enrolled_students_count'] ?? 0;

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
                              Expanded(
                                child: Text(
                                  name,
                                  style: const TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontSize: 17,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.primary.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: AppTheme.primary.withOpacity(0.3)),
                                ),
                                child: Text(
                                  '₹$fee / mo',
                                  style: const TextStyle(
                                    color: AppTheme.primary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              _buildPill(Icons.person_outline, 'Ages: $targetAge'),
                              _buildPill(Icons.trending_up, 'Level: $skillLevel'),
                              _buildPill(Icons.timer_outlined, '$duration mins/session'),
                              _buildPill(Icons.groups_outlined, 'Ratio: $coachRatio'),
                            ],
                          ),
                          const SizedBox(height: 16),
                          const Divider(color: AppTheme.borderSubtle, height: 1),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Active Batches: $activeBatches cohorts running',
                                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                              ),
                              Text(
                                '$enrolledStudents Athletes Enrolled',
                                style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w700),
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

  Widget _buildPill(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.surfaceElevated,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppTheme.textMuted),
          const SizedBox(width: 4),
          Text(text, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
