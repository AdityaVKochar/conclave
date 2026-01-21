import Foundation

#if DEBUG
func debugLog(_ message: @autoclosure () -> String) {
    debugLog(message())
}
#else
func debugLog(_ message: @autoclosure () -> String) { }
#endif
