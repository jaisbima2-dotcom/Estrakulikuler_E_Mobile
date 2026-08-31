"use client";

import { useEffect, useRef, useState } from "react";
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
    name: "Renaldi, M.Pd.",
    desc: "Pembina ekstrakurikuler basket sejak 2011. Berpengalaman membimbing lebih dari 70 siswa berprestasi.",
    initials: "RF",
  },
  {
    role: "Pelatih Utama",
    roleColor: "orange",
    name: "Irfan Maulana, S.Or.",
    desc: "Mantan atlet basket profesional liga daerah. Spesialis pelatihan teknik dan strategi permainan.",
    initials: "IM",
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
      className="text-center animate-fade-in"
      style={{ animationDelay: delay, animationFillMode: "both" }}
    >
      <div
        className="text-3xl md:text-4xl font-black text-white leading-none"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {number}
      </div>
      <div
        className="text-white/50 text-xs font-medium mt-1 uppercase tracking-widest"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────
export default function HomePage() {
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
      <section className="relative h-screen min-h-[680px] flex items-center overflow-hidden" style={{ paddingTop: "80px" }}>
        {/* Background Image via Unsplash */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/futsal.png')",
            filter: "blur(1px) brightness(0.6)",
            transform: "scale(1.04)",
          }}
        />

        {/* Gradient Overlay — dark navy left, semi-transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06101e] via-[#06101e]/80 to-[#06101e]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06101e] via-transparent to-[#06101e]/30" />

        {/* ── Content ── */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid gap-12 items-center hero-content">
          {/* LEFT — Text */}
          <div className="space-y-8 hero-left">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 animate-fade-in"
              style={{ animationDelay: "0.1s", animationFillMode: "both" }}
            >
              <span className="w-2 h-2 rounded-full bg-[#f97316] animate-[pulse-ring_2s_ease-in-out_infinite]" />
              <span
                className="text-white/85 text-xs font-semibold uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Ekstrakurikuler Aktif · 2025/2026
              </span>
            </div>

            {/* Headline */}
            <div
              className="animate-fade-in"
              style={{ animationDelay: "0.25s", animationFillMode: "both" }}
            >
              <h1
                className="text-white leading-[0.9] uppercase"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  fontWeight: 900,
                }}
              >
                Futsal
                <br />
                <span className="text-[#f97316]">SMKN 1</span>
                <br />
                Cibinong
              </h1>
            </div>

            {/* Divider */}
            <div
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            >
              <div className="h-px w-10 bg-[#f97316]" />
              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Description */}
            <p
              className="text-white/65 text-base md:text-lg leading-relaxed max-w-md animate-fade-in"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                animationDelay: "0.5s",
                animationFillMode: "both",
              }}
            >
              Wadah bagi siswa untuk mengembangkan bakat, disiplin, dan prestasi
              di bidang olahraga futsal. Bersama kami, cetak sejarahmu di
              lapangan.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap gap-4 animate-fade-in"
              style={{ animationDelay: "0.65s", animationFillMode: "both" }}
            >
              <button
                className="btn-primary group flex items-center gap-2.5 bg-[#f97316] hover:bg-[#ea6c09] text-white font-bold px-7 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 active:translate-y-0 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Daftar Sekarang
                <svg
                  className="btn-arrow w-4 h-4"
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
                className="btn-secondary group flex items-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/25 hover:border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <svg
                  className="w-4 h-4 text-[#f97316]"
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

            {/* Stats Row */}
            <div
              className="flex gap-8 pt-4 border-t border-white/10 animate-fade-in"
              style={{ animationDelay: "0.8s", animationFillMode: "both" }}
            >
              <StatBadge number="3×" label="Juara Provinsi" delay="0.9s" />
              <div className="w-px bg-white/10" />
              <StatBadge number="45+" label="Anggota Aktif" delay="1s" />
              <div className="w-px bg-white/10" />
              <StatBadge number="8th" label="Tahun Berdiri" delay="1.1s" />
            </div>
          </div>
        </div>
      </section>

      <main className="page-root">
        {/* ── SECTION 1: TENTANG KAMI ── */}
        <section className="section-about">
          <div className="container-md">
            <div className="about-badge">Ekstrakurikuler Futsal</div>
            <h1 className="about-title">Tentang Kami</h1>
            <p className="about-para">
              Ekstrakurikuler futsal merupakan kegiatan yang menjadi sarana bagi
              siswa untuk mengembangkan kemampuan dan minat dalam olahraga
              futsal. Melalui latihan rutin, anggota akan mempelajari teknik
              dasar seperti passing, dribbling, shooting, controlling, hingga
              strategi permainan tim dengan bimbingan pelatih dan pembina.
              Selain meningkatkan keterampilan bermain, eskul futsal juga
              membantu menjaga kebugaran tubuh serta melatih kecepatan,
              ketahanan, dan koordinasi.
            </p>
            <p className="about-para">
              Tidak hanya berfokus pada kemampuan bermain, eskul futsal juga
              membentuk karakter siswa agar lebih disiplin, sportif, percaya
              diri, dan mampu bekerja sama dalam tim. Berbagai kegiatan seperti
              latihan bersama, sparing, dan turnamen memberikan pengalaman serta
              meningkatkan kekompakan antaranggota. Dengan suasana latihan yang
              aktif dan penuh semangat, eskul futsal menjadi wadah yang tepat
              untuk menyalurkan bakat sekaligus membangun jiwa kompetitif yang
              positif.
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
                <h2 className="section-title">Jadwal Latihan</h2>
              </div>
              <p className="section-subtitle">
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
                    <span className="schedule-card__day">{item.day}</span>
                    <span className="schedule-card__time">{item.time}</span>
                  </div>

                  {/* Card Body */}
                  <div className="schedule-card__body">
                    <p className="schedule-card__activity">{item.activity}</p>
                    <p className="schedule-card__location">
                      <span className="icon-sm">
                        <IconLocation />
                      </span>{" "}
                      {item.location}
                    </p>

                    {/* Absensi */}
                    <div className="schedule-card__absensi">
                      <span className="absensi-label">ABSENSI</span>
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
                <h2 className="section-title">Pembina &amp; Pelatih</h2>
              </div>
              <p className="section-subtitle">
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
                    <h3 className="coach-name">{coach.name}</h3>
                    <p className="coach-desc">{coach.desc}</p>
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
              <h2 className="achievements-title">Prestasi &amp; Penghargaan</h2>
              <p className="achievements-subtitle">
                Rekam jejak terbaik Futsal SMKN 1 Cibinong di berbagai kompetisi
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
                        <span className="achievement-year">{item.year}</span>
                      </div>
                      <div className="achievement-text">
                        <p className="achievement-name">{item.title}</p>
                        <p className="achievement-sub">{item.sub}</p>
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
                <a href="#" className="btn-primary">
                  Daftar Sekarang <IconArrowRight />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: FOOTER ── */}
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-grid">
              {/* Col 1 — Branding */}
              <div className="footer-col">
                <div className="footer-brand">
                  <div className="footer-logo">F</div>
                  <span className="footer-brand-name">
                    Futsal SMKN 1 Cibinong
                  </span>
                </div>
                <p className="footer-brand-desc">
                  Membangun atlet pelajar berprestasi dengan karakter unggul
                  sejak 2010.
                </p>
                <div className="footer-socials">
                  <a href="#" className="social-icon" aria-label="Instagram">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="1"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  </a>
                  <a href="#" className="social-icon" aria-label="YouTube">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                      <polygon
                        points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  </a>
                  <a href="#" className="social-icon" aria-label="WhatsApp">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Col 3 — Jadwal */}
              <div className="footer-col">
                <h4 className="footer-col-title">Jadwal Latihan</h4>
                <div className="footer-schedule-list">
                  {[
                    { day: "Senin", time: "15.00 – 17.00" },
                    { day: "Rabu", time: "15.00 – 17.00" },
                    { day: "Jumat", time: "15.00 – 17.00" },
                  ].map((s) => (
                    <div key={s.day} className="footer-schedule-row">
                      <span className="footer-schedule-day">{s.day}</span>
                      <span className="footer-schedule-time">{s.time}</span>
                    </div>
                  ))}
                </div>
                <p className="footer-location-note">
                  <span>
                    <IconLocation />
                  </span>{" "}
                  Lapangan Utama SMKN 1 Cibinong
                </p>
              </div>

              {/* Col 4 — Hubungi Kami */}
              <div className="footer-col">
                <h4 className="footer-col-title">Hubungi Kami</h4>
                <ul className="footer-contact-list">
                  <li className="footer-contact-item">
                    <span>
                      <IconLocation />
                    </span>
                    <span>
                      Jl. Karadenan No.7, Cibinong, Bogor, Jawa Barat 16913
                    </span>
                  </li>
                  <li className="footer-contact-item">
                    <span>
                      <IconPhone />
                    </span>
                    <span>+62 812-3456-7890</span>
                  </li>
                  <li className="footer-contact-item">
                    <span>
                      <IconMail />
                    </span>
                    <span>futsal@smkn1cibinong.sch.id</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
              <p className="footer-bottom-left">
                © 2025 Ekstrakurikuler Futsal SMKN 1 Cibinong. Semua hak
                dilindungi.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
