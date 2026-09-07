import 'dart:convert';
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';

class AuditScreen extends StatefulWidget {
  const AuditScreen({super.key});

  @override
  State<AuditScreen> createState() => _AuditScreenState();
}

class _AuditScreenState extends State<AuditScreen> {
  final ApiClient _client = ApiClient();
  bool _isLoading = true;
  List<dynamic> _logs = [];
  String _selectedEntity = 'ALL';

  final List<String> _entities = ['ALL', 'USER', 'STUDENT', 'LEAD', 'PAYMENT', 'ATTENDANCE', 'SESSION'];

  @override
  void initState() {
    super.initState();
    _fetchAuditLogs();
  }

  Future<void> _fetchAuditLogs() async {
    setState(() => _isLoading = true);
    try {
      final queryParams = <String, dynamic>{'limit': 100};
      if (_selectedEntity != 'ALL') {
        queryParams['entity'] = _selectedEntity;
      }
      final res = await _client.dio.get(ApiEndpoints.audit, queryParameters: queryParams);
      if (mounted) {
        setState(() {
          _logs = res.data['data']?['logs'] ?? [];
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Color _actionColor(String action) {
    switch (action.toUpperCase()) {
      case 'CREATED':
      case 'ENROLLED':
        return AppTheme.success;
      case 'UPDATED':
      case 'CONVERTED':
        return AppTheme.warning;
      case 'DELETED':
      case 'REVOKED':
        return AppTheme.danger;
      default:
        return AppTheme.info;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('IMMUTABLE AUDIT LOGS'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.textSecondary),
            onPressed: _fetchAuditLogs,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SizedBox(
            height: 48,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _entities.length,
              itemBuilder: (ctx, i) {
                final ent = _entities[i];
                final isSelected = ent == _selectedEntity;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(ent),
                    selected: isSelected,
                    selectedColor: AppTheme.primary,
                    backgroundColor: AppTheme.surface,
                    labelStyle: TextStyle(
                      color: isSelected ? const Color(0xFF07090D) : AppTheme.textSecondary,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                    side: BorderSide(color: isSelected ? AppTheme.primary : AppTheme.border),
                    onSelected: (_) {
                      setState(() => _selectedEntity = ent);
                      _fetchAuditLogs();
                    },
                  ),
                );
              },
            ),
          ),
          const Divider(color: AppTheme.border, height: 1),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : _logs.isEmpty
                    ? const Center(
                        child: Text(
                          'No audit entries found.',
                          style: TextStyle(color: AppTheme.textMuted),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _logs.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (ctx, i) {
                          final log = _logs[i];
                          final actorName = log['actor_name'] ?? 'System';
                          final action = log['action'] ?? '';
                          final entity = log['entity'] ?? '';
                          final entityId = log['entity_id'] ?? '';
                          final createdAt = log['created_at'] != null
                              ? log['created_at'].toString().replaceAll('T', ' ').split('.')[0]
                              : '';
                          final actionColor = _actionColor(action);
                          final newData = log['new_data'];

                          return Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppTheme.surface,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppTheme.border),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: actionColor.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        action,
                                        style: TextStyle(
                                          color: actionColor,
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      '$entity • $entityId',
                                      style: const TextStyle(
                                        color: AppTheme.textPrimary,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      createdAt,
                                      style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'By $actorName',
                                  style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                                ),
                                if (newData != null) ...[
                                  const SizedBox(height: 6),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppTheme.background,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      newData is String ? newData : jsonEncode(newData),
                                      style: const TextStyle(
                                        color: AppTheme.textMuted,
                                        fontSize: 11,
                                        fontFamily: 'monospace',
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
