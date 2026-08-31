"use client";

import "./style.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAbsensiReportAction } from "./action-rbac";
import { logoutAction } from "@/app/Login/logout";

// ===== TYPES =====
type StatusType = "Hadir" | "Izin" | "Alpha";

interface AbsensiData {
  id: number;
  nama: string;
  inisial: string;
  avatarColor: string;
  ekskul: string;
  tanggal: string;
  status: StatusType;
  waktuScan: string;
}

// ===== DATA =====
const absensiData: AbsensiData[] = [
  {
    id: 1,
    nama: "Alya Pratama",
    inisial: "AP",
    avatarColor: "#dbeafe",
    ekskul: "Pramuka",
    tanggal: "23 Apr 2025",
    status: "Hadir",
    waktuScan: "07:15 WIB",
  },
  {
    id: 2,
    nama: "Bima Saputra",
    inisial: "BS",
    avatarColor: "#dcfce7",
    ekskul: "Basket",
    tanggal: "23 Apr 2025",
    status: "Hadir",
    waktuScan: "07:22 WIB",
  },
  {
    id: 3,
    nama: "Citra Maharani",
    inisial: "CM",
    avatarColor: "#fef3c7",
    ekskul: "Paduan Suara",
    tanggal: "22 Apr 2025",
    status: "Izin",
    waktuScan: "—",
  },
  {
    id: 4,
    nama: "Dimas Kurniawan",
    inisial: "DK",
    avatarColor: "#fee2e2",
    ekskul: "Robotika",
    tanggal: "22 Apr 2025",
    status: "Alpha",
    waktuScan: "—",
  },
  {
    id: 5,
    nama: "Elisa Ramadhani",
    inisial: "ER",
    avatarColor: "#f3e8ff",
    ekskul: "Pramuka",
    tanggal: "21 Apr 2025",
    status: "Hadir",
    waktuScan: "07:08 WIB",
  },
  {
    id: 6,
    nama: "Fajar Nugroho",
    inisial: "FN",
    avatarColor: "#fce7f3",
    ekskul: "Basket",
    tanggal: "21 Apr 2025",
    status: "Hadir",
    waktuScan: "07:30 WIB",
  },
];

const statsData = [
  {
    label: "Total Hadir",
    value: "1.107",
    icon: "✅",
    iconClass: "icon-green",
    badgeClass: "badge-green",
    valClass: "val-green",
    accentClass: "accent-green",
    badge: "↑ 89.2%",
  },
  {
    label: "Total Izin",
    value: "71",
    icon: "📋",
    iconClass: "icon-orange",
    badgeClass: "badge-orange",
    valClass: "val-orange",
    accentClass: "accent-orange",
    badge: "5.7%",
  },
  {
    label: "Total Alpha",
    value: "44",
    icon: "⚠️",
    iconClass: "icon-red",
    badgeClass: "badge-red",
    valClass: "val-red",
    accentClass: "accent-red",
    badge: "↓ 3.5%",
  },
  {
    label: "Total Anggota",
    value: "248",
    icon: "👥",
    iconClass: "icon-blue",
    badgeClass: "badge-blue",
    valClass: "val-blue",
    accentClass: "accent-blue",
    badge: "Aktif",
  },
];

// ===== STATUS BADGE =====
function StatusBadge({ status }: { status: StatusType }) {
  const map: Record<StatusType, { cls: string; dot: string }> = {
    Hadir: { cls: "badge-hadir", dot: "dot-hadir" },
    Izin: { cls: "badge-izin", dot: "dot-izin" },
    Alpha: { cls: "badge-alpha", dot: "dot-alpha" },
  };
  const { cls, dot } = map[status];
  return (
    <span className={`badge ${cls}`}>
      <span className={`badge-dot ${dot}`} />
      {status}
    </span>
  );
}

// ===== ICONS =====
const IconSearch = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconDownload = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconEye = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

// ===== MAIN PAGE =====
export default function DashboardAbsensiPage() {
  const pathname = usePathname();
  // User auth state (not read from client; server action will resolve httpOnly cookies)
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // UI state
  const [activeFilter, setActiveFilter] = useState<"Semua" | StatusType>(
    "Semua",
  );
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Data state
  const [realData, setRealData] = useState<AbsensiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount. Server action will resolve cookies (httpOnly).
  useEffect(() => {
    const abortController = new AbortController();
    
    const loadData = async () => {
      console.log("[Laporan_absensi] useEffect mounted - starting data load");
      await loadAbsensiData(1, abortController.signal);
    };
    
    loadData();
    
    // Cleanup on unmount
    return () => {
      console.log("[Laporan_absensi] useEffect unmount - cleanup");
      abortController.abort();
    };
  }, []);

  // Load attendance data using RBAC action
  async function loadAbsensiData(pageNum: number = 1, signal?: AbortSignal) {
    const actionId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();
    
    console.log(`[Laporan_absensi:${actionId}] ⏱️ ${timestamp} - loadAbsensiData() START`);
    console.log(`[Laporan_absensi:${actionId}] 📄 Page: ${pageNum}, signal: ${signal ? "provided" : "none"}`);
    
    setLoading(true);
    setError(null);

    try {
      // Timeout protection: max 15 seconds (increased from 10)
      console.log(`[Laporan_absensi:${actionId}] ⏱️ Setting up 15s timeout protection`);
      
      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const msg = "Request timeout: data fetch melebihi 15 detik";
          console.error(`[Laporan_absensi:${actionId}] ⏰ ${msg}`);
          reject(new Error(msg));
        }, 15000);
      });

      console.log(`[Laporan_absensi:${actionId}] 🚀 Calling getAbsensiReportAction(page=${pageNum})...`);
      console.log(`[Laporan_absensi:${actionId}] ℹ️ Will fetch with server-side cookie resolution`);
      
      const fetchPromise = getAbsensiReportAction(undefined, undefined, undefined, pageNum);
      const result: any = await Promise.race([fetchPromise, timeoutPromise]);

      // Clear timeout if race completed
      if (timeoutId) clearTimeout(timeoutId);

      console.log(`[Laporan_absensi:${actionId}] ✅ Server action returned`);
      
      if (!result) {
        const msg = "No response from server action";
        console.error(`[Laporan_absensi:${actionId}] ❌ ${msg}`);
        setError(msg);
        setRealData([]);
        return;
      }

      console.log(`[Laporan_absensi:${actionId}] 📊 Response: error=${result.error ? "yes" : "no"}, records=${result.data?.length || 0}, total=${result.count || "?"}`);

      if (result.error) {
        console.error(`[Laporan_absensi:${actionId}] ❌ Server error: ${result.error}`);
        setError(result.error);
        setRealData([]);
        return;
      }

      const rawData = result.data || [];
      console.log(`[Laporan_absensi:${actionId}] 📦 Received ${rawData.length} raw records to transform`);

      if (rawData.length === 0) {
        console.log(`[Laporan_absensi:${actionId}] ℹ️ No data returned (empty result)`);
        setRealData([]);
        return;
      }

      // Transform data to AbsensiData format
      console.log(`[Laporan_absensi:${actionId}] 🔄 Starting data transformation...`);
      
      const transformedData: AbsensiData[] = rawData.map((item: any, index: number) => {
        const statusMap: Record<string, StatusType> = {
          "hadir": "Hadir",
          "izin": "Izin",
          "alpha": "Alpha",
        };

        // Extract name from nested user_profile structure
        const nama = item.user_profile?.nama || item.user?.user_profile?.nama || item.user?.username || "N/A";
        const inisial = nama
          .split(" ")
          .slice(0, 2)
          .map((w: string) => w[0])
          .join("")
          .toUpperCase() || "?";

        // Extract eskul name
        const eskulName = item.eskul_nama || item.eskul?.nama_eskul || "N/A";

        // Format date
        const tanggalFormatted = item.tanggal
          ? new Date(item.tanggal + "T00:00:00").toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-";

        // Format time
        const createdAt = item.created_at || item.waktu_scan;
        const waktuScan = createdAt
          ? new Date(createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }) + " WIB"
          : "—";

        const transformed: AbsensiData = {
          id: item.id_absensi || index,
          nama,
          inisial,
          avatarColor: ["#dbeafe", "#dcfce7", "#fef3c7", "#fee2e2", "#f3e8ff", "#fce7f3"][
            (item.id_absensi || index) % 6
          ],
          ekskul: eskulName,
          tanggal: tanggalFormatted,
          status: statusMap[item.status?.toLowerCase()] || ("Hadir" as StatusType),
          waktuScan,
        };

        if (index < 3) {
          console.log(`[Laporan_absensi:${actionId}] 📝 Transform[${index}]: ${transformed.nama} (${transformed.ekskul}) - ${transformed.status}`);
        }

        return transformed;
      });

      console.log(`[Laporan_absensi:${actionId}] ✅ Transformation complete: ${transformedData.length} records transformed`);
      console.log(`[Laporan_absensi:${actionId}] 📊 Data sample:`, {
        first: transformedData[0],
        count: transformedData.length,
      });

      setRealData(transformedData);
      console.log(`[Laporan_absensi:${actionId}] ✅ State updated: realData set with ${transformedData.length} records`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Laporan_absensi:${actionId}] ❌ Exception caught:`, errMsg);
      console.error(`[Laporan_absensi:${actionId}] Stack:`, err instanceof Error ? err.stack : "no stack");

      // Determine error message
      let userErrorMsg = "Gagal memuat data absensi";
      if (errMsg.includes("timeout") || errMsg.includes("15 detik")) {
        userErrorMsg = "Request timeout: Server tidak merespons dalam waktu yang ditentukan. Coba lagi.";
      } else if (errMsg.includes("Session")) {
        userErrorMsg = "Session expired: Silakan login kembali";
      } else if (errMsg.includes("Unauthorized")) {
        userErrorMsg = "Anda tidak memiliki akses ke halaman ini";
      }

      console.error(`[Laporan_absensi:${actionId}] User message: ${userErrorMsg}`);
      setError(userErrorMsg);
      setRealData([]);
    } finally {
      console.log(`[Laporan_absensi:${actionId}] 🏁 FINALLY: Setting loading=false`);
      setLoading(false);
      console.log(`[Laporan_absensi:${actionId}] ✅ loadAbsensiData() COMPLETE`);
    }
  }

  // Use real data if available, otherwise fall back to mockup
  const displayData = realData.length > 0 ? realData : absensiData;

  const filters: Array<"Semua" | StatusType> = [
    "Semua",
    "Hadir",
    "Izin",
    "Alpha",
  ];

  const filtered = displayData.filter((row) => {
    const matchFilter = activeFilter === "Semua" || row.status === activeFilter;
    const matchSearch =
      row.nama.toLowerCase().includes(search.toLowerCase()) ||
      row.ekskul.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div
      className="layout"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* ---- TOPBAR ---- */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="brand-logo">
            <a href=""></a>
          </div>
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
                    console.log("[Laporan_absensi] Logout clicked");
                    try {
                      await logoutAction();
                    } catch (err) {
                      console.error("[Laporan_absensi] Logout error:", err);
                      // Fallback: redirect manually if server action fails
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
            <Link href="/Crud_profile" className={pathname === "/Crud_profile" ? "active" : ""}> Profile</Link>
            <Link href="/Laporan_absensi" className={pathname === "/Laporan_absensi" ? "active" : ""}>
              Laporan
            </Link>
            <Link href="/Generate_qr" className={pathname === "/Generate_qr" ? "active" : ""}> Generator QR Code</Link>
            <Link href="/Verifikasi" className={pathname === "/Verifikasi" ? "active" : ""}> Verifikasi Data Pendaftar</Link>
            <Link href="/Generate_kartu" className={pathname === "/Generate_kartu" ? "active" : ""}> Kartu Identitas</Link>
          </nav>
          </div>

       
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span>Dashboard</span>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">Laporan Absensi Ekskul</span>
        </div>

        {/* Page Header */}
        <div className="header-section">
          <div>
            <h1 className="header-title">Laporan Absensi Ekskul</h1>
          </div>
          <div className="header-controls">
            <input
              type="date"
              className="ctrl-input"
              defaultValue="2025-04-23"
            />
            <select className="ctrl-select">
              <option>Semua Ekskul</option>
              <option>Pramuka</option>
              <option>Basket</option>
              <option>Paduan Suara</option>
              <option>Robotika</option>
            </select>
            <button className="btn-export">
              <IconDownload />
              Export
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          {statsData.map((stat) => (
            <div key={stat.label} className="card shadow-soft card-hover">
              <div className="card-top">
                <div className={`card-icon ${stat.iconClass}`}>{stat.icon}</div>
                <span className={`card-badge ${stat.badgeClass}`}>
                  {stat.badge}
                </span>
              </div>
              <p className="card-label">{stat.label}</p>
              <p className={`card-value ${stat.valClass}`}>{stat.value}</p>
              <div className={`card-accent ${stat.accentClass}`} />
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="table-card shadow-soft" style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>⏳</div>
            <div style={{ color: "#666" }}>Memuat data absensi...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="table-card shadow-soft" style={{ textAlign: "center", padding: "40px", backgroundColor: "#fef2f2" }}>
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>❌</div>
            <div style={{ color: "#dc2626", fontWeight: "500", marginBottom: "12px" }}>{error}</div>
            <div style={{ fontSize: "12px", color: "#999", marginBottom: "16px", maxHeight: "60px", overflowY: "auto" }}>
              💡 Jika masalah berlanjut, cek browser console untuk error detail atau hubungi admin.
            </div>
            <button 
              onClick={() => {
                console.log("[Laporan_absensi] User clicked 'Coba Lagi' button");
                loadAbsensiData(1);
              }}
              style={{
                marginTop: "12px",
                padding: "10px 20px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              🔄 Coba Lagi
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && realData.length === 0 && (
          <div className="table-card shadow-soft" style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px", color: "#666" }}>Belum ada data absensi</div>
            <div style={{ fontSize: "14px", color: "#999" }}>Data absensi akan muncul setelah ada pemindaian QR</div>
          </div>
        )}

        {/* Table Card */}
        {!loading && !error && realData.length > 0 && (
          <div className="table-card shadow-soft">
          <div className="table-header">
            <div>
              <h2 className="table-title">Riwayat Absensi</h2>
              <p className="table-count">{filtered.length} data ditemukan</p>
            </div>
            <div className="table-controls">
              <div className="search-wrapper">
                <span className="search-icon">
                  <IconSearch />
                </span>
                <input
                  type="text"
                  placeholder="Cari nama atau ekskul..."
                  className="search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="filter-group">
                {filters.map((f) => (
                  <button
                    key={f}
                    className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nama Anggota</th>
                  <th>Ekskul</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Waktu Scan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="table-row">
                    <td>
                      <div className="avatar-cell">
                        <div
                          className="member-avatar"
                          style={{
                            background: row.avatarColor,
                            color: "#374151",
                          }}
                        >
                          {row.inisial}
                        </div>
                        <span className="avatar-name">{row.nama}</span>
                      </div>
                    </td>
                    <td>
                      <span className="ekskul-chip">{row.ekskul}</span>
                    </td>
                    <td style={{ color: "#64748b", fontSize: "13px" }}>
                      {row.tanggal}
                    </td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {row.waktuScan}
                    </td>
                    <td>
                      <div className="action-group">
                        <button className="btn-icon" title="Lihat Detail">
                          <IconEye />
                        </button>
                        <button className="btn-icon delete" title="Hapus">
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      Tidak ada data yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-bar">
            <span className="pagination-info">
              Menampilkan {filtered.length} dari 10 data
            </span>
            <div className="pagination-pages">
              {[1, 2].map((p) => (
                <button
                  key={p}
                  className={`page-btn ${activePage === p ? "active" : ""}`}
                  onClick={() => setActivePage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
