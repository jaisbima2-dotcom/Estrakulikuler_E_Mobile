"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import EskulCardUI from "./components/EskulCardUI";

// DIUBAH: menyesuaikan data dari backend page.tsx
interface EskulItem {
  id_eskul: number;
  nama_eskul: string;
  kategori: string;
  hari_latihan: string;
  jam_latihan: string;
  deskripsi: string;
  image_url?: string | null;
  id_pengurus?: number | null; // <--- SEKARANG MENGGUNAKAN ID_PENGURUS
  slug?: string;
}

export default function KategoriClient({
  initialEskuls,
  categories,
  userRole,
  userId,
}: {
  initialEskuls: EskulItem[];
  categories: string[];
  userRole: string | null;
  userId: number | null;
}) {
  const [search, setSearch] = useState("");
  const [activeKategori, setActiveKategori] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = (search || "").toLowerCase().trim();
    return initialEskuls.filter((e) => {
      if (activeKategori !== "All" && e.kategori !== activeKategori) return false;
      if (!q) return true;
      return e.nama_eskul.toLowerCase().includes(q) || (e.deskripsi || "").toLowerCase().includes(q);
    });
  }, [initialEskuls, search, activeKategori]);

  return (
    <div className="kategori-page" style={{ paddingTop: "80px" }}>
      <div className="container">
        {/* Hero */}
        <section className="kategori-hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <h1 className="hero-title">Kategori Ekstrakurikuler</h1>
              <p className="hero-sub">Jelajahi program ekstrakurikuler aktif di ExtraHub.</p>
            </div>
            <div className="hero-card">
              <div className="hero-card-title">Temukan Ekskul Favorit</div>
              <div className="hero-card-count">{initialEskuls.length}+ Pilihan</div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <div className="controls container-inner">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              aria-label="Cari ekstrakurikuler"
              className="search-input"
              placeholder="Cari ekstrakurikuler..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-filters">
            <button
              className={`filter-chip ${activeKategori === "All" ? "active" : ""}`}
              onClick={() => setActiveKategori("All")}
              style={
                activeKategori === "All"
                  ? {
                      backgroundColor: "var(--accent-orange)",
                      color: "#fff",
                      borderColor: "transparent",
                      boxShadow: "0 6px 18px rgba(249,115,22,0.24)",
                    }
                  : {}
              }
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`filter-chip ${activeKategori === c ? "active" : ""}`}
                onClick={() => setActiveKategori(c)}
                style={
                  activeKategori === c
                    ? {
                        backgroundColor: "var(--accent-orange)",
                        color: "#fff",
                        borderColor: "transparent",
                        boxShadow: "0 6px 18px rgba(249,115,22,0.24)",
                      }
                    : {}
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="container-inner results-info">
          Menampilkan <strong>{filtered.length}</strong> program
        </div>

        {/* Grid */}
        <section className="container-inner eskul-grid">
          {filtered.length === 0 ? (
            <div className="empty-state">Tidak ada ekstrakurikuler yang cocok.</div>
          ) : (
            <motion.div
              className="grid-list"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.04 } },
              }}
            >
              {filtered.map((eskul, idx) => (
                <EskulCardUI
                  key={eskul.id_eskul}
                  eskul={eskul}
                  index={idx}
                  userRole={userRole}
                  userId={userId}
                />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}