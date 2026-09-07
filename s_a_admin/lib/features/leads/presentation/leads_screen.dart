import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/utils/launcher_utils.dart';
import '../../../core/components/rebel_components.dart';

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
  String _selectedFilter = 'ALL';
  dynamic _selectedLead; // When non-null, shows Screen 6: Lead Detail

  final List<Map<String, String>> _filterPills = [
    {'key': 'ALL', 'label': 'All'},
    {'key': 'NEW', 'label': 'New'},
    {'key': 'FOLLOW_UP', 'label': 'Follow-up'},
    {'key': 'TRIAL_SCHEDULED', 'label': 'Trial'},
    {'key': 'CONTACTED', 'label': 'Enquiry'},
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
      final res = await _client.dio.get(
        ApiEndpoints.leads,
        queryParameters: {
          'status': _selectedFilter,
          if (_searchCtrl.text.trim().isNotEmpty) 'search': _searchCtrl.text.trim(),
        },
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

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'NEW':
        return AppTheme.statusNew;
      case 'TRIAL_SCHEDULED':
      case 'TRIAL_ATTENDED':
        return AppTheme.statusTrial;
      case 'FOLLOW_UP':
      case 'CONTACTED':
        return AppTheme.statusFollowUp;
      case 'CONVERTED':
        return AppTheme.statusPresent;
      case 'LOST':
      case 'NOT_INTERESTED':
        return AppTheme.statusAbsent;
      default:
        return AppTheme.textSecondary;
    }
  }

  String _formatRelativeTime(dynamic dateStr) {
    if (dateStr == null) return '';
    try {
      final dt = DateTime.parse(dateStr.toString());
      final diff = DateTime.now().difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      if (diff.inDays < 30) return '${diff.inDays}d ago';
      return DateFormat('d MMM').format(dt);
    } catch (_) {
      return '';
    }
  }

  void _showAddLeadSheet() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    String selectedBranch = 'kadavanthra';
    String selectedProgram = 'Kids Beginner';

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
            const Text('New Inbound Lead', style: AppTheme.sectionTitle),
            const SizedBox(height: 16),
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(hintText: 'Full Name *'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneCtrl,
              keyboardType: TextInputType.phone,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(hintText: 'Phone (+91 ...) *'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: emailCtrl,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: const InputDecoration(hintText: 'Email address'),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: RebelButton(
                label: 'Save Lead',
                onPressed: () async {
                  if (nameCtrl.text.trim().isEmpty || phoneCtrl.text.trim().isEmpty) return;
                  Navigator.pop(ctx);
                  try {
                    await _client.dio.post(ApiEndpoints.leads, data: {
                      'name': nameCtrl.text.trim(),
                      'phone': phoneCtrl.text.trim(),
                      'email': emailCtrl.text.trim(),
                      'branch': selectedBranch,
                      'program': selectedProgram,
                    });
                    _fetchLeads();
                  } catch (_) {}
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showScheduleTrialSheet(dynamic lead) {
    DateTime scheduledDate = DateTime.now().add(const Duration(days: 1));
    String timeSlot = '04:30 PM - 05:30 PM';

    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surfaceElevated,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Schedule Free Trial', style: AppTheme.sectionTitle),
            const SizedBox(height: 6),
            Text('For ${lead['name']} (${lead['phone']})', style: AppTheme.bodySecondary),
            const SizedBox(height: 20),
            Text('Date: ${DateFormat('EEE, d MMM y').format(scheduledDate)}', style: AppTheme.body),
            const SizedBox(height: 8),
            Text('Slot: $timeSlot', style: AppTheme.bodySecondary),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: RebelButton(
                label: 'Confirm Trial Booking',
                onPressed: () async {
                  Navigator.pop(ctx);
                  try {
                    await _client.dio.post(ApiEndpoints.trials, data: {
                      'leadId': lead['id'],
                      'scheduledDate': DateFormat('yyyy-MM-dd').format(scheduledDate),
                      'timeSlot': timeSlot,
                      'centreSlug': lead['branch'] ?? 'kadavanthra',
                      'programSlug': lead['program'] ?? 'junior-badminton-coaching',
                    });
                    _fetchLeads();
                    setState(() {
                      if (_selectedLead != null && _selectedLead['id'] == lead['id']) {
                        _selectedLead['status'] = 'TRIAL_SCHEDULED';
                      }
                    });
                  } catch (_) {}
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showConvertLeadSheet(dynamic lead) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppTheme.surfaceElevated,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Convert Lead to Enrolled Student', style: AppTheme.sectionTitle),
            const SizedBox(height: 8),
            Text('This will generate a student master record and parent profile for ${lead['name']}.', style: AppTheme.bodySecondary),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: RebelButton(
                label: 'Confirm Student Conversion',
                onPressed: () async {
                  Navigator.pop(ctx);
                  try {
                    await _client.dio.post(ApiEndpoints.convertLead, data: {
                      'leadId': lead['id'],
                      'primaryCentre': lead['branch'] ?? 'kadavanthra',
                      'monthlyFee': 3500,
                    });
                    _fetchLeads();
                    setState(() {
                      if (_selectedLead != null && _selectedLead['id'] == lead['id']) {
                        _selectedLead['status'] = 'CONVERTED';
                      }
                    });
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
    // If a lead is selected, render Screen 6: Lead Detail
    if (_selectedLead != null) {
      return _buildLeadDetailView(_selectedLead);
    }

    // Otherwise render Screen 5: Leads List
    return _buildLeadsListView();
  }

  /// Screen 5: Leads List matching reference mockup
  Widget _buildLeadsListView() {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title
              const Text('Leads', style: AppTheme.pageTitle),
              const SizedBox(height: 12),

              // Search bar
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search leads...',
                onChanged: (_) => _fetchLeads(),
                onClear: () => _fetchLeads(),
              ),
              const SizedBox(height: 12),

              // Filter pills carousel matching Screen 5
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _filterPills.map((f) {
                    final isSelected = _selectedFilter == f['key'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: RebelFilterPill(
                        label: f['label']!,
                        isSelected: isSelected,
                        onTap: () {
                          setState(() => _selectedFilter = f['key']!);
                          _fetchLeads();
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 16),

              // Leads List
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary),
                      )
                    : _leads.isEmpty
                        ? const RebelEmptyState(
                            icon: Icons.group_off_outlined,
                            title: 'No leads found',
                            message: 'New enquiries will appear here.',
                          )
                        : RefreshIndicator(
                            color: AppTheme.primary,
                            backgroundColor: AppTheme.surfaceElevated,
                            onRefresh: _fetchLeads,
                            child: ListView.separated(
                              itemCount: _leads.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 10),
                              itemBuilder: (context, index) {
                                final lead = _leads[index];
                                final name = lead['name'] ?? 'Unknown Lead';
                                final phone = lead['phone'] ?? '';
                                final status = (lead['status'] ?? 'NEW').toString();
                                final timeAgo = _formatRelativeTime(lead['submitted_at'] ?? lead['created_at']);
                                final statusColor = _getStatusColor(status);

                                return RebelCard(
                                  onTap: () => setState(() => _selectedLead = lead),
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
                                            const SizedBox(height: 3),
                                            Text(
                                              phone,
                                              style: const TextStyle(
                                                color: AppTheme.textSecondary,
                                                fontSize: 13,
                                              ),
                                            ),
                                            const SizedBox(height: 6),
                                            RebelStatusBadge(
                                              label: status.replaceAll('_', ' '),
                                              color: statusColor,
                                            ),
                                          ],
                                        ),
                                      ),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            timeAgo,
                                            style: const TextStyle(
                                              color: AppTheme.textMuted,
                                              fontSize: 11,
                                            ),
                                          ),
                                          const SizedBox(height: 10),
                                          const Icon(Icons.chevron_right, size: 18, color: AppTheme.textMuted),
                                        ],
                                      ),
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
        onPressed: _showAddLeadSheet,
        child: const Icon(Icons.add, size: 28),
      ),
    );
  }

  /// Screen 6: Lead Detail matching reference mockup
  Widget _buildLeadDetailView(dynamic lead) {
    final name = lead['name'] ?? 'Rohit Kumar';
    final phone = lead['phone'] ?? '+91 98765 43210';
    final email = lead['email'] ?? 'rohit.kumar@gmail.com';
    final status = (lead['status'] ?? 'NEW').toString();
    final centre = lead['branch'] ?? lead['centre'] ?? 'Kadavanthra';
    final program = lead['program'] ?? 'Kids (Beginner)';
    final notes = lead['notes'] ?? lead['message'] ?? 'Interested in evening batch. Parent will confirm this week.';
    final statusColor = _getStatusColor(status);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: TextButton.icon(
          icon: const Icon(Icons.chevron_left, color: AppTheme.primary, size: 24),
          label: const Text('Back', style: TextStyle(color: AppTheme.primary, fontSize: 15, fontWeight: FontWeight.w600)),
          onPressed: () => setState(() => _selectedLead = null),
        ),
        leadingWidth: 90,
        actions: [
          IconButton(
            icon: const Icon(Icons.more_horiz, color: AppTheme.textPrimary),
            onPressed: () {},
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Column(
                  children: [
                    // Avatar & Name Header matching Screen 6
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
                    const SizedBox(height: 6),
                    RebelStatusBadge(
                      label: status.replaceAll('_', ' '),
                      color: statusColor,
                    ),

                    const SizedBox(height: 20),

                    // Quick Actions Row: Call, WhatsApp, Email matching Screen 6
                    Row(
                      children: [
                        Expanded(
                          child: RebelSecondaryButton(
                            label: 'Call',
                            icon: Icons.phone_outlined,
                            height: 40,
                            onPressed: () => LauncherUtils.callPhone(phone),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: RebelSecondaryButton(
                            label: 'WhatsApp',
                            icon: Icons.chat_outlined,
                            height: 40,
                            onPressed: () => LauncherUtils.openWhatsApp(phone, 'Hi $name, regarding your enquiry with S&A Badminton Academy...'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: RebelSecondaryButton(
                            label: 'Email',
                            icon: Icons.email_outlined,
                            height: 40,
                            onPressed: () => LauncherUtils.sendEmail(email, 'S&A Badminton Academy Enquiry'),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Detail Key-Value Rows
                    RebelCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Column(
                        children: [
                          _buildDetailRow('Phone', phone),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Email', email),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Centre', centre.toString().toUpperCase()),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Program', program),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Assigned To', 'Alex Thomas'),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Follow-up Date', '12 Feb 2025'),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Notes', notes),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Sticky Action Bar matching Screen 6: Convert + Schedule Trial
            RebelBottomActionBar(
              children: [
                RebelSecondaryButton(
                  label: 'Convert',
                  onPressed: () => _showConvertLeadSheet(lead),
                  height: 48,
                ),
                const SizedBox(width: 12),
                RebelButton(
                  label: 'Schedule Trial',
                  onPressed: () => _showScheduleTrialSheet(lead),
                  height: 48,
                ),
              ],
            ),
          ],
        ),
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
            width: 110,
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
