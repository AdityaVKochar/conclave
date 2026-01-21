//
//  ConclaveApp.swift
//  Conclave
//

import SwiftUI
import Combine

@main
struct ConclaveApp: App {
    @StateObject private var appState = AppState()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }
}

@MainActor
class AppState: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    struct User: Identifiable {
        let id: String
        let name: String?
        let email: String?
    }
}
