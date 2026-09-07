import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class CmsScreen extends StatefulWidget {
  const CmsScreen({super.key});

  @override
  State<CmsScreen> createState() => _CmsScreenState();
}

class _CmsScreenState extends State<CmsScreen> with SingleTickerProviderStateMixin {
  final ApiClient _client = ApiClient();
  late TabController _tabController;
  bool _isLoading = true;
  String _currentSection = 'testimonials';
  List<dynamic> _items = [];

  final List<String> _sections = [
    'testimonials',
    'achievements',
    'announcements',
    'blog',
    'gallery',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _sections.length, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() => _currentSection = _sections[_tabController.index]);
        _fetchSectionData();
      }
    });
    _fetchSectionData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchSectionData() async {
    setState(() => _isLoading = true);
    try {
      final res = await _client.dio.get(ApiEndpoints.cms(_currentSection));
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

  void _openAddItemDialog() {
    final titleCtrl = TextEditingController();
    final bodyCtrl = TextEditingController();
    final authorCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppTheme.border),
        ),
        title: Text('Add ${_currentSection.toUpperCase()} Item',
            style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w800)),
        content: SizedBox(
          width: 460,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleCtrl,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Title / Heading / Athlete Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: bodyCtrl,
                style: const TextStyle(color: AppTheme.textPrimary),
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Content / Quote / Description'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: authorCtrl,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: const InputDecoration(labelText: 'Subtitle / Tournament / Parent Role'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppTheme.textMuted)),
          ),
          ElevatedButton(
            onPressed: () async {
              if (titleCtrl.text.isNotEmpty) {
                final newItem = {
                  'id': 'cms_${DateTime.now().millisecondsSinceEpoch}',
                  'title': titleCtrl.text.trim(),
                  'content': bodyCtrl.text.trim(),
                  'subtitle': authorCtrl.text.trim(),
                  'published': true,
                  'date': DateTime.now().toIso8601String().split('T')[0],
                };
                final updatedList = [..._items, newItem];
                try {
                  await _client.dio.put(
                    ApiEndpoints.cms(_currentSection),
                    data: {'items': updatedList},
                  );
                  if (ctx.mounted) Navigator.pop(ctx);
                  _fetchSectionData();
                } catch (_) {}
              }
            },
            child: const Text('Save Content'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('WEBSITE CMS GATEWAY'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: AppTheme.primary,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textMuted,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: _sections.map((s) => Tab(text: s.toUpperCase())).toList(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: AppTheme.primary),
            tooltip: 'Add Item',
            onPressed: _openAddItemDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchSectionData,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : _items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.web, size: 48, color: AppTheme.textMuted.withOpacity(0.4)),
                      const SizedBox(height: 12),
                      Text(
                        'No $_currentSection published yet.',
                        style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Static website content will safely display as fallback.',
                        style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (ctx, i) {
                    final item = _items[i];
                    final title = item['title'] ?? item['name'] ?? 'Item';
                    final content = item['content'] ?? item['quote'] ?? item['description'] ?? '';
                    final subtitle = item['subtitle'] ?? item['role'] ?? item['category'] ?? '';

                    return Container(
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
                                  title,
                                  style: const TextStyle(
                                    color: AppTheme.textPrimary,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppTheme.success.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'PUBLISHED',
                                  style: TextStyle(color: AppTheme.success, fontSize: 9, fontWeight: FontWeight.w800),
                                ),
                              ),
                            ],
                          ),
                          if (subtitle.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(subtitle, style: const TextStyle(color: AppTheme.primary, fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                          if (content.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(content, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                          ],
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
