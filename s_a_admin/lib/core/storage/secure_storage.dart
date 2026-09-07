import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    mOptions: MacOsOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const _keyAccessToken = 'sa_access_token';
  static const _keyRefreshToken = 'sa_refresh_token';
  static const _keyUserJson = 'sa_user_json';

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    String? userJson,
  }) async {
    await _storage.write(key: _keyAccessToken, value: accessToken);
    await _storage.write(key: _keyRefreshToken, value: refreshToken);
    if (userJson != null) {
      await _storage.write(key: _keyUserJson, value: userJson);
    }
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: _keyAccessToken);
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _keyRefreshToken);
  }

  Future<String?> getUserJson() async {
    return await _storage.read(key: _keyUserJson);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
