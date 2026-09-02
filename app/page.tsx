"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getLandingStats } from "./landing-actions";
import { getEskulPrimaryImage } from "@/lib/imageUtils";

// ── Helper Function: Map Eskul Name to Profile Path ────────────────────
const getEskulProfilePath = (eskulName: string): string => {
  const nameMap: Record<string, string> = {
    "Basket": "/Profile_Basket",
    "Badminton": "/Profile_badminton",
    "Voli": "/Profile_voli",
    "Futsal": "/Profile_futsal",
    "English Club": "/Profile_inggris",
    "English": "/Profile_inggris",
    "Inggris": "/Profile_inggris",
    "Japanese Club": "/Profile_jepang",
    "Japanese": "/Profile_jepang",
    "Jepang": "/Profile_jepang",
    "Paskibra": "/Profile_paskibra",
    "PMR": "/Profile_pmr",
    "Pramuka": "/Profile_pramuka",
    "ROHIS": "/Profile_rohis",
    "Rohani Islam": "/Profile_rohis",
    "ROKRIS": "/Profile_rokris",
    "Rokris": "/Profile_rokris",
    "Tari": "/Profile_tari",
    "Dance": "/Profile_tari",
  };

  // Return mapped path or construct from name
  return nameMap[eskulName] || `/Profile_${eskulName.toLowerCase().replace(/\s+/g, "_")}`;
};

// ── Icons ────────────────────────────────────────────
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
    <path d="M12 12h4M12 16h4M8 12h.01M8 16h.01" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 12l2 2 4-4" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const IconArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

// ── Data ────────────────────────────────────────────
const NAV_LINKS = ["Home",  "Kategori" ];

const EKSTRAKURIKULER = [
  {
    name: "Basket",
    localName: "Basket",
    cat: "Olahraga",
    desc: "Tingkatkan kemampuan atletik dan kerja sama tim melalui olahraga basket yang kompetitif dan menyenangkan.",
    img: getEskulPrimaryImage("Basket"),
  },
  {
    name: "Rohani Islam",
    localName: "Rohani Islam",
    cat: "Kerohanian",
    desc: "Perkuat iman dan karakter melalui kegiatan kajian Islam, mentoring, dan pengembangan diri Islami.",
    img: getEskulPrimaryImage("Rohani Islam"),
  },
  {
    name: "Paskibra",
    localName: "Paskibra",
    cat: "Organisasi",
    desc: "Pasukan Pengibar Bendera — latih disiplin, kebersamaan, dan dedikasi dalam kegiatan upacara nasional.",
    img: getEskulPrimaryImage("Paskibra"),
  },
];

const STEPS = [
  {
    icon: <IconUser />,
    title: "Daftar Akun",
    desc: "Daftar dengan NISN sekolah dan lengkapi profil pelajar kamu.",
    color: "blue",
  },
  {
    icon: <IconSearch />,
    title: "Pilih Ekskul",
    desc: "Jelajahi daftar ekstrakurikuler dan temukan yang sesuai minatmu.",
    color: "yellow",
  },
  {
    icon: <IconClipboard />,
    title: "Isi Formulir",
    desc: "Lengkapi formulir pendaftaran dan unggah berkas yang dibutuhkan.",
    color: "green",
  },
  {
    icon: <IconCheck />,
    title: "Konfirmasi",
    desc: "Tunggu konfirmasi dari pembina dan bergabunglah dengan anggota baru.",
    color: "pink",
  },
];

// ── Main Page Component ────────────────────────────────────────────
export default function HomePage() {
  const [stats, setStats] = useState({
    totalEskul: 12,
    totalMembers: 100,
    totalAchievements: 50,
  });
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  // [DEBUG][Home] Component initialization
  useEffect(() => {
    console.log("[DEBUG][Home] Landing page loaded successfully");
    
    // Fetch real stats from database
    const loadStats = async () => {
      try {
        const result = await getLandingStats();
        if (!result.error) {
          setStats({
            totalEskul: result.totalEskul,
            totalMembers: result.totalMembers,
            totalAchievements: result.totalAchievements,
          });
          console.log("[DEBUG][Home] ✅ Stats loaded:", result);
        } else {
          console.log("[DEBUG][Home] ℹ️ Using fallback stats");
        }
      } catch (err) {
        console.error("[DEBUG][Home] ❌ Error loading stats:", err);
      }
    };

    loadStats();
    return () => console.log("[DEBUG][Home] Landing page unmounted");
  }, []);

  // Reveal on scroll
  useEffect(() => {
    console.log("[DEBUG][Home] Setting up reveal animations");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 },
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addReveal = (el: HTMLElement | null, i: number) => {
    revealRefs.current[i] = el;
  };

  return (
    <>
      {/* ──────────── HERO ──────────── */}
     <section className="hero">
        <div className="hero-container">
          {/* Left */}
          <div>
            <div className="hero-badge fade-in fade-in-1">
              <IconStar />
              Ekstrakurikuler Unggulan
            </div>
            <h1 className="hero-title fade-in fade-in-2">
              Ekskul{" "}
              <span className="highlight">
                SMKN 1
                <br />
                Cibinong
              </span>
            </h1>
            <p className="hero-desc fade-in fade-in-3">
              Platform resmi untuk melihat, memilih, dan mendaftar
              ekstrakurikuler SMKN 1 Cibinong. Temukan kegiatan yang sesuai
              minat dan kembangkan potensimu bersama kami.
            </p>
            <div className="hero-buttons fade-in fade-in-4">
              <a href="#ekskul" className="btn-primary">
                Jelajahi <IconArrowRight />
              </a>
              <a href="#cara-daftar" className="btn-secondary">
                Pelajari
              </a>
            </div>
          </div>

          {/* Right — floating card */}
          <div className="fade-in fade-in-3">
            <div className="hero-card">
              <div className="hero-card-header">
                <span className="hero-card-title">Ekskul Pilihan</span>
                <span className="hero-card-badge">12+ Ekskul</span>
              </div>
              <div className="hero-card-grid">
                <div className="hero-card-img">
                  <img
                    src={getEskulPrimaryImage("Basket")}
                    alt="Basket"
                    loading="lazy"
                  />
                  <span className="hero-card-img-label">Basket</span>
                </div>
                <div className="hero-card-img">
                  <img
                    src={getEskulPrimaryImage("Rohani Islam")}
                    alt="Rohani Islam"
                    loading="lazy"
                  />
                  <span className="hero-card-img-label">Rohani</span>
                </div>
                <div className="hero-card-img">
                  <img
                    src={getEskulPrimaryImage("Paskibra")}
                    alt="Paskibra"
                    loading="lazy"
                  />
                  <span className="hero-card-img-label">Paskibra</span>
                </div>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-num">{stats.totalEskul}+</span>
                  <span className="hero-stat-label">Ekskul Aktif</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">{stats.totalMembers}</span>
                  <span className="hero-stat-label">Anggota</span>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-num">{stats.totalAchievements}+</span>
                  <span className="hero-stat-label">Prestasi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ──────────── EKSKUL POPULER ──────────── */}
      <section id="ekskul" style={{ background: "var(--gray-bg)" }}>
        <div className="section">
          <div
            className="section-header reveal"
            ref={(el) => addReveal(el as HTMLElement | null, 0)}
          >
            <div className="section-tag">★ Populer</div>
            <h2 className="section-title">Ekstrakurikuler Populer</h2>
            <p className="section-desc">
              Temukan berbagai kegiatan seru yang diminati ratusan siswa SMKN 1
              Cibinong dan kembangkan bakat terbaikmu.
            </p>
          </div>

          <div className="cards-grid">
            {EKSTRAKURIKULER.map((ekskul, i) => (
              <Link
                key={ekskul.name}
                href={getEskulProfilePath(ekskul.name)}
                className="ekskul-card-link-wrapper"
              >
                <div
                  className="ekskul-card reveal"
                  ref={(el) => addReveal(el as HTMLElement | null, i + 1)}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="ekskul-card-img-wrapper">
                    <img
                      src={ekskul.img}
                      alt={ekskul.name}
                      className="ekskul-card-img"
                      loading="lazy"
                    />
                    <span className="ekskul-card-category">{ekskul.cat}</span>
                  </div>
                  <div className="ekskul-card-body">
                    <h3 className="ekskul-card-name">{ekskul.name}</h3>
                    <p className="ekskul-card-desc">{ekskul.desc}</p>
                    <div className="ekskul-card-link">
                      Selengkapnya <IconArrowRight />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── CARA DAFTAR ──────────── */}
      <section id="cara-daftar" className="steps-section">
        <div className="steps-inner">
          <div
            className="section-header reveal"
            ref={(el) => addReveal(el as HTMLElement | null, 10)}
          >
            <div
              className="section-tag"
              style={{
                background: "rgba(249,115,22,0.1)",
                color: "var(--orange)",
              }}
            >
              Panduan
            </div>
            <h2 className="section-title">Cara Mendaftar</h2>
            <p className="section-desc">
              Proses pendaftaran mudah dan cepat hanya dalam 4 langkah
              sederhana.
            </p>
          </div>

          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="step-item reveal"
                ref={(el) => addReveal(el as HTMLElement | null, 11 + i)}
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <div className="step-icon">
                  {step.icon}
                  <span className="step-num">{i + 1}</span>
                </div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── CTA ──────────── */}
      <section className="cta-section">
        <div
          className="cta-card reveal"
          ref={(el) => addReveal(el as HTMLElement | null, 20)}
        >
          <div className="cta-content">
            <div className="cta-badge">Mulai Sekarang</div>
            <h2 className="cta-title">
              Siap Bergabung dengan
              <br />
              Ekskul Favoritmu?
            </h2>
            <p className="cta-desc">
              Jangan lewatkan kesempatan untuk mengembangkan bakat, memperluas
              jaringan, dan meraih prestasi bersama SMKN 1 Cibinong.
            </p>
            <div className="cta-buttons">
              <a href="/Daftar" className="btn-primary">
                Daftar Sekarang <IconArrowRight />
              </a>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
