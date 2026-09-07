import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../components/rebel_components.dart';

/// Result of validating and normalizing a phone number
class PhoneValidationResult {
  final bool isValid;
  final String? rawPhone;
  final String? normalizedPhone;
  final String? errorMessage;

  const PhoneValidationResult({
    required this.isValid,
    this.rawPhone,
    this.normalizedPhone,
    this.errorMessage,
  });

  @override
  String toString() =>
      'PhoneValidationResult(isValid: $isValid, raw: $rawPhone, normalized: $normalizedPhone, error: $errorMessage)';
}

/// Centralized service for resolving WhatsApp recipients, formatting numbers,
/// generating dynamic messages, and launching chats safely without global/stale state.
class WhatsAppService {
  /// Normalizes a raw phone number to international E.164 digits without punctuation or '+' prefix.
  ///
  /// Examples:
  /// - "+91 98765 43210" -> "919876543210"
  /// - "9876543210" (10 digits) -> "919876543210"
  /// - "09876543210" (11 digits with 0) -> "919876543210"
  /// - "919876543210" -> "919876543210"
  /// - "+1 (415) 555-2671" -> "14155552671"
  /// - null or "" -> Invalid
  static PhoneValidationResult normalizePhoneNumber(String? rawPhone) {
    if (rawPhone == null || rawPhone.trim().isEmpty) {
      return PhoneValidationResult(
        isValid: false,
        rawPhone: rawPhone,
        errorMessage: 'WhatsApp number is not available.',
      );
    }

    final trimmed = rawPhone.trim();

    // Remove everything except digits and leading '+'
    String digitsOnly = trimmed.replaceAll(RegExp(r'[^0-9+]'), '');

    if (digitsOnly.isEmpty) {
      return PhoneValidationResult(
        isValid: false,
        rawPhone: rawPhone,
        errorMessage: 'Invalid WhatsApp number.',
      );
    }

    String normalized = digitsOnly;

    // Handle leading '+'
    if (normalized.startsWith('+')) {
      normalized = normalized.substring(1);
    } else if (normalized.startsWith('00')) {
      // International prefix 00
      normalized = normalized.substring(2);
    } else if (normalized.startsWith('0') && normalized.length == 11) {
      // Indian trunk prefix 0 followed by 10 digits
      normalized = '91${normalized.substring(1)}';
    } else if (normalized.length == 10) {
      // Standard 10-digit Indian mobile number
      normalized = '91$normalized';
    }

    // Strip any lingering non-digit characters
    normalized = normalized.replaceAll(RegExp(r'[^0-9]'), '');

    // Validation checks:
    // 1. Minimum 10 digits, maximum 15 digits (E.164 standard)
    if (normalized.length < 10 || normalized.length > 15) {
      return PhoneValidationResult(
        isValid: false,
        rawPhone: rawPhone,
        normalizedPhone: normalized,
        errorMessage: 'Invalid phone number length (${normalized.length} digits).',
      );
    }

    // 2. Reject numbers made of only repeating identical digits (e.g. "0000000000")
    if (RegExp(r'^(\d)\1+$').hasMatch(normalized)) {
      return PhoneValidationResult(
        isValid: false,
        rawPhone: rawPhone,
        normalizedPhone: normalized,
        errorMessage: 'Invalid phone number format.',
      );
    }

    return PhoneValidationResult(
      isValid: true,
      rawPhone: rawPhone,
      normalizedPhone: normalized,
    );
  }

  /// Builds a Uri for wa.me with url-encoded message
  static Uri buildWhatsAppUri(String normalizedPhone, [String message = '']) {
    final encodedMsg = Uri.encodeComponent(message);
    return Uri.parse('https://wa.me/$normalizedPhone?text=$encodedMsg');
  }

  /// Resolves the intended recipient phone number from a dynamic Invoice record.
  /// Prioritizes:
  /// 1. `invoice['parent_phone']`
  /// 2. `invoice['parent']?['phone']`
  /// 3. `invoice['phone']`
  /// 4. `invoice['student_phone']`
  /// 5. `invoice['emergency_contact']`
  static String? resolveForInvoice(dynamic invoice) {
    if (invoice == null || invoice is! Map) return null;

    final parentPhone = invoice['parent_phone']?.toString().trim();
    if (parentPhone != null && parentPhone.isNotEmpty) {
      _logResolution('Invoice', invoice['id'] ?? invoice['invoice_number'], 'parent_phone', parentPhone);
      return parentPhone;
    }

    final parentObj = invoice['parent'];
    if (parentObj is Map) {
      final pPhone = parentObj['phone']?.toString().trim();
      if (pPhone != null && pPhone.isNotEmpty) {
        _logResolution('Invoice', invoice['id'] ?? invoice['invoice_number'], 'parent.phone', pPhone);
        return pPhone;
      }
    }

    final directPhone = invoice['phone']?.toString().trim();
    if (directPhone != null && directPhone.isNotEmpty) {
      _logResolution('Invoice', invoice['id'] ?? invoice['invoice_number'], 'phone', directPhone);
      return directPhone;
    }

    final studentPhone = invoice['student_phone']?.toString().trim();
    if (studentPhone != null && studentPhone.isNotEmpty) {
      _logResolution('Invoice', invoice['id'] ?? invoice['invoice_number'], 'student_phone', studentPhone);
      return studentPhone;
    }

    final emergency = invoice['emergency_contact']?.toString().trim();
    if (emergency != null && emergency.isNotEmpty) {
      _logResolution('Invoice', invoice['id'] ?? invoice['invoice_number'], 'emergency_contact', emergency);
      return emergency;
    }

    _logResolution('Invoice', invoice['id'] ?? invoice['invoice_number'], 'NONE', 'null');
    return null;
  }

  /// Resolves the intended recipient phone number from a dynamic Student record.
  /// If [preferParent] is true (default for academy operations & billing), checks:
  /// 1. `student['parent_phone']`
  /// 2. `student['parent']?['phone']`
  /// 3. `student['emergency_contact']`
  /// 4. `student['phone']`
  ///
  /// If [preferParent] is false, checks student's direct phone first.
  static String? resolveForStudent(dynamic student, {bool preferParent = true}) {
    if (student == null || student is! Map) return null;

    final studentId = student['id'] ?? student['student_id'] ?? student['full_name'];

    if (preferParent) {
      final parentPhone = student['parent_phone']?.toString().trim();
      if (parentPhone != null && parentPhone.isNotEmpty) {
        _logResolution('Student', studentId, 'parent_phone', parentPhone);
        return parentPhone;
      }

      final parentObj = student['parent'];
      if (parentObj is Map) {
        final pPhone = parentObj['phone']?.toString().trim();
        if (pPhone != null && pPhone.isNotEmpty) {
          _logResolution('Student', studentId, 'parent.phone', pPhone);
          return pPhone;
        }
      }

      final emergency = student['emergency_contact']?.toString().trim();
      if (emergency != null && emergency.isNotEmpty) {
        _logResolution('Student', studentId, 'emergency_contact', emergency);
        return emergency;
      }

      final directPhone = student['phone']?.toString().trim() ?? student['student_phone']?.toString().trim();
      if (directPhone != null && directPhone.isNotEmpty) {
        _logResolution('Student', studentId, 'phone', directPhone);
        return directPhone;
      }
    } else {
      final directPhone = student['phone']?.toString().trim() ?? student['student_phone']?.toString().trim();
      if (directPhone != null && directPhone.isNotEmpty) {
        _logResolution('Student', studentId, 'phone', directPhone);
        return directPhone;
      }

      final parentPhone = student['parent_phone']?.toString().trim();
      if (parentPhone != null && parentPhone.isNotEmpty) {
        _logResolution('Student', studentId, 'parent_phone', parentPhone);
        return parentPhone;
      }
    }

    _logResolution('Student', studentId, 'NONE', 'null');
    return null;
  }

  /// Resolves recipient phone for a Lead record.
  static String? resolveForLead(dynamic lead) {
    if (lead == null || lead is! Map) return null;

    final leadId = lead['id'] ?? lead['name'];
    final phone = lead['phone']?.toString().trim() ??
        lead['mobile']?.toString().trim() ??
        lead['contact_number']?.toString().trim();

    _logResolution('Lead', leadId, 'phone', phone ?? 'null');
    return (phone != null && phone.isNotEmpty) ? phone : null;
  }

  /// Constructs a personalized, professional payment reminder message.
  static String buildPaymentReminderMessage({
    required dynamic invoice,
  }) {
    final invNum = invoice['invoice_number'] ?? invoice['id'] ?? 'INV-XXXX';
    final studentName = invoice['student_name'] ?? invoice['student'] ?? 'Student';
    final parentName = invoice['parent_name'] ?? invoice['parent'] ?? 'Parent';
    final billingPeriod = invoice['billing_period'] ?? invoice['month'] ?? 'Current Month';

    final totalAmount = double.tryParse(invoice['amount']?.toString() ?? invoice['amount_due']?.toString() ?? '0') ?? 0;
    final paidAmount = double.tryParse(invoice['paid_amount']?.toString() ?? '0') ?? 0;
    final balance = double.tryParse(invoice['balance_amount']?.toString() ?? invoice['balance_due']?.toString() ?? '0') ??
        (totalAmount - paidAmount);

    final dueDate = invoice['due_date']?.toString().split('T').first ?? 'Due Soon';

    final numFormat = NumberFormat('#,##,###');

    return 'Hello $parentName,\n\n'
        'This is a payment reminder from S&A Badminton Academy.\n\n'
        'Student: $studentName\n'
        'Invoice: $invNum\n'
        'Billing Period: $billingPeriod\n'
        'Total Amount: ₹${numFormat.format(totalAmount)}\n'
        'Paid: ₹${numFormat.format(paidAmount)}\n'
        'Outstanding Balance: ₹${numFormat.format(balance)}\n'
        'Due Date: $dueDate\n\n'
        'Please complete the pending fee payment via UPI or at the academy reception at your earliest convenience.\n\n'
        'Thank you,\n'
        'S&A Badminton Academy';
  }

  /// Constructs a personalized lead follow-up message.
  static String buildLeadFollowUpMessage({
    required dynamic lead,
  }) {
    final name = lead['name'] ?? 'Friend';
    final program = lead['program'] ?? lead['primary_program'] ?? 'our training batches';
    final branch = lead['branch'] ?? lead['centre'] ?? 'S&A Academy';

    return 'Hi $name,\n\n'
        'Greetings from S&A Badminton Academy!\n\n'
        'Thank you for your enquiry regarding $program at our $branch centre. '
        'We would be delighted to schedule a free trial session for you.\n\n'
        'Please let us know your preferred day and time slot.\n\n'
        'Warm regards,\n'
        'S&A Badminton Academy';
  }

  /// Default 1-Click WhatsApp direct templates as required by S&A Rebel CRM
  static List<WhatsAppTemplate> defaultTemplates = [
    const WhatsAppTemplate(
      id: 'new_enquiry',
      name: 'WhatsApp — New Enquiry',
      purpose: 'Initial response to new inbound enquiries',
      message: 'Hi [Name], thank you for contacting S&A Badminton Academy. We received your enquiry for [Program] at our [Centre] centre. How can we help you?',
      isActive: true,
    ),
    const WhatsAppTemplate(
      id: 'follow_up',
      name: 'WhatsApp — Follow Up',
      purpose: 'Follow-up regarding earlier enquiry',
      message: 'Hi [Name], this is S&A Badminton Academy following up regarding your badminton coaching enquiry at [Centre]. Please let us know if you would like to proceed.',
      isActive: true,
    ),
    const WhatsAppTemplate(
      id: 'trial_confirmation',
      name: 'WhatsApp — Trial Confirmation',
      purpose: 'Confirm scheduled free trial booking',
      message: 'Hi [Name], your badminton trial session at S&A Badminton Academy has been scheduled at [Centre]. We look forward to seeing you.',
      isActive: true,
    ),
    const WhatsAppTemplate(
      id: 'trial_reminder',
      name: 'WhatsApp — Trial Reminder',
      purpose: 'Reminder on trial session day',
      message: 'Hi [Name], just a reminder about your badminton trial session at S&A Badminton Academy today at [Time] at [Centre].',
      isActive: true,
    ),
    const WhatsAppTemplate(
      id: 'general_enquiry',
      name: 'WhatsApp — General Enquiry',
      purpose: 'General welcoming enquiry message',
      message: 'Hi [Name], thank you for reaching out to S&A Badminton Academy. How can we assist you with badminton training at our [Centre] centre?',
      isActive: true,
    ),
  ];

  /// Interpolates template variables with real lead data:
  /// [Name], [Centre], [Program], [Date], [Time]
  static String interpolateTemplate(String template, dynamic lead) {
    if (lead == null || lead is! Map) return template;

    String result = template;

    // [Name]
    final name = (lead['name'] ?? lead['full_name'] ?? 'Friend').toString().trim();
    result = result.replaceAll('[Name]', name);

    // [Centre]
    final centre = (lead['branch'] ?? lead['centre'] ?? 'Kadavanthra').toString().trim();
    final formattedCentre = centre.isEmpty
        ? 'Kadavanthra'
        : '${centre[0].toUpperCase()}${centre.substring(1).toLowerCase()}';
    result = result.replaceAll('[Centre]', formattedCentre);

    // [Program]
    final program = (lead['program'] ?? lead['primary_program'] ?? 'Badminton Coaching').toString().trim();
    result = result.replaceAll('[Program]', program);

    // [Date]
    final date = (lead['follow_up_date'] ?? lead['trial_date'] ?? 'Upcoming').toString().split('T').first;
    result = result.replaceAll('[Date]', date);

    // [Time]
    final time = (lead['slot'] ?? lead['time_slot'] ?? 'your scheduled time').toString().trim();
    result = result.replaceAll('[Time]', time);

    return result;
  }

  /// 1-Click WhatsApp launcher for a specific template bound directly to the selected lead.
  /// Enforces: selectedLead.id -> selectedLead.phone -> normalize -> WhatsApp URL.
  static Future<bool> launchTemplate({
    BuildContext? context,
    required dynamic lead,
    required WhatsAppTemplate template,
  }) async {
    final rawPhone = resolveForLead(lead);
    final leadName = lead is Map ? (lead['name'] ?? 'lead') : 'lead';

    if (rawPhone == null || rawPhone.trim().isEmpty) {
      if (context != null && context.mounted) {
        RebelToast.showError(context, 'WhatsApp number is not available for this lead.');
      }
      return false;
    }

    final message = interpolateTemplate(template.message, lead);

    return launchChat(
      context: context,
      rawPhone: rawPhone,
      message: message,
      recipientLabel: 'lead ($leadName)',
    );
  }

  /// Launches WhatsApp with full recipient verification, normalization,
  /// and user-facing error feedback if the number is missing or invalid.
  static Future<bool> launchChat({
    BuildContext? context,
    required String? rawPhone,
    required String message,
    String recipientLabel = 'recipient',
  }) async {
    final validation = normalizePhoneNumber(rawPhone);

    if (!validation.isValid) {
      if (context != null && context.mounted) {
        final error = (rawPhone == null || rawPhone.trim().isEmpty)
            ? 'WhatsApp number is not available for this $recipientLabel.'
            : 'Invalid WhatsApp number ($rawPhone).';
        RebelToast.showError(context, error);
      }
      return false;
    }

    final url = buildWhatsAppUri(validation.normalizedPhone!, message);

    if (kDebugMode) {
      debugPrint('[WhatsAppService] Launching URL: $url');
    }

    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
        return true;
      } else {
        if (context != null && context.mounted) {
          RebelToast.showError(
            context,
            'WhatsApp is not available on this device.',
          );
        }
        return false;
      }
    } catch (e) {
      if (context != null && context.mounted) {
        RebelToast.showError(context, 'Error launching WhatsApp: $e');
      }
      return false;
    }
  }

  static void _logResolution(String entity, dynamic entityId, String sourceKey, String phone) {
    if (kDebugMode) {
      debugPrint('[WhatsAppService] Entity: $entity (ID: $entityId) -> Field: $sourceKey -> Phone: $phone');
    }
  }
}

/// Model for WhatsApp Direct Message Templates
class WhatsAppTemplate {
  final String id;
  final String name;
  final String purpose;
  final String message;
  final bool isActive;

  const WhatsAppTemplate({
    required this.id,
    required this.name,
    required this.purpose,
    required this.message,
    this.isActive = true,
  });

  WhatsAppTemplate copyWith({
    String? id,
    String? name,
    String? purpose,
    String? message,
    bool? isActive,
  }) {
    return WhatsAppTemplate(
      id: id ?? this.id,
      name: name ?? this.name,
      purpose: purpose ?? this.purpose,
      message: message ?? this.message,
      isActive: isActive ?? this.isActive,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'purpose': purpose,
        'message': message,
        'isActive': isActive,
      };

  factory WhatsAppTemplate.fromJson(Map<String, dynamic> json) => WhatsAppTemplate(
        id: json['id'] as String,
        name: json['name'] as String,
        purpose: json['purpose'] as String,
        message: json['message'] as String,
        isActive: json['isActive'] as bool? ?? true,
      );
}

