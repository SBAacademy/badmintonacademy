import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;
  final SecureStorageService _storage = SecureStorageService();
  String baseUrl = 'http://172.20.10.9:3000';

  Future<void> initBaseUrl() async {
    final saved = await _storage.getBaseUrl();
    if (saved != null && saved.trim().isNotEmpty) {
      updateBaseUrl(saved.trim());
    }
  }

  void updateBaseUrl(String newUrl) {
    var formatted = newUrl.trim();
    if (formatted.endsWith('/')) {
      formatted = formatted.substring(0, formatted.length - 1);
    }
    baseUrl = formatted;
    dio.options.baseUrl = formatted;
    _storage.saveBaseUrl(formatted);
  }

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Attach JWT access token if present
          final token = await _storage.getAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException error, handler) async {
          // Handle 401 Unauthorized by attempting refresh token rotation
          if (error.response?.statusCode == 401 && !error.requestOptions.path.contains('/auth/')) {
            final refreshToken = await _storage.getRefreshToken();
            if (refreshToken != null) {
              try {
                final refreshResponse = await dio.post(
                  '/api/admin/auth/refresh',
                  data: {'refreshToken': refreshToken},
                );

                if (refreshResponse.statusCode == 200 && refreshResponse.data['success'] == true) {
                  final newAccessToken = refreshResponse.data['data']['accessToken'];
                  final newRefreshToken = refreshResponse.data['data']['refreshToken'];

                  await _storage.saveTokens(
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                  );

                  // Retry original request with new token
                  final retryOptions = error.requestOptions;
                  retryOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                  final cloneReq = await dio.request(
                    retryOptions.path,
                    data: retryOptions.data,
                    queryParameters: retryOptions.queryParameters,
                    options: Options(
                      method: retryOptions.method,
                      headers: retryOptions.headers,
                    ),
                  );
                  return handler.resolve(cloneReq);
                }
              } catch (_) {
                // Refresh failed, clear tokens
                await _storage.clearAll();
              }
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  void setBaseUrl(String url) {
    baseUrl = url;
    dio.options.baseUrl = url;
  }

  /// Resolves relative API paths (e.g. /api/images/...) to absolute URLs using baseUrl for local display
  String resolveUrl(String? url) {
    if (url == null || url.trim().isEmpty) return '';
    final trimmed = url.trim();
    if (trimmed.startsWith('/')) {
      return '$baseUrl$trimmed';
    }
    return trimmed;
  }

  /// Strips host/IP from internal API paths so URLs are stored portably as relative paths
  String sanitizeUrl(String? url) {
    if (url == null || url.trim().isEmpty) return '';
    final trimmed = url.trim();
    final apiIdx = trimmed.indexOf('/api/images/');
    if (apiIdx != -1) {
      return trimmed.substring(apiIdx);
    }
    final uploadIdx = trimmed.indexOf('/uploads/');
    if (uploadIdx != -1) {
      return trimmed.substring(uploadIdx);
    }
    return trimmed;
  }
}

