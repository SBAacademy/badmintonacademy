import 'package:flutter_test/flutter_test.dart';
import 'package:s_a_admin/core/services/whatsapp_service.dart';

void main() {
  group('WhatsApp Recipient Resolution & Normalization Comprehensive Tests', () {
    // TEST 1: Lead A -> correct phone
    test('TEST 1: Resolves Lead A phone (+91 98765 00001) -> 919876500001', () {
      final leadA = {
        'id': 'lead-001',
        'name': 'Rohit Kumar',
        'phone': '+91 98765 00001',
        'branch': 'kadavanthra',
        'program': 'Kids Beginner',
      };

      final resolved = WhatsAppService.resolveForLead(leadA);
      expect(resolved, '+91 98765 00001');

      final normalized = WhatsAppService.normalizePhoneNumber(resolved);
      expect(normalized.isValid, isTrue);
      expect(normalized.normalizedPhone, '919876500001');
    });

    // TEST 2: Lead B -> correct phone
    test('TEST 2: Resolves Lead B phone (+91 98765 00002) -> 919876500002', () {
      final leadB = {
        'id': 'lead-002',
        'name': 'Ananya Menon',
        'phone': '+91 98765 00002',
        'branch': 'kumbalanghi',
        'program': 'Elite Junior',
      };

      final resolved = WhatsAppService.resolveForLead(leadB);
      expect(resolved, '+91 98765 00002');

      final normalized = WhatsAppService.normalizePhoneNumber(resolved);
      expect(normalized.isValid, isTrue);
      expect(normalized.normalizedPhone, '919876500002');
    });

    // TEST 3: Lead C -> correct phone
    test('TEST 3: Resolves Lead C phone (+91 98765 00003) -> 919876500003', () {
      final leadC = {
        'id': 'lead-003',
        'name': 'Siddharth Nair',
        'phone': '+91 98765 00003',
        'branch': 'maradu',
        'program': 'Adult Fitness',
      };

      final resolved = WhatsAppService.resolveForLead(leadC);
      expect(resolved, '+91 98765 00003');

      final normalized = WhatsAppService.normalizePhoneNumber(resolved);
      expect(normalized.isValid, isTrue);
      expect(normalized.normalizedPhone, '919876500003');
    });

    // TEST 4: Rapid switching Lead A -> Lead B -> Lead C ensures NO stale phone
    test('TEST 4: Rapid switching Lead A -> Lead B -> Lead C produces distinct recipient numbers without stale state', () {
      final leadA = {'id': 'lead-A', 'name': 'Lead Alpha', 'phone': '9800011111'};
      final leadB = {'id': 'lead-B', 'name': 'Lead Beta', 'phone': '9800022222'};
      final leadC = {'id': 'lead-C', 'name': 'Lead Gamma', 'phone': '9800033333'};

      // Rapidly switch selection
      dynamic currentSelection = leadA;
      String? phoneA = WhatsAppService.resolveForLead(currentSelection);
      String? numA = WhatsAppService.normalizePhoneNumber(phoneA).normalizedPhone;

      currentSelection = leadB;
      String? phoneB = WhatsAppService.resolveForLead(currentSelection);
      String? numB = WhatsAppService.normalizePhoneNumber(phoneB).normalizedPhone;

      currentSelection = leadC;
      String? phoneC = WhatsAppService.resolveForLead(currentSelection);
      String? numC = WhatsAppService.normalizePhoneNumber(phoneC).normalizedPhone;

      expect(numA, '919800011111');
      expect(numB, '919800022222');
      expect(numC, '919800033333');

      expect(numA, isNot(equals(numB)));
      expect(numB, isNot(equals(numC)));
      expect(numA, isNot(equals(numC)));
    });

    // TEST 5: Indian phone normalization (+91 98765 43210 -> 919876543210)
    test('TEST 5: Normalizes phone with spaces (+91 98765 43210)', () {
      final res = WhatsAppService.normalizePhoneNumber('+91 98765 43210');
      expect(res.isValid, isTrue);
      expect(res.normalizedPhone, '919876543210');
    });

    // TEST 6: Phone with +91 (+919876543210)
    test('TEST 6: Normalizes phone with +91 (+919876543210)', () {
      final res = WhatsAppService.normalizePhoneNumber('+919876543210');
      expect(res.isValid, isTrue);
      expect(res.normalizedPhone, '919876543210');
    });

    // TEST 7: 10-digit Indian phone (9876543210)
    test('TEST 7: Normalizes 10-digit Indian mobile number to 919876543210', () {
      final res = WhatsAppService.normalizePhoneNumber('9876543210');
      expect(res.isValid, isTrue);
      expect(res.normalizedPhone, '919876543210');
    });

    // TEST 8: Phone with leading zero trunk (09876543210)
    test('TEST 8: Normalizes phone starting with trunk 0 (09876543210)', () {
      final res = WhatsAppService.normalizePhoneNumber('09876543210');
      expect(res.isValid, isTrue);
      expect(res.normalizedPhone, '919876543210');
    });

    // TEST 9: Missing and blank phone rejection
    test('TEST 9: Rejects missing, null, and blank phone numbers', () {
      final resNull = WhatsAppService.normalizePhoneNumber(null);
      expect(resNull.isValid, isFalse);
      expect(resNull.errorMessage, contains('not available'));

      final resEmpty = WhatsAppService.normalizePhoneNumber('');
      expect(resEmpty.isValid, isFalse);

      final resSpaces = WhatsAppService.normalizePhoneNumber('   ');
      expect(resSpaces.isValid, isFalse);
    });

    // TEST 10: Invalid format phone numbers
    test('TEST 10: Rejects too short, non-numeric, or repeated digit phone numbers', () {
      final resShort = WhatsAppService.normalizePhoneNumber('12345');
      expect(resShort.isValid, isFalse);

      final resAlpha = WhatsAppService.normalizePhoneNumber('not-a-number');
      expect(resAlpha.isValid, isFalse);

      final resZeros = WhatsAppService.normalizePhoneNumber('0000000000');
      expect(resZeros.isValid, isFalse);
    });

    // TEST 11: 1-Click WhatsApp Direct Templates Variable Interpolation
    test('TEST 11: Interpolates [Name], [Centre], [Program], [Date], [Time] in all 5 templates with real lead data', () {
      final lead = {
        'id': 'lead-real',
        'name': 'Rohit Kumar',
        'phone': '9876543210',
        'branch': 'kadavanthra',
        'program': 'Junior Badminton Coaching',
        'follow_up_date': '2026-09-15',
        'slot': '05:00 PM',
      };

      // 1. New Enquiry
      final t1 = WhatsAppService.defaultTemplates.firstWhere((t) => t.id == 'new_enquiry');
      final msg1 = WhatsAppService.interpolateTemplate(t1.message, lead);
      expect(msg1, contains('Rohit Kumar'));
      expect(msg1, contains('Junior Badminton Coaching'));
      expect(msg1, contains('Kadavanthra'));
      expect(msg1, isNot(contains('[Name]')));
      expect(msg1, isNot(contains('[Centre]')));
      expect(msg1, isNot(contains('[Program]')));

      // 2. Follow Up
      final t2 = WhatsAppService.defaultTemplates.firstWhere((t) => t.id == 'follow_up');
      final msg2 = WhatsAppService.interpolateTemplate(t2.message, lead);
      expect(msg2, contains('Rohit Kumar'));
      expect(msg2, contains('Kadavanthra'));
      expect(msg2, isNot(contains('[Name]')));

      // 3. Trial Confirmation
      final t3 = WhatsAppService.defaultTemplates.firstWhere((t) => t.id == 'trial_confirmation');
      final msg3 = WhatsAppService.interpolateTemplate(t3.message, lead);
      expect(msg3, contains('Rohit Kumar'));
      expect(msg3, contains('Kadavanthra'));

      // 4. Trial Reminder
      final t4 = WhatsAppService.defaultTemplates.firstWhere((t) => t.id == 'trial_reminder');
      final msg4 = WhatsAppService.interpolateTemplate(t4.message, lead);
      expect(msg4, contains('Rohit Kumar'));
      expect(msg4, contains('05:00 PM'));
      expect(msg4, contains('Kadavanthra'));

      // 5. General Enquiry
      final t5 = WhatsAppService.defaultTemplates.firstWhere((t) => t.id == 'general_enquiry');
      final msg5 = WhatsAppService.interpolateTemplate(t5.message, lead);
      expect(msg5, contains('Rohit Kumar'));
      expect(msg5, contains('Kadavanthra'));
    });

    // TEST 12: WhatsApp URI generation and URL encoding
    test('TEST 12: Builds correct wa.me URI with URL encoded message parameters', () {
      final uri = WhatsAppService.buildWhatsAppUri('919876543210', 'Hi Rohit, trial at Kadavanthra & ₹5,000 fee');
      expect(uri.scheme, 'https');
      expect(uri.host, 'wa.me');
      expect(uri.path, '/919876543210');
      expect(uri.queryParameters['text'], 'Hi Rohit, trial at Kadavanthra & ₹5,000 fee');
      expect(uri.toString(), contains('wa.me/919876543210?text=Hi%20Rohit%2C%20trial%20at%20Kadavanthra%20%26%20%E2%82%B95%2C000%20fee'));
    });

    // TEST 13: WhatsAppTemplate model JSON serialization
    test('TEST 13: Serializes and deserializes WhatsAppTemplate model accurately', () {
      const template = WhatsAppTemplate(
        id: 'custom_01',
        name: 'WhatsApp — Weekend Camp',
        purpose: 'Weekend training camp invitation',
        message: 'Hi [Name], join our weekend training at [Centre].',
        isActive: true,
      );

      final json = template.toJson();
      final revived = WhatsAppTemplate.fromJson(json);

      expect(revived.id, 'custom_01');
      expect(revived.name, 'WhatsApp — Weekend Camp');
      expect(revived.purpose, 'Weekend training camp invitation');
      expect(revived.message, 'Hi [Name], join our weekend training at [Centre].');
      expect(revived.isActive, isTrue);
    });
  });
}
