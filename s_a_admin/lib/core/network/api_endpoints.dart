class ApiEndpoints {
  // Auth
  static const String login = '/api/admin/auth/login';
  static const String refresh = '/api/admin/auth/refresh';
  static const String logout = '/api/admin/auth/logout';
  static const String me = '/api/admin/auth/me';

  // Sessions & Attendance
  static const String sessionsToday = '/api/admin/sessions/today';
  static const String attendance = '/api/admin/attendance';

  // Leads & CRM
  static const String leads = '/api/admin/leads';
  static String lead(String id) => '/api/admin/leads/$id';
  static String leadNotes(String id) => '/api/admin/leads/$id/notes';
  static const String trials = '/api/admin/trials';
  static String trial(String id) => '/api/admin/trials/$id';

  // Students & Parents
  static const String students = '/api/admin/students';
  static String student(String id) => '/api/admin/students/$id';
  static const String convertLead = '/api/admin/students/convert-lead';
  static const String parents = '/api/admin/parents';
  static String parent(String id) => '/api/admin/parents/$id';

  // Schedule & Batches
  static const String batches = '/api/admin/batches';
  static String batch(String id) => '/api/admin/batches/$id';

  // Finance & Ledger
  static const String invoices = '/api/admin/invoices';
  static const String payments = '/api/admin/payments';
  static const String paymentReminders = '/api/admin/payments/reminders';

  // Academy Assets & Directory
  static const String coaches = '/api/admin/coaches';
  static const String centres = '/api/admin/centres';
  static const String programs = '/api/admin/programs';
  static const String performance = '/api/admin/performance';
  static String studentPerformance(String id) => '/api/admin/performance/student/$id';

  // Management & Ops
  static const String reportsSummary = '/api/admin/reports/summary';
  static String cms(String section) => '/api/admin/cms/$section';
  static const String notifications = '/api/admin/notifications';
  static const String search = '/api/admin/search';
  static const String audit = '/api/admin/audit';
  static const String staff = '/api/admin/staff';
}
