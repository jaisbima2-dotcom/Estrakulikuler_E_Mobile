"use client";

import { useEffect, useRef } from "react";
import styles from "./style.module.css";
import { resolveCssModuleClasses } from "@/lib/resolveCssModuleClasses";

const cx = (className: string) => resolveCssModuleClasses(styles, className);

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

// ── Main Page Component ────────────────────────────────────────────
type HomePageProps = {
  imageSrc?: string;
};

export default function HomePage({
  imageSrc = "/image/Kecee.jpeg",
}: HomePageProps) {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  // Reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.visible);
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
    <div className={cx("profile-page")}>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className={cx("profile-hero")} style={{ paddingTop: "80px" }}>
        {/* Background with Basketball Theme */}
        <div
          className={cx("profile-hero-media")}
          style={{
            backgroundImage: `url('${imageSrc}')`,
            filter: "blur(2px) brightness(0.78) contrast(1.1)",
            transform: "scale(1.05)",
          }}
        />

        {/* Primary Orange-Black Gradient Overlay */}
        <div className={cx("profile-hero-overlay profile-hero-overlay--side")} />

        {/* Secondary Top-Bottom Gradient */}
        <div className={cx("profile-hero-overlay profile-hero-overlay--vertical")} />

        {/* Subtle Glow Accent - Top Right */}
        <div className={cx("hero-glow-top")} />

        {/* Subtle Glow Accent - Bottom Left */}
        <div className={cx("hero-glow-bottom")} />

        {/* ── Content ── */}
        <div className={cx("profile-hero-content")}>
          {/* LEFT — Text */}
          <div className={cx("profile-hero-copy")}>
            {/* Badge */}


            {/* Headline - Enhanced with Gradient */}
            <div
              className={cx("animate-fade-in")}
              style={{ animationDelay: "0.25s" }}
            >
              <h1
                className={cx("profile-hero-title text-white leading-[0.95] uppercase font-black")}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(3.5rem, 9vw, 6.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                }}
              >
                Basket
                <br />
                <span className={cx("text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-[#ff8c42]")}>
                  SMKN 1
                </span>
                <br />
                Cibinong
              </h1>
            </div>

            {/* Divider - Enhanced */}
            <div
              className={cx("flex items-center gap-3 animate-fade-in")}
              style={{ animationDelay: "0.4s" }}
            >
              <div className={cx("h-1 w-12 bg-gradient-to-r from-[#f97316] to-[#ff8c42] rounded-full")} />
              <div className={cx("h-px flex-1 bg-gradient-to-r from-white/30 to-transparent")} />
            </div>

            {/* Description - Enhanced Typography */}


            {/* CTA Buttons - Enhanced Styling */}
            <div
              className={cx("profile-hero-actions flex flex-wrap gap-4 animate-fade-in pt-4")}
              style={{
                animationDelay: "0.65s",
              }}
            >
              <a href="/Daftar" className={cx("profile-hero-register")}>Daftar Sekarang</a>


            </div>
          </div>
        </div>
      </section>

      <main className={cx("page-root")}>
        {/* ── SECTION 1: TENTANG KAMI ── */}
        <section className={cx("section-about")}>
          <div className={cx("container-md")}>
            <div className={cx("about-badge")}>Ekstrakurikuler Resmi</div>
            <h1 className={cx("about-title text-white")}>Tentang Kami</h1>
            <p className={cx("about-para text-white/90")}>
              Ekstrakurikuler Basket SMKN 1 Cibinong adalah wadah bagi
              siswa-siswi yang memiliki semangat dan passion dalam olahraga bola
              basket. Kami hadir sebagai ruang pengembangan bakat, membentuk
              karakter tangguh, dan mencetak generasi atlet pelajar yang
              berprestasi di tingkat daerah maupun nasional.
            </p>
            <p className={cx("about-para text-white/90")}>
              Berdiri sejak tahun 2010, kami telah mengukir berbagai prestasi
              bergengsi dan terus berkomitmen memberikan pembinaan terbaik.
              Dengan pelatih berpengalaman dan fasilitas yang mendukung, setiap
              anggota dibimbing untuk berkembang baik di lapangan maupun dalam
              kehidupan sehari-hari.
            </p>
          </div>
        </section>

        {/* ── SECTION 2: JADWAL LATIHAN ── */}
        <section className={cx("section-schedule")}>
          <div className={cx("container-lg")}>
            <div className={cx("section-header")}>
              <div className={cx("section-title-row")}>
                <span className={cx("icon-accent")}>
                  <IconClock />
                </span>
                <h2 className={cx("section-title text-white")}>Jadwal Latihan</h2>
              </div>
              <p className={cx("section-subtitle text-white/80")}>
                Rutin setiap minggu konsisten membangun kemampuan terbaik
              </p>
            </div>

            <div className={cx("schedule-grid")}>
              {scheduleData.map((item) => (
                <div
                  key={item.day}
                  className={cx(`schedule-card ${item.highlight ? "schedule-card--highlight" : ""}`)}
                >
                  {/* Card Header */}
                  <div
                    className={cx(`schedule-card__header ${item.highlight ? "schedule-card__header--orange" : ""}`)}
                  >
                    <span className={cx("schedule-card__day text-white")}>
                      {item.day}
                    </span>
                    <span className={cx("schedule-card__time text-white")}>
                      {item.time}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className={cx("schedule-card__body")}>
                    <p className={cx("schedule-card__activity text-white")}>
                      {item.activity}
                    </p>
                    <p className={cx("schedule-card__location text-white/80")}>
                      <span className={cx("icon-sm")}>
                        <IconLocation />
                      </span>{" "}
                      {item.location}
                    </p>

                    {/* Absensi */}
                    <div className={cx("schedule-card__absensi")}>
                      <span className={cx("absensi-label text-white/70")}>
                        ABSENSI
                      </span>
                      <span
                        className={cx(`absensi-status ${item.absensi === "open" ? "absensi-status--open" : "absensi-status--closed"}`)}
                      >
                        {item.absensi === "open" ? "Dibuka" : "Ditutup"}
                      </span>
                    </div>

                    {/* Button */}
                    {item.absensi === "open" ? (
                      <button className={cx("btn-absensi btn-absensi--active")}>
                        Isi Absensi Sekarang
                      </button>
                    ) : (
                      <button
                        className={cx("btn-absensi btn-absensi--disabled")}
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
        <section className={cx("section-coaches")}>
          <div className={cx("container-lg")}>
            <div className={cx("section-header")}>
              <div className={cx("section-title-row")}>
                <span className={cx("icon-accent")}>
                  <IconUser />
                </span>
                <h2 className={cx("section-title text-white")}>
                  Pembina &amp; Pelatih
                </h2>
              </div>
              <p className={cx("section-subtitle text-white/80")}>
                Dipandu oleh tenaga profesional berpengalaman
              </p>
            </div>

            <div className={cx("coaches-grid")}>
              {coaches.map((coach) => (
                <div key={coach.name} className={cx("coach-card")}>
                  <div className={cx("coach-avatar")}>{coach.initials}</div>
                  <div className={cx("coach-info")}>
                    <span
                      className={cx(`coach-role ${coach.roleColor === "blue" ? "coach-role--blue" : "coach-role--orange"}`)}
                    >
                      {coach.role}
                    </span>
                    <h3 className={cx("coach-name text-white")}>{coach.name}</h3>
                    <p className={cx("coach-desc text-white/80")}>{coach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 4: PRESTASI & PENGHARGAAN ── */}
        <section className={cx("section-achievements")}>
          <div className={cx("container-md")}>
            <div className={cx("achievements-header")}>
              <span className={cx("badge-pill")}>Kebanggaan Kami</span>
              <h2 className={cx("achievements-title text-white")}>
                Prestasi &amp; Penghargaan
              </h2>
              <p className={cx("achievements-subtitle text-white/80")}>
                Rekam jejak terbaik Basket SMKN 1 Cibinong di berbagai kompetisi
              </p>
            </div>

            <div className={cx("achievements-list")}>
              {achievements.map((item) => {
                const medal = medalConfig[item.medal];
                return (
                  <div key={item.title} className={cx("achievement-item")}>
                    {/* Left */}
                    <div className={cx("achievement-left")}>
                      <div className={cx("achievement-icon-box")}>
                        <span className={cx("achievement-trophy")}>🏆</span>
                        <span className={cx("achievement-year text-white")}>
                          {item.year}
                        </span>
                      </div>
                      <div className={cx("achievement-text")}>
                        <p className={cx("achievement-name text-white")}>
                          {item.title}
                        </p>
                        <p className={cx("achievement-sub text-white/70")}>
                          {item.sub}
                        </p>
                      </div>
                    </div>
                    {/* Right */}
                    <span className={cx(`medal-badge ${medal.bg} ${medal.text}`)}>
                      {medal.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──────────── CTA ──────────── */}

        <section className={cx("cta-section")}>
          <div
            className={cx("cta-card")}
            ref={(el) => addReveal(el as HTMLElement | null, 20)}
          >
            <div className={cx("cta-content")}>
              <div className={cx("cta-badge")}>Mulai Sekarang</div>
              <h2 className={cx("cta-title text-white")}>
                Siap Bergabung dengan
                <br />
                Ekskul Favoritmu?
              </h2>
              <p className={cx("cta-desc text-white/80")}>
                Jangan lewatkan kesempatan untuk mengembangkan bakat, memperluas
                jaringan, dan meraih prestasi bersama SMKN 1 Cibinong.
              </p>
              <div className={cx("cta-buttons")}>
                <a href="/Daftar" className={cx("btn-primary")}>
                  Daftar Sekarang <IconArrowRight />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
