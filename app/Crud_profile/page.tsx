"use client";

import { useRef, useState,  type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./style.css";
import { saveCrudProfileAction } from "./action";

interface ScheduleRow {
  id: number;
  day: string;
  time: string;
  notes: string;
}
 
interface Achievement {
  id: number;
  value: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

const Label = ({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) => (
  <label className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
    {icon && <span className="text-blue-400">{icon}</span>}
    {children}
  </label>
);

export default function EkstrakurikulerPage() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [kategori, setKategori] = useState("");
  const [coachName, setCoachName] = useState("");
  const [coachDescription, setCoachDescription] = useState("");
  const [location, setLocation] = useState("");
 
  const [schedules, setSchedules] = useState<ScheduleRow[]>([
    { id: 1, day: "", time: "", notes: "" },
  ]);
 
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 1, value: "" },
  ]);
 
  /* ===== SCHEDULE HANDLERS ===== */
  const handleScheduleChange = (
    id: number,
    field: keyof Omit<ScheduleRow, "id">,
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };
 
  const addScheduleRow = () => {
    setSchedules((prev) => [
      ...prev,
      { id: Date.now(), day: "", time: "", notes: "" },
    ]);
  };
 
  const removeScheduleRow = (id: number) => {
    setSchedules((prev) => prev.filter((row) => row.id !== id));
  };
 
  /* ===== ACHIEVEMENT HANDLERS ===== */
  const handleAchievementChange = (id: number, value: string) => {
    setAchievements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, value } : a))
    );
  };
 
  const addAchievement = () => {
    setAchievements((prev) => [...prev, { id: Date.now(), value: "" }]);
  };
 
  const removeAchievement = (id: number) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = async () => {
    const result = await saveCrudProfileAction({
      description,
      kategori,
      coachName,
      coachDescription,
      location,
      schedules,
      achievements: achievements.map(a => a.value),
    });
    if (result.error) alert("Error: " + result.error);
    else alert("Data berhasil disimpan!");
  };

  return (
    <div
      className="layout"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
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
                    console.log("[Crud_profile] Logout clicked");
                    try {
                      const { logoutAction } = await import("@/app/Login/logout");
                      await logoutAction();
                    } catch (err) {
                      console.error("[Crud_profile] Logout error:", err);
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
      <aside className="sidebar">
        <div className="sidebar-section">
          <p className="sidebar-section-title">MENU UTAMA</p>
          <nav className="sidebar-menu">
            <Link href="/Dashboard_pembina" className={pathname === "/Dashboard_pembina" ? "active" : ""}> Dashboard</Link>
            <Link href="/Crud_profile" className={pathname === "/Crud_profile" ? "active" : ""}> Profile</Link>
            <Link href="/Laporan_absensi" className={pathname === "/Laporan_absensi" ? "active" : ""}> Laporan</Link>
            <Link href="/Generate_qr" className={pathname === "/Generate_qr" ? "active" : ""}> Generator QR Code</Link>
            <Link href="/Verifikasi" className={pathname === "/Verifikasi" ? "active" : ""}> Verifikasi Data Pendaftar</Link>
            <Link href="/Generate_kartu" className={pathname === "/Generate_kartu" ? "active" : ""}> Kartu Identitas</Link>
          </nav>
          </div>
      </aside>

     <div className="page-wrapper">
      <div className="container">
        {/* ===== HEADER BAR ===== */}
        <div className="header-bar">
          <h1>Tambahkan / Edit Data Ekstrakurikuler</h1>
        </div>
 
        {/* ===== CARD FORM ===== */}
        <div className="card-form">
 
          {/* SECTION: DESCRIPTION */}
          <div className="form-section">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea form-textarea-desc"
              placeholder="Masukkan deskripsi ekstrakurikuler..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
 
          {/* SECTION: KATEGORI */}
          <div className="form-section">
            <label className="form-label">Kategori</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan kategori (mis: Basket, Rohis)"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
            />
          </div>
 
          {/* SECTION: COACH */}
          <div className="coach-box">
            <p className="coach-box-title">Coach</p>
            <div className="coach-grid">
 
              {/* LEFT: PHOTO */}
              <div className="photo-upload-wrapper">
                <div className="photo-box">
                  <svg
                    className="photo-placeholder-icon"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <button type="button" className="btn-upload-photo">
                  Upload Photo
                </button>
              </div>
 
              {/* RIGHT: COACH FORM */}
              <div className="coach-form">
                <div className="form-section">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Masukkan nama pelatih..."
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                  />
                </div>
                <div className="form-section">
                  <label className="form-label">Coach Description</label>
                  <textarea
                    className="form-textarea form-textarea-coach"
                    placeholder="Masukkan deskripsi pelatih..."
                    value={coachDescription}
                    onChange={(e) => setCoachDescription(e.target.value)}
                  />
                </div>
              </div>
 
            </div>
          </div>
 
          {/* SECTION: LOCATION */}
          <div className="form-section">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan lokasi kegiatan..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
 
          {/* SECTION: TRAINING SCHEDULE */}
          <div className="form-section">
            <label className="form-label">Training Schedule</label>
            <div className="table-wrapper">
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Notes</th>
                    <th className="td-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., Senin"
                          value={row.day}
                          onChange={(e) =>
                            handleScheduleChange(row.id, "day", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g., 15:00–17:00"
                          value={row.time}
                          onChange={(e) =>
                            handleScheduleChange(row.id, "time", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Catatan tambahan"
                          value={row.notes}
                          onChange={(e) =>
                            handleScheduleChange(row.id, "notes", e.target.value)
                          }
                        />
                      </td>
                      <td className="td-action">
                        <button
                          type="button"
                          className="btn-hapus"
                          onClick={() => removeScheduleRow(row.id)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              className="btn-add-dashed"
              onClick={addScheduleRow}
            >
              + Tambah Jadwal
            </button>
          </div>
 
          {/* SECTION: ACHIEVEMENTS */}
          <div className="form-section">
            <label className="form-label">Achievements</label>
            <div className="achievements-list">
              {achievements.map((a) => (
                <input
                  key={a.id}
                  type="text"
                  className="form-input"
                  placeholder="Masukkan prestasi yang diraih..."
                  value={a.value}
                  onChange={(e) =>
                    handleAchievementChange(a.id, e.target.value)
                  }
                />
              ))}
            </div>
            <button
              type="button"
              className="btn-add-dashed"
              onClick={addAchievement}
            >
              + Tambah Prestasi
            </button>
          </div>
 
          {/* FOOTER BUTTONS */}
          <div className="footer-buttons">
            <button type="button" className="btn-batal">
              Batal
            </button>
            <button type="button" className="btn-simpan" onClick={handleSave}>
              Simpan Data
            </button>
          </div>
 
        </div>
      </div>
    </div>
    </div>
    
  );
}
