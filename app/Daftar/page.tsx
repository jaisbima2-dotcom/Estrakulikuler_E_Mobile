"use client";

import { useEffect, useRef, useState } from "react";
import { daftarEskulAction } from "./action";
import { getEskulOptionsAction, type EskulOption } from "./eskul-option";
import { getDefaultImagePath } from "@/lib/imageUtils";
import "./style.css";

// ── Icons ────────────────────────────────────────────

const IconLocation = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.72.33 1.43.63 2.11a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.68.3 1.39.51 2.11.63A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const NAV_LINKS = ["Home"];

// [DEBUG][Daftar] Component initialized
if (typeof window !== 'undefined') {
  console.log('[DEBUG][Daftar] Registration page loaded');
}

// ── Main Page Component ────────────────────────────────────────────
export default function DaftarPage() {
  const revealRefs                = useRef<(HTMLElement | null)[]>([]);

  // Form states
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);

  // ── PATCH: real eskul list ──────────────────────────────────────
  const [eskulList, setEskulList]         = useState<EskulOption[]>([]);
  const [eskulLoading, setEskulLoading]   = useState(true);
  const [eskulError, setEskulError]       = useState("");

  useEffect(() => {
    (async () => {
      setEskulLoading(true);
      const { data, error: err } = await getEskulOptionsAction();
      if (err) {
        setEskulError(err);
      } else {
        setEskulList(data);
      }
      setEskulLoading(false);
    })();
  }, []);
  // ───────────────────────────────────────────────────────────────

  // Reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const formElement = e.currentTarget;
      const formData    = new FormData(formElement);

      console.log("[DAFTAR PAGE] 🚀 Submitting registration");

      const result = await daftarEskulAction(formData);

      console.log("[DAFTAR PAGE] Response:", result);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.success) {
        setSuccess(true);
        alert(result.message || "Berhasil mendaftar ekstrakurikuler!");
        formElement.reset();
        setTimeout(() => {
          window.location.href = "/Beranda_user";
        }, 1500);
      } else {
        setError("Gagal melakukan pendaftaran");
        setLoading(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("[DAFTAR PAGE] ❌ Exception:", msg);
      setError("Terjadi kesalahan, silakan coba lagi");
      setLoading(false);
    }
  };

  return (
    <main className="page-root">
        <div className="reg-outer">
          <div className="reg-container">
            <div className="reg-card">

              {/* ══ LEFT — Image ══ */}
              <div className="reg-image-col">
                <img
                  src={getDefaultImagePath()}
                  alt="Students in field"
                />
              </div>

              {/* ══ RIGHT — Form Panel ══ */}
              <div className="reg-form-panel">
                <h1 className="reg-title">Daftar Sekarang!</h1>
                <p className="reg-desc">
                  Bergabunglah dengan ekstrakurikuler pilihan Anda. Isi formulir
                  di bawah ini dan tunggu verifikasi dari coach.
                </p>

                {/* Error Message */}
                {error && (
                  <div style={{ padding: "12px", marginBottom: "16px", backgroundColor: "#fee", color: "#c33", borderRadius: "6px", fontSize: "14px" }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div style={{ padding: "12px", marginBottom: "16px", backgroundColor: "#efe", color: "#3c3", borderRadius: "6px", fontSize: "14px" }}>
                    ✓ Berhasil mendaftar! Redirecting...
                  </div>
                )}

                {/* Form */}
                <form className="reg-form" onSubmit={handleSubmit}>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="reg-label">Nama Lengkap</label>
                    <input
                      type="text"
                      name="nama"
                      className="reg-input"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  {/* NIS */}
                  <div>
                    <label className="reg-label">NIS (Nomor Induk Siswa)</label>
                    <input
                      type="text"
                      name="nis"
                      className="reg-input"
                      placeholder="Masukkan NIS"
                      required
                    />
                  </div>

                  {/* Kelas */}
                  <div>
                    <label className="reg-label">Kelas</label>
                    <input
                      type="text"
                      name="kelas"
                      className="reg-input"
                      placeholder="Contoh: X TKJ 1"
                      required
                    />
                  </div>

                  {/* ── PATCH: dynamic eskul dropdown ── */}
                  <div>
                    <label className="reg-label">Pilih Ekstrakurikuler</label>
                    <div className="reg-select-wrap">
                      {eskulError ? (
                        <p style={{ color: "#c33", fontSize: 13 }}>
                          ⚠️ {eskulError}
                        </p>
                      ) : (
                        <select
                          name="id_eskul"
                          className="reg-select"
                          defaultValue=""
                          required
                          disabled={eskulLoading}
                        >
                          <option value="" disabled>
                            {eskulLoading
                              ? "Memuat daftar eskul..."
                              : "Pilih Eskul"}
                          </option>
                          {eskulList.map((eskul) => (
                            <option
                              key={eskul.id_eskul}
                              value={eskul.id_eskul}
                            >
                              {eskul.nama_eskul}
                              {eskul.kategori ? ` — ${eskul.kategori}` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  {/* ── END PATCH ── */}

                  {/* Submit */}
                  <button
                    type="submit"
                    className="reg-btn"
                    disabled={loading || eskulLoading}
                    style={{
                      opacity: loading || eskulLoading ? 0.6 : 1,
                      cursor: loading || eskulLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Memproses..." : "Submit"}
                  </button>
                </form>
              </div>
              {/* ══ END form panel ══ */}

            </div>
          </div>
        </div>

      </main>
    );
  }