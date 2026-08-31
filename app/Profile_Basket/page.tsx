"use client";

import { useEffect, useRef } from "react";
import "./style.css";

const scheduleData = [
  {
    day: "Senin",
    time: "15.00 - 17.00",
    activity: "Latihan Fisik",
    location: "Lapangan Utama",
    absensi: "open",
    highlight: false,
  },
  {
    day: "Rabu",
    time: "15.00 - 17.00",
    activity: "Latihan Teknik",
    location: "Lapangan Utama",
    absensi: "open",
    highlight: true,
  },
  {
    day: "Jumat",
    time: "15.00 - 17.00",
    activity: "Tanding Internal",
    location: "Lapangan Utama",
    absensi: "closed",
    highlight: false,
  },
];

const coaches = [
  {
    role: "Pembina",
    roleColor: "blue",
    name: "Drs. Ahmad Fauzi, M.Pd.",
    desc: "Pembina ekstrakurikuler basket sejak 2010. Berpengalaman membimbing lebih dari 200 siswa berprestasi.",
    initials: "AF",
  },
  {
    role: "Pelatih Utama",
    roleColor: "orange",
    name: "Rendi Kurniawan, S.Or.",
    desc: "Mantan atlet basket profesional liga daerah. Spesialis pelatihan teknik dan strategi permainan.",
    initials: "RK",
  },
];

const achievements = [
  {
    title: "Juara 1 DBL West Java Series",
    sub: "Provinsi",
    year: "2023",
    medal: "gold",
  },
  {
    title: "Juara 2 Kompetisi Basket Pelajar Bogor",
    sub: "Kabupaten",
    year: "2023",
    medal: "silver",
  },
  {
    title: "Juara 1 Turnamen Basket Antar SMK Se-Cibinong",
    sub: "Kecamatan",
    year: "2022",
    medal: "gold",
  },
  {
    title: "Juara 3 Kejuaraan Pelajar Jawa Barat",
    sub: "Provinsi",
    year: "2022",
    medal: "bronze",
  },
  {
    title: "Best Player — Rizky Pratama (XII TKJ)",
    sub: "Penghargaan Individu",
    year: "2023",
    medal: "special",
  },
];

const medalConfig: Record<string, { bg: string; text: string; label: string }> =
  {
    gold: { bg: "medal-gold-bg", text: "medal-gold-text", label: "Emas" },
    silver: {
      bg: "medal-silver-bg",
      text: "medal-silver-text",
      label: "Perak",
    },
    bronze: {
      bg: "medal-bronze-bg",
      text: "medal-bronze-text",
      label: "Perunggu",
    },
    special: {
      bg: "medal-special-bg",
      text: "medal-special-text",
      label: "Khusus",
    },
  };

// ── Icons ────────────────────────────────────────────

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

const IconClock = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconUser = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLocation = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPhone = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.72.33 1.43.63 2.11a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.68.3 1.39.51 2.11.63A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconMail = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16v16H4z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// ─── Stats Badge ───────────────────────────────────────────────────────────────
type StatBadgeProps = {
  number: React.ReactNode;
  label: React.ReactNode;
  delay?: string;
};

function StatBadge({ number, label, delay }: StatBadgeProps) {
  return (
    <div
      className="text-left animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div
        className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-[#ff8c42] leading-none"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {number}
      </div>
      <div
        className="text-white/60 text-xs font-medium mt-2 uppercase tracking-widest"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────
type HomePageProps = {
  imageSrc?: string;
};

export default function HomePage({ imageSrc = "/image/Eskul%20Data/Badminton/IMG-20260509-WA0041.jpg" }: HomePageProps) {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  // Reveal on scroll
  useEffect(() => {
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
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="profile-basket-hero" style={{ paddingTop: "80px" }}>
        {/* Background with Basketball Theme */}
        <div
          className="hero-background"
          style={{
            backgroundImage: `url('${imageSrc}')`,
            filter: "blur(2px) brightness(0.5) contrast(1.1)",
            transform: "scale(1.05)",
          }}
        />

        {/* Primary Orange-Black Gradient Overlay */}
        <div className="hero-overlay-primary" />
        
        {/* Secondary Top-Bottom Gradient */}
        <div className="hero-overlay-secondary" />

        {/* Subtle Glow Accent - Top Right */}
        <div className="hero-glow-top" />
        
        {/* Subtle Glow Accent - Bottom Left */}
        <div className="hero-glow-bottom" />

        {/* ── Content ── */}
        <div className="hero-content">
          {/* LEFT — Text */}
          <div className="hero-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f97316]/20 to-[#f97316]/10 backdrop-blur-md border border-[#f97316]/40 rounded-full px-4 py-2.5 animate-fade-in shadow-lg shadow-[#f97316]/10"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-[pulse-ring_2s_ease-in-out_infinite]" />
              <span
                className="text-[#f97316] text-xs font-bold uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Premium · 2025/2026
              </span>
            </div>

            {/* Headline - Enhanced with Gradient */}
            <div
              className="animate-fade-in"
              style={{ animationDelay: "0.25s" }}
            >
              <h1
                className="text-white leading-[0.95] uppercase font-black"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(3.5rem, 9vw, 6.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Basket
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-[#ff8c42]">SMKN 1</span>
                <br />
                Cibinong
              </h1>
            </div>

            {/* Divider - Enhanced */}
            <div
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="h-1 w-12 bg-gradient-to-r from-[#f97316] to-[#ff8c42] rounded-full" />
              <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent" />
            </div>

            {/* Description - Enhanced Typography */}
            <p
              className="text-white/75 text-lg md:text-xl leading-relaxed max-w-xl font-light animate-fade-in"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                animationDelay: "0.5s",
              }}
            >
              Wadah bagi siswa untuk mengembangkan bakat, disiplin, dan prestasi di bidang olahraga basket. Bersama kami, cetak sejarahmu di lapangan.
            </p>

            {/* CTA Buttons - Enhanced Styling */}
            <div
              className="flex flex-wrap gap-4 animate-fade-in pt-4"
              style={{
                animationDelay: "0.65s",
              }}
            >
              <button
                className="btn-primary group flex items-center gap-2.5 text-white font-bold px-8 py-4 rounded-xl text-base"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Daftar Sekarang
                <svg
                  className="btn-arrow w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>

              <button
                className="btn-secondary group flex items-center gap-2.5 text-white font-semibold px-8 py-4 rounded-xl text-base border border-white/20"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <svg
                  className="w-5 h-5 text-[#f97316]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Lihat Jadwal
              </button>
            </div>

            {/* Stats Row - Enhanced Design */}
            <div
              className="flex gap-10 pt-8 border-t border-white/10 animate-fade-in"
              style={{ animationDelay: "0.8s" }}
            >
              <StatBadge number="3×" label="Juara Provinsi" delay="0.9s" />
              <div className="w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              <StatBadge number="45+" label="Anggota Aktif" delay="1s" />
              <div className="w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              <StatBadge number="8th" label="Tahun Berdiri" delay="1.1s" />
            </div>
          </div>
        </div>
      </section>

      <main className="page-root">
        {/* ── SECTION 1: TENTANG KAMI ── */}
        <section className="section-about">
          <div className="container-md">
            <div className="about-badge">Ekstrakurikuler Resmi</div>
            <h1 className="about-title text-white">Tentang Kami</h1>
            <p className="about-para text-white/90">
              Ekstrakurikuler Basket SMKN 1 Cibinong adalah wadah bagi
              siswa-siswi yang memiliki semangat dan passion dalam olahraga bola
              basket. Kami hadir sebagai ruang pengembangan bakat, membentuk
              karakter tangguh, dan mencetak generasi atlet pelajar yang
              berprestasi di tingkat daerah maupun nasional.
            </p>
            <p className="about-para text-white/90">
              Berdiri sejak tahun 2010, kami telah mengukir berbagai prestasi
              bergengsi dan terus berkomitmen memberikan pembinaan terbaik.
              Dengan pelatih berpengalaman dan fasilitas yang mendukung, setiap
              anggota dibimbing untuk berkembang baik di lapangan maupun dalam
              kehidupan sehari-hari.
            </p>
          </div>
        </section>

        {/* ── SECTION 2: JADWAL LATIHAN ── */}
        <section className="section-schedule">
          <div className="container-lg">
            <div className="section-header">
              <div className="section-title-row">
                <span className="icon-accent">
                  <IconClock />
                </span>
                <h2 className="section-title text-white">Jadwal Latihan</h2>
              </div>
              <p className="section-subtitle text-white/80">
                Rutin setiap minggu konsisten membangun kemampuan terbaik
              </p>
            </div>

            <div className="schedule-grid">
              {scheduleData.map((item) => (
                <div
                  key={item.day}
                  className={`schedule-card ${item.highlight ? "schedule-card--highlight" : ""}`}
                >
                  {/* Card Header */}
                  <div
                    className={`schedule-card__header ${item.highlight ? "schedule-card__header--orange" : ""}`}
                  >
                    <span className="schedule-card__day text-white">{item.day}</span>
                    <span className="schedule-card__time text-white">{item.time}</span>
                  </div>

                  {/* Card Body */}
                  <div className="schedule-card__body">
                    <p className="schedule-card__activity text-white">{item.activity}</p>
                    <p className="schedule-card__location text-white/80">
                      <span className="icon-sm">
                        <IconLocation />
                      </span>{" "}
                      {item.location}
                    </p>

                    {/* Absensi */}
                    <div className="schedule-card__absensi">
                      <span className="absensi-label text-white/70">ABSENSI</span>
                      <span
                        className={`absensi-status ${item.absensi === "open" ? "absensi-status--open" : "absensi-status--closed"}`}
                      >
                        {item.absensi === "open" ? "Dibuka" : "Ditutup"}
                      </span>
                    </div>

                    {/* Button */}
                    {item.absensi === "open" ? (
                      <button className="btn-absensi btn-absensi--active">
                        Isi Absensi Sekarang
                      </button>
                    ) : (
                      <button
                        className="btn-absensi btn-absensi--disabled"
                        disabled
                      >
                        Absensi Ditutup
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: PEMBINA & PELATIH ── */}
        <section className="section-coaches">
          <div className="container-lg">
            <div className="section-header">
              <div className="section-title-row">
                <span className="icon-accent">
                  <IconUser />
                </span>
                <h2 className="section-title text-white">Pembina &amp; Pelatih</h2>
              </div>
              <p className="section-subtitle text-white/80">
                Dipandu oleh tenaga profesional berpengalaman
              </p>
            </div>

            <div className="coaches-grid">
              {coaches.map((coach) => (
                <div key={coach.name} className="coach-card">
                  <div className="coach-avatar">{coach.initials}</div>
                  <div className="coach-info">
                    <span
                      className={`coach-role ${coach.roleColor === "blue" ? "coach-role--blue" : "coach-role--orange"}`}
                    >
                      {coach.role}
                    </span>
                    <h3 className="coach-name text-white">{coach.name}</h3>
                    <p className="coach-desc text-white/80">{coach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: PRESTASI & PENGHARGAAN ── */}
        <section className="section-achievements">
          <div className="container-md">
            <div className="achievements-header">
              <span className="badge-pill">Kebanggaan Kami</span>
              <h2 className="achievements-title text-white">Prestasi &amp; Penghargaan</h2>
              <p className="achievements-subtitle text-white/80">
                Rekam jejak terbaik Basket SMKN 1 Cibinong di berbagai kompetisi
              </p>
            </div>

            <div className="achievements-list">
              {achievements.map((item) => {
                const medal = medalConfig[item.medal];
                return (
                  <div key={item.title} className="achievement-item">
                    {/* Left */}
                    <div className="achievement-left">
                      <div className="achievement-icon-box">
                        <span className="achievement-trophy">🏆</span>
                        <span className="achievement-year text-white">{item.year}</span>
                      </div>
                      <div className="achievement-text">
                        <p className="achievement-name text-white">{item.title}</p>
                        <p className="achievement-sub text-white/70">{item.sub}</p>
                      </div>
                    </div>
                    {/* Right */}
                    <span className={`medal-badge ${medal.bg} ${medal.text}`}>
                      {medal.label}
                    </span>
                  </div>
                );
              })}
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
              <h2 className="cta-title text-white">
                Siap Bergabung dengan
                <br />
                Ekskul Favoritmu?
              </h2>
              <p className="cta-desc text-white/80">
                Jangan lewatkan kesempatan untuk mengembangkan bakat, memperluas
                jaringan, dan meraih prestasi bersama SMKN 1 Cibinong.
              </p>
              <div className="cta-buttons">
                <a href="#" className="btn-primary">
                  Daftar Sekarang <IconArrowRight />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
