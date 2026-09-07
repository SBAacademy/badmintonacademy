import SwiftUI

public enum RebelColors {
    // Brand Tokens (Rebel Admin Aesthetic)
    public static let pitchBlack = Color(hex: "#07090D")
    public static let darkSurface = Color(hex: "#12161F")
    public static let surfaceElevated = Color(hex: "#1A202C")
    public static let border = Color(hex: "#1F2937")
    public static let borderSubtle = Color(hex: "#2D3748")

    // Accents
    public static let acidLime = Color(hex: "#B8F000")
    public static let acidLimeDark = Color(hex: "#8EBE00")
    public static let pureWhite = Color(hex: "#FFFFFF")
    public static let textMuted = Color(hex: "#9CA3AF")
    public static let textSubtle = Color(hex: "#6B7280")

    // Semantic Status
    public static let emerald = Color(hex: "#34D399")
    public static let amber = Color(hex: "#FBBF24")
    public static let coral = Color(hex: "#F87171")
    public static let skyBlue = Color(hex: "#38BDF8")
    public static let purple = Color(hex: "#A78BFA")
}

extension Color {
    init(hex: String) {
        let cleanHex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleanHex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch cleanHex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    // Dynamic Adaptive Colors for Dark/Light
    public static var rebelBackground: Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .light ? UIColor(Color(hex: "#F9FAFB")) : UIColor(RebelColors.pitchBlack)
        })
    }

    public static var rebelSurface: Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .light ? UIColor.white : UIColor(RebelColors.darkSurface)
        })
    }

    public static var rebelSurfaceElevated: Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .light ? UIColor(Color(hex: "#F3F4F6")) : UIColor(RebelColors.surfaceElevated)
        })
    }

    public static var rebelBorder: Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .light ? UIColor(Color(hex: "#E5E7EB")) : UIColor(RebelColors.border)
        })
    }

    public static var rebelPrimary: Color {
        RebelColors.acidLime
    }

    public static var rebelTextPrimary: Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .light ? UIColor(Color(hex: "#111827")) : UIColor(Color(hex: "#F9FAFB"))
        })
    }

    public static var rebelTextSecondary: Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .light ? UIColor(Color(hex: "#4B5563")) : UIColor(RebelColors.textMuted)
        })
    }

    public static var rebelPitchBlack: Color { RebelColors.pitchBlack }
    public static var rebelDarkSurface: Color { RebelColors.darkSurface }
    public static var rebelLime: Color { RebelColors.acidLime }
    public static var rebelWhite: Color { RebelColors.pureWhite }
    public static var rebelMuted: Color { RebelColors.textMuted }
    public static var rebelDanger: Color { RebelColors.coral }
    public static var rebelWarning: Color { RebelColors.amber }
    public static var rebelInfo: Color { RebelColors.skyBlue }
    public static var rebelSuccess: Color { RebelColors.emerald }
}

