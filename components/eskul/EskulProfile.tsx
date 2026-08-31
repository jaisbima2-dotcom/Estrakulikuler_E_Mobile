"use client";

import Link from "next/link";

export default function EskulProfile({ data }: { data: any }) {
  return (
    <div className="profile-page">
      {/* Navbar */}
      <nav style={{ padding: "20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "18px", fontWeight: "700", color: "#0f2460" }}>
            SMKN 1 Cibinong
          </Link>
          <Link href="/Beranda_user" style={{ color: "#1e3a8a", textDecoration: "underline" }}>
            ← Kembali
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        style={{
          background: data.color,
          color: "white",
          padding: "60px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "80px", marginBottom: "20px" }}>{data.icon}</div>
        <h1 style={{ fontSize: "48px", fontWeight: "800", marginBottom: "10px" }}>
          {data.name}
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.95, marginBottom: "20px" }}>
          {data.category}
        </p>
      </div>

      {/* Content Section */}
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "60px 24px" }}>
        <div style={{ maxWidth: "800px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "20px", color: "#0f2460" }}>
            Tentang Program
          </h2>
          <p style={{ fontSize: "18px", lineHeight: "1.8", color: "#334155", marginBottom: "40px" }}>
            {data.description}
          </p>

          {/* CTA */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button
              style={{
                background: data.color,
                color: "white",
                border: "none",
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: "700",
                borderRadius: "999px",
                cursor: "pointer",
              }}
            >
              Daftar Sekarang
            </button>
            <Link
              href="/Beranda_user"
              style={{
                border: `2px solid ${data.color}`,
                color: data.color,
                padding: "12px 32px",
                fontSize: "16px",
                fontWeight: "700",
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              ← Kembali
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
