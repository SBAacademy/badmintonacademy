import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

import 'core/network/api_client.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient().initBaseUrl();
  runApp(
    const ProviderScope(
      child: SABadmintonAdminApp(),
    ),
  );
}

class SABadmintonAdminApp extends ConsumerWidget {
  const SABadmintonAdminApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'S&A Badminton Academy Management Platform',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: router,
    );
  }
}
