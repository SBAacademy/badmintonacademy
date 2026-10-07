import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class ReviewsScreen extends ConsumerStatefulWidget {
  const ReviewsScreen({super.key});

  @override
  ConsumerState<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends ConsumerState<ReviewsScreen> {
  final ApiClient _client = ApiClient();
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _reviews = [];
  List<dynamic> _filteredReviews = [];

  String _statusFilter = 'ALL'; // ALL, PENDING, APPROVED, PUBLISHED, REJECTED
  String _selectedCentre = 'ALL'; // ALL, Kadavanthra, Kumbalanghi, Maradu, Palluruthy, Chullikal
  String _selectedSource = 'ALL'; // ALL, Google, Website

  final List<String> _centres = ['ALL', 'Kadavanthra', 'Kumbalanghi', 'Maradu', 'Palluruthy', 'Chullikal'];
  final List<String> _sources = ['ALL', 'Google', 'Website'];

  final List<Map<String, String>> _statusTabs = [
    {'key': 'ALL', 'label': 'All'},
    {'key': 'PENDING', 'label': 'Pending'},
    {'key': 'APPROVED', 'label': 'Approved'},
    {'key': 'PUBLISHED', 'label': 'Published'},
    {'key': 'REJECTED', 'label': 'Rejected'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchReviews();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchReviews() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await _client.dio.get(ApiEndpoints.cms('testimonials'));
      final rawItems = (res.data['items'] ?? res.data['data']?['items'] ?? []) as List<dynamic>;

      if (mounted) {
        setState(() {
          _reviews = rawItems;
          _applyFilters();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load website reviews. Check connection.';
          _isLoading = false;
        });
      }
    }
  }

  void _applyFilters() {
    final query = _searchCtrl.text.trim().toLowerCase();

    _filteredReviews = _reviews.where((rev) {
      final status = _normalizeStatus(rev);

      if (_statusFilter != 'ALL' && status != _statusFilter) return false;

      final centre = (rev['centre'] ?? rev['branch'] ?? '').toString().toLowerCase();
      if (_selectedCentre != 'ALL' && !centre.contains(_selectedCentre.toLowerCase())) return false;

      final src = (rev['source'] ?? 'Website').toString().toLowerCase();
      if (_selectedSource != 'ALL' && !src.contains(_selectedSource.toLowerCase())) return false;

      if (query.isNotEmpty) {
        final name = (rev['name'] ?? rev['author'] ?? rev['reviewer'] ?? '').toString().toLowerCase();
        final text = (rev['text'] ?? rev['review'] ?? rev['comment'] ?? '').toString().toLowerCase();
        if (!name.contains(query) && !text.contains(query)) return false;
      }

      return true;
    }).toList();
  }

  String _normalizeStatus(dynamic rev) {
    if (rev == null || rev is! Map) return 'PUBLISHED';
    final st = (rev['status'] ?? '').toString().toUpperCase();
    if (st.isNotEmpty) return st;
    if (rev['published'] == true || rev['is_published'] == true) return 'PUBLISHED';
    return 'APPROVED';
  }

  int get _totalCount => _reviews.length;
  int get _publishedCount => _reviews.where((r) => _normalizeStatus(r) == 'PUBLISHED').length;
  int get _pendingCount => _reviews.where((r) => _normalizeStatus(r) == 'PENDING').length;

  Future<void> _syncReviewsToBackend(List<dynamic> updatedList) async {
    try {
      await _client.dio.put(
        ApiEndpoints.cms('testimonials'),
        data: {'items': updatedList},
      );
      RebelToast.showSuccess(context, 'Website reviews updated.');
    } catch (_) {
      RebelToast.showError(context, 'Failed to update reviews.');
    }
  }

  Future<void> _updateReviewStatus(dynamic rev, String newStatus) async {
    setState(() {
      rev['status'] = newStatus;
      rev['published'] = (newStatus == 'PUBLISHED');
      rev['is_published'] = (newStatus == 'PUBLISHED');
      _applyFilters();
    });

    await _syncReviewsToBackend(_reviews);
  }

  Future<void> _deleteReview(dynamic rev) async {
    final confirm = await RebelConfirmationDialog.show(
      context,
      title: 'Delete Review?',
      message: 'This review will be permanently deleted from the website.',
      confirmLabel: 'Delete',
      isDestructive: true,
    );

    if (confirm != true) return;

    setState(() {
      _reviews.removeWhere((r) => (r['id'] ?? r['name']) == (rev['id'] ?? rev['name']));
      _applyFilters();
    });

    await _syncReviewsToBackend(_reviews);
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PUBLISHED':
        return AppTheme.statusPresent;
      case 'APPROVED':
        return AppTheme.statusNew;
      case 'PENDING':
        return AppTheme.statusFollowUp;
      case 'REJECTED':
        return AppTheme.statusAbsent;
      default:
        return AppTheme.textSecondary;
    }
  }

  void _showReviewDetailModal(dynamic rev) {
    final name = rev['name'] ?? rev['author'] ?? rev['reviewer'] ?? 'Website Customer';
    final text = rev['text'] ?? rev['review'] ?? rev['comment'] ?? 'No text provided.';
    final rating = int.tryParse((rev['rating'] ?? 5).toString()) ?? 5;
    final centre = rev['centre'] ?? rev['branch'] ?? 'All Centres';
    final source = rev['source'] ?? 'Website';
    final date = (rev['date'] ?? rev['created_at'] ?? 'Recent').toString().split('T').first;
    final status = _normalizeStatus(rev);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setModalState) => Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Review Details & Moderation', style: AppTheme.sectionTitle),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppTheme.textMuted),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  RebelAvatar(name: name, radius: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 2),
                        Text('$centre • Source: $source', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                      ],
                    ),
                  ),
                  RebelStatusBadge(label: status, color: _getStatusColor(status)),
                ],
              ),
              const SizedBox(height: 12),

              // Star Rating
              Row(
                children: List.generate(5, (i) {
                  return Icon(
                    i < rating ? Icons.star : Icons.star_border,
                    color: const Color(0xFFFBBF24),
                    size: 20,
                  );
                }),
              ),
              const SizedBox(height: 12),

              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.surfaceAlt,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppTheme.border),
                ),
                child: Text(
                  text,
                  style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, height: 1.5),
                ),
              ),
              const SizedBox(height: 10),
              Text('Date: $date', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              const SizedBox(height: 20),

              // Moderation Action Buttons: Approve, Publish, Unpublish, Reject
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.statusPresent, foregroundColor: Colors.black),
                    icon: const Icon(Icons.cloud_upload_outlined, size: 16),
                    label: const Text('Publish Live', style: TextStyle(fontWeight: FontWeight.w700)),
                    onPressed: () async {
                      Navigator.pop(ctx);
                      await _updateReviewStatus(rev, 'PUBLISHED');
                    },
                  ),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.statusNew, foregroundColor: Colors.black),
                    icon: const Icon(Icons.check_circle_outline, size: 16),
                    label: const Text('Approve', style: TextStyle(fontWeight: FontWeight.w700)),
                    onPressed: () async {
                      Navigator.pop(ctx);
                      await _updateReviewStatus(rev, 'APPROVED');
                    },
                  ),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(foregroundColor: AppTheme.textSecondary, side: const BorderSide(color: AppTheme.border)),
                    icon: const Icon(Icons.cloud_off_outlined, size: 16),
                    label: const Text('Unpublish'),
                    onPressed: () async {
                      Navigator.pop(ctx);
                      await _updateReviewStatus(rev, 'APPROVED');
                    },
                  ),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(foregroundColor: AppTheme.danger, side: const BorderSide(color: AppTheme.danger)),
                    icon: const Icon(Icons.cancel_outlined, size: 16),
                    label: const Text('Reject'),
                    onPressed: () async {
                      Navigator.pop(ctx);
                      await _updateReviewStatus(rev, 'REJECTED');
                    },
                  ),
                ],
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
                      const Text('Reviews', style: AppTheme.pageTitle),
                      const SizedBox(height: 2),
                      const Text(
                        'Monitor testimonials and social proof on website',
                        style: TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppTheme.primary),
                    onPressed: _fetchReviews,
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // REVIEW DASHBOARD STATS (Real values)
              Row(
                children: [
                  Expanded(
                    child: RebelMetricCard(
                      title: 'Total Reviews',
                      value: '$_totalCount',
                      icon: Icons.rate_review_outlined,
                      accentColor: AppTheme.statusNew,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: RebelMetricCard(
                      title: 'Published',
                      value: '$_publishedCount',
                      icon: Icons.check_circle_outline,
                      accentColor: AppTheme.statusPresent,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: RebelMetricCard(
                      title: 'Pending Review',
                      value: '$_pendingCount',
                      icon: Icons.pending_actions_outlined,
                      accentColor: AppTheme.statusFollowUp,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Search
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search reviewer name or review text...',
                onChanged: (_) => setState(_applyFilters),
                onClear: () => setState(_applyFilters),
              ),
              const SizedBox(height: 10),

              // Status Filter Tabs
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
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
              ),
              const SizedBox(height: 8),

              // Centre & Source Filter Pills
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    ..._centres.map((c) {
                      final isSelected = _selectedCentre == c;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: RebelFilterPill(
                          label: c == 'ALL' ? 'All Centres' : c,
                          isSelected: isSelected,
                          onTap: () {
                            setState(() {
                              _selectedCentre = c;
                              _applyFilters();
                            });
                          },
                        ),
                      );
                    }),
                    const SizedBox(width: 8),
                    ..._sources.map((s) {
                      final isSelected = _selectedSource == s;
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: RebelFilterPill(
                          label: s == 'ALL' ? 'All Sources' : s,
                          isSelected: isSelected,
                          onTap: () {
                            setState(() {
                              _selectedSource = s;
                              _applyFilters();
                            });
                          },
                        ),
                      );
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Reviews List
              Expanded(
                child: _isLoading
                    ? const RebelLoadingState(message: 'Loading customer reviews...')
                    : _errorMessage != null
                        ? RebelErrorState(message: _errorMessage!, onRetry: _fetchReviews)
                        : _filteredReviews.isEmpty
                            ? const RebelEmptyState(
                                icon: Icons.rate_review_outlined,
                                title: 'No reviews found',
                                message: 'Customer testimonials submitted online will appear here.',
                              )
                            : RefreshIndicator(
                                color: AppTheme.primary,
                                backgroundColor: AppTheme.surfaceElevated,
                                onRefresh: _fetchReviews,
                                child: ListView.separated(
                                  padding: const EdgeInsets.only(bottom: 24),
                                  itemCount: _filteredReviews.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                                  itemBuilder: (context, index) {
                                    final rev = _filteredReviews[index];
                                    final name = rev['name'] ?? rev['author'] ?? rev['reviewer'] ?? 'Website Customer';
                                    final text = rev['text'] ?? rev['review'] ?? rev['comment'] ?? 'No text provided.';
                                    final rating = int.tryParse((rev['rating'] ?? 5).toString()) ?? 5;
                                    final centre = rev['centre'] ?? rev['branch'] ?? 'Kadavanthra';
                                    final source = rev['source'] ?? 'Website';
                                    final status = _normalizeStatus(rev);

                                    return RebelCard(
                                      onTap: () => _showReviewDetailModal(rev),
                                      padding: const EdgeInsets.all(14),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              RebelAvatar(name: name, radius: 18),
                                              const SizedBox(width: 10),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      name,
                                                      style: const TextStyle(
                                                        color: AppTheme.textPrimary,
                                                        fontSize: 14,
                                                        fontWeight: FontWeight.w700,
                                                      ),
                                                    ),
                                                    Text(
                                                      '$centre • $source',
                                                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              RebelStatusBadge(
                                                label: status,
                                                color: _getStatusColor(status),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 8),

                                          // Stars
                                          Row(
                                            children: List.generate(5, (i) {
                                              return Icon(
                                                i < rating ? Icons.star : Icons.star_border,
                                                color: const Color(0xFFFBBF24),
                                                size: 16,
                                              );
                                            }),
                                          ),
                                          const SizedBox(height: 6),

                                          Text(
                                            text,
                                            style: const TextStyle(
                                              color: AppTheme.textSecondary,
                                              fontSize: 13,
                                              height: 1.4,
                                            ),
                                            maxLines: 3,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 10),

                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.end,
                                            children: [
                                              TextButton(
                                                style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(60, 30)),
                                                onPressed: () => _showReviewDetailModal(rev),
                                                child: const Text('Moderate', style: TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                                              ),
                                              const SizedBox(width: 12),
                                              IconButton(
                                                icon: const Icon(Icons.delete_outline, size: 16, color: AppTheme.danger),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _deleteReview(rev),
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
    );
  }
}
