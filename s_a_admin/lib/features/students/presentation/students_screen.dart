import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class StudentsScreen extends ConsumerStatefulWidget {
  const StudentsScreen({super.key});

  @override
  ConsumerState<StudentsScreen> createState() => _StudentsScreenState();
}

class _StudentsScreenState extends ConsumerState<StudentsScreen> {
  final ApiClient _client = ApiClient();
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isLoading = true;
  List<dynamic> _students = [];
  String _selectedCentre = 'ALL';
  dynamic _selectedStudent; // Non-null renders Screen 10: Student Detail
  String _detailTab = 'Profile';

  final List<Map<String, String>> _centrePills = [
    {'key': 'ALL', 'label': 'All'},
    {'key': 'kadavanthra', 'label': 'Kadavanthra'},
    {'key': 'edappally', 'label': 'Edappally'},
    {'key': 'kakkanad', 'label': 'Kakkanad'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchStudents() async {
    setState(() => _isLoading = true);
    try {
      final queryParams = <String, dynamic>{};
      if (_searchCtrl.text.trim().isNotEmpty) {
        queryParams['search'] = _searchCtrl.text.trim();
      }
      if (_selectedCentre != 'ALL') {
        queryParams['centre'] = _selectedCentre;
      }

      final res = await _client.dio.get(
        ApiEndpoints.students,
        queryParameters: queryParams,
      );

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

  void _showAddStudentDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final parentCtrl = TextEditingController();
    String branch = 'kadavanthra';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Enroll New Student', style: AppTheme.sectionTitle),
            const SizedBox(height: 16),
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(hintText: 'Student Full Name *'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: parentCtrl,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(hintText: 'Parent / Guardian Name *'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(hintText: 'Emergency Contact (+91 ...) *'),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: RebelButton(
                label: 'Save & Enroll',
                onPressed: () async {
                  if (nameCtrl.text.trim().isEmpty) return;
                  Navigator.pop(ctx);
                  try {
                    await _client.dio.post(ApiEndpoints.students, data: {
                      'fullName': nameCtrl.text.trim(),
                      'parentName': parentCtrl.text.trim(),
                      'parentPhone': phoneCtrl.text.trim(),
                      'primaryCentre': branch,
                      'programSlug': 'junior-badminton-coaching',
                    });
                    _fetchStudents();
                  } catch (_) {}
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // If a student is selected, render Screen 10: Student Detail
    if (_selectedStudent != null) {
      return _buildStudentDetailView(_selectedStudent);
    }

    // Otherwise render Screen 9: Students List
    return _buildStudentsListView();
  }

  /// Screen 9: Students List matching reference mockup
  Widget _buildStudentsListView() {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title with filter icon
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Students', style: AppTheme.pageTitle),
                  IconButton(
                    icon: const Icon(Icons.filter_list_rounded, color: AppTheme.primary, size: 22),
                    onPressed: () {},
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Search field matching Screen 9
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search students...',
                onChanged: (_) => _fetchStudents(),
                onClear: () => _fetchStudents(),
              ),
              const SizedBox(height: 12),

              // Centre filter pills: All, Kadavanthra, Edappally, Kakkanad
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _centrePills.map((c) {
                    final isSelected = _selectedCentre == c['key'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: RebelFilterPill(
                        label: c['label']!,
                        isSelected: isSelected,
                        onTap: () {
                          setState(() => _selectedCentre = c['key']!);
                          _fetchStudents();
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 16),

              // Students list rows matching Screen 9
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
                      )
                    : _students.isEmpty
                        ? const RebelEmptyState(
                            icon: Icons.person_off_outlined,
                            title: 'No students found',
                            message: 'Enrolled students will appear here.',
                          )
                        : RefreshIndicator(
                            color: AppTheme.primary,
                            backgroundColor: AppTheme.surfaceElevated,
                            onRefresh: _fetchStudents,
                            child: ListView.separated(
                              itemCount: _students.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 8),
                              itemBuilder: (context, index) {
                                final student = _students[index];
                                final name = student['name'] ?? student['full_name'] ?? 'Student';
                                final program = student['program_name'] ?? student['program'] ?? 'Kids (Beginner)';

                                return RebelCard(
                                  onTap: () => setState(() => _selectedStudent = student),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  child: Row(
                                    children: [
                                      RebelAvatar(name: name, radius: 20),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              name,
                                              style: const TextStyle(
                                                color: AppTheme.textPrimary,
                                                fontSize: 15,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              program,
                                              style: const TextStyle(
                                                color: AppTheme.textSecondary,
                                                fontSize: 13,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      const Icon(Icons.chevron_right, size: 20, color: AppTheme.textMuted),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.onPrimary,
        elevation: 4,
        shape: const CircleBorder(),
        onPressed: _showAddStudentDialog,
        child: const Icon(Icons.add, size: 28),
      ),
    );
  }

  /// Screen 10: Student Detail matching reference mockup
  Widget _buildStudentDetailView(dynamic student) {
    final name = student['name'] ?? student['full_name'] ?? 'Aarav S';
    final parent = student['parent_name'] ?? student['parent'] ?? 'Suresh S (Father)';
    final phone = student['parent_phone'] ?? student['phone'] ?? '+91 98765 43210';
    final centre = (student['primary_centre'] ?? student['centre'] ?? 'Kadavanthra').toString().toUpperCase();
    final program = student['program_name'] ?? student['program'] ?? 'Kids (Beginner)';
    final batch = student['batch_name'] ?? 'Mon, Wed, Fri - 4:00 PM';
    final status = (student['status'] ?? 'Active').toString();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: TextButton.icon(
          icon: const Icon(Icons.chevron_left, color: AppTheme.primary, size: 24),
          label: const Text('Back', style: TextStyle(color: AppTheme.primary, fontSize: 15, fontWeight: FontWeight.w600)),
          onPressed: () => setState(() => _selectedStudent = null),
        ),
        leadingWidth: 90,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          child: Column(
            children: [
              // Header: Avatar, Name, Student badge matching Screen 10
              RebelAvatar(name: name, radius: 36),
              const SizedBox(height: 12),
              Text(
                name,
                style: const TextStyle(
                  color: AppTheme.textPrimary,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Student',
                style: TextStyle(
                  color: AppTheme.textMuted,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),

              const SizedBox(height: 20),

              // Segmented tabs matching Screen 10: Profile, Attendance, Payments, Performance
              RebelSegmentedControl<String>(
                values: const ['Profile', 'Attendance', 'Payments', 'Performance'],
                selectedValue: _detailTab,
                labelBuilder: (v) => v,
                onSelected: (v) => setState(() => _detailTab = v),
              ),

              const SizedBox(height: 20),

              // Profile Details Card matching Screen 10
              RebelCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  children: [
                    _buildDetailRow('Parent', parent),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildDetailRow('Phone', phone),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildDetailRow('Centre', centre),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildDetailRow('Program', program),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildDetailRow('Batch', batch),
                    const Divider(color: AppTheme.border, height: 1),
                    _buildDetailRow('Status', status),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Navigation Tiles matching Screen 10
              _buildNavTile(
                icon: Icons.checklist_rtl_rounded,
                title: 'View Attendance',
                onTap: () => context.push('/attendance'),
              ),
              const SizedBox(height: 10),
              _buildNavTile(
                icon: Icons.receipt_long_outlined,
                title: 'View Payments',
                onTap: () => context.push('/finance'),
              ),
              const SizedBox(height: 10),
              _buildNavTile(
                icon: Icons.analytics_outlined,
                title: 'View Performance',
                onTap: () => context.push('/performance'),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavTile({required IconData icon, required String title, required VoidCallback onTap}) {
    return RebelCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.primary),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const Icon(Icons.chevron_right, size: 20, color: AppTheme.textMuted),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: const TextStyle(
                color: AppTheme.textMuted,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: AppTheme.textPrimary,
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
