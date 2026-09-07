import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/auth/auth_provider.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen> with SingleTickerProviderStateMixin {
  final ApiClient _client = ApiClient();
  late TabController _tabController;
  bool _isLoading = true;
  List<dynamic> _todaySessions = [];
  List<dynamic> _batches = [];
  String _selectedCentre = 'ALL';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchScheduleData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchScheduleData() async {
    setState(() => _isLoading = true);
    try {
      final sessionRes = await _client.dio.get(
        ApiEndpoints.sessionsToday,
        queryParameters: {'centre': _selectedCentre},
      );
      final batchRes = await _client.dio.get(
        ApiEndpoints.batches,
        queryParameters: {'centre': _selectedCentre},
      );

      if (mounted) {
        setState(() {
          _todaySessions = sessionRes.data['data']?['sessions'] ?? [];
          _batches = batchRes.data['data']?['batches'] ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _openCreateBatchDialog() {
    final nameCtrl = TextEditingController();
    final startTimeCtrl = TextEditingController(text: '16:00');
    final endTimeCtrl = TextEditingController(text: '17:30');
    final capacityCtrl = TextEditingController(text: '12');
    String centreSlug = 'kadavanthra';
    String programSlug = 'junior-badminton-coaching';
    List<String> selectedDays = ['MON', 'WED', 'FRI'];

    final allDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: const Text('Create Training Batch', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800)),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 480,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: nameCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Cohort / Batch Name (e.g. Juniors Cadre A)'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: centreSlug,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Training Centre'),
                    items: const [
                      DropdownMenuItem(value: 'kadavanthra', child: Text('Kadavanthra Centre')),
                      DropdownMenuItem(value: 'edappally', child: Text('Edappally Centre')),
                      DropdownMenuItem(value: 'kakkanad', child: Text('Kakkanad Centre')),
                    ],
                    onChanged: (v) => setDialogState(() => centreSlug = v!),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: programSlug,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Program Curriculum'),
                    items: const [
                      DropdownMenuItem(value: 'kids-badminton-coaching', child: Text('Kids Badminton Coaching')),
                      DropdownMenuItem(value: 'junior-badminton-coaching', child: Text('Junior Badminton Coaching')),
                      DropdownMenuItem(value: 'adult-badminton-coaching', child: Text('Adult Coaching & Fitness')),
                      DropdownMenuItem(value: 'elite-high-performance-training', child: Text('Elite High Performance')),
                      DropdownMenuItem(value: 'weekend-badminton-batches', child: Text('Weekend Intensive Coaching')),
                    ],
                    onChanged: (v) => setDialogState(() => programSlug = v!),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: startTimeCtrl,
                          style: const TextStyle(color: AppTheme.textPrimary),
                          decoration: const InputDecoration(labelText: 'Start Time (HH:MM)'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: endTimeCtrl,
                          style: const TextStyle(color: AppTheme.textPrimary),
                          decoration: const InputDecoration(labelText: 'End Time (HH:MM)'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: capacityCtrl,
                          style: const TextStyle(color: AppTheme.textPrimary),
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Max Capacity'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('Days of Week:', style: TextStyle(color: AppTheme.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: allDays.map((day) {
                      final isSelected = selectedDays.contains(day);
                      return FilterChip(
                        label: Text(day),
                        selected: isSelected,
                        selectedColor: AppTheme.primary,
                        backgroundColor: AppTheme.surfaceElevated,
                        labelStyle: TextStyle(
                          color: isSelected ? const Color(0xFF07090D) : AppTheme.textSecondary,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                        side: BorderSide(color: isSelected ? AppTheme.primary : AppTheme.border),
                        onSelected: (val) {
                          setDialogState(() {
                            if (val) {
                              selectedDays.add(day);
                            } else {
                              selectedDays.remove(day);
                            }
                          });
                        },
                      );
                    }).toList(),
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
                if (nameCtrl.text.isNotEmpty && selectedDays.isNotEmpty) {
                  try {
                    await _client.dio.post(
                      ApiEndpoints.batches,
                      data: {
                        'name': nameCtrl.text.trim(),
                        'centreSlug': centreSlug,
                        'programSlug': programSlug,
                        'startTime': startTimeCtrl.text.trim(),
                        'endTime': endTimeCtrl.text.trim(),
                        'maxCapacity': int.tryParse(capacityCtrl.text) ?? 12,
                        'daysOfWeek': selectedDays,
                      },
                    );
                    if (ctx.mounted) Navigator.pop(ctx);
                    _fetchScheduleData();
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(content: Text('Failed to create batch: $e')),
                      );
                    }
                  }
                }
              },
              child: const Text('Create Batch'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final canManageBatches = user?.isAdmin == true;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('SCHEDULE & TIMETABLE'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [
            Tab(text: "TODAY'S COURT SESSIONS"),
            Tab(text: "ALL COHORTS & BATCHES"),
          ],
        ),
        actions: [
          if (canManageBatches)
            IconButton(
              icon: const Icon(Icons.add_circle, color: AppTheme.primary),
              tooltip: 'Create Batch',
              onPressed: _openCreateBatchDialog,
            ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchScheduleData,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Centre Filter Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                const Text('CENTRE: ', style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.w800)),
                const SizedBox(width: 8),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildCentreChip('ALL', 'All Centres'),
                        _buildCentreChip('kadavanthra', 'Kadavanthra'),
                        _buildCentreChip('edappally', 'Edappally'),
                        _buildCentreChip('kakkanad', 'Kakkanad'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildTodaySessionsView(),
                      _buildBatchesView(),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCentreChip(String slug, String label) {
    final isSelected = _selectedCentre == slug;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        selectedColor: AppTheme.primary,
        backgroundColor: AppTheme.surface,
        labelStyle: TextStyle(
          color: isSelected ? const Color(0xFF07090D) : AppTheme.textSecondary,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
        side: BorderSide(color: isSelected ? AppTheme.primary : AppTheme.border),
        onSelected: (_) {
          setState(() => _selectedCentre = slug);
          _fetchScheduleData();
        },
      ),
    );
  }

  Widget _buildTodaySessionsView() {
    if (_todaySessions.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.calendar_today, size: 48, color: AppTheme.textMuted.withOpacity(0.4)),
            const SizedBox(height: 12),
            const Text(
              'No training sessions running today for this centre.',
              style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            const Text(
              'Batches scheduled for today\'s day of the week will show automatically.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _todaySessions.length,
      itemBuilder: (ctx, i) {
        final ses = _todaySessions[i];
        final sessionId = ses['id'] ?? '';
        final batchName = ses['batch_name'] ?? 'Training Session';
        final centreName = ses['centre_name'] ?? 'Centre';
        final coachName = ses['coach_name'] ?? 'Unassigned';
        final startTime = ses['start_time'] ?? '';
        final endTime = ses['end_time'] ?? '';
        final totalStudents = ses['total_students'] ?? 0;
        final markedStudents = ses['marked_students'] ?? 0;
        final isCompleted = ses['status'] == 'COMPLETED';

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isCompleted ? AppTheme.success.withOpacity(0.4) : AppTheme.border,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceElevated,
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Text(
                      '$startTime – $endTime',
                      style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: isCompleted ? AppTheme.success.withOpacity(0.12) : AppTheme.warning.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      isCompleted ? 'COMPLETED' : 'PENDING ATTENDANCE',
                      style: TextStyle(
                        color: isCompleted ? AppTheme.success : AppTheme.warning,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                batchName,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 4),
              Text(
                '$centreName • Head Coach: $coachName',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Enrolled Roster: $totalStudents athletes ($markedStudents marked)',
                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isCompleted ? AppTheme.surfaceElevated : AppTheme.primary,
                      foregroundColor: isCompleted ? AppTheme.textPrimary : const Color(0xFF07090D),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    ),
                    onPressed: () {
                      context.push('/attendance?sessionId=$sessionId');
                    },
                    icon: Icon(Icons.fact_check, size: 16, color: isCompleted ? AppTheme.primary : const Color(0xFF07090D)),
                    label: Text(
                      isCompleted ? 'Review' : 'Mark Attendance',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBatchesView() {
    if (_batches.isEmpty) {
      return const Center(
        child: Text('No batches found for this centre.', style: TextStyle(color: AppTheme.textMuted)),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _batches.length,
      itemBuilder: (ctx, i) {
        final b = _batches[i];
        final name = b['name'] ?? '';
        final centreName = b['centre_name'] ?? b['centre_slug'] ?? '';
        final programName = b['program_name'] ?? b['program_slug'] ?? '';
        final coachName = b['coach_name'] ?? 'Unassigned';
        final startTime = b['start_time'] ?? '';
        final endTime = b['end_time'] ?? '';
        final days = (b['days_of_week'] as List?)?.join(', ') ?? '';
        final enrolled = b['enrolled_count'] ?? 0;
        final maxCapacity = b['max_capacity'] ?? 12;
        final capacityRatio = maxCapacity > 0 ? (enrolled / maxCapacity).clamp(0.0, 1.0) : 0.0;

        Color capacityColor = AppTheme.success;
        if (capacityRatio >= 0.9) {
          capacityColor = AppTheme.danger;
        } else if (capacityRatio >= 0.7) {
          capacityColor = AppTheme.warning;
        }

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
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
                  Expanded(
                    child: Text(
                      name,
                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w800),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: capacityColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'CAPACITY: $enrolled / $maxCapacity',
                      style: TextStyle(color: capacityColor, fontSize: 11, fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                '$centreName • $programName',
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                'Coach: $coachName • $days ($startTime – $endTime)',
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: capacityRatio,
                  backgroundColor: AppTheme.border,
                  valueColor: AlwaysStoppedAnimation<Color>(capacityColor),
                  minHeight: 6,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
