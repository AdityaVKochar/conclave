//
//  ContentView.swift
//  Conclave
//
//  Root navigation view with state-based routing
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var meetingViewModel = MeetingViewModel()
    
    var body: some View {
        Group {
            switch meetingViewModel.connectionState {
            case .disconnected, .connecting, .connected:
                JoinView(viewModel: meetingViewModel)
                    .transition(.opacity)
                
            case .joining, .joined, .reconnecting:
                MeetingView(viewModel: meetingViewModel)
                    .transition(.opacity)
                
            case .waiting:
                WaitingRoomView(viewModel: meetingViewModel)
                    .transition(.opacity)
                
            case .error:
                ErrorView(
                    message: meetingViewModel.errorMessage ?? "An error occurred",
                    onRetry: { meetingViewModel.resetError() }
                )
                .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: meetingViewModel.connectionState)
        .preferredColorScheme(.dark)
    }
}

// MARK: - Waiting Room View

struct WaitingRoomView: View {
    @ObservedObject var viewModel: MeetingViewModel
    
    var body: some View {
        ZStack {
            ACMColors.dark
                .ignoresSafeArea()
            
            GeometryReader { geometry in
                Canvas { context, size in
                    let spacing: CGFloat = 30
                    let dotSize: CGFloat = 1.5
                    
                    for x in stride(from: 0, to: size.width, by: spacing) {
                        for y in stride(from: 0, to: size.height, by: spacing) {
                            let rect = CGRect(
                                x: x - dotSize/2,
                                y: y - dotSize/2,
                                width: dotSize,
                                height: dotSize
                            )
                            context.fill(
                                Path(ellipseIn: rect),
                                with: .color(ACMColors.cream.opacity(0.05))
                            )
                        }
                    }
                }
            }
            .ignoresSafeArea()
            
            VStack(spacing: 32) {
                ZStack {
                    Circle()
                        .stroke(ACMColors.primaryOrange.opacity(0.2), lineWidth: 4)
                        .frame(width: 80, height: 80)
                    
                    Circle()
                        .trim(from: 0, to: 0.7)
                        .stroke(ACMColors.primaryOrange, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                        .frame(width: 80, height: 80)
                        .rotationEffect(.degrees(-90))
                        .modifier(RotatingModifier())
                }
                
                VStack(spacing: 12) {
                    Text("Waiting for host")
                        .font(ACMFont.wide(24))
                        .foregroundStyle(ACMColors.cream)
                    
                    Text(viewModel.waitingMessage ?? "You'll join as soon as the host lets you in")
                        .font(ACMFont.trial(14))
                        .foregroundStyle(ACMColors.cream.opacity(0.5))
                        .multilineTextAlignment(.center)
                }
                
                HStack(spacing: 8) {
                    Image(systemName: "number")
                        .font(.system(size: 12))
                        .foregroundStyle(ACMColors.cream.opacity(0.4))
                    
                    Text(viewModel.roomId.uppercased())
                        .font(ACMFont.mono(14))
                        .foregroundStyle(ACMColors.cream.opacity(0.7))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(ACMColors.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(ACMColors.creamFaint, lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 8))
                
                Button {
                    viewModel.leaveRoom()
                } label: {
                    Text("Cancel")
                        .font(ACMFont.trial(14))
                        .foregroundStyle(ACMColors.cream.opacity(0.6))
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .strokeBorder(ACMColors.creamSubtle, lineWidth: 1)
                        )
                }
                .padding(.top, 16)
            }
            .padding(32)
        }
    }
}

struct RotatingModifier: ViewModifier {
    @State private var isRotating = false
    
    func body(content: Content) -> some View {
        content
            .rotationEffect(.degrees(isRotating ? 360 : 0))
            .animation(.linear(duration: 1).repeatForever(autoreverses: false), value: isRotating)
            .onAppear {
                isRotating = true
            }
    }
}

// MARK: - Error View

struct ErrorView: View {
    let message: String
    let onRetry: () -> Void
    
    var body: some View {
        ZStack {
            ACMColors.dark
                .ignoresSafeArea()
            
            VStack(spacing: 24) {
                ZStack {
                    Circle()
                        .fill(Color.red.opacity(0.1))
                        .frame(width: 80, height: 80)
                    
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.system(size: 36))
                        .foregroundStyle(.red)
                }
                
                VStack(spacing: 8) {
                    Text("Something went wrong")
                        .font(ACMFont.wide(20))
                        .foregroundStyle(ACMColors.cream)
                    
                    Text(message)
                        .font(ACMFont.trial(14))
                        .foregroundStyle(ACMColors.cream.opacity(0.5))
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: 280)
                }
                
                Button(action: onRetry) {
                    HStack(spacing: 8) {
                        Image(systemName: "arrow.clockwise")
                            .font(.system(size: 14, weight: .medium))
                        
                        Text("Try Again")
                            .font(ACMFont.trial(14, weight: .medium))
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(ACMColors.primaryOrange)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
            .padding(32)
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
