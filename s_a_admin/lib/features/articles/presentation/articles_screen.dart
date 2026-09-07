import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class ArticlesScreen extends ConsumerStatefulWidget {
  const ArticlesScreen({super.key});

  @override
  ConsumerState<ArticlesScreen> createState() => _ArticlesScreenState();
}

class _ArticlesScreenState extends ConsumerState<ArticlesScreen> {
  final ApiClient _client = ApiClient();
  final TextEditingController _searchCtrl = TextEditingController();
  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _articles = [];
  List<dynamic> _filteredArticles = [];

  String _statusFilter = 'ALL'; // ALL, PUBLISHED, DRAFT

  final List<Map<String, String>> _statusTabs = [
    {'key': 'ALL', 'label': 'All'},
    {'key': 'PUBLISHED', 'label': 'Published'},
    {'key': 'DRAFT', 'label': 'Draft'},
  ];

  @override
  void initState() {
    super.initState();
    _fetchArticles();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchArticles() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await _client.dio.get(ApiEndpoints.cms('blog'));
      final rawItems = (res.data['items'] ?? res.data['data']?['items'] ?? []) as List<dynamic>;

      if (mounted) {
        setState(() {
          _articles = rawItems;
          _applyFilters();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load website articles. Check connection.';
          _isLoading = false;
        });
      }
    }
  }

  void _applyFilters() {
    final query = _searchCtrl.text.trim().toLowerCase();

    _filteredArticles = _articles.where((article) {
      final isPublished = article['published'] == true || article['status'] == 'published' || article['published_at'] != null;

      if (_statusFilter == 'PUBLISHED' && !isPublished) return false;
      if (_statusFilter == 'DRAFT' && isPublished) return false;

      if (query.isNotEmpty) {
        final title = (article['title'] ?? '').toString().toLowerCase();
        final excerpt = (article['excerpt'] ?? '').toString().toLowerCase();
        final author = (article['author'] ?? '').toString().toLowerCase();
        if (!title.contains(query) && !excerpt.contains(query) && !author.contains(query)) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  Future<void> _syncArticlesToBackend(List<dynamic> updatedList) async {
    try {
      await _client.dio.put(
        ApiEndpoints.cms('blog'),
        data: {'items': updatedList},
      );
      RebelToast.showSuccess(context, 'Website articles updated.');
    } catch (_) {
      RebelToast.showError(context, 'Failed to update website articles.');
    }
  }

  Future<void> _deleteArticle(dynamic article) async {
    final confirm = await RebelConfirmationDialog.show(
      context,
      title: 'Delete this article?',
      message: 'This will permanently remove "${article['title']}" from the public website.',
      confirmLabel: 'Delete',
      isDestructive: true,
    );

    if (confirm != true) return;

    setState(() {
      _articles.removeWhere((a) => (a['slug'] ?? a['id']) == (article['slug'] ?? article['id']));
      _applyFilters();
    });

    await _syncArticlesToBackend(_articles);
  }

  Future<void> _togglePublishState(dynamic article) async {
    final currentlyPublished = article['published'] == true || article['status'] == 'published';
    final newPublished = !currentlyPublished;

    setState(() {
      article['published'] = newPublished;
      article['status'] = newPublished ? 'published' : 'draft';
      if (newPublished && (article['published_at'] == null || article['published_at'] == '')) {
        article['published_at'] = DateTime.now().toIso8601String();
      }
      _applyFilters();
    });

    await _syncArticlesToBackend(_articles);
  }

  // Article Preview Modal
  void _showArticlePreview(dynamic article) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.background,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        final title = article['title'] ?? 'Untitled Article';
        final coverImage = article['cover_image'] ?? article['coverImage'] ?? '';
        final author = article['author'] ?? 'S&A Editorial Team';
        final publishedDate = (article['published_at'] ?? article['publishedAt'] ?? 'Draft').toString().split('T').first;
        final content = article['content'] ?? article['body'] ?? 'No content written yet.';
        final category = article['category'] ?? 'Badminton Coaching';

        return SafeArea(
          child: Container(
            height: MediaQuery.of(context).size.height * 0.9,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Article Preview (Website View)', style: AppTheme.sectionTitle),
                    IconButton(
                      icon: const Icon(Icons.close, color: AppTheme.textMuted),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const Divider(color: AppTheme.border),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (coverImage.toString().startsWith('http')) ...[
                          ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.network(
                              coverImage,
                              height: 180,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                            ),
                          ),
                          const SizedBox(height: 14),
                        ],
                        RebelStatusBadge(label: category, color: AppTheme.statusTrial),
                        const SizedBox(height: 8),
                        Text(title, style: AppTheme.pageTitle),
                        const SizedBox(height: 6),
                        Text('By $author • $publishedDate', style: const TextStyle(color: AppTheme.textMuted, fontSize: 13)),
                        const SizedBox(height: 16),
                        const Divider(color: AppTheme.border),
                        const SizedBox(height: 12),
                        Text(
                          content,
                          style: const TextStyle(color: AppTheme.textPrimary, fontSize: 15, height: 1.6),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // Add / Edit Article Sheet
  void _showArticleFormModal({dynamic existingArticle}) {
    final isEditing = existingArticle != null;
    final titleCtrl = TextEditingController(text: existingArticle?['title'] ?? '');
    final slugCtrl = TextEditingController(text: existingArticle?['slug'] ?? '');
    final excerptCtrl = TextEditingController(text: existingArticle?['excerpt'] ?? '');
    final coverCtrl = TextEditingController(text: existingArticle?['cover_image'] ?? existingArticle?['coverImage'] ?? '');
    final contentCtrl = TextEditingController(text: existingArticle?['content'] ?? existingArticle?['body'] ?? '');
    final authorCtrl = TextEditingController(text: existingArticle?['author'] ?? 'S&A Academy');
    final categoryCtrl = TextEditingController(text: existingArticle?['category'] ?? 'Training & Drills');
    final seoTitleCtrl = TextEditingController(text: existingArticle?['seo_title'] ?? existingArticle?['seoTitle'] ?? '');
    final seoDescCtrl = TextEditingController(text: existingArticle?['seo_description'] ?? existingArticle?['seoDescription'] ?? '');
    bool isPublished = existingArticle != null ? (existingArticle['published'] == true || existingArticle['status'] == 'published') : true;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setModalState) => Container(
          height: MediaQuery.of(context).size.height * 0.9,
          padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(isEditing ? 'Edit Article' : 'Publish New Article', style: AppTheme.sectionTitle),
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
                        controller: titleCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Article Title *'),
                        onChanged: (val) {
                          if (!isEditing && slugCtrl.text.isEmpty) {
                            final autoSlug = val.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-').replaceAll(RegExp(r'^-|-$'), '');
                            setModalState(() => slugCtrl.text = autoSlug);
                          }
                        },
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: slugCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'URL Slug (e.g. smash-technique-tips) *'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: coverCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Cover Image URL (https://...)'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: excerptCtrl,
                        maxLines: 2,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Short Excerpt / Summary *'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: contentCtrl,
                        maxLines: 8,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'Article Body Content (Markdown supported) *'),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: authorCtrl,
                              style: const TextStyle(color: AppTheme.textPrimary),
                              decoration: const InputDecoration(hintText: 'Author'),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: TextField(
                              controller: categoryCtrl,
                              style: const TextStyle(color: AppTheme.textPrimary),
                              decoration: const InputDecoration(hintText: 'Category'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: seoTitleCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'SEO Meta Title'),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: seoDescCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(hintText: 'SEO Meta Description'),
                      ),
                      const SizedBox(height: 12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeColor: AppTheme.primary,
                        title: const Text('Publish Immediately', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Uncheck to save as draft', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                        value: isPublished,
                        onChanged: (val) => setModalState(() => isPublished = val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: RebelSecondaryButton(
                      label: 'Save Draft',
                      onPressed: () => _saveArticle(
                        ctx: ctx,
                        isEditing: isEditing,
                        existingArticle: existingArticle,
                        title: titleCtrl.text.trim(),
                        slug: slugCtrl.text.trim(),
                        cover: coverCtrl.text.trim(),
                        excerpt: excerptCtrl.text.trim(),
                        content: contentCtrl.text.trim(),
                        author: authorCtrl.text.trim(),
                        category: categoryCtrl.text.trim(),
                        seoTitle: seoTitleCtrl.text.trim(),
                        seoDesc: seoDescCtrl.text.trim(),
                        publishState: false,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: RebelButton(
                      label: isPublished ? 'Publish Live' : 'Save Changes',
                      onPressed: () => _saveArticle(
                        ctx: ctx,
                        isEditing: isEditing,
                        existingArticle: existingArticle,
                        title: titleCtrl.text.trim(),
                        slug: slugCtrl.text.trim(),
                        cover: coverCtrl.text.trim(),
                        excerpt: excerptCtrl.text.trim(),
                        content: contentCtrl.text.trim(),
                        author: authorCtrl.text.trim(),
                        category: categoryCtrl.text.trim(),
                        seoTitle: seoTitleCtrl.text.trim(),
                        seoDesc: seoDescCtrl.text.trim(),
                        publishState: isPublished,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _saveArticle({
    required BuildContext ctx,
    required bool isEditing,
    dynamic existingArticle,
    required String title,
    required String slug,
    required String cover,
    required String excerpt,
    required String content,
    required String author,
    required String category,
    required String seoTitle,
    required String seoDesc,
    required bool publishState,
  }) async {
    if (title.isEmpty || slug.isEmpty) {
      RebelToast.showError(context, 'Title and URL Slug are mandatory.');
      return;
    }

    Navigator.pop(ctx);

    if (isEditing) {
      setState(() {
        existingArticle['title'] = title;
        existingArticle['slug'] = slug;
        existingArticle['cover_image'] = cover;
        existingArticle['coverImage'] = cover;
        existingArticle['excerpt'] = excerpt;
        existingArticle['content'] = content;
        existingArticle['body'] = content;
        existingArticle['author'] = author;
        existingArticle['category'] = category;
        existingArticle['seo_title'] = seoTitle;
        existingArticle['seo_description'] = seoDesc;
        existingArticle['published'] = publishState;
        existingArticle['status'] = publishState ? 'published' : 'draft';
        existingArticle['updated_at'] = DateTime.now().toIso8601String();
        _applyFilters();
      });
    } else {
      final newArticle = {
        'id': 'art-${DateTime.now().millisecondsSinceEpoch}',
        'slug': slug,
        'title': title,
        'cover_image': cover,
        'coverImage': cover,
        'excerpt': excerpt,
        'content': content,
        'body': content,
        'author': author,
        'category': category,
        'seo_title': seoTitle,
        'seo_description': seoDesc,
        'published': publishState,
        'status': publishState ? 'published' : 'draft',
        'published_at': publishState ? DateTime.now().toIso8601String() : null,
        'created_at': DateTime.now().toIso8601String(),
      };
      setState(() {
        _articles.insert(0, newArticle);
        _applyFilters();
      });
    }

    await _syncArticlesToBackend(_articles);
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
                      const Text('Articles', style: AppTheme.pageTitle),
                      const SizedBox(height: 2),
                      Text(
                        '${_filteredArticles.length} articles on public website',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppTheme.primary),
                    onPressed: _fetchArticles,
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Search Bar
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search articles by title, author...',
                onChanged: (_) => setState(_applyFilters),
                onClear: () => setState(_applyFilters),
              ),
              const SizedBox(height: 12),

              // Filter Tabs
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

              // Articles List
              Expanded(
                child: _isLoading
                    ? const RebelLoadingState(message: 'Loading website articles...')
                    : _errorMessage != null
                        ? RebelErrorState(message: _errorMessage!, onRetry: _fetchArticles)
                        : _filteredArticles.isEmpty
                            ? const RebelEmptyState(
                                icon: Icons.article_outlined,
                                title: 'No articles published',
                                message: 'Tap the + button to create a new website article.',
                              )
                            : RefreshIndicator(
                                color: AppTheme.primary,
                                backgroundColor: AppTheme.surfaceElevated,
                                onRefresh: _fetchArticles,
                                child: ListView.separated(
                                  padding: const EdgeInsets.only(bottom: 80),
                                  itemCount: _filteredArticles.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                                  itemBuilder: (context, index) {
                                    final article = _filteredArticles[index];
                                    final title = article['title'] ?? 'Untitled Article';
                                    final author = article['author'] ?? 'S&A Team';
                                    final coverImage = article['cover_image'] ?? article['coverImage'] ?? '';
                                    final isPublished = article['published'] == true || article['status'] == 'published';
                                    final dateStr = (article['published_at'] ?? article['created_at'] ?? '').toString().split('T').first;

                                    return RebelCard(
                                      onTap: () => _showArticleFormModal(existingArticle: article),
                                      padding: const EdgeInsets.all(12),
                                      child: Row(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Thumbnail
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(8),
                                            child: coverImage.toString().startsWith('http')
                                                ? Image.network(
                                                    coverImage,
                                                    width: 70,
                                                    height: 70,
                                                    fit: BoxFit.cover,
                                                    errorBuilder: (_, __, ___) => Container(
                                                      width: 70,
                                                      height: 70,
                                                      color: AppTheme.surfaceAlt,
                                                      child: const Icon(Icons.article, color: AppTheme.textMuted),
                                                    ),
                                                  )
                                                : Container(
                                                    width: 70,
                                                    height: 70,
                                                    color: AppTheme.surfaceAlt,
                                                    child: const Icon(Icons.article, color: AppTheme.textMuted),
                                                  ),
                                          ),
                                          const SizedBox(width: 12),

                                          // Content & Metadata
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  title,
                                                  style: const TextStyle(
                                                    color: AppTheme.textPrimary,
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                  maxLines: 2,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  '$author • $dateStr',
                                                  style: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                                                ),
                                                const SizedBox(height: 6),
                                                RebelStatusBadge(
                                                  label: isPublished ? 'Published' : 'Draft',
                                                  color: isPublished ? AppTheme.statusPresent : AppTheme.statusFollowUp,
                                                ),
                                              ],
                                            ),
                                          ),

                                          // Actions: Preview, Toggle Publish, Delete
                                          Column(
                                            children: [
                                              IconButton(
                                                icon: const Icon(Icons.remove_red_eye_outlined, size: 18, color: AppTheme.primary),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _showArticlePreview(article),
                                              ),
                                              const SizedBox(height: 8),
                                              IconButton(
                                                icon: Icon(
                                                  isPublished ? Icons.cloud_done : Icons.cloud_upload_outlined,
                                                  size: 18,
                                                  color: isPublished ? AppTheme.statusPresent : AppTheme.textMuted,
                                                ),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _togglePublishState(article),
                                              ),
                                              const SizedBox(height: 8),
                                              IconButton(
                                                icon: const Icon(Icons.delete_outline, size: 18, color: AppTheme.danger),
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _deleteArticle(article),
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
        onPressed: () => _showArticleFormModal(),
        icon: const Icon(Icons.edit_note, size: 20),
        label: const Text('Add Article', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}
