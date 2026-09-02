"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { FC, MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { getEskulListAction, deleteQRAction, type EskulItem } from "./action";
import {
  QrCode,
  ChevronRight,
  MapPin,
  MoreHorizontal,
  Download,
  ChevronLeft,
  Activity,
  CheckCircle2,
  Hash,
  Users,
  Trash2,
  RefreshCw,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/Login/logout";
import "./style.css";

/* ─── TYPES ─────────────────────────────────────────────────────────── */
interface StatCardData {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

interface TableRow {
  id: number;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  nama: string;
  kategori: string;
  pembina: string;
  hari: string;
  jam: string;
  lokasi: string;
  status: "Aktif" | "Nonaktif";
}

/* QR state per row */
interface RowQrState {
  loading: boolean;
  qrImage: string | null;
  qrToken: string | null;
  qrExpiredAt: string | null;
  error: string | null;
  menuOpen: boolean;
}

/* Toast notification */
interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

/* ─── DATA ─────────────────────────────────────────────────────────── */
const STAT_CARDS: StatCardData[] = [
  {
    label: "Total Eskul",
    value: "24",
    sub: "+3 bulan ini",
    icon: Hash,
    iconBg: "#ede9fe",
    iconColor: "#7c3aed",
  },
  {
    label: "Sesi Aktif",
    value: "6",
    sub: "Berjalan hari ini",
    icon: Activity,
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
  },
  {
    label: "QR Tergenerate",
    value: "142",
    sub: "+12 minggu ini",
    icon: QrCode,
    iconBg: "#fef3c7",
    iconColor: "#d97706",
  },
  {
    label: "Kehadiran",
    value: "89%",
    sub: "↑ 4% dari kemarin",
    icon: Users,
    iconBg: "#d1fae5",
    iconColor: "#059669",
  },
];

const TABLE_DATA: TableRow[] = [
  {
    id: 2,
    initials: "VL",
    avatarBg: "#dbeafe",
    avatarColor: "#2563eb",
    nama: "Voli",
    kategori: "Olahraga",
    pembina: "Pak Rendi",
    hari: "Senin",
    jam: "15:00 – 17:00",
    lokasi: "Lapangan Utama",
    status: "Aktif",
  },
  {
    id: 3,
    initials: "FS",
    avatarBg: "#fce7f3",
    avatarColor: "#db2777",
    nama: "Futsal",
    kategori: "Olahraga",
    pembina: "Bu Sari",
    hari: "Selasa",
    jam: "14:00 – 16:00",
    lokasi: "Lapangan Upacara",
    status: "Aktif",
  },
  {
    id: 4,
    initials: "PM",
    avatarBg: "#dcfce7",
    avatarColor: "#16a34a",
    nama: "PMR",
    kategori: "Kesehatan",
    pembina: "Pak Dian",
    hari: "Rabu",
    jam: "15:30 – 17:30",
    lokasi: "Studio Kesehatan",
    status: "Aktif",
  },
  {
    id: 5,
    initials: "BK",
    avatarBg: "#fef3c7",
    avatarColor: "#d97706",
    nama: "Basket",
    kategori: "Olahraga",
    pembina: "Bu Rani",
    hari: "Kamis",
    jam: "13:00 – 15:30",
    lokasi: "Gym Indoor",
    status: "Nonaktif",
  },
  {
    id: 6,
    initials: "RH",
    avatarBg: "#f3e8ff",
    avatarColor: "#7c3aed",
    nama: "Rohis",
    kategori: "Religi",
    pembina: "Pak Hendra",
    hari: "Jumat",
    jam: "15:00 – 17:00",
    lokasi: "Ruang Ibadah",
    status: "Aktif",
  },
  {
    id: 7,
    initials: "PR",
    avatarBg: "#fee2e2",
    avatarColor: "#dc2626",
    nama: "Pramuka",
    kategori: "Kedisiplinan",
    pembina: "Bu Lina",
    hari: "Sabtu",
    jam: "09:00 – 12:00",
    lokasi: "Lapangan Luas",
    status: "Aktif",
  },
  {
    id: 8,
    initials: "PB",
    avatarBg: "#fecdd3",
    avatarColor: "#be123c",
    nama: "Paskibra",
    kategori: "Bela Negara",
    pembina: "Pak Suryanto",
    hari: "Minggu",
    jam: "08:00 – 10:00",
    lokasi: "Lapangan Upacara",
    status: "Aktif",
  },
  {
    id: 9,
    initials: "EC",
    avatarBg: "#e0e7ff",
    avatarColor: "#6366f1",
    nama: "English Club",
    kategori: "Bahasa",
    pembina: "Mrs. Jennifer",
    hari: "Senin",
    jam: "16:00 – 18:00",
    lokasi: "Lab Bahasa",
    status: "Aktif",
  },
  {
    id: 10,
    initials: "JC",
    avatarBg: "#fef08a",
    avatarColor: "#ca8a04",
    nama: "Japanese Club",
    kategori: "Bahasa",
    pembina: "Pak Bambang",
    hari: "Rabu",
    jam: "16:30 – 18:30",
    lokasi: "Ruang Kelas 3B",
    status: "Aktif",
  },
  {
    id: 11,
    initials: "RK",
    avatarBg: "#fda29b",
    avatarColor: "#b42318",
    nama: "Rokris",
    kategori: "Religi",
    pembina: "Ustad Ahmad",
    hari: "Jumat",
    jam: "14:00 – 16:00",
    lokasi: "Musholla",
    status: "Aktif",
  },
];

/* ─── STAT CARD ─────────────────────────────────────────────────────── */
const StatCard: FC<StatCardData> = ({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="stat-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p style={{ fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>
            {label}
          </p>
          <p
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.1,
              marginTop: 4,
            }}
          >
            {value}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#10b981",
              fontWeight: 600,
              marginTop: 6,
            }}
          >
            {sub}
          </p>
        </div>
        <div className="icon-box" style={{ background: iconBg }}>
          <Icon size={20} color={iconColor} />
        </div>
      </div>
    </div>
  );
};

/* ─── QR CELL (only shows QR image, no buttons) ─────────────────────── */
interface QrCellProps {
  qrImage: string | null;
  qrExpiredAt: string | null;
}

const QrCell: FC<QrCellProps> = ({ qrImage, qrExpiredAt }) => {
  if (!qrImage) {
    return (
      <div className="qr-placeholder">
        <QrCode size={20} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "flex-start",
      }}
    >
      <img
        src={qrImage}
        alt="QR Code"
        style={{
          width: 60,
          height: 60,
          borderRadius: 4,
          border: "1px solid #0891b2",
          cursor: "pointer",
        }}
        title="Click action column to view full QR"
      />
      {qrExpiredAt && (
        <p
          style={{
            fontSize: 10,
            color: "#0891b2",
            margin: 0,
            fontWeight: 500,
          }}
        >
          ⏱{" "}
          {new Date(qrExpiredAt).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
};

/* ─── ACTION CELL (buttons & menu only) ───────────────────────────────── */
interface ActionCellProps {
  id_eskul: number;
  qrImage: string | null;
  qrExpiredAt: string | null;
  loading: boolean;
  error: string | null;
  menuOpen: boolean;
  onGenerateQR: (id: number) => Promise<void>;
  onDeleteQR: (id: number) => Promise<void>;
  onToggleMenu: () => void;
  onViewQR: () => void;
}

const ActionCell: FC<ActionCellProps> = ({
  id_eskul,
  qrImage,
  loading,
  error,
  menuOpen,
  onGenerateQR,
  onDeleteQR,
  onToggleMenu,
  onViewQR,
}) => {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Generate QR button - show only if no QR */}
        {!qrImage ? (
          <button
            className="btn-primary-sm btn-gradient"
            style={{ borderRadius: 6, fontFamily: "inherit", fontSize: 12 }}
            disabled={loading}
            onClick={() => onGenerateQR(id_eskul)}
          >
            {loading ? "⏳ Generating..." : "Generate QR"}
          </button>
        ) : (
          /* Lihat QR button - show only if QR exists */
          <button
            className="btn-secondary-sm"
            style={{
              borderColor: "#0891b2",
              color: "#0891b2",
              fontFamily: "inherit",
              fontSize: 12,
              borderRadius: 6,
              padding: "6px 12px",
            }}
            onClick={onViewQR}
          >
            👁 Lihat QR
          </button>
        )}

        {/* Menu dots button */}
        <div style={{ position: "relative" }}>
          <button
            className="btn-dots"
            onClick={onToggleMenu}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              cursor: "pointer",
              padding: "6px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <MoreHorizontal size={16} />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 4,
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                zIndex: 50,
                minWidth: 180,
              }}
            >
              {/* Regenerate option - only show if QR exists */}
              {qrImage && (
                <button
                  onClick={() => {
                    onGenerateQR(id_eskul);
                    onToggleMenu();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <RefreshCw size={14} /> Regenerate QR
                </button>
              )}

              {/* Delete option - only show if QR exists */}
              {qrImage && (
                <button
                  onClick={() => {
                    onDeleteQR(id_eskul);
                    onToggleMenu();
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.2s",
                    borderTop: "1px solid #e2e8f0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  <Trash2 size={14} /> Delete QR Session
                </button>
              )}

              {!qrImage && (
                <p
                  style={{
                    padding: "10px 14px",
                    color: "#94a3b8",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  No QR generated yet
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p
          style={{
            fontSize: 11,
            color: "#dc2626",
            margin: "6px 0 0 0",
            maxWidth: 200,
          }}
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

/* ─── QR FULLSCREEN MODAL ───────────────────────────────────────────── */
interface QrModalProps {
  isOpen: boolean;
  qrImage: string | null;
  qrExpiredAt: string | null;
  qrToken: string | null;
  eskulName: string;
  onClose: () => void;
}

const QrModal: FC<QrModalProps> = ({
  isOpen,
  qrImage,
  qrExpiredAt,
  qrToken,
  eskulName,
  onClose,
}) => {
  if (!isOpen || !qrImage) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: 40,
          borderRadius: 12,
          maxWidth: 600,
          width: "90%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>
            QR Code - {eskulName}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#94a3b8",
              padding: "0 8px",
            }}
          >
            ✕
          </button>
        </div>

        <img
          src={qrImage}
          alt="QR Code"
          style={{
            width: 300,
            height: 300,
            borderRadius: 8,
            border: "2px solid #0891b2",
            marginBottom: 20,
            backgroundColor: "#fff",
          }}
        />

        {qrToken && (
          <div
            style={{
              backgroundColor: "#f0f9ff",
              padding: 12,
              borderRadius: 6,
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            <p
              style={{
                fontSize: 11,
                color: "#0891b2",
                fontWeight: 600,
                margin: "0 0 6px 0",
              }}
            >
              Token:
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "#475569",
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              <span>{qrToken}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrToken);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#0891b2",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Copy token"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}

        {qrExpiredAt && (
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              margin: "12px 0",
            }}
          >
            ⏱ Expires:{" "}
            <strong>
              {new Date(qrExpiredAt).toLocaleString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </strong>
          </p>
        )}

        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0891b2",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            marginTop: 16,
          }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

/* ─── TOAST NOTIFICATION ────────────────────────────────────────────── */
interface ToastContainerProps {
  toasts: Toast[];
}

const ToastContainer: FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: "12px 16px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            animation: "slideIn 0.3s ease-out",
            backgroundColor:
              toast.type === "success"
                ? "#d1fae5"
                : toast.type === "error"
                  ? "#fee2e2"
                  : "#dbeafe",
            color:
              toast.type === "success"
                ? "#065f46"
                : toast.type === "error"
                  ? "#7f1d1d"
                  : "#0c4a6e",
            border:
              toast.type === "success"
                ? "1px solid #a7f3d0"
                : toast.type === "error"
                  ? "1px solid #fecaca"
                  : "1px solid #93c5fd",
          }}
        >
          {toast.type === "success" && "✓"} {toast.type === "error" && "✕"}{" "}
          {toast.type === "info" && "ℹ"} {toast.message}
        </div>
      ))}
    </div>
  );
};

/* ─── MAIN PAGE ────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const pathname = usePathname();
  const [activePage, setActivePage] = useState<number>(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* User data */
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);

  /* Eskul list data */
  const [eskulList, setEskulList] = useState<EskulItem[]>([]);
  const [loadingEskul, setLoadingEskul] = useState(true);
  const [errorEskul, setErrorEskul] = useState<string | null>(null);

  /* QR state map by id_eskul */
  const [qrStates, setQrStates] = useState<Record<number, RowQrState>>({});

  // Handle logout with atomic cleanup
  const handleLogout = async (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.preventDefault();

    if (isLoggingOut) return; // Prevent double-click

    setIsLoggingOut(true);
    setDropdownOpen(false);
    console.log("[Generate_qr] 🔐 Initiating logout...");

    try {
      console.log(
        "[Generate_qr] 🗑️ Clearing localStorage and sessionStorage...",
      );
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log("[Generate_qr] ✅ Client storage cleared");
      } catch (storageErr) {
        console.warn(
          "[Generate_qr] ⚠️ Storage clear error (non-fatal):",
          storageErr,
        );
      }

      console.log("[Generate_qr] 📡 Calling logout server action...");
      const result = await logoutAction();

      if (result.success) {
        console.log("[Generate_qr] ✅ Server logout successful");
      } else {
        console.error(
          "[Generate_qr] ⚠️ Server logout returned error:",
          result.error,
        );
      }

      console.log(
        "[Generate_qr] ⏳ Waiting 300ms for server to process cookie deletion...",
      );
      await new Promise((resolve) => setTimeout(resolve, 300));

      console.log("[Generate_qr] 🔄 Performing hard redirect to /Login");
      window.location.href = "/Login?logout=success";
    } catch (err) {
      console.error("[Generate_qr] ❌ Logout error:", err);
      console.log("[Generate_qr] 🔄 Fallback: Hard redirect to /Login");
      window.location.href = "/Login?logout=failed";
    }
  };

  /* Fetch user info from cookies and load eskul list */
  useEffect(() => {
    const fetchUserAndEskul = async () => {
      try {
        console.log("[useEffect] Fetching eskul list from server");

        // Note: userId and role are set but can't be read from httpOnly cookies on client
        // Server action will read actual httpOnly cookies and validate session
        setUserId(null);
        setRole(null);

        // Fetch filtered eskul list based on role
        // Server action will read httpOnly cookies from server-side
        setLoadingEskul(true);
        const result = await getEskulListAction();

        if (result.error) {
          console.error("[useEffect] Error fetching eskul:", result.error);
          setErrorEskul(result.error);
          setEskulList([]);
        } else {
          console.log(
            `[useEffect] ✅ Loaded ${result.data?.length || 0} eskul`,
          );
          setEskulList(result.data || []);
          setErrorEskul(null);
        }
      } catch (err) {
        console.error("[useEffect] Exception:", err);
        setErrorEskul("Gagal memuat data eskul");
      } finally {
        setLoadingEskul(false);
      }
    };

    fetchUserAndEskul();
  }, []);

  /* Get or initialize QR state for a row */
  const getRowQrState = (id: number): RowQrState => {
    return (
      qrStates[id] || {
        loading: false,
        qrImage: null,
        qrToken: null,
        qrExpiredAt: null,
        error: null,
        menuOpen: false,
      }
    );
  };

  /* Update QR state for a row */
  const updateRowQrState = (id: number, updates: Partial<RowQrState>) => {
    setQrStates((prev) => ({
      ...prev,
      [id]: { ...getRowQrState(id), ...updates },
    }));
  };

  /* Add toast notification */
  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  /* Generate QR for a row */
  const generateQR = async (id_eskul: number): Promise<void> => {
    console.log("📱 Generating QR for id_eskul:", id_eskul);
    updateRowQrState(id_eskul, { loading: true, error: null });

    try {
      // Import server action directly and let it resolve httpOnly cookies on the server
      const { generateQRAction } = await import("./action-rbac");
      const result = await generateQRAction(id_eskul);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.data) {
        throw new Error("Gagal memperoleh token QR dari server.");
      }

      // Format response disesuaikan dengan skema database qr_session kamu
      updateRowQrState(id_eskul, {
        loading: false,
        qrImage: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${result.data.token}`, // Menghasilkan gambar QR dari token secara dinamis
        qrToken: result.data.token,
        qrExpiredAt: result.data.expired_at,
        error: null,
      });

      addToast("success", "✓ QR Code berhasil dibuat untuk eskul ini!");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("📱 QR generation error:", errorMsg);
      updateRowQrState(id_eskul, {
        loading: false,
        error: errorMsg,
      });
      addToast("error", `✕ ${errorMsg}`);
    }
  };

  /* Delete QR session for a row */
  const deleteQRSession = async (id_eskul: number): Promise<void> => {
    // ────────────────────────────────────────────────────────────────
    // DEBUG LOGS - Frontend DELETE
    // ────────────────────────────────────────────────────────────────
    console.log("🗑️  [FRONTEND DELETE] START");
    console.log("DELETE userId:", userId);
    console.log("DELETE role:", role);
    console.log("DELETE id_eskul:", id_eskul);

    updateRowQrState(id_eskul, { loading: true, error: null });

    try {
      // ────────────────────────────────────────────────────────────────
      // Call server action with role-based validation
      // ────────────────────────────────────────────────────────────────
      console.log("🗑️  [FRONTEND DELETE] Calling deleteQRAction...");
      const result = await deleteQRAction(id_eskul, userId || 0, role || "");

      console.log("🗑️  [FRONTEND DELETE] Server action response:", result);

      // ────────────────────────────────────────────────────────────────
      // Handle response
      // ────────────────────────────────────────────────────────────────
      if (result?.error) {
        const errorMsg =
          result.error || result.message || "Gagal delete QR session.";
        console.error("🗑️  [FRONTEND DELETE] Error:", errorMsg);
        throw new Error(errorMsg);
      }

      if (!result?.success) {
        const errorMsg = result?.message || "Gagal delete QR session.";
        console.error("🗑️  [FRONTEND DELETE] Delete failed:", errorMsg);
        throw new Error(errorMsg);
      }

      // ────────────────────────────────────────────────────────────────
      // Success - update UI
      // ────────────────────────────────────────────────────────────────
      console.log("🗑️  [FRONTEND DELETE] SUCCESS - Updating UI");
      updateRowQrState(id_eskul, {
        loading: false,
        qrImage: null,
        qrToken: null,
        qrExpiredAt: null,
        error: null,
        menuOpen: false,
      });

      addToast("success", "✓ QR session deleted successfully!");
      console.log("🗑️  [FRONTEND DELETE] COMPLETE\n");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("🗑️  [FRONTEND DELETE] EXCEPTION:", errorMsg);
      updateRowQrState(id_eskul, {
        loading: false,
        error: errorMsg,
      });
      addToast("error", `✕ ${errorMsg}`);
    }
  };

  /* Toggle menu for a row */
  const toggleMenu = (id_eskul: number) => {
    updateRowQrState(id_eskul, { menuOpen: !getRowQrState(id_eskul).menuOpen });
    // Close other menus
    Object.keys(qrStates).forEach((id) => {
      if (Number(id) !== id_eskul && qrStates[Number(id)]?.menuOpen) {
        updateRowQrState(Number(id), { menuOpen: false });
      }
    });
  };

  /* Handle modal close and open for each row */
  const [activeModalId, setActiveModalId] = useState<number | null>(null);

  return (
    <div className="page-bg">
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

      {/* ── SIDEBAR ── */}
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
              Profile
            </Link>
            <Link
              href="/Laporan_absensi"
              className={pathname === "/Laporan_absensi" ? "active" : ""}
            >
              Laporan
            </Link>
            <Link
              href="/Generate_qr"
              className={pathname === "/Generate_qr" ? "active" : ""}
            >
              Generator QR Code
            </Link>
            <Link
              href="/Verifikasi"
              className={pathname === "/Verifikasi" ? "active" : ""}
            >
              Verifikasi Data Pendaftar
            </Link>
            <Link
              href="/Generate_kartu"
              className={pathname === "/Generate_kartu" ? "active" : ""}
            >
              Kartu Identitas
            </Link>
          </nav>
        </div>
      </aside>

      {/* ── MAIN WRAPPER ── */}
      <div className="main-wrapper">
        <main style={{ padding: 28 }}>
          {/* Page title */}
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>
            Jadwal Eskul & QR Code
          </h1>

          {/* ── FILTER BAR ── */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <select className="filter-select">
              <option>Semua Hari</option>
              <option>Senin</option>
              <option>Selasa</option>
              <option>Rabu</option>
              <option>Kamis</option>
              <option>Jumat</option>
              <option>Sabtu</option>
            </select>
            <button
              className="btn-gradient"
              style={{
                padding: "9px 18px",
                borderRadius: 99,
                fontSize: 13.5,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: 17, lineHeight: 1, marginTop: -1 }}>
                +
              </span>
              Tambah Jadwal
            </button>
          </div>

          {/* ── STAT CARDS ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {STAT_CARDS.map((c: StatCardData) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>

          {/* ── TABLE CARD ── */}
          <div className="table-card">
            {/* Table card header */}
            <div
              style={{
                padding: "18px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  Daftar Jadwal
                </p>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#64748b",
                    marginTop: 2,
                    margin: 0,
                  }}
                >
                  Menampilkan {eskulList.length} dari {eskulList.length} jadwal
                  {role === "coach" && " (Hanya eskul Anda)"}
                </p>
              </div>
              <button className="btn-export">
                <Download size={14} />
                Ekspor
              </button>
            </div>

            {/* Loading state */}
            {loadingEskul && (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                ⏳ Memuat data eskul...
              </div>
            )}

            {/* Error state */}
            {errorEskul && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#fee2e2",
                  color: "#7f1d1d",
                  borderRadius: 6,
                  margin: 16,
                  fontSize: 13,
                }}
              >
                ⚠️ {errorEskul}
              </div>
            )}

            {/* Empty state */}
            {!loadingEskul && !errorEskul && eskulList.length === 0 && (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#94a3b8",
                }}
              >
                📭 Tidak ada data eskul
              </div>
            )}

            {/* Table */}
            {!loadingEskul && eskulList.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr className="table-header-row">
                      <th style={{ textAlign: "left" }}>Nama Eskul</th>
                      <th style={{ textAlign: "left" }}>Kategori</th>
                      <th style={{ textAlign: "left" }}>Pembina</th>
                      <th style={{ textAlign: "left" }}>Status</th>
                      <th style={{ textAlign: "left" }}>QR Code</th>
                      <th style={{ textAlign: "left" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingEskul ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: "center",
                            padding: "24px",
                            color: "#64748b",
                            fontSize: 13.5,
                          }}
                        >
                          ⏳ Memuat data eskul yang kamu ampu...
                        </td>
                      </tr>
                    ) : errorEskul ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: "center",
                            padding: "24px",
                            color: "#dc2626",
                            fontSize: 13.5,
                          }}
                        >
                          ⚠️ {errorEskul}
                        </td>
                      </tr>
                    ) : eskulList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: "center",
                            padding: "24px",
                            color: "#64748b",
                            fontSize: 13.5,
                          }}
                        >
                          Kamu belum ditugaskan di eskul manapun. Silakan
                          hubungi Admin Utama.
                        </td>
                      </tr>
                    ) : (
                      eskulList.map((eskul: EskulItem, index: number) => {
                        const rowQr = getRowQrState(eskul.id_eskul);
                        const initials = eskul.nama_eskul
                          .split(" ")
                          .slice(0, 2)
                          .map((w: string) => w[0].toUpperCase())
                          .join("");
                        const colors = [
                          { bg: "#dbeafe", color: "#2563eb" },
                          { bg: "#fce7f3", color: "#db2777" },
                          { bg: "#dcfce7", color: "#16a34a" },
                          { bg: "#fef3c7", color: "#d97706" },
                          { bg: "#f3e8ff", color: "#7c3aed" },
                          { bg: "#fee2e2", color: "#dc2626" },
                          { bg: "#fecdd3", color: "#be123c" },
                          { bg: "#e0e7ff", color: "#6366f1" },
                        ];
                        const color = colors[index % colors.length];

                        return (
                          <tr key={eskul.id_eskul} className="table-row">
                            {/* Nama Eskul */}
                            <td className="table-cell">
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                }}
                              >
                                <div
                                  className="avatar"
                                  style={{
                                    background: color.bg,
                                    color: color.color,
                                    fontSize: 12,
                                  }}
                                >
                                  {initials}
                                </div>
                                <div>
                                  <p
                                    style={{
                                      fontWeight: 700,
                                      fontSize: 13.5,
                                      color: "#0f172a",
                                      margin: 0,
                                    }}
                                  >
                                    {eskul.nama_eskul}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Kategori */}
                            <td className="table-cell">
                              <p
                                style={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: "#0f172a",
                                  margin: 0,
                                }}
                              >
                                {eskul.kategori}
                              </p>
                            </td>

                            {/* Pembina */}
                            <td className="table-cell">
                              <p
                                style={{
                                  fontSize: 13,
                                  color: "#64748b",
                                  margin: 0,
                                }}
                              >
                                {eskul.pembina}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="table-cell">
                              <span className="badge badge-aktif">
                                <CheckCircle2 size={11} /> Aktif
                              </span>
                            </td>

                            {/* QR Code Column */}
                            <td className="table-cell">
                              <QrCell
                                qrImage={rowQr.qrImage}
                                qrExpiredAt={rowQr.qrExpiredAt}
                              />
                            </td>

                            {/* Aksi (Actions) Column */}
                            <td className="table-cell">
                              <ActionCell
                                id_eskul={eskul.id_eskul}
                                qrImage={rowQr.qrImage}
                                qrExpiredAt={rowQr.qrExpiredAt}
                                loading={rowQr.loading}
                                error={rowQr.error}
                                menuOpen={rowQr.menuOpen}
                                onGenerateQR={generateQR}
                                onDeleteQR={deleteQRSession}
                                onToggleMenu={() => toggleMenu(eskul.id_eskul)}
                                onViewQR={() =>
                                  setActiveModalId(eskul.id_eskul)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── PAGINATION ── */}
            {!loadingEskul && eskulList.length > 0 && (
              <div
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #f1f5f9",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                  Halaman{" "}
                  <strong style={{ color: "#0f172a" }}>{activePage}</strong>{" "}
                  dari <strong style={{ color: "#0f172a" }}>1</strong>
                </p>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    className="page-btn page-btn-nav"
                    onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      width: "auto",
                      padding: "0 12px",
                    }}
                  >
                    <ChevronLeft size={14} /> Sebelumnya
                  </button>
                  <button
                    className={`page-btn${activePage === 1 ? " active" : ""}`}
                    onClick={() => setActivePage(1)}
                  >
                    1
                  </button>
                  <button
                    className="page-btn page-btn-nav"
                    onClick={() => setActivePage((p) => Math.min(1, p + 1))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      width: "auto",
                      padding: "0 12px",
                    }}
                  >
                    Selanjutnya <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── QR MODALS (per row) ── */}
      {eskulList.map((eskul: EskulItem) => {
        const rowQr = getRowQrState(eskul.id_eskul);
        return (
          <QrModal
            key={`modal-${eskul.id_eskul}`}
            isOpen={activeModalId === eskul.id_eskul}
            qrImage={rowQr.qrImage}
            qrExpiredAt={rowQr.qrExpiredAt}
            qrToken={rowQr.qrToken}
            eskulName={eskul.nama_eskul}
            onClose={() => setActiveModalId(null)}
          />
        );
      })}

      {/* ── TOAST NOTIFICATIONS ── */}
      <ToastContainer toasts={toasts} />

      {/* Close menus when clicking outside */}
      {Object.values(qrStates).some((state) => state.menuOpen) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
          }}
          onClick={() => {
            Object.keys(qrStates).forEach((id) => {
              if (qrStates[Number(id)]?.menuOpen) {
                updateRowQrState(Number(id), { menuOpen: false });
              }
            });
          }}
        />
      )}
    </div>
  );
}
