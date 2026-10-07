import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class CoachesScreen extends ConsumerStatefulWidget {
  const CoachesScreen({super.key});

  @override
  ConsumerState<CoachesScreen> createState() => _CoachesScreenState();
}

class _CoachesScreenState extends ConsumerState<CoachesScreen> {
  final ApiClient _client = ApiClient();
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _coaches = [];
  List<dynamic> _filteredCoaches = [];

  String _statusFilter = 'ALL'; // ALL, PUBLISHED, DRAFT

  final List<Map<String, String>> _statusTabs = [
    {'key': 'ALL', 'label': 'All'},
    {'key': 'PUBLISHED', 'label': 'Published'},
    {'key': 'DRAFT', 'label': 'Draft'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchCoaches();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchCoaches() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await _client.dio.get(ApiEndpoints.cms('coaches'));
      final rawItems = (res.data['items'] ?? res.data['data']?['items'] ?? []) as List<dynamic>;

      if (mounted) {
        setState(() {
          _coaches = rawItems;
          _applyFilters();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load website coaches. Please check network.';
          _isLoading = false;
        });
      }
    }
  }

  void _applyFilters() {
    final query = _searchCtrl.text.trim().toLowerCase();

    _filteredCoaches = _coaches.where((coach) {
      final isPublished = coach['published'] == true || coach['is_published'] == true || coach['status'] == 'published';

      if (_statusFilter == 'PUBLISHED' && !isPublished) return false;
      if (_statusFilter == 'DRAFT' && isPublished) return false;

      if (query.isNotEmpty) {
        final name = (coach['name'] ?? '').toString().toLowerCase();
        final role = (coach['role'] ?? '').toString().toLowerCase();
        final spec = (coach['specialization'] ?? '').toString().toLowerCase();
        final bio = (coach['bio'] ?? coach['short_bio'] ?? '').toString().toLowerCase();
        if (!name.contains(query) && !role.contains(query) && !spec.contains(query) && !bio.contains(query)) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  Future<void> _syncCoachesToBackend(List<dynamic> updatedList) async {
    try {
      await _client.dio.put(
        ApiEndpoints.cms('coaches'),
        data: {'items': updatedList},
      );
      RebelToast.showSuccess(context, 'Website coaches updated.');
    } catch (_) {
      RebelToast.showError(context, 'Failed to sync coaches to website.');
    }
  }

  Future<void> _deleteCoach(dynamic coach) async {
    final confirm = await RebelConfirmationDialog.show(
      context,
      title: 'Remove Coach Profile?',
      message: 'This will remove "${coach['name']}" from the public website coach directory.',
      confirmLabel: 'Delete',
      isDestructive: true,
    );

    if (confirm != true) return;

    setState(() {
      _coaches.removeWhere((c) => (c['id'] ?? c['name']) == (coach['id'] ?? coach['name']));
      _applyFilters();
    });

    await _syncCoachesToBackend(_coaches);
  }

  Future<void> _togglePublishState(dynamic coach) async {
    final currentlyPublished = coach['published'] == true || coach['is_published'] == true || coach['status'] == 'published';
    final newPublished = !currentlyPublished;

    setState(() {
      coach['published'] = newPublished;
      coach['is_published'] = newPublished;
      coach['status'] = newPublished ? 'published' : 'draft';
      _applyFilters();
    });

    await _syncCoachesToBackend(_coaches);
  }

  void _showCoachFormModal({dynamic existingCoach}) {
    final isEditing = existingCoach != null;
    final nameCtrl = TextEditingController(text: existingCoach?['name'] ?? '');
    final roleCtrl = TextEditingController(text: existingCoach?['role'] ?? 'Badminton Coach');
    final photoCtrl = TextEditingController(text: existingCoach?['photo'] ?? existingCoach?['image'] ?? '');
    final bioCtrl = TextEditingController(text: existingCoach?['bio'] ?? existingCoach?['short_bio'] ?? '');
    final specCtrl = TextEditingController(text: existingCoach?['specialization'] ?? 'Singles Strategy & Footwork');
    final centresCtrl = TextEditingController(text: (existingCoach?['centres'] is List) ? (existingCoach['centres'] as List).join(', ') : (existingCoach?['centres'] ?? 'Kadavanthra, Kumbalanghi'));
    final orderCtrl = TextEditingController(text: (existingCoach?['display_order'] ?? existingCoach?['order'] ?? '1').toString());
    bool isPublished = existingCoach != null ? (existingCoach['published'] == true || existingCoach['is_published'] == true) : true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setModalState) => Container(
          height: MediaQuery.of(context).size.height * 0.85,
          padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(isEditing ? 'Edit Coach Profile' : 'Add Coach to Website', style: AppTheme.sectionTitle),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textMuted),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      TextField(
                        controller: nameCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Coach Full Name *'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: roleCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Role (e.g. Head Coach, Senior Coach) *'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: photoCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Profile Photo URL (https://...)'),
                        onChanged: (_) => setModalState(() {}),
                      ),
                      const SizedBox(height: 10),

                      if (photoCtrl.text.trim().startsWith('http')) ...[
                        CircleAvatar(
                          radius: 36,
                          backgroundImage: NetworkImage(photoCtrl.text.trim()),
                          backgroundColor: AppTheme.surfaceAlt,
                        ),
                        const SizedBox(height: 10),
                      ],

                      TextField(
                        controller: specCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Specialization (e.g. Advanced Footwork, Smash Power)'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: centresCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Centre(s) (e.g. Kadavanthra, Kumbalanghi)'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: bioCtrl,
                        maxLines: 3,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Short Bio / Accreditations for Website *'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: orderCtrl,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Display Order (1, 2, 3...)'),
                      ),
                      const SizedBox(height: 12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeColor: AppTheme.primary,
                        title: const Text('Publish on Website', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Show coach profile on public coaching faculty section', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                        value: isPublished,
                        onChanged: (val) => setModalState(() => isPublished = val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: RebelButton(
                  label: isEditing ? 'Save Coach Changes' : 'Add Coach to Faculty',
                  onPressed: () async {
                    final name = nameCtrl.text.trim();
                    final role = roleCtrl.text.trim();
                    if (name.isEmpty || role.isEmpty) {
                      RebelToast.showError(context, 'Name and Role are mandatory.');
                      return;
                    }

                    Navigator.pop(ctx);

                    final centresList = centresCtrl.text.split(',').map((c) => c.trim()).where((c) => c.isNotEmpty).toList();

                    if (isEditing) {
                      setState(() {
                        existingCoach['name'] = name;
                        existingCoach['role'] = role;
                        existingCoach['photo'] = photoCtrl.text.trim();
                        existingCoach['image'] = photoCtrl.text.trim();
                        existingCoach['bio'] = bioCtrl.text.trim();
                        existingCoach['short_bio'] = bioCtrl.text.trim();
                        existingCoach['specialization'] = specCtrl.text.trim();
                        existingCoach['centres'] = centresList;
                        existingCoach['display_order'] = int.tryParse(orderCtrl.text.trim()) ?? 1;
                        existingCoach['published'] = isPublished;
                        existingCoach['is_published'] = isPublished;
                        existingCoach['status'] = isPublished ? 'published' : 'draft';
                        _applyFilters();
                      });
                    } else {
                      final newCoach = {
                        'id': 'coach-${DateTime.now().millisecondsSinceEpoch}',
                        'name': name,
                        'role': role,
                        'photo': photoCtrl.text.trim(),
                        'image': photoCtrl.text.trim(),
                        'bio': bioCtrl.text.trim(),
                        'short_bio': bioCtrl.text.trim(),
                        'specialization': specCtrl.text.trim(),
                        'centres': centresList,
                        'display_order': int.tryParse(orderCtrl.text.trim()) ?? (_coaches.length + 1),
                        'published': isPublished,
                        'is_published': isPublished,
                        'status': isPublished ? 'published' : 'draft',
                      };
                      setState(() {
                        _coaches.insert(0, newCoach);
                        _applyFilters();
                      });
                    }

                    await _syncCoachesToBackend(_coaches);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Coaches', style: AppTheme.pageTitle),
                      const SizedBox(height: 2),
                      Text(
                        '${_filteredCoaches.length} faculty profiles on public website',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppTheme.primary),
                    onPressed: _fetchCoaches,
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Search Bar
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search coaches by name, specialization...',
                onChanged: (_) => setState(_applyFilters),
                onClear: () => setState(_applyFilters),
              ),
              const SizedBox(height: 12),

              // Status Filter Tabs
              Row(
                children: _statusTabs.map((tab) {
                  final isSelected = _statusFilter == tab['key'];
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: RebelFilterPill(
                      label: tab['label']!,
                      isSelected: isSelected,
                      onTap: () {
                        setState(() {
                          _statusFilter = tab['key']!;
                          _applyFilters();
                        });
                      },
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),

              // Coaches List
              Expanded(
                child: _isLoading
                    ? const RebelLoadingState(message: 'Loading coaching faculty...')
                    : _errorMessage != null
                        ? RebelErrorState(message: _errorMessage!, onRetry: _fetchCoaches)
                        : _filteredCoaches.isEmpty
                            ? const RebelEmptyState(
                                icon: Icons.sports_tennis_outlined,
                                title: 'No coaches listed',
                                message: 'Tap + to add coaching faculty profiles.',
                              )
                            : RefreshIndicator(
                                color: AppTheme.primary,
                                backgroundColor: AppTheme.surfaceElevated,
                                onRefresh: _fetchCoaches,
                                child: ListView.separated(
                                  padding: const EdgeInsets.only(bottom: 80),
                                  itemCount: _filteredCoaches.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                                  itemBuilder: (context, index) {
                                    final coach = _filteredCoaches[index];
                                    final name = coach['name'] ?? 'Coach Profile';
                                    final role = coach['role'] ?? 'Badminton Trainer';
                                    final photo = coach['photo'] ?? coach['image'] ?? '';
                                    final bio = coach['bio'] ?? coach['short_bio'] ?? 'Experienced badminton coach.';
                                    final spec = coach['specialization'] ?? '';
                                    final centres = coach['centres'] is List ? (coach['centres'] as List).join(', ') : (coach['centres'] ?? 'All Centres');
                                    final isPublished = coach['published'] == true || coach['is_published'] == true || coach['status'] == 'published';

                                    return RebelCard(
                                      onTap: () => _showCoachFormModal(existingCoach: coach),
                                      padding: const EdgeInsets.all(14),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              RebelAvatar(
                                                name: name,
                                                imageUrl: photo.toString().startsWith('http') ? photo : null,
                                                radius: 26,
                                              ),
                                              const SizedBox(width: 14),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      name,
                                                      style: const TextStyle(
                                                        color: AppTheme.textPrimary,
                                                        fontSize: 16,
                                                        fontWeight: FontWeight.w700,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 2),
                                                    Text(
                                                      role,
                                                      style: const TextStyle(
                                                        color: AppTheme.primary,
                                                        fontSize: 13,
                                                        fontWeight: FontWeight.w600,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              RebelStatusBadge(
                                                label: isPublished ? 'Live' : 'Draft',
                                                color: isPublished ? AppTheme.statusPresent : AppTheme.statusFollowUp,
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 10),

                                          Text(
                                            bio,
                                            style: const TextStyle(
                                              color: AppTheme.textSecondary,
                                              fontSize: 13,
                                              height: 1.4,
                                            ),
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 10),

                                          if (spec.toString().isNotEmpty) ...[
                                            Row(
                                              children: [
                                                const Icon(Icons.verified_outlined, size: 14, color: AppTheme.statusNew),
                                                const SizedBox(width: 6),
                                                Expanded(
                                                  child: Text(
                                                    spec,
                                                    style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 6),
                                          ],

                                          Row(
                                            children: [
                                              const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textMuted),
                                              const SizedBox(width: 6),
                                              Expanded(
                                                child: Text(
                                                  centres,
                                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              IconButton(
                                                icon: Icon(
                                                  isPublished ? Icons.visibility : Icons.visibility_off,
                                                  size: 18,
                                                  color: isPublished ? AppTheme.primary : AppTheme.textMuted,
                                                ),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _togglePublishState(coach),
                                              ),
                                              const SizedBox(width: 12),
                                              IconButton(
                                                icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.danger),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _deleteCoach(coach),
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
        onPressed: () => _showCoachFormModal(),
        icon: const Icon(Icons.person_add_alt_1_outlined, size: 20),
        label: const Text('Add Coach', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}
