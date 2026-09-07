import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class GlobalSearchDialog extends StatefulWidget {
  const GlobalSearchDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (ctx) => const GlobalSearchDialog(),
    );
  }

  @override
  State<GlobalSearchDialog> createState() => _GlobalSearchDialogState();
}

class _GlobalSearchDialogState extends State<GlobalSearchDialog> {
  final TextEditingController _searchCtrl = TextEditingController();
  final ApiClient _client = ApiClient();
  Timer? _debounce;
  bool _isLoading = false;
  List<dynamic> _results = [];
  String _query = '';

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onQueryChanged(String query) {
    _debounce?.cancel();
    final trimmed = query.trim();
    if (trimmed.length < 2) {
      setState(() {
        _query = trimmed;
        _results = [];
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _query = trimmed;
      _isLoading = true;
    });

    _debounce = Timer(const Duration(milliseconds: 300), () async {
      try {
        final res = await _client.dio.get(
          ApiEndpoints.search,
          queryParameters: {'q': trimmed},
        );
        if (mounted) {
          setState(() {
            _results = res.data['data']?['results'] ?? [];
            _isLoading = false;
          });
        }
      } catch (_) {
        if (mounted) setState(() => _isLoading = false);
      }
    });
  }

  void _onSelectResult(dynamic item) {
    Navigator.of(context).pop();
    final type = item['type'];
    final id = item['id'];

    if (type == 'STUDENT') {
      context.go('/students?id=$id');
    } else if (type == 'LEAD') {
      context.go('/leads?id=$id');
    } else if (type == 'PARENT') {
      context.go('/students?parentId=$id');
    } else if (type == 'COACH') {
      context.go('/coaches');
    } else if (type == 'BATCH') {
      context.go('/schedule');
    }
  }

  Color _badgeColor(String type) {
    switch (type) {
      case 'STUDENT':
        return AppTheme.primary;
      case 'LEAD':
        return AppTheme.warning;
      case 'PARENT':
        return AppTheme.info;
      case 'COACH':
        return AppTheme.success;
      case 'BATCH':
        return const Color(0xFFA78BFA);
      default:
        return AppTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppTheme.surface,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 40),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppTheme.border),
      ),
      child: Container(
        width: 600,
        constraints: const BoxConstraints(maxHeight: 550),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.search, color: AppTheme.primary, size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    autofocus: true,
                    style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16),
                    decoration: InputDecoration(
                      hintText: 'Search athletes, leads, parents, coaches, cohorts...',
                      hintStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 14),
                      filled: false,
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, color: AppTheme.textMuted, size: 18),
                              onPressed: () {
                                _searchCtrl.clear();
                                _onQueryChanged('');
                              },
                            )
                          : null,
                    ),
                    onChanged: _onQueryChanged,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppTheme.textMuted),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const Divider(color: AppTheme.border, height: 24),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                  : _query.length < 2
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.manage_search, size: 48, color: AppTheme.textMuted.withOpacity(0.4)),
                              const SizedBox(height: 12),
                              const Text(
                                'Type at least 2 characters to search',
                                style: TextStyle(color: AppTheme.textMuted, fontSize: 13),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Searches live athletes, inbound leads, parents, coaches and batches.',
                                style: TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                              ),
                            ],
                          ),
                        )
                      : _results.isEmpty
                          ? Center(
                              child: Text(
                                'No matching records found for "$_query"',
                                style: const TextStyle(color: AppTheme.textMuted, fontSize: 14),
                              ),
                            )
                          : ListView.separated(
                              itemCount: _results.length,
                              separatorBuilder: (_, __) => const Divider(color: AppTheme.borderSubtle, height: 1),
                              itemBuilder: (ctx, i) {
                                final item = _results[i];
                                final type = item['type'] ?? '';
                                final title = item['title'] ?? '';
                                final subtitle = item['subtitle'] ?? '';
                                final color = _badgeColor(type);

                                return ListTile(
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  title: Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: color.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(4),
                                          border: Border.all(color: color.withOpacity(0.4)),
                                        ),
                                        child: Text(
                                          type,
                                          style: TextStyle(
                                            color: color,
                                            fontSize: 9,
                                            fontWeight: FontWeight.w800,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Text(
                                          title,
                                          style: const TextStyle(
                                            color: AppTheme.textPrimary,
                                            fontWeight: FontWeight.w700,
                                            fontSize: 14,
                                          ),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  subtitle: Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(
                                      subtitle,
                                      style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  trailing: const Icon(Icons.arrow_forward_ios, size: 12, color: AppTheme.textMuted),
                                  onTap: () => _onSelectResult(item),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }
}
