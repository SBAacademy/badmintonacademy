import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class CmsScreen extends StatefulWidget {
  const CmsScreen({super.key});

  @override
  State<CmsScreen> createState() => _CmsScreenState();
}

class _CmsScreenState extends State<CmsScreen> {
  final ApiClient _client = ApiClient();
  String? _activeCategory; // Non-null shows category items
  bool _isLoading = false;
  List<dynamic> _items = [];

  final List<Map<String, dynamic>> _categories = [
    {
      'slug': 'blog',
      'title': 'Blog',
      'description': 'Manage blog posts',
      'icon': Icons.article_outlined,
      'color': AppTheme.statusTrial,
    },
    {
      'slug': 'gallery',
      'title': 'Gallery',
      'description': 'Manage photos and albums',
      'icon': Icons.photo_library_outlined,
      'color': AppTheme.statusNew,
    },
    {
      'slug': 'testimonials',
      'title': 'Testimonials',
      'description': 'Manage testimonials',
      'icon': Icons.rate_review_outlined,
      'color': Color(0xFF60A5FA),
    },
    {
      'slug': 'achievements',
      'title': 'Achievements',
      'description': 'Manage achievements',
      'icon': Icons.emoji_events_outlined,
      'color': AppTheme.statusFollowUp,
    },
    {
      'slug': 'announcements',
      'title': 'Announcements',
      'description': 'Manage announcements',
      'icon': Icons.campaign_outlined,
      'color': AppTheme.statusLate,
    },
    {
      'slug': 'content',
      'title': 'Website Content',
      'description': 'Update website content',
      'icon': Icons.language_rounded,
      'color': AppTheme.statusPresent,
    },
  ];

  Future<void> _fetchCategoryItems(String slug) async {
    setState(() {
      _activeCategory = slug;
      _isLoading = true;
    });

    try {
      final res = await _client.dio.get(ApiEndpoints.cms(slug));
      if (mounted) {
        setState(() {
          _items = res.data['data']?['items'] ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_activeCategory != null) {
      return _buildCategoryDetailView(_activeCategory!);
    }

    return _buildCmsHubView();
  }

  /// Screen 14: CMS Category Hub matching reference mockup
  Widget _buildCmsHubView() {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header title matching Screen 14
              const Text('CMS', style: AppTheme.pageTitle),
              const SizedBox(height: 16),

              Expanded(
                child: ListView.separated(
                  itemCount: _categories.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final color = cat['color'] as Color;

                    return RebelCard(
                      onTap: () => _fetchCategoryItems(cat['slug']),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: color.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(cat['icon'] as IconData, color: color, size: 20),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  cat['title'],
                                  style: const TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  cat['description'],
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
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryDetailView(String slug) {
    final cat = _categories.firstWhere((c) => c['slug'] == slug);

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: TextButton.icon(
          icon: const Icon(Icons.chevron_left, color: AppTheme.primary, size: 24),
          label: const Text('CMS', style: TextStyle(color: AppTheme.primary, fontSize: 15, fontWeight: FontWeight.w600)),
          onPressed: () => setState(() => _activeCategory = null),
        ),
        leadingWidth: 90,
        title: Text(cat['title']),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: AppTheme.primary),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Adding new ${cat["title"]} entry...'),
                  backgroundColor: AppTheme.surfaceElevated,
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary))
            : _items.isEmpty
                ? RebelEmptyState(
                    icon: cat['icon'] as IconData,
                    title: 'No ${cat["title"]} entries yet',
                    message: 'Published content will appear here.',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = _items[index];
                      final title = item['title'] ?? item['author'] ?? item['tournament_name'] ?? 'Entry ${index + 1}';
                      final subtitle = item['role'] ?? item['category'] ?? item['published_at'] ?? 'Published';

                      return RebelCard(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    title.toString(),
                                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15, fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    subtitle.toString(),
                                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            const Icon(Icons.edit_outlined, size: 18, color: AppTheme.primary),
                          ],
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
