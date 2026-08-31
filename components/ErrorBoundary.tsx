"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

/**
 * Error Boundary Component
 * Catches errors in child components and displays Indonesian error messages
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: "",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[DEBUG][ErrorBoundary] Error caught:", error.message);
    return {
      hasError: true,
      error,
      errorInfo: "",
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[DEBUG][ErrorBoundary] Component stack:", errorInfo.componentStack);
    console.error("[DEBUG][ErrorBoundary] Full error:", error);

    this.setState({
      errorInfo: errorInfo.componentStack || "",
    });
  }

  handleReset = () => {
    console.log("[DEBUG][ErrorBoundary] Resetting error state");
    this.setState({
      hasError: false,
      error: null,
      errorInfo: "",
    });
  };

  getErrorMessage(error: Error | null): string {
    if (!error) return "Terjadi kesalahan yang tidak diketahui";

    const message = error.message.toLowerCase();

    // Map common error messages to Indonesian
    if (message.includes("network")) {
      return "Kesalahan jaringan. Periksa koneksi internet Anda.";
    }
    if (message.includes("not found") || message.includes("404")) {
      return "Halaman atau data tidak ditemukan.";
    }
    if (message.includes("unauthorized") || message.includes("403")) {
      return "Anda tidak memiliki izin untuk mengakses halaman ini.";
    }
    if (message.includes("timeout")) {
      return "Permintaan terlalu lama. Silakan coba lagi.";
    }
    if (message.includes("supabase")) {
      return "Terjadi kesalahan koneksi database. Silakan coba lagi nanti.";
    }

    return `Kesalahan aplikasi: ${error.message}`;
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            padding: "20px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "40px 32px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                fontSize: "48px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              ⚠️
            </div>

            {/* Error Title */}
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#dc2626",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Oops! Terjadi Kesalahan
            </h1>

            {/* Error Message */}
            <p
              style={{
                fontSize: "16px",
                color: "#475569",
                marginBottom: "24px",
                textAlign: "center",
                lineHeight: "1.6",
              }}
            >
              {this.getErrorMessage(this.state.error)}
            </p>

            {/* Debug Info (development only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details
                style={{
                  marginBottom: "24px",
                  padding: "12px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#7f1d1d",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: "600" }}>
                  📋 Detail Teknis (Development Only)
                </summary>
                <pre
                  style={{
                    marginTop: "12px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "11px",
                    fontFamily: "monospace",
                  }}
                >
                  {this.state.error.message}
                  {this.state.errorInfo && `\n\n${this.state.errorInfo}`}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={this.handleReset}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }}
              >
                🔄 Coba Lagi
              </button>
              <a
                href="/"
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "inline-block",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
              >
                🏠 Kembali ke Beranda
              </a>
            </div>

            {/* Footer Help Text */}
            <p
              style={{
                marginTop: "24px",
                fontSize: "12px",
                color: "#94a3b8",
                textAlign: "center",
              }}
            >
              Jika masalah terus berlanjut, hubungi tim support atau refresh halaman Anda.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
