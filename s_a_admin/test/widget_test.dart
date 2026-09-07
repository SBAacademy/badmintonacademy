import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:s_a_admin/core/theme/app_theme.dart';
import 'package:s_a_admin/core/auth/auth_provider.dart';
import 'package:s_a_admin/core/network/api_endpoints.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:s_a_admin/core/network/offline_queue.dart';

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

  group('API Endpoints Directory Tests', () {
    test('Verifies centralized API endpoint routes match backend contracts', () {
      expect(ApiEndpoints.login, '/api/admin/auth/login');
      expect(ApiEndpoints.refresh, '/api/admin/auth/refresh');
      expect(ApiEndpoints.logout, '/api/admin/auth/logout');
      expect(ApiEndpoints.sessionsToday, '/api/admin/sessions/today');
      expect(ApiEndpoints.attendance, '/api/admin/attendance');
      expect(ApiEndpoints.leads, '/api/admin/leads');
      expect(ApiEndpoints.convertLead, '/api/admin/students/convert-lead');
      expect(ApiEndpoints.invoices, '/api/admin/invoices');
      expect(ApiEndpoints.payments, '/api/admin/payments');
      expect(ApiEndpoints.coaches, '/api/admin/coaches');
      expect(ApiEndpoints.centres, '/api/admin/centres');
      expect(ApiEndpoints.programs, '/api/admin/programs');
      expect(ApiEndpoints.performance, '/api/admin/performance');
      expect(ApiEndpoints.notifications, '/api/admin/notifications');
      expect(ApiEndpoints.search, '/api/admin/search');
      expect(ApiEndpoints.audit, '/api/admin/audit');
      expect(ApiEndpoints.staff, '/api/admin/staff');
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

      final coach = UserProfile(
        userId: 'usr-coach-01',
        email: 'anand@sabadminton.com',
        fullName: 'Coach Anand Varma',
        role: 'COACH',
        assignedCentre: 'kadavanthra',
      );

      expect(coach.isSuperAdmin, isFalse);
      expect(coach.isAdmin, isFalse);
      expect(coach.isCoach, isTrue);

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

  group('Offline Attendance Queue Storage Tests', () {
    test('Enqueues offline attendance record into local storage', () async {
      SharedPreferences.setMockInitialValues({});
      final queue = OfflineAttendanceQueue();

      expect(await queue.getPendingCount(), 0);

      await queue.enqueueSessionAttendance(
        sessionId: 'SES-TEST-01',
        records: [
          {'studentId': 'STU-01', 'status': 'PRESENT'},
          {'studentId': 'STU-02', 'status': 'LATE'},
        ],
      );

      expect(await queue.getPendingCount(), 1);
    });
  });

  group('Widget Render Tests', () {
    testWidgets('AppTheme surface and card render cleanly with branding', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.darkTheme,
          home: Scaffold(
            body: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  'S&A ACADEMY OS',
                  style: TextStyle(color: AppTheme.primary),
                ),
              ),
            ),
          ),
        ),
      );

      expect(find.text('S&A ACADEMY OS'), findsOneWidget);
    });
  });
}
