import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../auth/auth_provider.dart';
import '../../features/splash/presentation/splash_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/navigation/main_scaffold.dart';
import '../../features/crm/presentation/crm_screen.dart';
import '../../features/gallery/presentation/gallery_screen.dart';
import '../../features/articles/presentation/articles_screen.dart';
import '../../features/navigation/more_screen.dart';
import '../../features/coaches/presentation/coaches_screen.dart';
import '../../features/track_records/presentation/track_records_screen.dart';
import '../../features/reviews/presentation/reviews_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    redirect: (context, state) {
      final isSplash = state.uri.path == '/splash';
      final isLoggingIn = state.uri.path == '/login';
      if (isSplash) return null;
      if (authState.isLoading) return null;

      if (!authState.isAuthenticated && !isLoggingIn) {
        return '/login';
      }

      if (authState.isAuthenticated && (isLoggingIn || state.uri.path == '/today')) {
        return '/crm';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/crm',
            builder: (context, state) => const CrmScreen(),
          ),
          GoRoute(
            path: '/leads',
            redirect: (context, state) => '/crm',
          ),
          GoRoute(
            path: '/gallery',
            builder: (context, state) => const GalleryScreen(),
          ),
          GoRoute(
            path: '/articles',
            builder: (context, state) => const ArticlesScreen(),
          ),
          GoRoute(
            path: '/more',
            builder: (context, state) => const MoreScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/coaches',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CoachesScreen(),
      ),
      GoRoute(
        path: '/track-records',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const TrackRecordsScreen(),
      ),
      GoRoute(
        path: '/reviews',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ReviewsScreen(),
      ),
      GoRoute(
        path: '/settings',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
  );
});
