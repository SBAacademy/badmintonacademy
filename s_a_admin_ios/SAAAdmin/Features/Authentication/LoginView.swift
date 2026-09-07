import SwiftUI

public struct LoginView: View {
    @ObservedObject private var authManager = AuthManager.shared

    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var showErrorAlert = false

    public init() {}

    public var body: some View {
        ZStack {
            Color.rebelBackground.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 28) {
                    Spacer(minLength: 40)

                    // Academy Brand Header
                    VStack(spacing: 12) {
                        HStack(spacing: 8) {
                            Text("S&A")
                                .font(.system(size: 20, weight: .black))
                                .foregroundColor(.black)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Color.rebelPrimary)
                                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                            Text("ACADEMY OS")
                                .font(.system(size: 18, weight: .heavy, design: .default))
                                .foregroundColor(.rebelTextPrimary)
                                .tracking(1)
                        }

                        Text("Operations & Administration Platform")
                            .font(RebelTypography.caption)
                            .foregroundColor(.rebelTextSecondary)
                    }

                    // Login Card
                    VStack(spacing: 20) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("STAFF EMAIL")
                                .font(RebelTypography.badge)
                                .foregroundColor(.rebelTextSecondary)

                            TextField("name@sabadminton.com", text: $email)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .disableAutocorrection(true)
                                .padding(14)
                                .background(Color.rebelSurfaceElevated)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8)
                                        .stroke(Color.rebelBorder, lineWidth: 1)
                                )
                                .foregroundColor(.rebelTextPrimary)
                        }

                        VStack(alignment: .leading, spacing: 8) {
                            Text("PASSWORD")
                                .font(RebelTypography.badge)
                                .foregroundColor(.rebelTextSecondary)

                            HStack {
                                if showPassword {
                                    TextField("Enter password", text: $password)
                                        .autocapitalization(.none)
                                        .disableAutocorrection(true)
                                } else {
                                    SecureField("Enter password", text: $password)
                                }

                                Button {
                                    showPassword.toggle()
                                } label: {
                                    Image(systemName: showPassword ? "eye.slash" : "eye")
                                        .foregroundColor(.rebelTextSecondary)
                                }
                            }
                            .padding(14)
                            .background(Color.rebelSurfaceElevated)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.rebelBorder, lineWidth: 1)
                            )
                            .foregroundColor(.rebelTextPrimary)
                        }

                        if let err = authManager.errorMessage {
                            HStack {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundColor(RebelColors.coral)
                                Text(err)
                                    .font(RebelTypography.caption)
                                    .foregroundColor(RebelColors.coral)
                            }
                            .padding(.top, 4)
                        }

                        // Submit Button
                        Button {
                            Task {
                                let ok = await authManager.login(email: email, password: password)
                                if !ok {
                                    showErrorAlert = true
                                }
                            }
                        } label: {
                            HStack(spacing: 8) {
                                if authManager.isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .black))
                                } else {
                                    Text("AUTHENTICATE & ENTER →")
                                        .font(.system(size: 14, weight: .black))
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.rebelPrimary)
                            .foregroundColor(.black)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        .disabled(authManager.isLoading || email.isEmpty || password.isEmpty)
                        .opacity(email.isEmpty || password.isEmpty ? 0.6 : 1.0)

                        // Biometrics Button (if enabled)
                        if authManager.biometricsEnabled {
                            Button {
                                Task {
                                    _ = await authManager.loginWithBiometrics()
                                }
                            } label: {
                                HStack {
                                    Image(systemName: "faceid")
                                    Text("Unlock with Face ID / Touch ID")
                                }
                                .font(RebelTypography.bodyBold)
                                .foregroundColor(.rebelPrimary)
                                .padding(.top, 8)
                            }
                        }
                    }
                    .rebelCard()
                    .padding(.horizontal, 20)

                    // Footer security notice
                    HStack(spacing: 6) {
                        Image(systemName: "lock.shield")
                            .font(.system(size: 12))
                        Text("Encrypted Academy Connection • Zero Secrets Stored Locally")
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundColor(.rebelTextSecondary)
                    .padding(.top, 16)

                    Spacer()
                }
            }
        }
    }
}
