import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../auth/auth_provider.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/navigation/main_scaffold.dart';
import '../../features/dashboard/presentation/today_screen.dart';
import '../../features/leads/presentation/leads_screen.dart';
import '../../features/students/presentation/students_screen.dart';
import '../../features/schedule/presentation/schedule_screen.dart';
import '../../features/attendance/presentation/mark_attendance_screen.dart';
import '../../features/finance/presentation/finance_screen.dart';
import '../../features/coaches/presentation/coaches_screen.dart';
import '../../features/centres/presentation/centres_screen.dart';
import '../../features/programs/presentation/programs_screen.dart';
import '../../features/performance/presentation/performance_screen.dart';
import '../../features/reports/presentation/reports_screen.dart';
import '../../features/cms/presentation/cms_screen.dart';
import '../../features/audit/presentation/audit_screen.dart';
import '../../features/notifications/presentation/notifications_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/today',
    redirect: (context, state) {
      final isLoggingIn = state.uri.path == '/login';
      if (authState.isLoading) return null;

      if (!authState.isAuthenticated && !isLoggingIn) {
        return '/login';
      }

      if (authState.isAuthenticated && isLoggingIn) {
        return '/today';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/today',
            builder: (context, state) => const TodayScreen(),
          ),
          GoRoute(
            path: '/leads',
            builder: (context, state) => const LeadsScreen(),
          ),
          GoRoute(
            path: '/students',
            builder: (context, state) => const StudentsScreen(),
          ),
          GoRoute(
            path: '/schedule',
            builder: (context, state) => const ScheduleScreen(),
          ),
          GoRoute(
            path: '/finance',
            builder: (context, state) => const FinanceScreen(),
          ),
          GoRoute(
            path: '/coaches',
            builder: (context, state) => const CoachesScreen(),
          ),
          GoRoute(
            path: '/centres',
            builder: (context, state) => const CentresScreen(),
          ),
          GoRoute(
            path: '/programs',
            builder: (context, state) => const ProgramsScreen(),
          ),
          GoRoute(
            path: '/performance',
            builder: (context, state) => const PerformanceScreen(),
          ),
          GoRoute(
            path: '/reports',
            builder: (context, state) => const ReportsScreen(),
          ),
          GoRoute(
            path: '/cms',
            builder: (context, state) => const CmsScreen(),
          ),
          GoRoute(
            path: '/audit',
            builder: (context, state) => const AuditScreen(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationsScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/attendance',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final sessionId = state.uri.queryParameters['sessionId'];
          return MarkAttendanceScreen(sessionId: sessionId);
        },
      ),
    ],
  );
});
