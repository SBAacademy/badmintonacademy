import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class PerformanceScreen extends StatefulWidget {
  const PerformanceScreen({super.key});

  @override
  State<PerformanceScreen> createState() => _PerformanceScreenState();
}

class _PerformanceScreenState extends State<PerformanceScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _students = [];

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  Future<void> _fetchStudents() async {
    setState(() => _isLoading = true);
    try {
      final res = await _client.dio.get(ApiEndpoints.students);
      if (mounted) {
        setState(() {
          _students = res.data['data']?['students'] ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _openAssessmentDialog(dynamic student) {
    final studentId = student['id'];
    final studentName = student['full_name'];

    double footwork = 3;
    double technique = 3;
    double fitness = 3;
    double tactical = 3;
    double consistency = 3;
    final notesCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: Text(
            'Athlete Assessment • $studentName',
            style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800, fontSize: 16),
          ),
          content: SizedBox(
            width: 460,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSlider('Footwork & Agility', footwork, (v) => setDialogState(() => footwork = v)),
                  _buildSlider('Stroke Technique & Grip', technique, (v) => setDialogState(() => technique = v)),
                  _buildSlider('Match Fitness & Stamina', fitness, (v) => setDialogState(() => fitness = v)),
                  _buildSlider('Tactical Awareness', tactical, (v) => setDialogState(() => tactical = v)),
                  _buildSlider('Rally Consistency', consistency, (v) => setDialogState(() => consistency = v)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Coach Technical Notes & Goals'),
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
                try {
                  await _client.dio.post(
                    ApiEndpoints.performance,
                    data: {
                      'studentId': studentId,
                      'footwork': footwork.toInt(),
                      'technique': technique.toInt(),
                      'fitness': fitness.toInt(),
                      'tactical': tactical.toInt(),
                      'consistency': consistency.toInt(),
                      'notes': notesCtrl.text.trim(),
                    },
                  );
                  if (ctx.mounted) {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Performance assessment recorded successfully.'),
                        backgroundColor: AppTheme.surfaceElevated,
                      ),
                    );
                  }
                } catch (e) {
                  if (ctx.mounted) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      SnackBar(content: Text('Failed to save assessment: $e')),
                    );
                  }
                }
              },
              child: const Text('Record Assessment'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSlider(String label, double val, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
            Text('${val.toInt()} / 5', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w800, fontSize: 13)),
          ],
        ),
        Slider(
          value: val,
          min: 1,
          max: 5,
          divisions: 4,
          activeColor: AppTheme.primary,
          inactiveColor: AppTheme.border,
          onChanged: onChanged,
        ),
        const SizedBox(height: 4),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('ATHLETE PERFORMANCE ASSESSMENTS'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchStudents,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _students.isEmpty
              ? const Center(child: Text('No students enrolled to evaluate.', style: TextStyle(color: AppTheme.textMuted)))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _students.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (ctx, i) {
                    final st = _students[i];
                    final name = st['full_name'] ?? 'Athlete';
                    final code = st['student_code'] ?? 'STU';
                    final branch = st['branch'] ?? 'Centre';
                    final program = st['program_name'] ?? st['program_slug'] ?? '';

                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.border),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: AppTheme.primary.withOpacity(0.15),
                            child: Text(
                              name.isNotEmpty ? name[0] : 'A',
                              style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w800),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(name, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15, fontWeight: FontWeight.w800)),
                                const SizedBox(height: 4),
                                Text('$code • $branch • $program', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                              ],
                            ),
                          ),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.surfaceElevated,
                              foregroundColor: AppTheme.primary,
                              side: const BorderSide(color: AppTheme.border),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            ),
                            onPressed: () => _openAssessmentDialog(st),
                            icon: const Icon(Icons.analytics_outlined, size: 14),
                            label: const Text('Evaluate', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
