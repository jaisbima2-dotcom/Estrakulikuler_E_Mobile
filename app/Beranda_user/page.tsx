"use client";

import Link from "next/link";
import { QrCode, Users } from "lucide-react";

export default function BerandaUserPage() {
  const cards = [
    { label: "Daftar Eskul", href: "/Profile_eskul", icon: Users, desc: "Lihat seluruh ekstrakurikuler yang tersedia" },
    { label: "Absensi", href: "/Absensi", icon: QrCode, desc: "Scan QR pembina untuk mencatat kehadiran" },
  ];
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "sans-serif", padding: "48px 24px" }}>
      <section style={{ maxWidth: 900, margin: "0 auto" }}>
        <p style={{ color: "#64748b", margin: 0 }}>Portal Siswa</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e3a5f", margin: "8px 0 28px" }}>Ekstrakurikuler E-Mobile</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
          {cards.map((item) => <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <article style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" }}>
              <item.icon size={36} color="#1e3a5f" strokeWidth={1.5} />
              <h2 style={{ color: "#1e3a5f", fontWeight: 700, margin: "14px 0 6px", fontSize: 20 }}>{item.label}</h2>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>{item.desc}</p>
            </article>
          </Link>)}
        </div>
      </section>
    </main>
  );
}
