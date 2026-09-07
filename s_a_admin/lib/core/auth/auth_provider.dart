import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';
import '../network/api_client.dart';

class UserProfile {
  final String userId;
  final String email;
  final String fullName;
  final String role;
  final String? assignedCentre;

  UserProfile({
    required this.userId,
    required this.email,
    required this.fullName,
    required this.role,
    this.assignedCentre,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      userId: json['userId'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? json['full_name'] ?? '',
      role: json['role'] ?? 'COACH',
      assignedCentre: json['assignedCentre'] ?? json['assigned_centre'],
    );
  }

  Map<String, dynamic> toJson() => {
    'userId': userId,
    'email': email,
    'fullName': fullName,
    'role': role,
    'assignedCentre': assignedCentre,
  };

  bool get isSuperAdmin => role == 'SUPER_ADMIN';
  bool get isAdmin => role == 'SUPER_ADMIN' || role == 'ADMIN';
  bool get isCoach => role == 'COACH';
  bool get isFrontDesk => role == 'FRONT_DESK';
  bool get isContentManager => role == 'CONTENT_MANAGER';
}

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final UserProfile? user;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.isLoading = true,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    UserProfile? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final SecureStorageService _storage = SecureStorageService();
  final ApiClient _client = ApiClient();

  AuthNotifier() : super(AuthState()) {
    checkInitialAuth();
  }

  Future<void> checkInitialAuth() async {
    state = state.copyWith(isLoading: true);
    final token = await _storage.getAccessToken();
    final userJson = await _storage.getUserJson();

    if (token != null && userJson != null) {
      try {
        final profile = UserProfile.fromJson(jsonDecode(userJson));
        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: profile,
        );
        return;
      } catch (_) {
        await _storage.clearAll();
      }
    }

    state = state.copyWith(
      isAuthenticated: false,
      isLoading: false,
      user: null,
    );
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await _client.dio.post(
        '/api/admin/auth/login',
        data: {
          'email': email.trim(),
          'password': password,
        },
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        final accessToken = data['accessToken'];
        final refreshToken = data['refreshToken'];
        final userMap = data['user'];
        final userProfile = UserProfile.fromJson(userMap);

        await _storage.saveTokens(
          accessToken: accessToken,
          refreshToken: refreshToken,
          userJson: jsonEncode(userProfile.toJson()),
        );

        state = state.copyWith(
          isAuthenticated: true,
          isLoading: false,
          user: userProfile,
          error: null,
        );
        return true;
      } else {
        final err = response.data['error'] ?? 'Login failed. Please verify credentials.';
        state = state.copyWith(isLoading: false, error: err);
        return false;
      }
    } catch (e) {
      String msg = 'Unable to connect to academy server.';
      if (e is DioException && e.response?.data != null) {
        final data = e.response!.data;
        if (data is Map && data['error'] != null) {
          msg = data['error'].toString();
        }
      }
      state = state.copyWith(isLoading: false, error: msg);
      return false;
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    try {
      final refreshToken = await _storage.getRefreshToken();
      if (refreshToken != null) {
        await _client.dio.post('/api/admin/auth/logout', data: {'refreshToken': refreshToken});
      }
    } catch (_) {
      // Best-effort remote revocation
    }

    await _storage.clearAll();
    state = AuthState(isAuthenticated: false, isLoading: false, user: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
