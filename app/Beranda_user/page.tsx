"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BerandaUserPage() {
  const [username, setUsername] = useState("");

  useEffect(() => {
    console.log("[DEBUG][Beranda_user] User home page loaded");
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : "";
    };
    setUsername(getCookie("username"));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif" }}>
      <nav style={{ background: "#1e3a5f", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>ExtraHub</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>Halo, {username}</span>
          <button
            onClick={() => {
              ["user_id","user_role","username"].forEach(k => {
                document.cookie = `${k}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              });
              window.location.href = "/Login";
            }}
            style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e3a5f", marginBottom: 8 }}>
          Selamat Datang di ExtraHub
        </h1>
        <p style={{ color: "#64748b", marginBottom: 32 }}>
          Platform ekstrakurikuler SMKN 1 Cibinong
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {[
            { label: "Profile", href: "/Profile_Basket", icon: "📝", desc: "Profile" },
            { label: "Absensi", href: "/Absensi", icon: "📷", desc: "Scan QR untuk absensi" },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb", cursor: "pointer", transition: "transform 0.2s" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ color: "#1e3a5f", fontWeight: 700, marginBottom: 6 }}>{item.label}</h3>
                <p style={{ color: "#64748b", fontSize: 13 }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
