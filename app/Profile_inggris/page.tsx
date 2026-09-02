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

// ── Main Page Component ────────────────────────────────────────────
export default function HomePage() {
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
        {/* Background Image via Unsplash */}
        <div
          className={cx("profile-hero-media")}
          style={{
            backgroundImage: "url('/image/Kecee.jpeg')",
            filter: "blur(1px) brightness(0.82)",
            transform: "scale(1.04)",
          }}
        />

        {/* Gradient Overlay — dark navy left, semi-transparent right */}
        <div className={cx("profile-hero-overlay profile-hero-overlay--side")} />
        <div className={cx("profile-hero-overlay profile-hero-overlay--vertical")} />

        {/* ── Content ── */}
        <div className={cx("profile-hero-content")}>
          {/* LEFT — Text */}
          <div className={cx("profile-hero-copy space-y-8")}>
            {/* Badge */}


            {/* Headline */}
            <div
              className={cx("animate-fade-in")}
              style={{ animationDelay: "0.25s", animationFillMode: "both" }}
            >
              <h1
                className={cx("profile-hero-title text-white leading-[0.9] uppercase")}
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  fontWeight: 900,
                }}
              >
                English Club
                <br />
                <span className={cx("text-[#f97316]")}>SMKN 1</span>
                <br />
                Cibinong
              </h1>
            </div>

            {/* Divider */}
            <div
              className={cx("flex items-center gap-3 animate-fade-in")}
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            >
              <div className={cx("h-px w-10 bg-[#f97316]")} />
              <div className={cx("h-px flex-1 bg-white/10")} />
            </div>

            {/* Description */}


            {/* CTA Buttons */}
            <div
              className={cx("profile-hero-actions flex flex-wrap gap-4 animate-fade-in")}
              style={{ animationDelay: "0.65s", animationFillMode: "both" }}
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
            <div className={cx("about-badge")}>Ekstrakurikuler English club</div>
            <h1 className={cx("about-title")}>Tentang Kami</h1>
            <p className={cx("about-para")}>
              Ekstrakurikuler English Club merupakan wadah bagi siswa untuk
              mengembangkan kemampuan berbahasa Inggris secara aktif dan
              menyenangkan. Dalam kegiatan ini, anggota akan belajar berbagai
              aspek bahasa seperti speaking, listening, reading, dan writing
              melalui diskusi, permainan edukatif, presentasi, hingga praktik
              percakapan sehari-hari. Kegiatan ini membantu siswa meningkatkan
              rasa percaya diri dalam menggunakan bahasa Inggris baik di
              lingkungan sekolah maupun di kehidupan sehari-hari.
            </p>
            <p className={cx("about-para")}>
              Selain meningkatkan kemampuan bahasa, English Club juga melatih
              keberanian, kreativitas, dan kemampuan berkomunikasi siswa.
              Berbagai kegiatan seperti debate, storytelling, speech, dan lomba
              bahasa Inggris memberikan pengalaman baru sekaligus memperluas
              wawasan anggota. Dengan suasana belajar yang interaktif dan
              mendukung, English Club menjadi tempat yang tepat untuk
              mengembangkan potensi serta kemampuan berbahasa internasional.
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
                <h2 className={cx("section-title")}>Jadwal Latihan</h2>
              </div>
              <p className={cx("section-subtitle")}>
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
                    <span className={cx("schedule-card__day")}>{item.day}</span>
                    <span className={cx("schedule-card__time")}>{item.time}</span>
                  </div>

                  {/* Card Body */}
                  <div className={cx("schedule-card__body")}>
                    <p className={cx("schedule-card__activity")}>{item.activity}</p>
                    <p className={cx("schedule-card__location")}>
                      <span className={cx("icon-sm")}>
                        <IconLocation />
                      </span>{" "}
                      {item.location}
                    </p>

                    {/* Absensi */}
                    <div className={cx("schedule-card__absensi")}>
                      <span className={cx("absensi-label")}>ABSENSI</span>
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
                <h2 className={cx("section-title")}>Pembina &amp; Pelatih</h2>
              </div>
              <p className={cx("section-subtitle")}>
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
                    <h3 className={cx("coach-name")}>{coach.name}</h3>
                    <p className={cx("coach-desc")}>{coach.desc}</p>
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
              <h2 className={cx("achievements-title")}>Prestasi &amp; Penghargaan</h2>
              <p className={cx("achievements-subtitle")}>
                Rekam jejak terbaik English Club SMKN 1 Cibinong di berbagai
                kompetisi
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
                        <span className={cx("achievement-year")}>{item.year}</span>
                      </div>
                      <div className={cx("achievement-text")}>
                        <p className={cx("achievement-name")}>{item.title}</p>
                        <p className={cx("achievement-sub")}>{item.sub}</p>
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
              <h2 className={cx("cta-title")}>
                Siap Bergabung dengan
                <br />
                Ekskul Favoritmu?
              </h2>
              <p className={cx("cta-desc")}>
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

        {/* ── SECTION 5: FOOTER ── */}
        <footer className={cx("footer")}>
          <div className={cx("footer-container")}>
            <div className={cx("footer-grid")}>
              {/* Col 1 — Branding */}
              <div className={cx("footer-col")}>
                <div className={cx("footer-brand")}>
                  <div className={cx("footer-logo")}>B</div>
                  <span className={cx("footer-brand-name")}>
                    English Club SMKN 1 Cibinong
                  </span>
                </div>
                <p className={cx("footer-brand-desc")}>
                  Membangun atlet pelajar berprestasi dengan karakter unggul
                  sejak 2010.
                </p>
                <div className={cx("footer-socials")}>
                  <a href="#" className={cx("social-icon")} aria-label="Instagram">
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
                  <a href="#" className={cx("social-icon")} aria-label="YouTube">
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
                  <a href="#" className={cx("social-icon")} aria-label="WhatsApp">
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
              <div className={cx("footer-col")}>
                <h4 className={cx("footer-col-title")}>Jadwal Latihan</h4>
                <div className={cx("footer-schedule-list")}>
                  {[
                    { day: "Senin", time: "15.00 – 17.00" },
                    { day: "Rabu", time: "15.00 – 17.00" },
                    { day: "Jumat", time: "15.00 – 17.00" },
                  ].map((s) => (
                    <div key={s.day} className={cx("footer-schedule-row")}>
                      <span className={cx("footer-schedule-day")}>{s.day}</span>
                      <span className={cx("footer-schedule-time")}>{s.time}</span>
                    </div>
                  ))}
                </div>
                <p className={cx("footer-location-note")}>
                  <span>
                    <IconLocation />
                  </span>{" "}
                  Lapangan Utama SMKN 1 Cibinong
                </p>
              </div>

              {/* Col 4 — Hubungi Kami */}
              <div className={cx("footer-col")}>
                <h4 className={cx("footer-col-title")}>Hubungi Kami</h4>
                <ul className={cx("footer-contact-list")}>
                  <li className={cx("footer-contact-item")}>
                    <span>
                      <IconLocation />
                    </span>
                    <span>
                      Jl. Karadenan No.7, Cibinong, Bogor, Jawa Barat 16913
                    </span>
                  </li>
                  <li className={cx("footer-contact-item")}>
                    <span>
                      <IconPhone />
                    </span>
                    <span>+62 812-3456-7890</span>
                  </li>
                  <li className={cx("footer-contact-item")}>
                    <span>
                      <IconMail />
                    </span>
                    <span>englishclub@smkn1cibinong.sch.id</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className={cx("footer-bottom")}>
              <p className={cx("footer-bottom-left")}>
                © 2025 Ekstrakurikuler English Club SMKN 1 Cibinong. Semua hak
                dilindungi.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
