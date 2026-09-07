import UIKit

public struct ExternalLauncher {
    public static func launchWhatsApp(phone: String, message: String = "") {
        var cleanPhone = phone.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
        if cleanPhone.count == 10 {
            cleanPhone = "91" + cleanPhone
        }

        let encoded = message.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        let urlString = "https://wa.me/\(cleanPhone)?text=\(encoded)"

        if let url = URL(string: urlString), UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        }
    }

    public static func launchPhone(phone: String) {
        let clean = phone.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
        if let url = URL(string: "tel://\(clean)"), UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        }
    }

    public static func launchEmail(email: String, subject: String = "") {
        let encodedSubject = subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
        if let url = URL(string: "mailto:\(email)?subject=\(encodedSubject)"), UIApplication.shared.canOpenURL(url) {
            UIApplication.shared.open(url)
        }
    }

    public static func openWhatsApp(phone: String, message: String = "") {
        launchWhatsApp(phone: phone, message: message)
    }

    public static func makePhoneCall(phone: String) {
        launchPhone(phone: phone)
    }

    public static func sendEmail(email: String, subject: String = "") {
        launchEmail(email: email, subject: subject)
    }
}
