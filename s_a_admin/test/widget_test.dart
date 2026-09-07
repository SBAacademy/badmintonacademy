import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:s_a_admin/core/theme/app_theme.dart';
import 'package:s_a_admin/core/auth/auth_provider.dart';
import 'package:s_a_admin/core/network/api_endpoints.dart';
import 'package:s_a_admin/core/network/api_client.dart';
import 'package:s_a_admin/core/components/rebel_components.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Rebel Admin Design System & Theme Tests', () {
    test('Verifies Rebel Admin color tokens', () {
      expect(AppTheme.background, const Color(0xFF0A0C0F));
      expect(AppTheme.surface, const Color(0xFF13161C));
      expect(AppTheme.primary, const Color(0xFFCCFF00));
      expect(AppTheme.border, const Color(0xFF232732));
      expect(AppTheme.success, const Color(0xFF22C55E));
      expect(AppTheme.warning, const Color(0xFFFBBF24));
      expect(AppTheme.danger, const Color(0xFFEF4444));
      expect(AppTheme.statusNew, const Color(0xFF38BDF8));
      expect(AppTheme.statusTrial, const Color(0xFFA855F7));
      expect(AppTheme.statusLate, const Color(0xFFFB923C));
    });

    test('Verifies ThemeData configuration', () {
      final theme = AppTheme.darkTheme;
      expect(theme.brightness, Brightness.dark);
      expect(theme.scaffoldBackgroundColor, AppTheme.background);
      expect(theme.colorScheme.primary, AppTheme.primary);
      expect(theme.colorScheme.surface, AppTheme.surface);
    });
  });

  group('API Endpoints for Website & CRM Modules', () {
    test('Verifies centralized API endpoint routes match backend contracts', () {
      expect(ApiEndpoints.login, '/api/admin/auth/login');
      expect(ApiEndpoints.refresh, '/api/admin/auth/refresh');
      expect(ApiEndpoints.logout, '/api/admin/auth/logout');
      expect(ApiEndpoints.leads, '/api/admin/leads');
      expect(ApiEndpoints.lead('lead-123'), '/api/admin/leads/lead-123');
      expect(ApiEndpoints.cms('gallery'), '/api/admin/cms/gallery');
      expect(ApiEndpoints.cms('blog'), '/api/admin/cms/blog');
      expect(ApiEndpoints.cms('coaches'), '/api/admin/cms/coaches');
      expect(ApiEndpoints.cms('achievements'), '/api/admin/cms/achievements');
      expect(ApiEndpoints.cms('testimonials'), '/api/admin/cms/testimonials');
    });

    test('Verifies ApiClient resolveUrl and sanitizeUrl logic', () {
      final client = ApiClient();
      client.setBaseUrl('http://172.20.10.9:3000');

      // sanitizeUrl strips local IP / domain prefixes
      expect(
        client.sanitizeUrl('http://172.20.10.9:3000/api/images/sample.png'),
        '/api/images/sample.png',
      );
      expect(
        client.sanitizeUrl('http://localhost:3000/api/images/sample.png'),
        '/api/images/sample.png',
      );
      expect(
        client.sanitizeUrl('/api/images/sample.png'),
        '/api/images/sample.png',
      );
      expect(
        client.sanitizeUrl('https://images.unsplash.com/photo-123'),
        'https://images.unsplash.com/photo-123',
      );

      // resolveUrl prepends baseUrl only to relative paths
      expect(
        client.resolveUrl('/api/images/sample.png'),
        'http://172.20.10.9:3000/api/images/sample.png',
      );
      expect(
        client.resolveUrl('https://images.unsplash.com/photo-123'),
        'https://images.unsplash.com/photo-123',
      );
    });
  });

  group('Authentication & UserProfile Role Hierarchy Tests', () {
    test('Parses UserProfile and verifies role access getters', () {
      final superAdmin = UserProfile(
        userId: 'usr-admin-01',
        email: 'admin@sabadminton.com',
        fullName: 'Academy Director',
        role: 'SUPER_ADMIN',
        assignedCentre: 'kadavanthra',
      );

      expect(superAdmin.isSuperAdmin, isTrue);
      expect(superAdmin.isAdmin, isTrue);
      expect(superAdmin.isCoach, isFalse);

      final contentMgr = UserProfile(
        userId: 'usr-cms-01',
        email: 'editor@sabadminton.com',
        fullName: 'Content Editor',
        role: 'CONTENT_MANAGER',
      );

      expect(contentMgr.isContentManager, isTrue);
      expect(contentMgr.isAdmin, isFalse);
    });

    test('Serializes and deserializes UserProfile JSON', () {
      final original = UserProfile(
        userId: 'usr-front-01',
        email: 'frontdesk@sabadminton.com',
        fullName: 'Reception Staff',
        role: 'FRONT_DESK',
      );

      final json = original.toJson();
      final reconstituted = UserProfile.fromJson(json);

      expect(reconstituted.userId, original.userId);
      expect(reconstituted.email, original.email);
      expect(reconstituted.fullName, original.fullName);
      expect(reconstituted.role, original.role);
    });
  });

  group('Rebel UI Components Render Tests', () {
    testWidgets('Renders RebelCard with text and tap handler', (WidgetTester tester) async {
      bool tapped = false;
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: Scaffold(
            body: RebelCard(
              onTap: () => tapped = true,
              child: const Text('Lead: Rohit Kumar'),
            ),
          ),
        ),
      );

      expect(find.text('Lead: Rohit Kumar'), findsOneWidget);
      await tester.tap(find.text('Lead: Rohit Kumar'));
      expect(tapped, isTrue);
    });

    testWidgets('Renders RebelStatusBadge with color', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: const Scaffold(
            body: RebelStatusBadge(label: 'NEW', color: AppTheme.statusNew),
          ),
        ),
      );

      expect(find.text('NEW'), findsOneWidget);
    });

    testWidgets('Renders RebelFilterPill with active state', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: Scaffold(
            body: RebelFilterPill(
              label: 'Kadavanthra',
              isSelected: true,
              count: 12,
              onTap: () {},
            ),
          ),
        ),
      );

      expect(find.text('Kadavanthra'), findsOneWidget);
      expect(find.text('(12)'), findsOneWidget);
    });

    testWidgets('Renders RebelMetricCard with title and metric value', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: const Scaffold(
            body: RebelMetricCard(
              title: 'Total Reviews',
              value: '42',
              icon: Icons.star,
            ),
          ),
        ),
      );

      expect(find.text('Total Reviews'), findsOneWidget);
      expect(find.text('42'), findsOneWidget);
    });

    testWidgets('Renders RebelEmptyState with icon and action button', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: Scaffold(
            body: RebelEmptyState(
              icon: Icons.photo_library_outlined,
              title: 'No photos found',
              message: 'Add photos to display on website',
              actionLabel: 'Add Photo',
              onAction: () {},
            ),
          ),
        ),
      );

      expect(find.text('No photos found'), findsOneWidget);
      expect(find.text('Add photos to display on website'), findsOneWidget);
      expect(find.text('Add Photo'), findsOneWidget);
    });
  });
}
