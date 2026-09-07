import SwiftUI

public enum RebelTypography {
    public static let appTitle: Font = .system(size: 20, weight: .black, design: .default)
    public static let sectionTitle: Font = .system(size: 16, weight: .bold, design: .default)
    public static let metricNumber: Font = .system(size: 22, weight: .black, design: .rounded)
    public static let bodyBold: Font = .system(size: 14, weight: .bold, design: .default)
    public static let bodyRegular: Font = .system(size: 14, weight: .regular, design: .default)
    public static let caption: Font = .system(size: 12, weight: .medium, design: .default)
    public static let badge: Font = .system(size: 10, weight: .heavy, design: .default)
}

public struct RebelCardModifier: ViewModifier {
    public var borderColor: Color = .rebelBorder
    public var padding: CGFloat = 16

    public func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(Color.rebelSurface)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(borderColor, lineWidth: 1)
            )
    }
}

public struct RebelBadge: View {
    public let text: String
    public let color: Color
    public var icon: String? = nil

    public init(_ text: String, color: Color, icon: String? = nil) {
        self.text = text
        self.color = color
        self.icon = icon
    }

    public init(text: String, color: Color, icon: String? = nil) {
        self.text = text
        self.color = color
        self.icon = icon
    }

    public var body: some View {
        HStack(spacing: 4) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 9, weight: .bold))
            }
            Text(text)
                .font(RebelTypography.badge)
        }
        .foregroundColor(color)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(color.opacity(0.14))
        .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
        .accessibilityElement(children: .combine)
        .accessibilityLabel(text)
    }
}

extension View {
    public func rebelCard(borderColor: Color = .rebelBorder, padding: CGFloat = 16) -> some View {
        modifier(RebelCardModifier(borderColor: borderColor, padding: padding))
    }
}
