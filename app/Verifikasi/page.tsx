"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { PendaftaranRow } from "@/app/API/Backend/verifikasi/verifikasi.db";
import { verifikasiEskulAction } from "./action";
import { getVerifikasiDataAction } from "./action-rbac";
import { logoutAction } from "@/app/Login/logout";
import "./style.css";

export default function VerifikasiPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "diterima" | "ditolak" | "semua"
  >("pending");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Data & Loading states
  const [data, setData] = useState<PendaftaranRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Handle logout with atomic cleanup
  const handleLogout = async (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.preventDefault();

    if (isLoggingOut) return; // Prevent double-click

    setIsLoggingOut(true);
    setDropdownOpen(false);
    console.log("[Verifikasi] 🔐 Initiating logout...");

    try {
      console.log(
        "[Verifikasi] 🗑️ Clearing localStorage and sessionStorage...",
      );
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log("[Verifikasi] ✅ Client storage cleared");
      } catch (storageErr) {
        console.warn(
          "[Verifikasi] ⚠️ Storage clear error (non-fatal):",
          storageErr,
        );
      }

      console.log("[Verifikasi] 📡 Calling logout server action...");
      const result = await logoutAction();

      if (result.success) {
        console.log("[Verifikasi] ✅ Server logout successful");
      } else {
        console.error(
          "[Verifikasi] ⚠️ Server logout returned error:",
          result.error,
        );
      }

      console.log(
        "[Verifikasi] ⏳ Waiting 300ms for server to process cookie deletion...",
      );
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("[Verifikasi] 🔄 Performing hard redirect to /Login");
      window.location.href = "/Login?logout=success";
    } catch (err) {
      console.error("[Verifikasi] ❌ Logout error:", err);
      console.log("[Verifikasi] 🔄 Fallback: Hard redirect to /Login");
      window.location.href = "/Login?logout=failed";
    }
  };

  // Fetch data from database with RBAC
  // Server action reads session from server-side cookies, no need for client params
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const filter =
        statusFilter === "semua" ? undefined : (statusFilter as any);

      // Use RBAC server action - admin sees all, coach sees only their eskul
      // No need to pass userId/role - server action reads from server-side cookies
      const { data: result, error: err } = await getVerifikasiDataAction(
        undefined,
        undefined,
        filter,
      );

      if (err) {
        setError(err);
        console.error("[VERIFIKASI PAGE] Error:", err);
        return;
      }

      console.log(
        "[VERIFIKASI PAGE] Data fetched successfully:",
        result?.length || 0,
        "records",
      );
      setData((result as any[]) || []);
    } catch (err) {
      console.error("[VERIFIKASI PAGE] Error fetching data:", err);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when status filter changes
  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Handle verify (terima)
  const handleVerify = async (id_pendaftar: number) => {
    console.log("[VERIFIKASI PAGE] handleVerify called");

    // Server action will validate session from server-side cookies

    if (!confirm("Yakin ingin menerima pendaftaran ini?")) {
      return;
    }

    try {
      setVerifyingId(id_pendaftar);

      // Server action reads userId from session cookies
      console.log("[VERIFIKASI PAGE] Calling verifikasiEskulAction");

      const result = await verifikasiEskulAction(
        id_pendaftar,
        "diterima",
        0, // Not used - server uses session userId
      );

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert("Pendaftaran berhasil diterima!");
        fetchData(); // Refresh data
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan");
    } finally {
      setVerifyingId(null);
    }
  };

  // Handle reject (tolak)
  const handleReject = async (id_pendaftar: number) => {
    console.log("[VERIFIKASI PAGE] handleReject called");

    // Server action will validate session from server-side cookies

    if (!confirm("Yakin ingin menolak pendaftaran ini?")) {
      return;
    }

    try {
      setVerifyingId(id_pendaftar);

      // Server action reads userId from session cookies
      console.log("[VERIFIKASI PAGE] Calling verifikasiEskulAction");

      const result = await verifikasiEskulAction(
        id_pendaftar,
        "ditolak",
        0, // Not used - server uses session userId
      );

      if (result.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert("Pendaftaran berhasil ditolak!");
        fetchData(); // Refresh data
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan");
    } finally {
      setVerifyingId(null);
    }
  };

  // Filter data based on search
  const filteredData = data.filter((item) => {
    const searchLower = search.toLowerCase();
    const namaUser = item.user?.user_profile?.nama?.toLowerCase() || "";
    const namaEskul = item.eskul?.nama_eskul?.toLowerCase() || "";
    return namaUser.includes(searchLower) || namaEskul.includes(searchLower);
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800"; // Orange
      case "diterima":
        return "#4CAF50"; // Green
      case "ditolak":
        return "#F44336"; // Red
      default:
        return "#999";
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "diterima":
        return "Diterima";
      case "ditolak":
        return "Ditolak";
      default:
        return status;
    }
  };

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
                <p>View Profile</p>
                <p>Messages</p>
                <p
                  className="logout"
                  onClick={handleLogout}
                  style={{
                    cursor: isLoggingOut ? "not-allowed" : "pointer",
                    opacity: isLoggingOut ? 0.6 : 1,
                  }}
                >
                  ↩ {isLoggingOut ? "Logging out..." : "Logout"}
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
            <Link
              href="/Dashboard_pengawas"
              className={pathname === "/Dashboard_pengawas" ? "active" : ""}
            >
              Dashboard
            </Link>
            <Link
              href="/Crud_profile"
              className={pathname === "/Crud_profile" ? "active" : ""}
            >
              {" "}
              Profile
            </Link>
            <Link
              href="/Laporan_absensi"
              className={pathname === "/Laporan_absensi" ? "active" : ""}
            >
              {" "}
              Laporan
            </Link>
            <Link
              href="/Generate_qr"
              className={pathname === "/Generate_qr" ? "active" : ""}
            >
              {" "}
              Generator QR Code
            </Link>
            <Link
              href="/Verifikasi"
              className={pathname === "/Verifikasi" ? "active" : ""}
            >
              {" "}
              Verifikasi Data Pendaftar
            </Link>
            <Link
              href="/Generate_kartu"
              className={pathname === "/Generate_kartu" ? "active" : ""}
            >
              {" "}
              Kartu Identitas
            </Link>
          </nav>
          <Link href="/Profile_eskul" className="dashboard-sidebar-back">← Kembali ke Halaman Utama</Link>
        </div>
      </aside>

      {/* Main wrapper */}
      <div className="main-wrapper">
        {/* Content */}
        <main className="content">
          {/* Page header */}
          <div className="page-header">
            <h1 className="page-header__title">Verifikasi Data Pendaftar</h1>
            <p className="page-header__sub">
              Kelola dan verifikasi data pendaftar ekstrakurikuler
            </p>
          </div>

          {/* Action bar */}
          <div className="action-bar">
            <div className="action-bar__filters">
              <div className="search-wrapper">
                <Search size={16} className="search-wrapper__icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari nama atau eskul..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="select-wrapper">
                <select
                  className="status-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "pending"
                        | "diterima"
                        | "ditolak"
                        | "semua",
                    )
                  }
                >
                  <option value="semua">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="diterima">Diterima</option>
                  <option value="ditolak">Ditolak</option>
                </select>
                <ChevronDown size={14} className="select-wrapper__icon" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "16px",
                marginBottom: "16px",
                backgroundColor: "#fee",
                color: "#c33",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px",
              }}
            >
              <Loader2
                size={32}
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span style={{ marginLeft: "12px" }}>Memuat data...</span>
            </div>
          )}

          {/* Table card */}
          {!loading && (
            <div className="table-card">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nama Siswa</th>
                      <th>Kelas</th>
                      <th>Ekstrakurikuler</th>
                      <th>Status</th>
                      <th>Tanggal Daftar</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr className="table-empty">
                        <td colSpan={6}>
                          <div className="empty-state">
                            <div className="empty-state__icon">
                              <FileText size={32} />
                            </div>
                            <p className="empty-state__text">
                              Tidak ada data pendaftar
                            </p>
                            <p className="empty-state__hint">
                              Data pendaftar akan muncul di sini setelah ada
                              siswa yang mendaftar.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr key={item.id_pendaftar}>
                          <td className="cell-name">
                            {item.user?.user_profile?.nama || "N/A"}
                          </td>
                          <td className="cell-kelas">
                            {item.user?.user_profile?.kelas || "N/A"}
                          </td>
                          <td className="cell-eskul">
                            {item.eskul?.nama_eskul || "N/A"}
                          </td>
                          <td className="cell-status">
                            <span
                              style={{
                                backgroundColor: getStatusColor(
                                  item.status_daftar,
                                ),
                                color: "white",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "500",
                              }}
                            >
                              {getStatusLabel(item.status_daftar)}
                            </span>
                          </td>
                          <td className="cell-date">
                            {new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                            )}
                          </td>
                          <td className="cell-actions">
                            {item.status_daftar === "pending" ? (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  justifyContent: "center",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    handleVerify(item.id_pendaftar)
                                  }
                                  disabled={verifyingId === item.id_pendaftar}
                                  style={{
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    cursor:
                                      verifyingId === item.id_pendaftar
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      verifyingId === item.id_pendaftar
                                        ? 0.6
                                        : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {verifyingId === item.id_pendaftar ? (
                                    <Loader2
                                      size={14}
                                      style={{
                                        animation: "spin 1s linear infinite",
                                      }}
                                    />
                                  ) : (
                                    <CheckCircle2 size={14} />
                                  )}
                                  Terima
                                </button>
                                <button
                                  onClick={() =>
                                    handleReject(item.id_pendaftar)
                                  }
                                  disabled={verifyingId === item.id_pendaftar}
                                  style={{
                                    backgroundColor: "#F44336",
                                    color: "white",
                                    border: "none",
                                    padding: "6px 12px",
                                    borderRadius: "4px",
                                    cursor:
                                      verifyingId === item.id_pendaftar
                                        ? "not-allowed"
                                        : "pointer",
                                    opacity:
                                      verifyingId === item.id_pendaftar
                                        ? 0.6
                                        : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  {verifyingId === item.id_pendaftar ? (
                                    <Loader2
                                      size={14}
                                      style={{
                                        animation: "spin 1s linear infinite",
                                      }}
                                    />
                                  ) : (
                                    <XCircle size={14} />
                                  )}
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: "#999", fontSize: "12px" }}>
                                Sudah diverifikasi
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span className="table-footer__info">
                  Menampilkan {filteredData.length} dari {data.length} data
                </span>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
