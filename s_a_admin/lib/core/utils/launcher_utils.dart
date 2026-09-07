import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class LauncherUtils {
  static Future<void> launchWhatsApp({
    required BuildContext context,
    required String phone,
    String message = '',
  }) async {
    // Sanitize phone number (remove spaces, dashes, parentheses)
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length == 10) {
        cleanPhone = '91$cleanPhone'; // default to India (+91)
      }
    } else {
      cleanPhone = cleanPhone.replaceFirst('+', '');
    }

    final encodedMsg = Uri.encodeComponent(message);
    final url = Uri.parse('https://wa.me/$cleanPhone?text=$encodedMsg');

    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not open WhatsApp.')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error launching WhatsApp: $e')),
        );
      }
    }
  }

  static Future<void> launchPhone({
    required BuildContext context,
    required String phone,
  }) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final url = Uri.parse('tel:$cleanPhone');

    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not initiate phone call.')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error launching dialer: $e')),
        );
      }
    }
  }

  static Future<void> launchEmail({
    required BuildContext context,
    required String email,
    String subject = '',
  }) async {
    final url = Uri.parse('mailto:$email?subject=${Uri.encodeComponent(subject)}');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      }
    } catch (_) {}
  }

  static Future<void> callPhone(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    final url = Uri.parse('tel:$cleanPhone');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      }
    } catch (_) {}
  }

  static Future<void> openWhatsApp(String phone, [String message = '']) async {
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.length == 10) {
        cleanPhone = '91$cleanPhone';
      }
    } else {
      cleanPhone = cleanPhone.replaceFirst('+', '');
    }
    final encodedMsg = Uri.encodeComponent(message);
    final url = Uri.parse('https://wa.me/$cleanPhone?text=$encodedMsg');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  static Future<void> sendEmail(String email, [String subject = '']) async {
    final url = Uri.parse('mailto:$email?subject=${Uri.encodeComponent(subject)}');
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      }
    } catch (_) {}
  }
}
