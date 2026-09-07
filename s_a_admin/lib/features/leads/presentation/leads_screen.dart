import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/utils/launcher_utils.dart';
import '../../../core/auth/auth_provider.dart';

class LeadsScreen extends ConsumerStatefulWidget {
  const LeadsScreen({super.key});

  @override
  ConsumerState<LeadsScreen> createState() => _LeadsScreenState();
}

class _LeadsScreenState extends ConsumerState<LeadsScreen> {
  final ApiClient _client = ApiClient();
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isLoading = true;
  List<dynamic> _leads = [];
  String _selectedStatus = 'ALL';
  String _selectedCentre = 'ALL';

  final List<String> _statusTabs = [
    'ALL',
    'NEW',
    'CONTACTED',
    'FOLLOW_UP',
    'TRIAL_SCHEDULED',
    'TRIAL_ATTENDED',
    'CONVERTED',
    'NOT_INTERESTED',
    'LOST',
  ];

  @override
  void initState() {
    super.initState();
    _fetchLeads();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchLeads() async {
    setState(() => _isLoading = true);
    try {
      final queryParams = <String, dynamic>{'status': _selectedStatus};
      if (_selectedCentre != 'ALL') {
        queryParams['centre'] = _selectedCentre;
      }
      if (_searchCtrl.text.trim().isNotEmpty) {
        queryParams['search'] = _searchCtrl.text.trim();
      }

      final res = await _client.dio.get(
        ApiEndpoints.leads,
        queryParameters: queryParams,
      );
      if (mounted) {
        setState(() {
          _leads = res.data['data']?['leads'] ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _advanceLeadStatus(String leadId, String newStatus) async {
    try {
      await _client.dio.put(
        ApiEndpoints.lead(leadId),
        data: {'status': newStatus},
      );
      _fetchLeads();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lead status transitioned to $newStatus'),
            backgroundColor: AppTheme.surfaceElevated,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Status update failed: $e')),
        );
      }
    }
  }

  void _openAddLeadDialog() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final notesCtrl = TextEditingController();
    String branch = 'kadavanthra';
    String program = 'junior-badminton-coaching';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: const Text('Record Inbound Lead', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800)),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 460,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: nameCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Candidate / Student Name *'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: phoneCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(labelText: 'Phone Number (10 digits) *'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: emailCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(labelText: 'Email Address (Optional)'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: branch,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Preferred Centre'),
                    items: const [
                      DropdownMenuItem(value: 'kadavanthra', child: Text('Kadavanthra Centre')),
                      DropdownMenuItem(value: 'edappally', child: Text('Edappally Centre')),
                      DropdownMenuItem(value: 'kakkanad', child: Text('Kakkanad Centre')),
                    ],
                    onChanged: (v) => setDialogState(() => branch = v!),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: program,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Interested Program'),
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
                    controller: notesCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Staff Inbound Notes'),
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
                if (nameCtrl.text.isNotEmpty && phoneCtrl.text.isNotEmpty) {
                  try {
                    await _client.dio.post(
                      ApiEndpoints.leads,
                      data: {
                        'name': nameCtrl.text.trim(),
                        'phone': phoneCtrl.text.trim(),
                        'email': emailCtrl.text.trim(),
                        'branch': branch,
                        'program': program,
                        'notes': notesCtrl.text.trim(),
                      },
                    );
                    if (ctx.mounted) Navigator.pop(ctx);
                    _fetchLeads();
                  } catch (e) {
                    if (ctx.mounted) {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(content: Text('Failed to record lead: $e')),
                      );
                    }
                  }
                }
              },
              child: const Text('Record Lead'),
            ),
          ],
        ),
      ),
    );
  }

  void _openScheduleTrialDialog(dynamic lead) {
    final leadId = lead['id'];
    final leadName = lead['name'];
    final leadPhone = lead['phone'];
    final dateCtrl = TextEditingController(
      text: DateTime.now().add(const Duration(days: 1)).toIso8601String().split('T')[0],
    );
    final timeCtrl = TextEditingController(text: '16:30');
    String centreSlug = lead['branch'] ?? 'kadavanthra';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppTheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppTheme.border),
          ),
          title: Text('Schedule Free Trial • $leadName', style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: dateCtrl,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Trial Date (YYYY-MM-DD)'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: timeCtrl,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Time (HH:MM)'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: centreSlug,
                dropdownColor: AppTheme.surface,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Evaluation Centre'),
                items: const [
                  DropdownMenuItem(value: 'kadavanthra', child: Text('Kadavanthra Centre')),
                  DropdownMenuItem(value: 'edappally', child: Text('Edappally Centre')),
                  DropdownMenuItem(value: 'kakkanad', child: Text('Kakkanad Centre')),
                ],
                onChanged: (v) => setDialogState(() => centreSlug = v!),
              ),
            ],
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
                    ApiEndpoints.trials,
                    data: {
                      'leadId': leadId,
                      'studentName': leadName,
                      'parentPhone': leadPhone,
                      'centreSlug': centreSlug,
                      'trialDate': dateCtrl.text.trim(),
                      'trialTime': timeCtrl.text.trim(),
                    },
                  );
                  if (ctx.mounted) {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Free trial evaluation scheduled successfully.')),
                    );
                  }
                  _fetchLeads();
                } catch (e) {
                  if (ctx.mounted) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      SnackBar(content: Text('Failed to schedule trial: $e')),
                    );
                  }
                }
              },
              child: const Text('Confirm Trial'),
            ),
          ],
        ),
      ),
    );
  }

  void _openConvertLeadDialog(dynamic lead) {
    final leadId = lead['id'];
    final nameCtrl = TextEditingController(text: lead['name']);
    final parentNameCtrl = TextEditingController(text: 'Parent of ${lead['name']}');
    final parentPhoneCtrl = TextEditingController(text: lead['phone']);
    final parentEmailCtrl = TextEditingController(text: lead['email'] ?? '');
    final feeAmountCtrl = TextEditingController(text: '3500');
    String centreSlug = lead['branch'] ?? 'kadavanthra';
    String programSlug = lead['program'] ?? 'junior-badminton-coaching';
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
          title: Text('Convert Lead to Enrolled Student • ${lead['name']}',
              style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800, fontSize: 16)),
          content: SingleChildScrollView(
            child: SizedBox(
              width: 500,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Student Athlete Details:', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: nameCtrl,
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
                  const SizedBox(height: 16),
                  const Text('Guardian / Parent Details:', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: parentNameCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Parent / Guardian Full Name *'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: parentPhoneCtrl,
                          style: const TextStyle(color: AppTheme.textPrimary),
                          decoration: const InputDecoration(labelText: 'Parent Phone *'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: parentEmailCtrl,
                          style: const TextStyle(color: AppTheme.textPrimary),
                          decoration: const InputDecoration(labelText: 'Parent Email'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text('Academy Enrollment & Fees:', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    initialValue: centreSlug,
                    dropdownColor: AppTheme.surface,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    decoration: const InputDecoration(labelText: 'Enrolled Centre'),
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
                    decoration: const InputDecoration(labelText: 'Enrolled Program'),
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
                  TextField(
                    controller: feeAmountCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary),
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'Initial Monthly Fee Obligation (₹)'),
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
                    ApiEndpoints.convertLead,
                    data: {
                      'leadId': leadId,
                      'studentName': nameCtrl.text.trim(),
                      'gender': gender,
                      'parentName': parentNameCtrl.text.trim(),
                      'parentPhone': parentPhoneCtrl.text.trim(),
                      'parentEmail': parentEmailCtrl.text.trim(),
                      'centreSlug': centreSlug,
                      'programSlug': programSlug,
                      'initialFee': double.tryParse(feeAmountCtrl.text) ?? 3500.0,
                    },
                  );
                  if (ctx.mounted) {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Lead converted to enrolled student! Parent & initial fee ledger created.'),
                        backgroundColor: AppTheme.success,
                      ),
                    );
                  }
                  _fetchLeads();
                } catch (e) {
                  if (ctx.mounted) {
                    ScaffoldMessenger.of(ctx).showSnackBar(
                      SnackBar(content: Text('Conversion failed: $e')),
                    );
                  }
                }
              },
              child: const Text('Convert & Enroll'),
            ),
          ],
        ),
      ),
    );
  }

  void _openLeadDetailSheet(dynamic lead) {
    final name = lead['name'] ?? 'Candidate';
    final phone = lead['phone'] ?? '';
    final email = lead['email'] ?? '';
    final branch = lead['branch'] ?? 'kadavanthra';
    final program = lead['program'] ?? '';
    final status = lead['status'] ?? 'NEW';
    final id = lead['id'] ?? '';
    final notes = lead['notes'] ?? 'No notes recorded.';

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
                Expanded(
                  child: Text(
                    name,
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 20, fontWeight: FontWeight.w800),
                  ),
                ),
                _buildStatusBadge(status),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Enquired for $program at ${branch.toString().toUpperCase()} Centre',
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 20),
            // Contact Buttons Row
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
                      phone: phone,
                      message: 'Hello $name! Greetings from S&A Badminton Academy regarding your enquiry for $program at $branch centre:',
                    ),
                    icon: const Icon(Icons.chat, size: 16),
                    label: const Text('WhatsApp'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primary,
                      side: const BorderSide(color: AppTheme.primary),
                    ),
                    onPressed: () => LauncherUtils.launchPhone(context: context, phone: phone),
                    icon: const Icon(Icons.phone, size: 16),
                    label: const Text('Call Phone'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Divider(color: AppTheme.borderSubtle),
            const SizedBox(height: 12),
            const Text('Lead Timeline & Notes:', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
            const SizedBox(height: 6),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.border),
              ),
              child: Text(notes, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
            ),
            const SizedBox(height: 20),
            const Text('Stage Transitions & Actions:', style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (status != 'CONTACTED')
                  ActionChip(
                    label: const Text('Mark Contacted'),
                    backgroundColor: AppTheme.surfaceElevated,
                    side: const BorderSide(color: AppTheme.info),
                    labelStyle: const TextStyle(color: AppTheme.info, fontSize: 12, fontWeight: FontWeight.w700),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _advanceLeadStatus(id, 'CONTACTED');
                    },
                  ),
                ActionChip(
                  label: const Text('+ Schedule Free Trial'),
                  backgroundColor: AppTheme.surfaceElevated,
                  side: const BorderSide(color: AppTheme.warning),
                  labelStyle: const TextStyle(color: AppTheme.warning, fontSize: 12, fontWeight: FontWeight.w700),
                  onPressed: () {
                    Navigator.pop(ctx);
                    _openScheduleTrialDialog(lead);
                  },
                ),
                if (status == 'TRIAL_SCHEDULED')
                  ActionChip(
                    label: const Text('Mark Trial Attended'),
                    backgroundColor: AppTheme.surfaceElevated,
                    side: const BorderSide(color: AppTheme.success),
                    labelStyle: const TextStyle(color: AppTheme.success, fontSize: 12, fontWeight: FontWeight.w700),
                    onPressed: () {
                      Navigator.pop(ctx);
                      _advanceLeadStatus(id, 'TRIAL_ATTENDED');
                    },
                  ),
                ActionChip(
                  label: const Text('★ Convert to Enrolled Student'),
                  backgroundColor: AppTheme.primary,
                  side: BorderSide.none,
                  labelStyle: const TextStyle(color: Color(0xFF07090D), fontSize: 12, fontWeight: FontWeight.w800),
                  onPressed: () {
                    Navigator.pop(ctx);
                    _openConvertLeadDialog(lead);
                  },
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = AppTheme.primary;
    if (status == 'CONTACTED') color = AppTheme.info;
    if (status == 'TRIAL_SCHEDULED') color = AppTheme.warning;
    if (status == 'TRIAL_ATTENDED') color = const Color(0xFFA78BFA);
    if (status == 'CONVERTED' || status == 'ENROLLED') color = AppTheme.success;
    if (status == 'LOST' || status == 'NOT_INTERESTED') color = AppTheme.danger;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w800),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('LEADS & INBOUND CRM'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_alt_1, color: AppTheme.primary),
            tooltip: 'Record Lead',
            onPressed: _openAddLeadDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchLeads,
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
                    controller: _searchCtrl,
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Search by candidate name, phone or email...',
                      prefixIcon: const Icon(Icons.search, size: 18, color: AppTheme.textMuted),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 16, color: AppTheme.textMuted),
                              onPressed: () {
                                _searchCtrl.clear();
                                _fetchLeads();
                              },
                            )
                          : null,
                    ),
                    onSubmitted: (_) => _fetchLeads(),
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
                    _fetchLeads();
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
              itemCount: _statusTabs.length,
              itemBuilder: (ctx, i) {
                final tab = _statusTabs[i];
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
                      _fetchLeads();
                    },
                  ),
                );
              },
            ),
          ),
          const Divider(color: AppTheme.border, height: 16),

          // Lead Cards List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _leads.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.contact_mail_outlined, size: 48, color: AppTheme.textMuted.withOpacity(0.4)),
                            const SizedBox(height: 12),
                            const Text(
                              'No leads found in this stage.',
                              style: TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'New website enquiries will automatically appear here.',
                              style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _leads.length,
                        itemBuilder: (ctx, i) {
                          final lead = _leads[i];
                          return _buildLeadCard(lead);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildLeadCard(dynamic lead) {
    final name = lead['name'] ?? 'Candidate';
    final phone = lead['phone'] ?? '';
    final branch = lead['branch'] ?? 'kadavanthra';
    final program = lead['program'] ?? '';
    final status = lead['status'] ?? 'NEW';

    return InkWell(
      onTap: () => _openLeadDetailSheet(lead),
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
                Expanded(
                  child: Text(
                    name,
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                _buildStatusBadge(status),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '$phone • $branch • $program',
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tap for timeline & conversion →',
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.chat, color: Color(0xFF25D366), size: 18),
                      tooltip: 'WhatsApp',
                      onPressed: () => LauncherUtils.launchWhatsApp(
                        context: context,
                        phone: phone,
                        message: 'Hello $name! Greetings from S&A Badminton Academy:',
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.phone, color: AppTheme.primary, size: 18),
                      tooltip: 'Call Phone',
                      onPressed: () => LauncherUtils.launchPhone(context: context, phone: phone),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
