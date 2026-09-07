import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/whatsapp_service.dart';

class LauncherUtils {
  static Future<void> launchWhatsApp({
    required BuildContext context,
    required String phone,
    String message = '',
    String recipientLabel = 'recipient',
  }) async {
    await WhatsAppService.launchChat(
      context: context,
      rawPhone: phone,
      message: message,
      recipientLabel: recipientLabel,
    );
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

  static Future<bool> openWhatsApp(String phone, [String message = '']) async {
    return await WhatsAppService.launchChat(
      rawPhone: phone,
      message: message,
    );
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
