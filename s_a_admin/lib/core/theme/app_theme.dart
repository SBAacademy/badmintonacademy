import 'package:flutter/material.dart';

class AppTheme {
  // Brand Color Tokens (Rebel Admin Aesthetic)
  static const Color background = Color(0xFF0A0C0F);          // Ultra-Deep Obsidian
  static const Color backgroundSecondary = Color(0xFF0D0F12); // Slightly raised dark
  static const Color surface = Color(0xFF13161C);             // Dark Surface
  static const Color surfaceAlt = Color(0xFF181C24);          // Alternate Surface
  static const Color surfaceElevated = Color(0xFF1D222C);     // Elevated Card/Sheet
  static const Color border = Color(0xFF232732);              // 1px Subtle Border
  static const Color borderSubtle = Color(0xFF1F242F);

  // Primary Electric Lime Brand Accent
  static const Color primary = Color(0xFFCCFF00);             // Electric Lime / Rebel Volt
  static const Color primaryHover = Color(0xFFB8E600);
  static const Color onPrimary = Color(0xFF0A0C0F);

  // Typography Tokens
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Operational Status Colors
  static const Color statusNew = Color(0xFF38BDF8);           // Sky Cyan (New / Inbound)
  static const Color statusTrial = Color(0xFFA855F7);         // Purple (Trial Scheduled)
  static const Color statusFollowUp = Color(0xFFFBBF24);      // Amber Gold (Follow-up)
  static const Color statusPresent = Color(0xFF22C55E);       // Emerald Green (Paid / Present)
  static const Color statusAbsent = Color(0xFFEF4444);        // Crimson Red (Overdue / Absent)
  static const Color statusLate = Color(0xFFFB923C);          // Orange (Late / Partial)

  // System Aliases
  static const Color success = statusPresent;
  static const Color warning = statusFollowUp;
  static const Color danger = statusAbsent;
  static const Color info = statusNew;

  // Typography Styles
  static const TextStyle pageTitle = TextStyle(
    color: textPrimary,
    fontSize: 28,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.8,
  );

  static const TextStyle sectionTitle = TextStyle(
    color: textPrimary,
    fontSize: 18,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.3,
  );

  static const TextStyle cardTitle = TextStyle(
    color: textPrimary,
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.2,
  );

  static const TextStyle body = TextStyle(
    color: textPrimary,
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.4,
  );

  static const TextStyle bodySecondary = TextStyle(
    color: textSecondary,
    fontSize: 13,
    fontWeight: FontWeight.w400,
    height: 1.3,
  );

  static const TextStyle caption = TextStyle(
    color: textMuted,
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.3,
  );

  static const TextStyle metricValue = TextStyle(
    color: textPrimary,
    fontSize: 26,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.8,
  );

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        onPrimary: onPrimary,
        surface: surface,
        onSurface: textPrimary,
        error: danger,
        outline: border,
      ),
      fontFamily: 'sans-serif',
      appBarTheme: const AppBarTheme(
        backgroundColor: background,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.5,
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: const BorderSide(color: border, width: 1),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: surfaceElevated,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: border, width: 1),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: surface,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          side: BorderSide(color: border, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceAlt,
        hintStyle: const TextStyle(color: textMuted, fontSize: 14),
        labelStyle: const TextStyle(color: textSecondary, fontSize: 14),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: primary, width: 1.5),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: onPrimary,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.2,
          ),
        ),
      ),
    );
  }
}
