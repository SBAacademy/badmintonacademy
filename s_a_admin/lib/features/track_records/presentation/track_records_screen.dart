import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class TrackRecordsScreen extends ConsumerStatefulWidget {
  const TrackRecordsScreen({super.key});

  @override
  ConsumerState<TrackRecordsScreen> createState() => _TrackRecordsScreenState();
}

class _TrackRecordsScreenState extends ConsumerState<TrackRecordsScreen> {
  final ApiClient _client = ApiClient();
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _records = [];
  List<dynamic> _filteredRecords = [];

  String _statusFilter = 'ALL'; // ALL, PUBLISHED, DRAFT
  String _selectedCentre = 'ALL'; // ALL, Kadavanthra, Edappally, Kakkanad

  final List<Map<String, String>> _statusTabs = [
    {'key': 'ALL', 'label': 'All'},
    {'key': 'PUBLISHED', 'label': 'Published'},
    {'key': 'DRAFT', 'label': 'Draft'},
  ];

  final List<String> _centres = ['ALL', 'Kadavanthra', 'Edappally', 'Kakkanad'];

  @override
  void initState() {
    super.initState();
    _fetchTrackRecords();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchTrackRecords() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await _client.dio.get(ApiEndpoints.cms('achievements'));
      final rawItems = (res.data['items'] ?? res.data['data']?['items'] ?? []) as List<dynamic>;

      if (mounted) {
        setState(() {
          _records = rawItems;
          _applyFilters();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load track records. Check network.';
          _isLoading = false;
        });
      }
    }
  }

  void _applyFilters() {
    final query = _searchCtrl.text.trim().toLowerCase();

    _filteredRecords = _records.where((record) {
      final isPublished = record['published'] == true || record['is_published'] == true || record['status'] == 'published';

      if (_statusFilter == 'PUBLISHED' && !isPublished) return false;
      if (_statusFilter == 'DRAFT' && isPublished) return false;

      final centre = (record['centre'] ?? record['branch'] ?? '').toString().toLowerCase();
      if (_selectedCentre != 'ALL' && !centre.contains(_selectedCentre.toLowerCase())) return false;

      if (query.isNotEmpty) {
        final athlete = (record['athlete_name'] ?? record['athleteName'] ?? record['title'] ?? '').toString().toLowerCase();
        final tournament = (record['tournament_name'] ?? record['tournament'] ?? '').toString().toLowerCase();
        final achievement = (record['achievement'] ?? record['title'] ?? '').toString().toLowerCase();
        final category = (record['category'] ?? '').toString().toLowerCase();
        if (!athlete.contains(query) && !tournament.contains(query) && !achievement.contains(query) && !category.contains(query)) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  Future<void> _syncRecordsToBackend(List<dynamic> updatedList) async {
    try {
      await _client.dio.put(
        ApiEndpoints.cms('achievements'),
        data: {'items': updatedList},
      );
      RebelToast.showSuccess(context, 'Website track records updated.');
    } catch (_) {
      RebelToast.showError(context, 'Failed to update track records.');
    }
  }

  Future<void> _deleteRecord(dynamic record) async {
    final confirm = await RebelConfirmationDialog.show(
      context,
      title: 'Delete Track Record?',
      message: 'This tournament achievement will be removed from the public website.',
      confirmLabel: 'Delete',
      isDestructive: true,
    );

    if (confirm != true) return;

    setState(() {
      _records.removeWhere((r) => (r['id'] ?? r['title']) == (record['id'] ?? record['title']));
      _applyFilters();
    });

    await _syncRecordsToBackend(_records);
  }

  Future<void> _togglePublishState(dynamic record) async {
    final currentlyPublished = record['published'] == true || record['is_published'] == true || record['status'] == 'published';
    final newPublished = !currentlyPublished;

    setState(() {
      record['published'] = newPublished;
      record['is_published'] = newPublished;
      record['status'] = newPublished ? 'published' : 'draft';
      _applyFilters();
    });

    await _syncRecordsToBackend(_records);
  }

  void _showRecordFormModal({dynamic existingRecord}) {
    final isEditing = existingRecord != null;
    final athleteCtrl = TextEditingController(text: existingRecord?['athlete_name'] ?? existingRecord?['athleteName'] ?? existingRecord?['name'] ?? '');
    final titleCtrl = TextEditingController(text: existingRecord?['achievement'] ?? existingRecord?['title'] ?? '');
    final tournamentCtrl = TextEditingController(text: existingRecord?['tournament_name'] ?? existingRecord?['tournament'] ?? '');
    final categoryCtrl = TextEditingController(text: existingRecord?['category'] ?? 'Under-17 Singles');
    final positionCtrl = TextEditingController(text: existingRecord?['position'] ?? existingRecord?['result'] ?? 'Gold Medalist');
    final yearCtrl = TextEditingController(text: (existingRecord?['year'] ?? existingRecord?['date'] ?? DateTime.now().year).toString());
    final photoCtrl = TextEditingController(text: existingRecord?['photo'] ?? existingRecord?['image'] ?? '');
    final descCtrl = TextEditingController(text: existingRecord?['description'] ?? '');
    String selectedCentre = existingRecord?['centre'] ?? 'Kadavanthra';
    bool isPublished = existingRecord != null ? (existingRecord['published'] == true || existingRecord['is_published'] == true) : true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setModalState) => Container(
          height: MediaQuery.of(context).size.height * 0.88,
          padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(isEditing ? 'Edit Track Record' : 'Add Tournament Track Record', style: AppTheme.sectionTitle),
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
                        controller: athleteCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Athlete Full Name *'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: titleCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Achievement Title (e.g. State Champion, Gold Medal) *'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: tournamentCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Tournament / Event Name *'),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: categoryCtrl,
                              style: const TextStyle(color: AppTheme.textPrimary),
                              decoration: const InputDecoration(hintText: 'Category (U-15, U-17...)'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: positionCtrl,
                              style: const TextStyle(color: AppTheme.textPrimary),
                              decoration: const InputDecoration(hintText: 'Position / Result'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: yearCtrl,
                              style: const TextStyle(color: AppTheme.textPrimary),
                              decoration: const InputDecoration(hintText: 'Year / Date *'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: AppTheme.surfaceAlt,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppTheme.border),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: selectedCentre,
                                  dropdownColor: AppTheme.surfaceElevated,
                                  isExpanded: true,
                                  items: const [
                                    DropdownMenuItem(value: 'Kadavanthra', child: Text('Kadavanthra')),
                                    DropdownMenuItem(value: 'Edappally', child: Text('Edappally')),
                                    DropdownMenuItem(value: 'Kakkanad', child: Text('Kakkanad')),
                                  ],
                                  onChanged: (val) {
                                    if (val != null) setModalState(() => selectedCentre = val);
                                  },
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: photoCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Athlete / Podium Photo URL (https://...)'),
                        onChanged: (_) => setModalState(() {}),
                      ),
                      const SizedBox(height: 10),

                      if (photoCtrl.text.trim().startsWith('http')) ...[
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            photoCtrl.text.trim(),
                            height: 100,
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                          ),
                        ),
                        const SizedBox(height: 10),
                      ],

                      TextField(
                        controller: descCtrl,
                        maxLines: 2,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Description / Tournament Details'),
                      ),
                      const SizedBox(height: 12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeColor: AppTheme.primary,
                        title: const Text('Publish on Website', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Display achievement on website Hall of Fame & Track Records', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
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
                  label: isEditing ? 'Save Track Record' : 'Add to Website Achievements',
                  onPressed: () async {
                    final athlete = athleteCtrl.text.trim();
                    final title = titleCtrl.text.trim();
                    final tournament = tournamentCtrl.text.trim();
                    if (athlete.isEmpty || title.isEmpty || tournament.isEmpty) {
                      RebelToast.showError(context, 'Athlete, Achievement, and Tournament are required.');
                      return;
                    }

                    Navigator.pop(ctx);

                    if (isEditing) {
                      setState(() {
                        existingRecord['athlete_name'] = athlete;
                        existingRecord['athleteName'] = athlete;
                        existingRecord['achievement'] = title;
                        existingRecord['title'] = title;
                        existingRecord['tournament_name'] = tournament;
                        existingRecord['tournament'] = tournament;
                        existingRecord['category'] = categoryCtrl.text.trim();
                        existingRecord['position'] = positionCtrl.text.trim();
                        existingRecord['result'] = positionCtrl.text.trim();
                        existingRecord['year'] = yearCtrl.text.trim();
                        existingRecord['date'] = yearCtrl.text.trim();
                        existingRecord['photo'] = photoCtrl.text.trim();
                        existingRecord['image'] = photoCtrl.text.trim();
                        existingRecord['centre'] = selectedCentre;
                        existingRecord['description'] = descCtrl.text.trim();
                        existingRecord['published'] = isPublished;
                        existingRecord['is_published'] = isPublished;
                        existingRecord['status'] = isPublished ? 'published' : 'draft';
                        _applyFilters();
                      });
                    } else {
                      final newRecord = {
                        'id': 'ach-${DateTime.now().millisecondsSinceEpoch}',
                        'athlete_name': athlete,
                        'athleteName': athlete,
                        'achievement': title,
                        'title': title,
                        'tournament_name': tournament,
                        'tournament': tournament,
                        'category': categoryCtrl.text.trim(),
                        'position': positionCtrl.text.trim(),
                        'result': positionCtrl.text.trim(),
                        'year': yearCtrl.text.trim(),
                        'date': yearCtrl.text.trim(),
                        'photo': photoCtrl.text.trim(),
                        'image': photoCtrl.text.trim(),
                        'centre': selectedCentre,
                        'description': descCtrl.text.trim(),
                        'published': isPublished,
                        'is_published': isPublished,
                        'status': isPublished ? 'published' : 'draft',
                      };
                      setState(() {
                        _records.insert(0, newRecord);
                        _applyFilters();
                      });
                    }

                    await _syncRecordsToBackend(_records);
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
                      const Text('Track Records', style: AppTheme.pageTitle),
                      const SizedBox(height: 2),
                      Text(
                        '${_filteredRecords.length} tournament achievements on website',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppTheme.primary),
                    onPressed: _fetchTrackRecords,
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Search Bar
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search athlete, tournament, achievement...',
                onChanged: (_) => setState(_applyFilters),
                onClear: () => setState(_applyFilters),
              ),
              const SizedBox(height: 12),

              // Status Filter Tabs & Centre Pills
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
              const SizedBox(height: 8),

              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _centres.map((centre) {
                    final isSelected = _selectedCentre == centre;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: RebelFilterPill(
                        label: centre == 'ALL' ? 'All Centres' : centre,
                        isSelected: isSelected,
                        onTap: () {
                          setState(() {
                            _selectedCentre = centre;
                            _applyFilters();
                          });
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 14),

              // Track Records List
              Expanded(
                child: _isLoading
                    ? const RebelLoadingState(message: 'Loading track records...')
                    : _errorMessage != null
                        ? RebelErrorState(message: _errorMessage!, onRetry: _fetchTrackRecords)
                        : _filteredRecords.isEmpty
                            ? const RebelEmptyState(
                                icon: Icons.emoji_events_outlined,
                                title: 'No track records found',
                                message: 'Tap + to add tournament achievements and medals.',
                              )
                            : RefreshIndicator(
                                color: AppTheme.primary,
                                backgroundColor: AppTheme.surfaceElevated,
                                onRefresh: _fetchTrackRecords,
                                child: ListView.separated(
                                  padding: const EdgeInsets.only(bottom: 80),
                                  itemCount: _filteredRecords.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                                  itemBuilder: (context, index) {
                                    final item = _filteredRecords[index];
                                    final athlete = item['athlete_name'] ?? item['athleteName'] ?? item['name'] ?? 'Athlete';
                                    final title = item['achievement'] ?? item['title'] ?? 'Champion';
                                    final tournament = item['tournament_name'] ?? item['tournament'] ?? 'Badminton Championship';
                                    final result = item['position'] ?? item['result'] ?? 'Gold';
                                    final category = item['category'] ?? 'Junior';
                                    final year = item['year'] ?? item['date'] ?? '2026';
                                    final centre = item['centre'] ?? 'Kadavanthra';
                                    final isPublished = item['published'] == true || item['is_published'] == true || item['status'] == 'published';

                                    return RebelCard(
                                      onTap: () => _showRecordFormModal(existingRecord: item),
                                      padding: const EdgeInsets.all(14),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.all(10),
                                                decoration: BoxDecoration(
                                                  color: AppTheme.statusFollowUp.withOpacity(0.15),
                                                  borderRadius: BorderRadius.circular(10),
                                                ),
                                                child: const Icon(Icons.emoji_events, color: AppTheme.statusFollowUp, size: 22),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      athlete,
                                                      style: const TextStyle(
                                                        color: AppTheme.textPrimary,
                                                        fontSize: 16,
                                                        fontWeight: FontWeight.w700,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 2),
                                                    Text(
                                                      title,
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
                                            '$tournament • $category',
                                            style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                                          ),
                                          const SizedBox(height: 8),

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
                                                  centre.toString().toUpperCase(),
                                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 10, fontWeight: FontWeight.w700),
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                '$result ($year)',
                                                style: const TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600),
                                              ),
                                              const Spacer(),
                                              IconButton(
                                                icon: Icon(
                                                  isPublished ? Icons.visibility : Icons.visibility_off,
                                                  size: 18,
                                                  color: isPublished ? AppTheme.primary : AppTheme.textMuted,
                                                ),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _togglePublishState(item),
                                              ),
                                              const SizedBox(width: 12),
                                              IconButton(
                                                icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.danger),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _deleteRecord(item),
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
        onPressed: () => _showRecordFormModal(),
        icon: const Icon(Icons.add_circle_outline, size: 20),
        label: const Text('Add Record', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}
