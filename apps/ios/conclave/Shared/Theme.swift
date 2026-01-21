//
//  Theme.swift
//  Conclave
//
//  Design System
//

import SwiftUI
import UIKit

// MARK: - Colors

enum ACMColors {
    static let primaryOrange = Color(hex: "#F95F4A")
    static let primaryPink = Color(hex: "#FF007A")
    static let cream = Color(hex: "#FEFCD9")
    static let dark = Color(hex: "#060606")
    static let darkAlt = Color(hex: "#0d0e0d")
    static let surface = Color(hex: "#1a1a1a")
    static let surfaceLight = Color(hex: "#252525")
    static let surfaceHover = Color(hex: "#2a2a2a")
    
    static let creamDim = cream.opacity(0.4)
    static let creamMuted = cream.opacity(0.3)
    static let creamSubtle = cream.opacity(0.15)
    static let creamFaint = cream.opacity(0.1)
    static let creamGhost = cream.opacity(0.05)
}

// MARK: - Gradients

enum ACMGradients {
    static let primary = LinearGradient(
        colors: [ACMColors.primaryOrange, ACMColors.primaryPink],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let avatarBackground = LinearGradient(
        colors: [ACMColors.primaryOrange.opacity(0.2), ACMColors.primaryPink.opacity(0.2)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    static let cardBackground = LinearGradient(
        colors: [ACMColors.surface, ACMColors.darkAlt],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

// MARK: - Typography

enum ACMFont {
    private static let regular = "PolySansTrial-Neutral"
    private static let medium = "PolySansTrial-Median"
    private static let bold = "PolySansTrial-Bulky"
    private static let wideBold = "PolySansTrial-BulkyWide"
    private static let monoRegular = "PolySansTrial-NeutralMono"
    private static let monoMedium = "PolySansTrial-MedianMono"
    private static let monoBold = "PolySansTrial-BulkyMono"

    static func trial(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        let name: String
        switch weight {
        case .medium, .semibold:
            name = medium
        case .bold, .heavy, .black:
            name = bold
        default:
            name = regular
        }
        return custom(name, size: size, fallback: .system(size: size, weight: weight, design: .default))
    }

    static func mono(_ size: CGFloat, weight: Font.Weight = .medium) -> Font {
        let name: String
        switch weight {
        case .bold, .heavy, .black:
            name = monoBold
        case .regular:
            name = monoRegular
        default:
            name = monoMedium
        }
        return custom(name, size: size, fallback: .system(size: size, weight: weight, design: .monospaced))
    }

    static func wide(_ size: CGFloat) -> Font {
        custom(wideBold, size: size, fallback: .system(size: size, weight: .bold, design: .default))
    }

    private static func custom(_ name: String, size: CGFloat, fallback: Font) -> Font {
        if UIFont(name: name, size: size) != nil {
            return .custom(name, size: size)
        }
        return fallback
    }
}

// MARK: - Control Button Styles

struct ACMControlButtonStyle: ButtonStyle {
    var isActive: Bool = false
    var isMuted: Bool = false
    var isGhostDisabled: Bool = false
    var isDanger: Bool = false
    var isHandRaised: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16))
            .foregroundStyle(foregroundColor)
            .frame(width: 44, height: 44)
            .background(backgroundColor)
            .clipShape(Circle())
            .overlay(
                Circle()
                    .strokeBorder(borderColor, lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
            .opacity(isGhostDisabled ? 0.3 : 1.0)
    }
    
    private var foregroundColor: Color {
        if isDanger {
            return Color.red.opacity(0.9)
        }
        if isHandRaised {
            return .black
        }
        if isActive {
            return .white
        }
        if isMuted {
            return ACMColors.primaryOrange
        }
        return ACMColors.cream.opacity(0.8)
    }
    
    private var backgroundColor: Color {
        if isHandRaised {
            return Color.yellow.opacity(0.9)
        }
        if isActive {
            return ACMColors.primaryOrange
        }
        if isMuted {
            return ACMColors.primaryOrange.opacity(0.15)
        }
        return .clear
    }
    
    private var borderColor: Color {
        if isActive || isMuted || isHandRaised {
            return .clear
        }
        return ACMColors.creamSubtle
    }
}

// MARK: - Primary Button Style

struct ACMPrimaryButtonStyle: ButtonStyle {
    var isLoading: Bool = false
    
    func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            if isLoading {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(0.8)
            }
            configuration.label
        }
        .font(ACMFont.trial(14, weight: .medium))
        .foregroundStyle(.white)
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(ACMColors.primaryOrange)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
        .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Input Field Style

struct ACMInputStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(ACMFont.trial(14))
            .foregroundStyle(ACMColors.cream)
            .padding(.horizontal, 12)
            .padding(.vertical, 12)
            .background(ACMColors.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(ACMColors.creamFaint, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

extension View {
    func acmInputStyle() -> some View {
        modifier(ACMInputStyle())
    }
}

// MARK: - Video Tile Style

struct ACMVideoTileModifier: ViewModifier {
    var isSpeaking: Bool = false
    
    func body(content: Content) -> some View {
        content
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .strokeBorder(
                        isSpeaking ? ACMColors.primaryOrange : ACMColors.creamFaint,
                        lineWidth: isSpeaking ? 2 : 1
                    )
            )
            .shadow(
                color: isSpeaking ? ACMColors.primaryOrange.opacity(0.3) : .clear,
                radius: isSpeaking ? 15 : 0
            )
    }
}

extension View {
    func acmVideoTile(isSpeaking: Bool = false) -> some View {
        modifier(ACMVideoTileModifier(isSpeaking: isSpeaking))
    }
}

// MARK: - Label Style

struct ACMLabelStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(ACMFont.mono(10))
            .textCase(.uppercase)
            .tracking(1.5)
            .foregroundStyle(ACMColors.creamDim)
    }
}

extension View {
    func acmLabel() -> some View {
        modifier(ACMLabelStyle())
    }
}

// MARK: - Color Hex Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Convenience Extensions

extension View {
    func acmBackground() -> some View {
        self.background(ACMColors.dark)
    }
    
    func acmPill() -> some View {
        self
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(.black.opacity(0.5))
            .background(.ultraThinMaterial.opacity(0.3))
            .overlay(
                Capsule()
                    .strokeBorder(ACMColors.creamFaint, lineWidth: 1)
            )
            .clipShape(Capsule())
    }
}
