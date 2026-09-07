import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/utils/launcher_utils.dart';
import '../../../core/auth/auth_provider.dart';

class StudentsScreen extends ConsumerStatefulWidget {
  const StudentsScreen({super.key});

  @override
  ConsumerState<StudentsScreen> createState() => _StudentsScreenState();
}

class _StudentsScreenState extends ConsumerState<StudentsScreen> {
  final ApiClient _client = ApiClient();
  final _searchController = TextEditingController();
  bool _isLoading = true;
  List<dynamic> _students = [];
  String _selectedCentre = 'ALL';
  String _selectedStatus = 'ALL';

  final List<String> _statusFilters = ['ALL', 'ACTIVE', 'INACTIVE', 'TRIAL', 'ON_HOLD'];

  @override
  void initState() {
    super.initState();
    _fetchStudents();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchStudents() async {
    setState(() => _isLoading = true);
    try {
      final queryParams = <String, dynamic>{};
      if (_searchController.text.trim().isNotEmpty) {
        queryParams['search'] = _searchController.text.trim();
      }
      if (_selectedCentre != 'ALL') {
        queryParams['centre'] = _selectedCentre;
      }
      if (_selectedStatus != 'ALL') {
        queryParams['status'] = _selectedStatus;
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

  void _openEnrollDialog() {
    final studentNameCtrl = TextEditingController();
    final parentNameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final feeCtrl = TextEditingController(text: '3500');
    String centre = 'kadavanthra';
    String program = 'junior-badminton-coaching';
    String gender = 'MALE';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: const Text('Enroll New Student Athlete', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800)),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 480,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: studentNameCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Student Full Name *'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: gender,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Gender'),
                    items: const [
                      DropdownMenuItem(value: 'MALE', child: Text('Male')),
                      DropdownMenuItem(value: 'FEMALE', child: Text('Female')),
                      DropdownMenuItem(value: 'OTHER', child: Text('Other')),
                    ],
                    onChanged: (v) => setDialogState(() => gender = v!),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: parentNameCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Parent / Guardian Full Name *'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: phoneCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(labelText: 'Parent Phone (10 digits) *'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: emailCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Parent Email'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: centre,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Primary Training Centre'),
                    items: const [
                      DropdownMenuItem(value: 'kadavanthra', child: Text('Kadavanthra Centre')),
                      DropdownMenuItem(value: 'edappally', child: Text('Edappally Centre')),
                      DropdownMenuItem(value: 'kakkanad', child: Text('Kakkanad Centre')),
                    ],
                    onChanged: (v) => setDialogState(() => centre = v!),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: program,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Training Program Curriculum'),
                    items: const [
                      DropdownMenuItem(value: 'kids-badminton-coaching', child: Text('Kids Badminton Coaching')),
                      DropdownMenuItem(value: 'junior-badminton-coaching', child: Text('Junior Badminton Coaching')),
                      DropdownMenuItem(value: 'adult-badminton-coaching', child: Text('Adult Coaching & Fitness')),
                      DropdownMenuItem(value: 'elite-high-performance-training', child: Text('Elite High Performance')),
                      DropdownMenuItem(value: 'weekend-badminton-batches', child: Text('Weekend Intensive Coaching')),
                    ],
                    onChanged: (v) => setDialogState(() => program = v!),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: feeCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Monthly Fee Obligation (₹)'),
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
                if (studentNameCtrl.text.isNotEmpty && phoneCtrl.text.isNotEmpty) {
                  try {
                    await _client.dio.post(
                      ApiEndpoints.students,
                      data: {
                        'fullName': studentNameCtrl.text.trim(),
                        'gender': gender,
                        'parentName': parentNameCtrl.text.trim(),
                        'parentPhone': phoneCtrl.text.trim(),
                        'parentEmail': emailCtrl.text.trim(),
                        'primaryCentre': centre,
                        'primaryProgram': program,
                        'monthlyFee': double.tryParse(feeCtrl.text) ?? 3500.0,
                      },
                    );
                    if (ctx.mounted) {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Athlete enrolled successfully. Parent and initial invoice generated.'),
                          backgroundColor: AppTheme.success,
                        ),
                      );
                    }
                    _fetchStudents();
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(content: Text('Enrollment failed: $e')),
                      );
                    }
                  }
                }
              },
              child: const Text('Enroll & Create Invoice'),
            ),
          ],
        ),
      ),
    );
  }

  void _openStudentProfileSheet(dynamic s) async {
    final id = s['id'] ?? '';
    final name = s['full_name'] ?? 'Athlete';
    final code = s['student_code'] ?? id;
    final centre = s['centre_name'] ?? s['primary_centre'] ?? s['branch'] ?? '';
    final program = s['program_name'] ?? s['primary_program'] ?? s['program_slug'] ?? '';
    final parentName = s['parent_name'] ?? 'Guardian';
    final parentPhone = s['parent_phone'] ?? '';
    final status = s['status'] ?? 'ACTIVE';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        side: BorderSide(color: AppTheme.border),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(color: AppTheme.textPrimary, fontSize: 20, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Athlete ID: $code',
                      style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    status,
                    style: const TextStyle(color: AppTheme.success, fontSize: 10, fontWeight: FontWeight.w800),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildDetailRow('Curriculum:', program),
            const SizedBox(height: 6),
            _buildDetailRow('Centre:', centre),
            const SizedBox(height: 6),
            _buildDetailRow('Parent / Guardian:', '$parentName ($parentPhone)'),
            const SizedBox(height: 20),
            // Parent Action Row
            if (parentPhone.isNotEmpty) ...[
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        foregroundColor: Colors.white,
                      ),
                      onPressed: () => LauncherUtils.launchWhatsApp(
                        context: context,
                        phone: parentPhone,
                        message: 'Hello $parentName! Greetings from S&A Badminton Academy regarding $name:',
                      ),
                      icon: const Icon(Icons.chat, size: 16),
                      label: const Text('WhatsApp Parent'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                        side: const BorderSide(color: AppTheme.primary),
                      ),
                      onPressed: () => LauncherUtils.launchPhone(context: context, phone: parentPhone),
                      icon: const Icon(Icons.phone, size: 16),
                      label: const Text('Call Parent'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],
            const Divider(color: AppTheme.borderSubtle),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Multi-Child Family Association:',
                  style: TextStyle(color: AppTheme.textSecondary, fontSize: 12, fontWeight: FontWeight.w700),
                ),
                Text(
                  'Linked via $parentPhone',
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 130,
          child: Text(label, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, fontWeight: FontWeight.w600)),
        ),
        Expanded(
          child: Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w700)),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final canEnroll = user?.role != 'COACH';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('STUDENT MASTER ROSTER'),
        actions: [
          if (canEnroll)
            IconButton(
              icon: const Icon(Icons.person_add, color: AppTheme.primary),
              tooltip: 'Enroll Student',
              onPressed: _openEnrollDialog,
            ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchStudents,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Search & Centre Filter Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Search by athlete name, student ID, or parent phone...',
                      prefixIcon: const Icon(Icons.search, size: 18, color: AppTheme.textMuted),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 16, color: AppTheme.textMuted),
                              onPressed: () {
                                _searchController.clear();
                                _fetchStudents();
                              },
                            )
                          : null,
                    ),
                    onSubmitted: (_) => _fetchStudents(),
                  ),
                ),
                const SizedBox(width: 8),
                DropdownButton<String>(
                  value: _selectedCentre,
                  dropdownColor: AppTheme.surface,
                  style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
                  underline: const SizedBox(),
                  items: const [
                    DropdownMenuItem(value: 'ALL', child: Text('All Centres')),
                    DropdownMenuItem(value: 'kadavanthra', child: Text('Kadavanthra')),
                    DropdownMenuItem(value: 'edappally', child: Text('Edappally')),
                    DropdownMenuItem(value: 'kakkanad', child: Text('Kakkanad')),
                  ],
                  onChanged: (v) {
                    setState(() => _selectedCentre = v!);
                    _fetchStudents();
                  },
                ),
              ],
            ),
          ),

          // Status Filter Tabs
          SizedBox(
            height: 44,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _statusFilters.length,
              itemBuilder: (ctx, i) {
                final tab = _statusFilters[i];
                final isSelected = tab == _selectedStatus;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(tab),
                    selected: isSelected,
                    selectedColor: AppTheme.primary,
                    backgroundColor: AppTheme.surface,
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF07090D) : AppTheme.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                    side: BorderSide(
                      color: isSelected ? AppTheme.primary : AppTheme.border,
                    ),
                    onSelected: (_) {
                      setState(() => _selectedStatus = tab);
                      _fetchStudents();
                    },
                  ),
                );
              },
            ),
          ),
          const Divider(color: AppTheme.border, height: 16),

          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _students.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.people_outline, size: 48, color: AppTheme.textMuted.withOpacity(0.4)),
                            const SizedBox(height: 12),
                            const Text(
                              'No student athletes found.',
                              style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Enrolled candidates from the CRM or walk-ins will appear here.',
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _students.length,
                        itemBuilder: (ctx, i) {
                          final student = _students[i];
                          return _buildStudentCard(student);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentCard(dynamic s) {
    final id = s['id'] ?? '';
    final name = s['full_name'] ?? 'Student';
    final code = s['student_code'] ?? id;
    final centre = s['centre_name'] ?? s['primary_centre'] ?? s['branch'] ?? '';
    final program = s['program_name'] ?? s['primary_program'] ?? s['program_slug'] ?? '';
    final parentName = s['parent_name'] ?? 'Guardian';
    final parentPhone = s['parent_phone'] ?? '';
    final status = s['status'] ?? 'ACTIVE';

    return InkWell(
      onTap: () => _openStudentProfileSheet(s),
      borderRadius: BorderRadius.circular(12),
      child: Container(
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
                Text(
                  name,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    status,
                    style: const TextStyle(
                      color: AppTheme.success,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '$code • $centre',
              style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            Text(
              program,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Parent: $parentName ($parentPhone)',
                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                ),
                const Text(
                  'View Profile →',
                  style: TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
