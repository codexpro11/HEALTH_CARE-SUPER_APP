import SwiftUI

@main
struct HealthConnectApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .tint(HealthConnectStyle.teal)
        }
    }
}

enum HealthConnectStyle {
    static let teal = Color(red: 0.0, green: 0.59, blue: 0.54)
    static let canvas = Color(red: 0.97, green: 0.98, blue: 0.99)
    static let ink = Color(red: 0.12, green: 0.16, blue: 0.22)
    static let muted = Color(red: 0.40, green: 0.45, blue: 0.52)
    static let border = Color(red: 0.88, green: 0.90, blue: 0.92)
}
