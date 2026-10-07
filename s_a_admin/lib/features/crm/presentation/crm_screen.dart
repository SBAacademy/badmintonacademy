import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/utils/launcher_utils.dart';
import '../../../core/services/whatsapp_service.dart';
import '../../../core/components/rebel_components.dart';

class CrmScreen extends ConsumerStatefulWidget {
  const CrmScreen({super.key});

  @override
  ConsumerState<CrmScreen> createState() => _CrmScreenState();
}

class _CrmScreenState extends ConsumerState<CrmScreen> {
  final ApiClient _client = ApiClient();
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _allLeads = [];
  List<dynamic> _filteredLeads = [];

  String _selectedCentre = 'ALL'; // ALL, KADAVANTHRA, KUMBALANGHI, MARADU, PALLURUTHY, CHULLIKAL
  String _selectedStatus = 'ALL'; // ALL, NEW, CONTACTED, FOLLOW_UP, TRIAL, CONVERTED, CLOSED
  dynamic _selectedLead;

  final List<String> _centres = ['ALL', 'KADAVANTHRA', 'KUMBALANGHI', 'MARADU', 'PALLURUTHY', 'CHULLIKAL'];

  final List<Map<String, String>> _statusFilters = [
    {'key': 'ALL', 'label': 'All'},
    {'key': 'NEW', 'label': 'New'},
    {'key': 'CONTACTED', 'label': 'Contacted'},
    {'key': 'FOLLOW_UP', 'label': 'Follow-up'},
    {'key': 'TRIAL', 'label': 'Trial'},
    {'key': 'CONVERTED', 'label': 'Converted'},
    {'key': 'CLOSED', 'label': 'Closed'},
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
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await _client.dio.get(
        ApiEndpoints.leads,
        queryParameters: {
          if (_selectedStatus != 'ALL') 'status': _selectedStatus,
          if (_selectedCentre != 'ALL') 'centre': _selectedCentre.toLowerCase(),
          if (_searchCtrl.text.trim().isNotEmpty) 'search': _searchCtrl.text.trim(),
        },
      );

      final leads = (res.data['data']?['leads'] ?? res.data['leads'] ?? []) as List<dynamic>;

      if (mounted) {
        setState(() {
          _allLeads = leads;
          _applyLocalFilters();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load leads. Please check your network connection.';
          _isLoading = false;
        });
      }
    }
  }

  void _applyLocalFilters() {
    final query = _searchCtrl.text.trim().toLowerCase();

    _filteredLeads = _allLeads.where((lead) {
      // Centre filter
      final branch = (lead['branch'] ?? lead['centre'] ?? '').toString().toUpperCase();
      if (_selectedCentre != 'ALL' && !branch.contains(_selectedCentre)) {
        return false;
      }

      // Status filter
      final status = (lead['status'] ?? 'NEW').toString().toUpperCase();
      if (_selectedStatus != 'ALL') {
        if (_selectedStatus == 'TRIAL' && !status.contains('TRIAL')) return false;
        if (_selectedStatus == 'CLOSED' && status != 'CLOSED' && status != 'LOST' && status != 'NOT_INTERESTED') return false;
        if (_selectedStatus != 'TRIAL' && _selectedStatus != 'CLOSED' && status != _selectedStatus) return false;
      }

      // Search query
      if (query.isNotEmpty) {
        final name = (lead['name'] ?? '').toString().toLowerCase();
        final phone = (lead['phone'] ?? '').toString().toLowerCase();
        final email = (lead['email'] ?? '').toString().toLowerCase();
        final program = (lead['program'] ?? '').toString().toLowerCase();
        if (!name.contains(query) && !phone.contains(query) && !email.contains(query) && !program.contains(query)) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  // Calculate real centre lead counts from data
  int _getCentreCount(String centreName) {
    if (centreName == 'ALL') return _allLeads.length;
    return _allLeads.where((lead) {
      final b = (lead['branch'] ?? lead['centre'] ?? '').toString().toUpperCase();
      return b.contains(centreName);
    }).length;
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'NEW':
        return AppTheme.statusNew;
      case 'TRIAL':
      case 'TRIAL_SCHEDULED':
      case 'TRIAL_ATTENDED':
        return AppTheme.statusTrial;
      case 'CONTACTED':
      case 'FOLLOW_UP':
        return AppTheme.statusFollowUp;
      case 'CONVERTED':
        return AppTheme.statusPresent;
      case 'CLOSED':
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

  // 1-Click WhatsApp Direct Templates Bottom Sheet
  void _showWhatsAppTemplatesSheet(dynamic lead) {
    final rawPhone = WhatsAppService.resolveForLead(lead);
    final leadName = lead['name'] ?? 'Lead';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (sheetContext, setModalState) {
            return Container(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.85,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Drag handle
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppTheme.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('1-Click WhatsApp Direct', style: AppTheme.sectionTitle),
                          const SizedBox(height: 2),
                          Text(
                            'Recipient: $leadName (${rawPhone ?? "No phone"})',
                            style: const TextStyle(color: AppTheme.primary, fontSize: 13, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: AppTheme.textMuted),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const Divider(color: AppTheme.border, height: 24),

                  const Text(
                    'Select a direct template below to launch WhatsApp instantly with personalized lead details:',
                    style: AppTheme.bodySecondary,
                  ),
                  const SizedBox(height: 14),

                  // Template Cards List
                  Expanded(
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: WhatsAppService.defaultTemplates.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 10),
                      itemBuilder: (context, idx) {
                        final tmpl = WhatsAppService.defaultTemplates[idx];
                        final interpolated = WhatsAppService.interpolateTemplate(tmpl.message, lead);

                        return RebelCard(
                          padding: const EdgeInsets.all(14),
                          color: AppTheme.surface,
                          borderColor: AppTheme.border,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF22C55E).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Icon(Icons.chat_rounded, color: Color(0xFF22C55E), size: 16),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          tmpl.name,
                                          style: const TextStyle(
                                            color: AppTheme.textPrimary,
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          tmpl.purpose,
                                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                        ),
                                      ],
                                    ),
                                  ),
                                  ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF22C55E),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onPressed: () async {
                                      Navigator.pop(ctx);
                                      await WhatsAppService.launchTemplate(
                                        context: context,
                                        lead: lead,
                                        template: tmpl,
                                      );
                                    },
                                    child: const Text('Send', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppTheme.surfaceAlt,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppTheme.border.withOpacity(0.5)),
                                ),
                                child: Text(
                                  interpolated,
                                  style: const TextStyle(
                                    color: AppTheme.textSecondary,
                                    fontSize: 12,
                                    height: 1.4,
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  // Add Lead Modal Sheet
  void _showAddLeadSheet() {
    final nameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final programCtrl = TextEditingController(text: 'Kids Coaching');
    final messageCtrl = TextEditingController();
    String selectedBranch = 'kadavanthra';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (sheetContext, setModalState) => Padding(
          padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Add Website Enquiry / Walk-In', style: AppTheme.sectionTitle),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textMuted),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(hintText: 'Lead Name *'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(hintText: 'Phone (+91 98765 43210) *'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailCtrl,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(hintText: 'Email address (optional)'),
              ),
              const SizedBox(height: 10),
              // Centre selection
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceAlt,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.border),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: selectedBranch,
                    dropdownColor: AppTheme.surfaceElevated,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem(value: 'kadavanthra', child: Text('Kadavanthra Centre')),
                      DropdownMenuItem(value: 'kumbalanghi', child: Text('Kumbalanghi Centre')),
                      DropdownMenuItem(value: 'maradu', child: Text('Maradu Centre')),
                      DropdownMenuItem(value: 'palluruthy', child: Text('Palluruthy Centre')),
                      DropdownMenuItem(value: 'chullikal', child: Text('Chullikal Centre')),
                    ],
                    onChanged: (val) {
                      if (val != null) setModalState(() => selectedBranch = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: programCtrl,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(hintText: 'Program / Enquiry Details'),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: messageCtrl,
                maxLines: 2,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(hintText: 'Notes / Query details'),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: RebelButton(
                  label: 'Save Lead',
                  onPressed: () async {
                    if (nameCtrl.text.trim().isEmpty || phoneCtrl.text.trim().isEmpty) {
                      RebelToast.showError(context, 'Name and Phone are mandatory.');
                      return;
                    }
                    Navigator.pop(ctx);
                    try {
                      await _client.dio.post(ApiEndpoints.leads, data: {
                        'name': nameCtrl.text.trim(),
                        'phone': phoneCtrl.text.trim(),
                        'email': emailCtrl.text.trim(),
                        'branch': selectedBranch,
                        'program': programCtrl.text.trim(),
                        'message': messageCtrl.text.trim(),
                      });
                      RebelToast.showSuccess(context, 'Lead added successfully.');
                      _fetchLeads();
                    } catch (_) {
                      RebelToast.showError(context, 'Failed to save lead.');
                    }
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Update Status Modal
  void _showStatusDialog(dynamic lead) {
    final statuses = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'TRIAL', 'CONVERTED', 'CLOSED'];
    showDialog(
      context: context,
      builder: (ctx) => SimpleDialog(
        backgroundColor: AppTheme.surfaceElevated,
        title: const Text('Change Lead Status', style: AppTheme.sectionTitle),
        children: statuses.map((st) {
          final isCurrent = (lead['status'] ?? 'NEW').toString().toUpperCase() == st;
          return SimpleDialogOption(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                await _client.dio.put(
                  ApiEndpoints.lead(lead['id']),
                  data: {'status': st},
                );
                setState(() {
                  lead['status'] = st;
                  if (_selectedLead != null && _selectedLead['id'] == lead['id']) {
                    _selectedLead['status'] = st;
                  }
                });
                RebelToast.showSuccess(context, 'Status updated to $st');
                _fetchLeads();
              } catch (_) {
                RebelToast.showError(context, 'Failed to update status.');
              }
            },
            child: Row(
              children: [
                RebelStatusBadge(label: st.replaceAll('_', ' '), color: _getStatusColor(st)),
                const Spacer(),
                if (isCurrent) const Icon(Icons.check, color: AppTheme.primary, size: 18),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  // Add Note Modal
  void _showAddNoteDialog(dynamic lead) {
    final noteCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceElevated,
        title: const Text('Add Internal Note', style: AppTheme.sectionTitle),
        content: TextField(
          controller: noteCtrl,
          maxLines: 3,
          style: const TextStyle(color: AppTheme.textPrimary),
          decoration: const InputDecoration(hintText: 'Enter lead note...'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: AppTheme.onPrimary),
            onPressed: () async {
              final note = noteCtrl.text.trim();
              if (note.isEmpty) return;
              Navigator.pop(ctx);
              try {
                await _client.dio.put(
                  ApiEndpoints.lead(lead['id']),
                  data: {'newNote': note},
                );
                setState(() {
                  final existingNotes = lead['notes']?.toString() ?? '';
                  lead['notes'] = existingNotes.isEmpty ? note : '$existingNotes\n• $note';
                });
                RebelToast.showSuccess(context, 'Note recorded.');
              } catch (_) {
                RebelToast.showError(context, 'Failed to record note.');
              }
            },
            child: const Text('Save Note'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_selectedLead != null) {
      return _buildLeadDetailView(_selectedLead);
    }
    return _buildCrmHomeView();
  }

  /// CRM HOME SCREEN
  Widget _buildCrmHomeView() {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header & Subheading
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('CRM', style: AppTheme.pageTitle),
                      const SizedBox(height: 2),
                      const Text(
                        'Manage enquiries across all centres',
                        style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppTheme.primary),
                    onPressed: _fetchLeads,
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Search Bar
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search leads by name, phone, program...',
                onChanged: (_) => setState(_applyLocalFilters),
                onClear: () => setState(_applyLocalFilters),
              ),
              const SizedBox(height: 14),

              // CENTRE CRM OVERVIEW CARDS (Real backend counts)
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _centres.map((centre) {
                    final isSelected = _selectedCentre == centre;
                    final count = _getCentreCount(centre);
                    final displayName = centre == 'ALL' ? 'All Centres' : '${centre[0]}${centre.substring(1).toLowerCase()}';

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCentre = centre;
                            _applyLocalFilters();
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? AppTheme.primary.withOpacity(0.15) : AppTheme.surfaceAlt,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? AppTheme.primary : AppTheme.border,
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                displayName,
                                style: TextStyle(
                                  color: isSelected ? AppTheme.primary : AppTheme.textSecondary,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '$count Leads',
                                style: TextStyle(
                                  color: isSelected ? AppTheme.primary : AppTheme.textPrimary,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 12),

              // STATUS FILTER PILLS
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _statusFilters.map((st) {
                    final isSelected = _selectedStatus == st['key'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: RebelFilterPill(
                        label: st['label']!,
                        isSelected: isSelected,
                        onTap: () {
                          setState(() {
                            _selectedStatus = st['key']!;
                            _applyLocalFilters();
                          });
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 14),

              // LEADS LIST / STATES
              Expanded(
                child: _isLoading
                    ? const RebelLoadingState(message: 'Loading CRM leads...')
                    : _errorMessage != null
                        ? RebelErrorState(message: _errorMessage!, onRetry: _fetchLeads)
                        : _filteredLeads.isEmpty
                            ? const RebelEmptyState(
                                icon: Icons.group_off_outlined,
                                title: 'No leads found',
                                message: 'New website enquiries and walk-ins will appear here.',
                              )
                            : RefreshIndicator(
                                color: AppTheme.primary,
                                backgroundColor: AppTheme.surfaceElevated,
                                onRefresh: _fetchLeads,
                                child: ListView.separated(
                                  itemCount: _filteredLeads.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                                  itemBuilder: (context, index) {
                                    final lead = _filteredLeads[index];
                                    final name = lead['name'] ?? 'Unknown Lead';
                                    final rawPhone = WhatsAppService.resolveForLead(lead);
                                    final centre = (lead['branch'] ?? lead['centre'] ?? 'Kadavanthra').toString().toUpperCase();
                                    final program = (lead['program'] ?? 'Coaching Enquiry').toString();
                                    final status = (lead['status'] ?? 'NEW').toString();
                                    final timeAgo = _formatRelativeTime(lead['submitted_at'] ?? lead['created_at']);
                                    final statusColor = _getStatusColor(status);

                                    return RebelCard(
                                      onTap: () => setState(() => _selectedLead = lead),
                                      padding: const EdgeInsets.all(14),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
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
                                                        fontWeight: FontWeight.w700,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 2),
                                                    Text(
                                                      rawPhone ?? 'No phone provided',
                                                      style: const TextStyle(
                                                        color: AppTheme.textSecondary,
                                                        fontSize: 13,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              Column(
                                                crossAxisAlignment: CrossAxisAlignment.end,
                                                children: [
                                                  RebelStatusBadge(
                                                    label: status.replaceAll('_', ' '),
                                                    color: statusColor,
                                                  ),
                                                  if (timeAgo.isNotEmpty) ...[
                                                    const SizedBox(height: 4),
                                                    Text(
                                                      timeAgo,
                                                      style: const TextStyle(
                                                        color: AppTheme.textMuted,
                                                        fontSize: 11,
                                                      ),
                                                    ),
                                                  ],
                                                ],
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 10),
                                          const Divider(color: AppTheme.border, height: 1),
                                          const SizedBox(height: 8),

                                          // Centre & Program tags + 1-Click WhatsApp Direct button
                                          Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: AppTheme.surfaceAlt,
                                                  borderRadius: BorderRadius.circular(4),
                                                  border: Border.all(color: AppTheme.border),
                                                ),
                                                child: Text(
                                                  centre,
                                                  style: const TextStyle(
                                                    color: AppTheme.textSecondary,
                                                    fontSize: 10,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 6),
                                              Expanded(
                                                child: Text(
                                                  program,
                                                  style: const TextStyle(
                                                    color: AppTheme.textMuted,
                                                    fontSize: 12,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              // 1-Click WhatsApp direct button
                                              InkWell(
                                                onTap: () => _showWhatsAppTemplatesSheet(lead),
                                                borderRadius: BorderRadius.circular(6),
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                                  decoration: BoxDecoration(
                                                    color: const Color(0xFF22C55E).withOpacity(0.15),
                                                    borderRadius: BorderRadius.circular(6),
                                                    border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.4)),
                                                  ),
                                                  child: const Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      Icon(Icons.chat, size: 13, color: Color(0xFF22C55E)),
                                                      SizedBox(width: 4),
                                                      Text(
                                                        'WhatsApp',
                                                        style: TextStyle(
                                                          color: Color(0xFF22C55E),
                                                          fontSize: 11,
                                                          fontWeight: FontWeight.w700,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
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
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.onPrimary,
        elevation: 4,
        onPressed: _showAddLeadSheet,
        icon: const Icon(Icons.add, size: 20),
        label: const Text('Add Lead', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }

  /// LEAD DETAIL VIEW
  Widget _buildLeadDetailView(dynamic lead) {
    final name = lead['name'] ?? 'Lead Contact';
    final resolvedPhone = WhatsAppService.resolveForLead(lead);
    final email = lead['email'] ?? 'No email provided';
    final status = (lead['status'] ?? 'NEW').toString();
    final centre = (lead['branch'] ?? lead['centre'] ?? 'Kadavanthra').toString().toUpperCase();
    final program = lead['program'] ?? 'Kids Coaching';
    final notes = lead['notes'] ?? lead['message'] ?? 'No additional notes provided.';
    final followUp = lead['follow_up_date'] ?? 'None set';
    final createdDate = lead['submitted_at'] ?? lead['created_at'] ?? 'Recent';
    final statusColor = _getStatusColor(status);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: TextButton.icon(
          icon: const Icon(Icons.chevron_left, color: AppTheme.primary, size: 24),
          label: const Text('CRM', style: TextStyle(color: AppTheme.primary, fontSize: 15, fontWeight: FontWeight.w600)),
          onPressed: () => setState(() => _selectedLead = null),
        ),
        leadingWidth: 90,
        title: const Text('Lead Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_note, color: AppTheme.primary),
            onPressed: () => _showAddNoteDialog(lead),
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
                    // Avatar & Lead Header
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
                    GestureDetector(
                      onTap: () => _showStatusDialog(lead),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          RebelStatusBadge(
                            label: status.replaceAll('_', ' '),
                            color: statusColor,
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.edit, size: 14, color: AppTheme.textMuted),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Primary Contact Actions: Call, 1-Click WhatsApp, Email
                    Row(
                      children: [
                        Expanded(
                          child: RebelSecondaryButton(
                            label: 'Call',
                            icon: Icons.phone_outlined,
                            height: 42,
                            onPressed: () {
                              if (resolvedPhone == null || resolvedPhone.trim().isEmpty) {
                                RebelToast.showError(context, 'Phone number is not available for this lead.');
                                return;
                              }
                              LauncherUtils.callPhone(resolvedPhone);
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF22C55E),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              padding: const EdgeInsets.symmetric(horizontal: 10),
                            ),
                            icon: const Icon(Icons.chat, size: 18),
                            label: const Text('WhatsApp', style: TextStyle(fontWeight: FontWeight.w700)),
                            onPressed: () => _showWhatsAppTemplatesSheet(lead),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: RebelSecondaryButton(
                            label: 'Email',
                            icon: Icons.email_outlined,
                            height: 42,
                            onPressed: () => LauncherUtils.sendEmail(email, 'S&A Badminton Academy Enquiry'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Detail Key-Value Card
                    RebelCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Column(
                        children: [
                          _buildDetailRow('Phone', resolvedPhone ?? 'Not Provided'),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Email', email),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Centre', centre),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Program', program),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Follow-up Date', followUp),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Created', createdDate.toString().split('T').first),
                          const Divider(color: AppTheme.border, height: 1),
                          _buildDetailRow('Notes', notes),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Actions: Change Status & Add Note
            RebelBottomActionBar(
              children: [
                RebelSecondaryButton(
                  label: 'Add Note',
                  icon: Icons.note_add_outlined,
                  onPressed: () => _showAddNoteDialog(lead),
                  height: 48,
                ),
                const SizedBox(width: 12),
                RebelButton(
                  label: 'Change Status',
                  icon: Icons.tune,
                  onPressed: () => _showStatusDialog(lead),
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
