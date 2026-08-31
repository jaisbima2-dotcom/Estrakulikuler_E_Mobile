"use client";

import "./style.css";
import {
  Star,
  QrCode,
  Shield,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function QRScannerContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [scanStatus, setScanStatus] = useState<"idle"|"processing"|"success"|"error">("idle");
  const [scanMessage, setScanMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    setScanStatus("processing");
    fetch("/API/Backend/scan-validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setScanStatus("success");
          setScanMessage("Absensi berhasil dicatat!");
        } else {
          setScanStatus("error");
          setScanMessage(data.error || "Gagal mencatat absensi");
        }
      })
      .catch(() => {
        setScanStatus("error");
        setScanMessage("Terjadi kesalahan jaringan");
      });
  }, [token]);

  return (
    <div className="page-root">
      <div className="mobile-container">

        {/* HEADER */}
        <div className="header">
          <div className="avatar-logo">
            <Star size={18} strokeWidth={2.2} />
          </div>
          <div className="header-title">ExtraHub</div>
          <div className="header-subtitle">Sistem Absensi Ekskul</div>
        </div>

        {/* QR ICON SECTION */}
        <div className="qr-icon-section">
          <QrCode size={28} strokeWidth={1.8} />
          <p className="qr-section-text">
            Scan QR untuk melakukan absensi kehadiran
          </p>
        </div>

        {/* SCANNER CARD */}
        <div className="scanner-card">

          {/* STATUS MESSAGE */}
          {scanStatus !== "idle" && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 12,
              marginBottom: 16,
              background: scanStatus === "success" ? "rgba(0,230,118,0.15)" : scanStatus === "processing" ? "rgba(0,229,255,0.1)" : "rgba(255,68,68,0.15)",
              color: scanStatus === "success" ? "#00e676" : scanStatus === "processing" ? "#00e5ff" : "#ff4444",
              fontSize: 14,
              fontWeight: 500,
              textAlign: "center",
            }}>
              {scanStatus === "processing" ? "⏳ Memproses absensi..." : scanStatus === "success" ? "✅ " + scanMessage : "❌ " + scanMessage}
            </div>
          )}

          {/* SCANNER BOX */}
          <div className="scanner-box-wrapper">
            <div className="scanner-box">
              {/* Grid */}
              <div className="scanner-grid" />

              {/* Corner brackets */}
              <div className="corner-tl" />
              <div className="corner-tr" />
              <div className="corner-bl" />
              <div className="corner-br" />

              {/* Center QR icon */}
              <div className="scanner-center-icon">
                <QrCode size={72} strokeWidth={1.2} />
              </div>

              {/* Scan line */}
              <div className="scan-line" />
            </div>
          </div>

          {/* STATUS PILL */}
          <div className="status-pill">
            <QrCode size={14} strokeWidth={1.8} />
            <span className="status-pill-text">Menunggu QR Code...</span>
          </div>

          {/* STATUS RESULT BADGES */}
          <div className="status-badges">
            <div className="badge badge-success">✓ Sukses</div>
            <div className="badge badge-invalid">✕ Invalid</div>
            <div className="badge badge-expired">⚠ Expired</div>
          </div>

        </div>

        {/* BOTTOM INFO */}
        <div className="bottom-info">
          <Shield size={16} strokeWidth={1.6} />
          <p className="bottom-info-text">
            Pastikan QR ditampilkan oleh pembina ekskul
          </p>
        </div>

      </div>
    </div>
  );
}

export default function QRScannerPage() {
  return (
    <Suspense fallback={
      <div className="page-root">
        <div className="mobile-container">
          <div className="header">
            <div className="avatar-logo">
              <Star size={18} strokeWidth={2.2} />
            </div>
            <div className="header-title">ExtraHub</div>
            <div className="header-subtitle">Sistem Absensi Ekskul</div>
          </div>
          <p style={{ textAlign: "center", color: "#64748b", marginTop: "40px" }}>Memuat...</p>
        </div>
      </div>
    }>
      <QRScannerContent />
    </Suspense>
  );
}