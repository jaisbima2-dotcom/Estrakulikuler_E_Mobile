"use client";

import "./style.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getKartuStats, deleteKartu, type KartuAnggota, type KartuStats } from "./action";
import { getKartuDataAction } from "./action-rbac";

/* ─── TYPES ─────────────────────────────────────────────────────────── */

// Color palette for cards (cycle through colors)
const colors = [
  { color: "#ef4444", bg: "#fef2f2", avatarBg: "#fecaca", avatarColor: "#dc2626", stripColor: "#ef4444" },
  { color: "#3b82f6", bg: "#eff6ff", avatarBg: "#bfdbfe", avatarColor: "#1d4ed8", stripColor: "#3b82f6" },
  { color: "#10b981", bg: "#ecfdf5", avatarBg: "#a7f3d0", avatarColor: "#047857", stripColor: "#10b981" },
  { color: "#f97316", bg: "#fff7ed", avatarBg: "#fed7aa", avatarColor: "#c2410c", stripColor: "#f97316" },
  { color: "#06b6d4", bg: "#ecfeff", avatarBg: "#a5f3fc", avatarColor: "#0e7490", stripColor: "#06b6d4" },
  { color: "#22c55e", bg: "#f0fdf4", avatarBg: "#bbf7d0", avatarColor: "#15803d", stripColor: "#22c55e" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getColorForIndex(index: number) {
  return colors[index % colors.length];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "-";
  }
}

async function printKartu(kartu: KartuAnggota, index: number) {
  try {
    console.log("[printKartu] START - id_anggota:", kartu.id_anggota);

    const colorScheme = getColorForIndex(index);
    const printWindow = window.open("", "", "width=600,height=800");

    if (!printWindow) {
      alert("Tidak bisa membuka print window");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu ${kartu.nis}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .card { width: 400px; padding: 20px; background: ${colorScheme.bg}; border-radius: 12px; }
            .header { border-top: 4px solid ${colorScheme.stripColor}; padding-top: 12px; }
            .school { text-align: center; margin-bottom: 12px; }
            .school-name { font-weight: bold; font-size: 14px; color: #666; }
            .school-sub { font-size: 12px; color: #999; }
            .body { display: flex; gap: 12px; margin-bottom: 16px; margin-top: 12px; }
            .avatar { width: 60px; height: 60px; background: ${colorScheme.avatarBg}; color: ${colorScheme.avatarColor}; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 16px; }
            .info { flex: 1; }
            .label { font-size: 11px; color: #999; text-transform: uppercase; }
            .value { font-size: 13px; font-weight: bold; color: #333; margin-bottom: 8px; }
            .footer { border-top: 1px solid #ddd; padding-top: 8px; margin-top: 12px; }
            .mono { font-family: monospace; color: ${colorScheme.color}; font-weight: bold; }
            @media print { body { margin: 0; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="school">
                <div class="school-name">SMA NEGERI 1</div>
                <div class="school-sub">Kartu Anggota Ekskul</div>
              </div>
              <div class="body">
                <div class="avatar">${getInitials(kartu.nama)}</div>
                <div class="info">
                  <div class="label">Nama</div>
                  <div class="value">${kartu.nama}</div>
                  <div class="label">Kelas</div>
                  <div class="value">${kartu.kelas || "-"}</div>
                </div>
              </div>
              <div>
                <div class="label">NISN</div>
                <div class="value mono">${kartu.nis}</div>
              </div>
              <div>
                <div class="label">Ekskul</div>
                <div class="value">${kartu.nama_eskul}</div>
              </div>
              <div>
                <div class="label">ID Anggota</div>
                <div class="value mono">${kartu.id_anggota}</div>
              </div>
              <div class="footer">
                <div class="label">Tanggal Masuk</div>
                <div class="value">${formatDate(kartu.tanggal_masuk)}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };

    console.log("[printKartu] ✅ Print dialog opened");
  } catch (error) {
    console.error("[printKartu] ❌ Error:", error);
    alert("Gagal membuka halaman print");
  }
}

async function downloadKartuPDF(kartu: KartuAnggota, index: number) {
  try {
    console.log("[downloadKartuPDF] 📥 START - Processing kartu");
    console.log("[downloadKartuPDF]    id_anggota:", kartu.id_anggota);
    console.log("[downloadKartuPDF]    nama:", kartu.nama || "MISSING");
    console.log("[downloadKartuPDF]    nis:", kartu.nis || "MISSING");
    console.log("[downloadKartuPDF]    kelas:", kartu.kelas || "N/A");
    console.log("[downloadKartuPDF]    eskul:", kartu.nama_eskul || "MISSING");

    // Validate required fields
    if (!kartu.nama || !kartu.nis) {
      console.error("[downloadKartuPDF] ❌ Missing required fields");
      alert("❌ Data kartu tidak lengkap. Tidak bisa mengunduh.");
      return;
    }

    const colorScheme = getColorForIndex(index);
    const cardElement = document.createElement("div");
    cardElement.style.width = "400px";
    cardElement.style.padding = "20px";
    cardElement.style.backgroundColor = colorScheme.bg;
    cardElement.style.borderRadius = "12px";
    cardElement.style.fontFamily = "Arial, sans-serif";
    cardElement.innerHTML = `
      <div style="border-top: 4px solid ${colorScheme.stripColor}; padding-top: 12px;">
        <div style="text-align: center; margin-bottom: 12px;">
          <strong style="font-size: 14px; color: #666;">SMA NEGERI 1</strong><br/>
          <span style="font-size: 12px; color: #999;">Kartu Anggota Ekskul</span>
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="width: 60px; height: 60px; background: ${colorScheme.avatarBg}; color: ${colorScheme.avatarColor}; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 16px;">
            ${getInitials(kartu.nama || "?")}
          </div>
          <div>
            <div style="font-size: 11px; color: #999; text-transform: uppercase;">Nama</div>
            <div style="font-size: 13px; font-weight: bold; color: #333; margin-bottom: 8px;">${kartu.nama || "Tidak ada nama"}</div>
            <div style="font-size: 11px; color: #999; text-transform: uppercase;">Kelas</div>
            <div style="font-size: 13px; font-weight: bold; color: #333;">${kartu.kelas || "-"}</div>
          </div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; color: #999; text-transform: uppercase;">NISN</div>
          <div style="font-size: 12px; font-family: monospace; color: ${colorScheme.color}; font-weight: bold;">${kartu.nis || "N/A"}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; color: #999; text-transform: uppercase;">Ekskul</div>
          <div style="font-size: 12px; color: ${colorScheme.color}; font-weight: bold;">${kartu.nama_eskul || "Tidak ada eskul"}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="font-size: 11px; color: #999; text-transform: uppercase;">ID Anggota</div>
          <div style="font-size: 12px; font-family: monospace; color: ${colorScheme.color}; font-weight: bold;">${kartu.id_anggota || "N/A"}</div>
        </div>
        <div style="border-top: 1px solid #ddd; padding-top: 8px;">
          <div style="font-size: 11px; color: #999; text-transform: uppercase;">Tanggal Masuk</div>
          <div style="font-size: 12px; color: #333;">${formatDate(kartu.tanggal_masuk)}</div>
        </div>
      </div>
    `;

    document.body.appendChild(cardElement);

    // Use html2canvas if available
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardElement, { scale: 2, backgroundColor: "#ffffff" });
    const image = canvas.toDataURL("image/png");

    // Use jsPDF if available
    const jsPDF = (await import("jspdf")).jsPDF;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = 100;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(image, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(`kartu-${kartu.nis || "unknown"}.pdf`);

    document.body.removeChild(cardElement);
    console.log("[downloadKartuPDF] ✅ PDF downloaded for:", kartu.nis);
  } catch (error) {
    console.error("[downloadKartuPDF] ❌ Error:", error);
    alert("Gagal mengunduh PDF. Silakan coba lagi.");
  }
}

export default function AnggotaPage() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [kartuList, setKartuList] = useState<KartuAnggota[]>([]);
  const [stats, setStats] = useState<KartuStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      
      console.log("[Generate_kartu] 📥 Starting data load...");

      // Call RBAC server action - server reads cookies automatically
      const kartuResult = await getKartuDataAction();
      const statsResult = await getKartuStats();

      if (kartuResult.error) {
        console.error("[Generate_kartu] ❌ Error loading kartu:", kartuResult.error);
        setError(kartuResult.error);
        setKartuList([]);
      } else {
        console.log(`[Generate_kartu] ✅ Loaded ${kartuResult.data?.length || 0} kartu`);
        
        // Validate all kartu have required fields
        const validatedKartu = (kartuResult.data || []).map((k: any) => ({
          ...k,
          nama: k.nama || "Data tidak tersedia",
          kelas: k.kelas || "-",
          nis: k.nis || "N/A",
          nama_eskul: k.nama_eskul || "Tidak ada eskul",
          id_anggota: k.id_anggota || null,
        }));
        
        setKartuList(validatedKartu);
      }

      if (!statsResult.error) {
        console.log("[Generate_kartu] ✅ Stats loaded:", statsResult.data);
        setStats(statsResult.data);
      }
    } catch (err) {
      console.error("[Generate_kartu] ❌ Exception:", err);
      setError("Gagal memuat data kartu. Silakan coba refresh halaman.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteKartu(id_anggota: number) {
    if (!confirm("Apakah Anda yakin ingin menghapus kartu ini?")) return;

    try {
      const result = await deleteKartu(id_anggota);
      if (result.success) {
        console.log("[AnggotaPage] Deleted kartu:", id_anggota);
        await loadData();
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("[AnggotaPage] Delete error:", err);
      alert("Gagal menghapus kartu");
    }
  }

  async function handleDownloadAll() {
    if (kartuList.length === 0) {
      alert("Tidak ada kartu untuk diunduh");
      return;
    }

    const confirmDownload = window.confirm(
      `Unduh ${kartuList.length} kartu? Ini akan membuka beberapa tab browser untuk setiap kartu.`
    );
    if (!confirmDownload) return;

    try {
      console.log("[handleDownloadAll] Starting bulk download for", kartuList.length, "kartu");
      
      // Download each kartu with a small delay to prevent browser blocking
      for (let i = 0; i < kartuList.length; i++) {
        const kartu = kartuList[i];
        // Add delay between downloads (500ms) to prevent browser blocking
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        await downloadKartuPDF(kartu, i);
      }

      console.log("[handleDownloadAll] ✅ Bulk download completed");
      alert(`✅ Berhasil mengunduh ${kartuList.length} kartu. Periksa folder downloads Anda.`);
    } catch (error) {
      console.error("[handleDownloadAll] Error:", error);
      alert("❌ Terjadi kesalahan saat mengunduh kartu");
    }
  }

  return (
    <div className="layout">
      {/* ── TOPBAR ── */}
      <div className="topbar">
        <div className="topbar-left">
          <h2>Dashboard Admin</h2>
        </div>

        <div className="topbar-right">
          <button className="notif-btn">🔔</button>

          <div className="avatar-wrapper">
            <div
              className="avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              AD
            </div>

            {dropdownOpen && (
              <div className="dropdown">
                <p>👤 View Profile</p>
                <p>✉️ Messages</p>
                <p
                  className="logout"
                  onClick={async () => {
                    console.log("[Generate_kartu] Logout clicked");
                    try {
                      const { logoutAction } = await import("@/app/Login/logout");
                      await logoutAction();
                    } catch (err) {
                      console.error("[Generate_kartu] Logout error:", err);
                      window.location.href = "/";
                    }
                  }}
                >
                  ↩️ Logout
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- SIDEBAR ---- */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <p className="sidebar-section-title">MENU UTAMA</p>
          <nav className="sidebar-menu">
            <Link href="/Dashboard_pembina" className={pathname === "/Dashboard_pembina" ? "active" : ""}>
              Dashboard
            </Link>
            <Link href="/Crud_profile" className={pathname === "/Crud_profile" ? "active" : ""}>
              Profile
            </Link>
            <Link href="/Laporan_absensi" className={pathname === "/Laporan_absensi" ? "active" : ""}>
              Laporan
            </Link>
            <Link href="/Generate_qr" className={pathname === "/Generate_qr" ? "active" : ""}>
              Generator QR Code
            </Link>
            <Link href="/Verifikasi" className={pathname === "/Verifikasi" ? "active" : ""}>
              Verifikasi Data Pendaftar
            </Link>
            <Link href="/Generate_kartu" className={pathname === "/Generate_kartu" ? "active" : ""}>
              Kartu Identitas
            </Link>
          </nav>
        </div>
      </aside>

      {/* ── MAIN WRAPPER ── */}
      <div className="main-wrapper">
        <main className="kartu-page-shell">
          <div className="kartu-content">
            <div className="kartu-header">
              <div className="kartu-header-copy">
                <div className="breadcrumb">
                  <span>Dashboard</span>
                  <span className="breadcrumb-sep">›</span>
                  <span>Anggota</span>
                  <span className="breadcrumb-sep">›</span>
                  <span className="breadcrumb-active">Kartu Keanggotaan</span>
                </div>
                <h1 className="font-extrabold text-gray-900 mt-1" style={{ fontSize: 22, letterSpacing: "-0.5px" }}>
                  Kartu Keanggotaan Ekskul
                </h1>
                <p className="text-sm text-gray-400 mt-1 font-medium">
                  Kelola dan unduh kartu anggota yang telah diverifikasi
                </p>
              </div>

              <div className="kartu-header-actions">
                <button className="btn-outline" onClick={handleDownloadAll} disabled={loading || kartuList.length === 0}>
                  ⬇ Unduh Semua
                </button>
                <button className="btn-primary">+ Tambah Anggota</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
              <span className="summary-badge" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                <span style={{ fontSize: 16 }}>🪪</span>
                Total Kartu
                <strong>{stats?.total_kartu ?? 0}</strong>
              </span>
              <span className="summary-badge" style={{ background: "#dcfce7", color: "#15803d" }}>
                <span style={{ fontSize: 14 }}>✅</span>
                Aktif
                <strong>{stats?.total_aktif ?? 0}</strong>
              </span>
              <span className="summary-badge" style={{ background: "#fff7ed", color: "#c2410c" }}>
                <span style={{ fontSize: 14 }}>⏳</span>
                Tidak Aktif
                <strong>{stats?.total_nonaktif ?? 0}</strong>
              </span>
            </div>

            <div className="search-container mb-6">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Cari nama anggota, ekskul, atau ID..."
                className="search-input"
                disabled={loading}
              />
              <button className="filter-btn" disabled={loading}>⚙ Filter</button>
              <div className="view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  ⊞ Grid
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  ☰ Daftar
                </button>
              </div>
            </div>

            {loading && (
              <div className="kartu-state-card kartu-state-card--loading">
                <div className="kartu-state-icon">⏳</div>
                <div className="kartu-state-title">Memuat data kartu...</div>
                <div className="kartu-state-desc">Sedang mengambil data dari database</div>
              </div>
            )}

            {error && (
              <div className="kartu-state-card kartu-state-card--error">
                <div className="kartu-state-icon">❌</div>
                <div className="kartu-state-title">{error}</div>
                <div className="kartu-state-actions">
                  <button onClick={loadData} className="btn-outline">
                    🔄 Coba Lagi
                  </button>
                  <button onClick={() => window.location.reload()} className="btn-primary">
                    🔃 Refresh Halaman
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && kartuList.length === 0 && (
              <div className="kartu-state-card kartu-state-card--empty">
                <div className="kartu-state-icon">🪪</div>
                <div className="kartu-state-title">Belum ada anggota yang terdaftar di eskul ini</div>
                <div className="kartu-state-desc">Lakukan verifikasi anggota untuk menampilkan kartu identitas</div>
              </div>
            )}

            {!loading && !error && kartuList.length > 0 && (
              <div className={viewMode === "grid" ? "kartu-grid" : "list-view"}>
                {kartuList.map((kartu, index) => {
                  const colorScheme = getColorForIndex(index);
                  return (
                    <div
                      key={kartu.id_anggota}
                      className={`card-soft card-hover kartu-card ${viewMode === "list" ? "list-card" : ""}`}
                    >
                      {/* ─── HEADER STRIP (GRID MODE) ─── */}
                      {viewMode === "grid" && (
                        <div
                          className="card-header-strip"
                          style={{
                            background: `linear-gradient(90deg, ${colorScheme.stripColor}, ${colorScheme.stripColor}44)`,
                          }}
                        />
                      )}

                      {/* ─── SCHOOL & BADGE HEADER ─── */}
                      <div className="card-school-header">
                        <div>
                          <div className="school-name">SMK NEGERI 1</div>
                          <div className="school-sub">Kartu Anggota Ekskul</div>
                        </div>
                        <span className="badge-soft badge-verified">
                          <span className="badge-dot badge-dot-green" />
                          Aktif
                        </span>
                      </div>

                      {/* ─── MAIN CONTENT ─── */}
                      {viewMode === "grid" ? (
                        // GRID VIEW: Avatar + Info side-by-side
                        <div className="flex items-start">
                          <div>
                            <div
                              className="avatar-box"
                              style={{
                                background: colorScheme.avatarBg,
                                color: colorScheme.avatarColor,
                              }}
                            >
                              {getInitials(kartu.nama)}
                            </div>
                            <div className="accent-line" style={{ background: colorScheme.stripColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="card-label">NAMA</div>
                            <div className="card-value truncate" title={kartu.nama}>
                              {kartu.nama}
                            </div>
                            <div className="flex flex-wrap mt-3" style={{ gap: "var(--sp-md)" }}>
                              <div>
                                <div className="card-label">KELAS</div>
                                <div className="font-semibold text-gray-700">
                                  {kartu.kelas || "-"}
                                </div>
                              </div>
                              <div>
                                <div className="card-label">EKSKUL</div>
                                <span className="ekskul-badge" style={{ background: colorScheme.bg, color: colorScheme.color }}>
                                  {kartu.nama_eskul}
                                </span>
                              </div>
                              <div>
                                <div className="card-label">NISN</div>
                                <div className="id-mono" style={{ color: colorScheme.color }}>
                                  {kartu.nis}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // LIST VIEW: Vertical layout
                        <div className="list-card-body">
                          <div>
                            <div className="card-label">NAMA</div>
                            <div className="card-value-list" title={kartu.nama}>
                              {kartu.nama}
                            </div>
                          </div>
                          <div className="flex flex-wrap" style={{ gap: "var(--sp-md)" }}>
                            <div>
                              <div className="card-label">KELAS</div>
                              <div className="font-semibold text-gray-700">
                                {kartu.kelas || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="card-label">EKSKUL</div>
                              <span className="ekskul-badge" style={{ background: colorScheme.bg, color: colorScheme.color }}>
                                {kartu.nama_eskul}
                              </span>
                            </div>
                            <div>
                              <div className="card-label">NISN</div>
                              <div className="id-mono" style={{ color: colorScheme.color }}>
                                {kartu.nis}
                              </div>
                            </div>
                            <div>
                              <div className="card-label">ID ANGGOTA</div>
                              <div className="id-mono" style={{ color: colorScheme.color }}>
                                {kartu.id_anggota}
                              </div>
                            </div>
                            <div>
                              <div className="card-label">TANGGAL MASUK</div>
                              <div className="font-semibold text-gray-700">
                                {formatDate(kartu.tanggal_masuk)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ─── FOOTER WITH ACTIONS ─── */}
                      <div className="card-footer">
                        <div>
                          {viewMode === "grid" && (
                            <>
                              <div className="card-label">ID ANGGOTA</div>
                              <div className="id-mono" style={{ color: colorScheme.color }}>
                                {kartu.id_anggota}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="card-footer-actions">
                          <button className="icon-btn" title="Print" onClick={() => printKartu(kartu, index)}>
                            🖨
                          </button>
                          <button className="icon-btn" title="Download PDF" onClick={() => downloadKartuPDF(kartu, index)}>
                            ⬇
                          </button>
                          <button className="icon-btn" title="Hapus" onClick={() => handleDeleteKartu(kartu.id_anggota)}>
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
