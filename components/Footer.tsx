"use client";

import { usePathname } from "next/navigation";

// Icons for footer
const IconLocation = () => (
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
    strokeWidth="2"
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
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16v16H4z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard and management pages
  const dashboardRoutes = [
    "/Dashboard_pengawas",
    "/Dashboard_pembina",
    "/Generate_kartu",
    "/Generate_qr",
    "/Verifikasi",
    "/Laporan_absensi",
    "/Crud_profile",
    "/Crud_pembina",
  ];

  const isOnDashboard = dashboardRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isOnDashboard) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1 — Branding & Social */}
          <div className="footer-col">
            <div className="footer-brand">
              <strong>Ekstrakurikuler E-Mobile</strong>
              <small>SMKN 1 Cibinong</small>
            </div>
            <div className="footer-socials">
              <h4>Ikuti Kami</h4>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href="#"
                  className="social-icon"
                  title="Instagram"
                  aria-label="Instagram"
                >
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
                <a
                  href="#"
                  className="social-icon"
                  title="YouTube"
                  aria-label="YouTube"
                >
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
                <a
                  href="#"
                  className="social-icon"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                >
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
          </div>

          {/* Col 2 — Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigasi</h4>
            <ul className="footer-links">
              <li>
                <a href="/Beranda_user">Home</a>
              </li>
              <li>
                <a href="/Profile_eskul">Kategori</a>
              </li>
              <li>
                <a href="#kontak">Kontak</a>
              </li>
            </ul>
          </div>

          {/* Col 3 — Schedule */}
          <div className="footer-col">
            <h4 className="footer-col-title">Jadwal Latihan</h4>
            <div className="footer-schedule-list">
              {[
                { day: "Senin", time: "15:00 – 17:00" },
                { day: "Rabu", time: "15:00 – 17:00" },
                { day: "Jumat", time: "15:00 – 17:00" },
              ].map((s) => (
                <div key={s.day} className="footer-schedule-row">
                  <span className="footer-schedule-day">{s.day}</span>
                  <span className="footer-schedule-time">{s.time}</span>
                </div>
              ))}
            </div>
            <p className="footer-location-note">
              <IconLocation /> Lapangan Utama SMKN 1 Cibinong
            </p>
          </div>

          {/* Col 4 — Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Hubungi Kami</h4>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <IconLocation />
                <span>
                  Jl. Karadenan No.7, Cibinong, Bogor, Jawa Barat 16913
                </span>
              </li>
              <li className="footer-contact-item">
                <IconPhone />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="footer-contact-item">
                <IconMail />
                <span>Ekstrakurikuler@smkn1cibinong.sch.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-bottom-left">
            © {new Date().getFullYear()} Ekstrakurikuler SMKN 1 Cibinong. Semua
            hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
