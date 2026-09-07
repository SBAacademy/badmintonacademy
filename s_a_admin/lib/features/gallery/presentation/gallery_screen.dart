import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/api_endpoints.dart';
import '../../../core/components/rebel_components.dart';

class GalleryScreen extends ConsumerStatefulWidget {
  const GalleryScreen({super.key});

  @override
  ConsumerState<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends ConsumerState<GalleryScreen> {
  final ApiClient _client = ApiClient();
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _searchCtrl = TextEditingController();

  bool _isLoading = true;
  String? _errorMessage;
  List<dynamic> _items = [];
  List<dynamic> _filteredItems = [];

  String _statusFilter = 'ALL'; // ALL, PUBLISHED, DRAFT
  String _centreFilter = 'ALL'; // ALL, Kadavanthra, Edappally, Kakkanad
  String _categoryFilter = 'ALL';

  final List<Map<String, String>> _statusTabs = [
    {'key': 'ALL', 'label': 'All Status'},
    {'key': 'PUBLISHED', 'label': 'Published'},
    {'key': 'DRAFT', 'label': 'Draft'},
  ];

  final List<String> _centres = ['ALL', 'Kadavanthra', 'Edappally', 'Kakkanad'];

  final List<String> _categories = [
    'ALL',
    'Courts & Arena',
    'Training Drills',
    'Tournaments',
    'Juniors & Camps',
    'Coaching Sessions',
  ];

  @override
  void initState() {
    super.initState();
    _fetchGallery();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchGallery() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await _client.dio.get(ApiEndpoints.cms('gallery'));
      final rawItems = (res.data['items'] ?? res.data['data']?['items'] ?? []) as List<dynamic>;

      if (mounted) {
        setState(() {
          _items = rawItems;
          _applyFilters();
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load website photos. Check connection.';
          _isLoading = false;
        });
      }
    }
  }

  void _applyFilters() {
    final query = _searchCtrl.text.trim().toLowerCase();

    _filteredItems = _items.where((item) {
      // Status filter
      final isPublished = item['published'] == true ||
          item['is_published'] == true ||
          item['status'] == 'published' ||
          item['status'] == null; // default published on website

      if (_statusFilter == 'PUBLISHED' && !isPublished) return false;
      if (_statusFilter == 'DRAFT' && isPublished) return false;

      // Centre / Branch filter
      final branch = (item['branch'] ?? item['centre'] ?? '').toString().toLowerCase();
      if (_centreFilter != 'ALL') {
        final target = _centreFilter.toLowerCase();
        if (!branch.contains(target) && branch != 'all centres' && branch != 'all') {
          return false;
        }
      }

      // Category filter
      final cat = (item['category'] ?? '').toString().toLowerCase();
      if (_categoryFilter != 'ALL') {
        if (!cat.contains(_categoryFilter.toLowerCase())) return false;
      }

      // Search query
      if (query.isNotEmpty) {
        final title = (item['title'] ?? item['caption'] ?? '').toString().toLowerCase();
        final desc = (item['description'] ?? item['caption'] ?? '').toString().toLowerCase();
        final branchStr = branch;
        if (!title.contains(query) && !desc.contains(query) && !branchStr.contains(query)) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  Future<void> _syncGalleryToBackend(List<dynamic> updatedItems) async {
    try {
      final sanitizedItems = updatedItems.map((item) {
        if (item is Map) {
          final copy = Map<String, dynamic>.from(item);
          for (final key in ['image', 'src', 'url']) {
            if (copy[key] is String) {
              copy[key] = _client.sanitizeUrl(copy[key] as String);
            }
          }
          return copy;
        }
        return item;
      }).toList();

      await _client.dio.put(
        ApiEndpoints.cms('gallery'),
        data: {'items': sanitizedItems},
      );
      RebelToast.showSuccess(context, 'Website gallery updated.');
    } catch (_) {
      RebelToast.showError(context, 'Failed to save gallery changes.');
    }
  }

  // Toggle publish state
  Future<void> _togglePublish(dynamic item) async {
    final currentlyPublished = item['published'] == true || item['is_published'] == true || item['status'] == 'published';
    final newPublished = !currentlyPublished;

    setState(() {
      item['published'] = newPublished;
      item['is_published'] = newPublished;
      item['status'] = newPublished ? 'published' : 'draft';
      _applyFilters();
    });

    await _syncGalleryToBackend(_items);
  }

  // Delete with confirmation
  Future<void> _deletePhoto(dynamic item) async {
    final confirm = await RebelConfirmationDialog.show(
      context,
      title: 'Delete this photo?',
      message: 'This action will permanently remove the photo from the public website.',
      confirmLabel: 'Delete',
      isDestructive: true,
    );

    if (confirm != true) return;

    setState(() {
      _items.removeWhere((i) => (i['id'] ?? i['src']) == (item['id'] ?? item['src']));
      _applyFilters();
    });

    await _syncGalleryToBackend(_items);
  }

  // Pick and Upload Image to Server
  Future<void> _pickAndUploadImage({
    required ImageSource source,
    required StateSetter setModalState,
    required TextEditingController urlCtrl,
    required Function(bool) setUploading,
    required Function(double) setProgress,
  }) async {
    try {
      final XFile? picked = await _picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1920,
      );

      if (picked == null) return;

      setUploading(true);
      setProgress(0.1);

      final bytes = await picked.readAsBytes();
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          bytes,
          filename: picked.name,
        ),
      });

      final res = await _client.dio.post(
        ApiEndpoints.upload,
        data: formData,
        onSendProgress: (sent, total) {
          if (total > 0) {
            setProgress(sent / total);
          }
        },
      );

      setUploading(false);

      if (res.data['success'] == true) {
        final uploadedPath = res.data['url']?.toString() ?? '';
        final sanitized = _client.sanitizeUrl(uploadedPath);

        setModalState(() {
          urlCtrl.text = sanitized;
        });

        if (mounted) {
          RebelToast.showSuccess(context, 'Image uploaded successfully.');
        }
      } else {
        if (mounted) {
          RebelToast.showError(context, res.data['error'] ?? 'Upload failed.');
        }
      }
    } catch (e) {
      setUploading(false);
      if (mounted) {
        RebelToast.showError(context, 'Image upload failed: $e');
      }
    }
  }

  // Add or Edit Photo Sheet with Centre Selection & Upload
  void _showPhotoFormModal({dynamic existingItem}) {
    final isEditing = existingItem != null;
    final titleCtrl = TextEditingController(text: existingItem?['title'] ?? existingItem?['caption'] ?? '');
    final descCtrl = TextEditingController(text: existingItem?['description'] ?? existingItem?['caption'] ?? '');
    final urlCtrl = TextEditingController(text: existingItem?['image'] ?? existingItem?['src'] ?? existingItem?['url'] ?? '');
    final orderCtrl = TextEditingController(text: (existingItem?['display_order'] ?? existingItem?['order'] ?? (_items.length + 1)).toString());

    String selectedCentre = existingItem?['branch'] ?? existingItem?['centre'] ?? 'Kadavanthra';
    String selectedCategory = existingItem?['category'] ?? 'Courts & Arena';
    bool isPublished = existingItem != null
        ? (existingItem['published'] == true || existingItem['is_published'] == true || existingItem['status'] == 'published')
        : true;

    bool isUploading = false;
    double uploadProgress = 0.0;

    final modalCentres = ['All Centres', 'Kadavanthra', 'Edappally', 'Kakkanad'];
    final modalCategories = [
      'Courts & Arena',
      'Training Drills',
      'Tournaments',
      'Juniors & Camps',
      'Coaching Sessions',
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surfaceElevated,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (sheetCtx, setModalState) => Container(
          height: MediaQuery.of(context).size.height * 0.9,
          padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(isEditing ? 'Edit Photo Details' : 'Upload Photo to Website', style: AppTheme.sectionTitle),
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
                      // SECTION 1: PHOTO SELECTION & UPLOAD
                      const Text('PHOTO UPLOAD', style: AppTheme.caption),
                      const SizedBox(height: 8),

                      if (isUploading) ...[
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceAlt,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.primary.withOpacity(0.5)),
                          ),
                          child: Column(
                            children: [
                              const SizedBox(
                                width: 32,
                                height: 32,
                                child: CircularProgressIndicator(color: AppTheme.primary, strokeWidth: 3),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Uploading image to CDN: ${(uploadProgress * 100).toInt()}%',
                                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                      ] else if (urlCtrl.text.trim().isNotEmpty) ...[
                        // Image Preview Card
                        Stack(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                _client.resolveUrl(urlCtrl.text.trim()),
                                height: 170,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => Container(
                                  height: 100,
                                  color: AppTheme.surfaceAlt,
                                  alignment: Alignment.center,
                                  child: const Text('Image preview not available', style: TextStyle(color: AppTheme.textMuted)),
                                ),
                              ),
                            ),
                            Positioned(
                              top: 8,
                              right: 8,
                              child: Row(
                                children: [
                                  InkWell(
                                    onTap: () => _pickAndUploadImage(
                                      source: ImageSource.gallery,
                                      setModalState: setModalState,
                                      urlCtrl: urlCtrl,
                                      setUploading: (v) => setModalState(() => isUploading = v),
                                      setProgress: (p) => setModalState(() => uploadProgress = p),
                                    ),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withOpacity(0.75),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: AppTheme.primary),
                                      ),
                                      child: const Row(
                                        children: [
                                          Icon(Icons.photo_library, color: AppTheme.primary, size: 14),
                                          SizedBox(width: 4),
                                          Text('Change', style: TextStyle(color: AppTheme.primary, fontSize: 11, fontWeight: FontWeight.w700)),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  InkWell(
                                    onTap: () => setModalState(() => urlCtrl.clear()),
                                    child: Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: Colors.black.withOpacity(0.75),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Icon(Icons.close, color: AppTheme.danger, size: 14),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                      ] else ...[
                        // Upload Options Box
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceAlt,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.border, style: BorderStyle.solid),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.cloud_upload_outlined, size: 36, color: AppTheme.primary),
                              const SizedBox(height: 8),
                              const Text('Select or Capture Photo', style: AppTheme.cardTitle),
                              const SizedBox(height: 4),
                              const Text('Uploads directly to website CDN & Database', style: AppTheme.bodySecondary),
                              const SizedBox(height: 16),
                              Row(
                                children: [
                                  Expanded(
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppTheme.primary,
                                        foregroundColor: AppTheme.onPrimary,
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      icon: const Icon(Icons.photo_library, size: 18),
                                      label: const Text('Photo Library', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                      onPressed: () => _pickAndUploadImage(
                                        source: ImageSource.gallery,
                                        setModalState: setModalState,
                                        urlCtrl: urlCtrl,
                                        setUploading: (v) => setModalState(() => isUploading = v),
                                        setProgress: (p) => setModalState(() => uploadProgress = p),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: AppTheme.textPrimary,
                                        side: const BorderSide(color: AppTheme.border),
                                        padding: const EdgeInsets.symmetric(vertical: 12),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                      ),
                                      icon: const Icon(Icons.camera_alt, size: 18),
                                      label: const Text('Camera', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                      onPressed: () => _pickAndUploadImage(
                                        source: ImageSource.camera,
                                        setModalState: setModalState,
                                        urlCtrl: urlCtrl,
                                        setUploading: (v) => setModalState(() => isUploading = v),
                                        setProgress: (p) => setModalState(() => uploadProgress = p),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 10),
                      ],

                      // Direct URL Input fallback
                      TextField(
                        controller: urlCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: 'Or enter image URL (https://...)',
                          prefixIcon: Icon(Icons.link, size: 16, color: AppTheme.textMuted),
                        ),
                        onChanged: (_) => setModalState(() {}),
                      ),
                      const SizedBox(height: 18),

                      // SECTION 2: SELECT CENTRE ("senters")
                      const Text('SELECT CENTRE / LOCATION', style: AppTheme.caption),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: modalCentres.map((centre) {
                          final isSelected = selectedCentre.toLowerCase() == centre.toLowerCase();
                          return ChoiceChip(
                            label: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.location_on,
                                  size: 14,
                                  color: isSelected ? AppTheme.onPrimary : AppTheme.textMuted,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  centre,
                                  style: TextStyle(
                                    color: isSelected ? AppTheme.onPrimary : AppTheme.textPrimary,
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                            selected: isSelected,
                            selectedColor: AppTheme.primary,
                            backgroundColor: AppTheme.surfaceAlt,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                              side: BorderSide(
                                color: isSelected ? AppTheme.primary : AppTheme.border,
                              ),
                            ),
                            onSelected: (val) {
                              if (val) setModalState(() => selectedCentre = centre);
                            },
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 18),

                      // SECTION 3: SELECT CATEGORY
                      const Text('CATEGORY', style: AppTheme.caption),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceAlt,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: selectedCategory,
                            dropdownColor: AppTheme.surfaceElevated,
                            isExpanded: true,
                            items: modalCategories.map((c) {
                              return DropdownMenuItem(value: c, child: Text(c));
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) setModalState(() => selectedCategory = val);
                            },
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),

                      // SECTION 4: ALL DETAILS
                      const Text('PHOTO DETAILS', style: AppTheme.caption),
                      const SizedBox(height: 8),

                      TextField(
                        controller: titleCtrl,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(
                          hintText: 'Photo Title / Headline *',
                          helperText: 'e.g. Central Arena 6-Court Layout',
                        ),
                      ),
                      const SizedBox(height: 12),

                      TextField(
                        controller: descCtrl,
                        maxLines: 3,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(
                          hintText: 'Caption & Description *',
                          helperText: 'e.g. Glare-free 750 Lux overhead LED illumination at Kadavanthra.',
                        ),
                      ),
                      const SizedBox(height: 12),

                      TextField(
                        controller: orderCtrl,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: AppTheme.textPrimary),
                        decoration: const InputDecoration(
                          hintText: 'Display Order Priority (1 = First)',
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Publication toggle
                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeColor: AppTheme.primary,
                        title: const Text('Publish on Website', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        subtitle: const Text('Make photo live immediately on public website gallery', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                        value: isPublished,
                        onChanged: (val) => setModalState(() => isPublished = val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Save Action Button
              SizedBox(
                width: double.infinity,
                child: RebelButton(
                  label: isEditing ? 'Save Changes' : 'Upload & Publish to Website',
                  onPressed: isUploading
                      ? null
                      : () async {
                          final title = titleCtrl.text.trim();
                          final url = _client.sanitizeUrl(urlCtrl.text.trim());
                          final caption = descCtrl.text.trim();

                          if (title.isEmpty) {
                            RebelToast.showError(context, 'Please enter a photo title.');
                            return;
                          }
                          if (url.isEmpty) {
                            RebelToast.showError(context, 'Please upload or provide an image.');
                            return;
                          }

                          Navigator.pop(ctx);

                          final order = int.tryParse(orderCtrl.text.trim()) ?? 1;

                          if (isEditing) {
                            setState(() {
                              existingItem['title'] = title;
                              existingItem['caption'] = caption.isNotEmpty ? caption : title;
                              existingItem['description'] = caption;
                              existingItem['image'] = url;
                              existingItem['src'] = url;
                              existingItem['url'] = url;
                              existingItem['branch'] = selectedCentre;
                              existingItem['centre'] = selectedCentre;
                              existingItem['category'] = selectedCategory;
                              existingItem['display_order'] = order;
                              existingItem['published'] = isPublished;
                              existingItem['is_published'] = isPublished;
                              existingItem['status'] = isPublished ? 'published' : 'draft';
                              _applyFilters();
                            });
                          } else {
                            final newItem = {
                              'id': 'g-${DateTime.now().millisecondsSinceEpoch}',
                              'title': title,
                              'caption': caption.isNotEmpty ? caption : title,
                              'description': caption,
                              'image': url,
                              'src': url,
                              'url': url,
                              'branch': selectedCentre,
                              'centre': selectedCentre,
                              'category': selectedCategory,
                              'display_order': order,
                              'published': isPublished,
                              'is_published': isPublished,
                              'status': isPublished ? 'published' : 'draft',
                            };
                            setState(() {
                              _items.insert(0, newItem);
                              _applyFilters();
                            });
                          }

                          await _syncGalleryToBackend(_items);
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
                      const Text('Gallery', style: AppTheme.pageTitle),
                      const SizedBox(height: 2),
                      Text(
                        '${_filteredItems.length} photos on public website',
                        style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppTheme.primary),
                    onPressed: _fetchGallery,
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // Search Bar
              RebelSearchField(
                controller: _searchCtrl,
                hintText: 'Search photos by title, caption, centre...',
                onChanged: (_) => setState(_applyFilters),
                onClear: () => setState(_applyFilters),
              ),
              const SizedBox(height: 10),

              // 1. CENTRE FILTER PILLS ("senters")
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _centres.map((centre) {
                    final isSelected = _centreFilter == centre;
                    final label = centre == 'ALL' ? 'All Centres' : centre;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: RebelFilterPill(
                        label: label,
                        isSelected: isSelected,
                        onTap: () {
                          setState(() {
                            _centreFilter = centre;
                            _applyFilters();
                          });
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 8),

              // 2. STATUS FILTER PILLS (All, Published, Draft)
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

              // 3. CATEGORY FILTER PILLS
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _categories.map((cat) {
                    final isSelected = _categoryFilter == cat;
                    final label = cat == 'ALL' ? 'All Categories' : cat;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: RebelFilterPill(
                        label: label,
                        isSelected: isSelected,
                        onTap: () {
                          setState(() {
                            _categoryFilter = cat;
                            _applyFilters();
                          });
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 14),

              // Gallery Grid
              Expanded(
                child: _isLoading
                    ? const RebelLoadingState(message: 'Loading website photos...')
                    : _errorMessage != null
                        ? RebelErrorState(message: _errorMessage!, onRetry: _fetchGallery)
                        : _filteredItems.isEmpty
                            ? const RebelEmptyState(
                                icon: Icons.photo_library_outlined,
                                title: 'No photos found',
                                message: 'Tap the + button to upload website photos.',
                              )
                            : RefreshIndicator(
                                color: AppTheme.primary,
                                backgroundColor: AppTheme.surfaceElevated,
                                onRefresh: _fetchGallery,
                                child: GridView.builder(
                                  padding: const EdgeInsets.only(bottom: 80),
                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    mainAxisSpacing: 12,
                                    crossAxisSpacing: 12,
                                    childAspectRatio: 0.82,
                                  ),
                                  itemCount: _filteredItems.length,
                                  itemBuilder: (context, index) {
                                    final item = _filteredItems[index];
                                    final title = item['title'] ?? item['caption'] ?? 'Photo ${index + 1}';
                                    final branch = item['branch'] ?? item['centre'] ?? 'Kadavanthra';
                                    final imgUrl = item['image'] ?? item['src'] ?? item['url'] ?? '';
                                    final isPublished = item['published'] == true ||
                                        item['is_published'] == true ||
                                        item['status'] == 'published' ||
                                        item['status'] == null;

                                    return RebelCard(
                                      padding: EdgeInsets.zero,
                                      onTap: () => _showPhotoFormModal(existingItem: item),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Image preview
                                          Expanded(
                                            child: Stack(
                                              fit: StackFit.expand,
                                              children: [
                                                ClipRRect(
                                                  borderRadius: const BorderRadius.vertical(top: Radius.circular(13)),
                                                  child: imgUrl.toString().isNotEmpty
                                                      ? Image.network(
                                                          _client.resolveUrl(imgUrl),
                                                          fit: BoxFit.cover,
                                                          errorBuilder: (_, __, ___) => Container(
                                                            color: AppTheme.surfaceAlt,
                                                            child: const Icon(Icons.broken_image_outlined, color: AppTheme.textMuted),
                                                          ),
                                                        )
                                                      : Container(
                                                          color: AppTheme.surfaceAlt,
                                                          child: const Center(
                                                            child: Icon(Icons.image, size: 36, color: AppTheme.textMuted),
                                                          ),
                                                        ),
                                                ),
                                                // Centre Badge
                                                Positioned(
                                                  top: 8,
                                                  left: 8,
                                                  child: Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: Colors.black.withOpacity(0.75),
                                                      borderRadius: BorderRadius.circular(4),
                                                      border: Border.all(color: AppTheme.border),
                                                    ),
                                                    child: Text(
                                                      branch.toString().toUpperCase(),
                                                      style: const TextStyle(
                                                        color: AppTheme.textPrimary,
                                                        fontSize: 9,
                                                        fontWeight: FontWeight.w700,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                // Published / Draft Badge
                                                Positioned(
                                                  top: 8,
                                                  right: 8,
                                                  child: RebelStatusBadge(
                                                    label: isPublished ? 'Live' : 'Draft',
                                                    color: isPublished ? AppTheme.statusPresent : AppTheme.statusFollowUp,
                                                    isFilled: true,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),

                                          // Info & Actions Bar
                                          Padding(
                                            padding: const EdgeInsets.fromLTRB(10, 8, 8, 8),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  title,
                                                  style: const TextStyle(
                                                    color: AppTheme.textPrimary,
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                const SizedBox(height: 4),
                                                Row(
                                                  children: [
                                                    Expanded(
                                                      child: Text(
                                                        item['category'] ?? 'Gallery',
                                                        style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                      ),
                                                    ),
                                                    IconButton(
                                                      icon: Icon(
                                                        isPublished ? Icons.visibility : Icons.visibility_off,
                                                        size: 16,
                                                        color: isPublished ? AppTheme.primary : AppTheme.textMuted,
                                                      ),
                                                      padding: EdgeInsets.zero,
                                                      constraints: const BoxConstraints(),
                                                      onPressed: () => _togglePublish(item),
                                                    ),
                                                    const SizedBox(width: 8),
                                                    IconButton(
                                                      icon: const Icon(Icons.delete_outline, size: 16, color: AppTheme.danger),
                                                      padding: EdgeInsets.zero,
                                                      constraints: const BoxConstraints(),
                                                      onPressed: () => _deletePhoto(item),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
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
        onPressed: () => _showPhotoFormModal(),
        icon: const Icon(Icons.add_photo_alternate_outlined, size: 20),
        label: const Text('Upload Photo', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}
