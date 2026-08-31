"use client";

import "./style.css";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

/* ────────────────────────── Types ────────────────────────── */
type Role = "Mentor" | "Coach";
type Status = "Aktif" | "Nonaktif";

interface Staff {
  id: number;
  name: string;
  role: Role;
  eskul: string;
  email: string;
  phone: string;
  joinDate: string;
  status: Status;
  gender: "L" | "P";
}

/* ────────────────────────── Data ────────────────────────── */
const ESKUL_LIST = [
  "Basket", "Futsal", "Voli", "PMR", "Paskibra",
  "Rohis", "English Club", "Pramuka",
];

const INITIAL_STAFF: Staff[] = [
  { id: 1, name: "Ahmad Fauzan", role: "Coach", eskul: "Basket", email: "ahmad@smkn1cibinong.sch.id", phone: "081234567890", joinDate: "2022-08-01", status: "Aktif", gender: "L" },
  { id: 2, name: "Siti Nurhaliza", role: "Mentor", eskul: "Rohis", email: "siti@smkn1cibinong.sch.id", phone: "082345678901", joinDate: "2023-01-15", status: "Aktif", gender: "P" },
  { id: 3, name: "Budi Santoso", role: "Coach", eskul: "Futsal", email: "budi@smkn1cibinong.sch.id", phone: "083456789012", joinDate: "2021-07-10", status: "Aktif", gender: "L" },
  { id: 4, name: "Dewi Kartika", role: "Mentor", eskul: "PMR", email: "dewi@smkn1cibinong.sch.id", phone: "084567890123", joinDate: "2023-03-20", status: "Nonaktif", gender: "P" },
  { id: 5, name: "Rizky Pratama", role: "Coach", eskul: "Paskibra", email: "rizky@smkn1cibinong.sch.id", phone: "085678901234", joinDate: "2022-12-01", status: "Aktif", gender: "L" },
  { id: 6, name: "Hana Pertiwi", role: "Mentor", eskul: "English Club", email: "hana@smkn1cibinong.sch.id", phone: "086789012345", joinDate: "2024-01-05", status: "Aktif", gender: "P" },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Mentor & Coach", icon: GraduationCap, href: "/mentor", active: true },
  
];

/* ────────────────────────── Helpers ────────────────────────── */
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

/* ────────────────────────── Sub-components ────────────────────────── */
function Sidebar() {
  const router = useRouter();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="sidebar-logo-badge">EPS</div>
          <div>
            <div className="sidebar-logo-text">SMKN 1 Cibinong</div>
            <div className="sidebar-logo-sub">Admin Supervisor</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <a key={item.label} href={item.href} className={`nav-item ${item.active ? "active" : ""}`}>
              <Icon size={15} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="btn-back">
        <button onClick={() => router.back()}>
          <ChevronLeft size={15} />
          <span>Back</span>
        </button>
      </div>
    </aside>
  );
}

interface StaffCardProps {
  staff: Staff;
  onDetail: (s: Staff) => void;
  onEdit: (s: Staff) => void;
  onToggle: (id: number) => void;
}

function StaffCard({ staff, onDetail, onEdit, onToggle }: StaffCardProps) {
  return (
    <div className="staff-card">
      <div className="card-header">
        <div className={`card-avatar ${staff.role === "Coach" ? "coach" : ""}`}>
          {initials(staff.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {staff.name}
          </div>
          <span className={`badge ${staff.role === "Coach" ? "badge-coach" : "badge-mentor"}`}>
            {staff.role}
          </span>
        </div>
        <span className={`badge ${staff.status === "Aktif" ? "badge-active" : "badge-inactive"}`}>
          {staff.status}
        </span>
      </div>

      <div className="card-body">
        <div className="card-info-row">
          <BookOpen size={12} />
          <span>{staff.eskul}</span>
        </div>
        <div className="card-info-row">
          <Mail size={12} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{staff.email}</span>
        </div>
        <div className="card-info-row">
          <Phone size={12} />
          <span>{staff.phone}</span>
        </div>
        <div className="card-info-row">
          <CalendarDays size={12} />
          <span>Bergabung {fmtDate(staff.joinDate)}</span>
        </div>
      </div>

      <div className="card-footer">
        <button className="btn-detail" onClick={() => onDetail(staff)}>Detail</button>
        <button className="btn-edit" onClick={() => onEdit(staff)}>Edit</button>
        <button className="btn-deactivate" onClick={() => onToggle(staff.id)}>
          {staff.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────── Add / Edit Modal ────────────────────────── */
interface StaffModalProps {
  initial?: Staff | null;
  onClose: () => void;
  onSave: (data: Omit<Staff, "id">) => void;
}

function StaffModal({ initial, onClose, onSave }: StaffModalProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    gender: initial?.gender ?? ("L" as "L" | "P"),
    role: initial?.role ?? ("Mentor" as Role),
    eskul: initial?.eskul ?? "Basket",
    status: (initial?.status ?? "Aktif") === "Aktif",
    joinDate: initial?.joinDate ?? new Date().toISOString().slice(0, 10),
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    onSave({ ...form, status: form.status ? "Aktif" : "Nonaktif" });
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div className="modal-title">{initial ? "Edit Staff" : "Tambah Staff Baru"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.7)" }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-subtitle">
          {initial ? "Perbarui data mentor atau coach" : "Isi data lengkap mentor atau coach baru"}
        </div>

        <div className="form-section-title">Identitas</div>
        <div className="form-group">
          <label className="form-label">Nama Lengkap *</label>
          <input className="form-input" placeholder="Masukkan nama lengkap" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-input" placeholder="email@sekolah.sch.id" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">No. Telepon</label>
            <input type="tel" className="form-input" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Jenis Kelamin</label>
          <select className="form-input" value={form.gender} onChange={(e) => set("gender", e.target.value as "L" | "P")}>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>

        <div className="form-section-title">Peran</div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-input" value={form.role} onChange={(e) => set("role", e.target.value as Role)}>
            <option value="Mentor">Mentor</option>
            <option value="Coach">Coach</option>
          </select>
        </div>

        <div className="form-section-title">Ekstrakurikuler</div>
        <div className="form-group">
          <label className="form-label">Pilih Ekstrakurikuler</label>
          <select className="form-input" value={form.eskul} onChange={(e) => set("eskul", e.target.value)}>
            {ESKUL_LIST.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        <div className="form-section-title">Status</div>
        <div className="toggle-wrapper">
          <label className="toggle">
            <input type="checkbox" checked={form.status} onChange={(e) => set("status", e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          <span className="toggle-label">{form.status ? "Aktif" : "Nonaktif"}</span>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Batal</button>
          <button className="btn-save" onClick={handleSave}>
            <Check size={14} />
            Simpan Staff
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── Detail Modal ────────────────────────── */
const TABS = ["Overview", "Riwayat Eskul", "Aktivitas", "Kehadiran"];

function DetailModal({ staff, onClose }: { staff: Staff; onClose: () => void }) {
  const [tab, setTab] = useState(0);

  return (
    <div className="detail-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-card">
        <div className="detail-top">
          <div className={`detail-avatar ${staff.role === "Coach" ? "coach" : ""}`}>
            {initials(staff.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="detail-name">{staff.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span className={`badge ${staff.role === "Coach" ? "badge-coach" : "badge-mentor"}`}>{staff.role}</span>
              <span className={`badge ${staff.status === "Aktif" ? "badge-active" : "badge-inactive"}`}>{staff.status}</span>
              <span style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>{staff.eskul}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(148,163,184,0.6)", alignSelf: "flex-start" }}>
            <X size={18} />
          </button>
        </div>

        <div className="detail-tabs">
          {TABS.map((t, i) => (
            <div key={t} className={`detail-tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>
              {t}
            </div>
          ))}
        </div>

        <div className="detail-content">
          {tab === 0 && (
            <>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-value">3</div><div className="stat-label">Eskul Diampu</div></div>
                <div className="stat-card"><div className="stat-value">92%</div><div className="stat-label">Tingkat Hadir</div></div>
                <div className="stat-card"><div className="stat-value">48</div><div className="stat-label">Sesi Aktif</div></div>
              </div>
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <div className="detail-info-label">Email</div>
                  <div className="detail-info-value" style={{ fontSize: 12, wordBreak: "break-all" }}>{staff.email}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Telepon</div>
                  <div className="detail-info-value">{staff.phone}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Jenis Kelamin</div>
                  <div className="detail-info-value">{staff.gender === "L" ? "Laki-laki" : "Perempuan"}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Tanggal Bergabung</div>
                  <div className="detail-info-value">{fmtDate(staff.joinDate)}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Ekstrakurikuler</div>
                  <div className="detail-info-value">{staff.eskul}</div>
                </div>
                <div className="detail-info-item">
                  <div className="detail-info-label">Status</div>
                  <div className="detail-info-value">{staff.status}</div>
                </div>
              </div>
            </>
          )}
          {tab !== 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(148,163,184,0.4)", fontSize: 13 }}>
              Data {TABS[tab]} belum tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── Page ────────────────────────── */
let nextId = INITIAL_STAFF.length + 1;

export default function MentorPage() {
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterEskul, setFilterEskul] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [detailTarget, setDetailTarget] = useState<Staff | null>(null);

  const [topbarSearch, setTopbarSearch] = useState("");

  const filtered = useMemo(() => {
    const q = (search || topbarSearch).toLowerCase();
    return staff.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
      if (filterRole && s.role !== filterRole) return false;
      if (filterEskul && s.eskul !== filterEskul) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      return true;
    });
  }, [staff, search, topbarSearch, filterRole, filterEskul, filterStatus]);

  const handleSave = (data: Omit<Staff, "id">) => {
    if (editTarget) {
      setStaff((prev) => prev.map((s) => s.id === editTarget.id ? { ...s, ...data } : s));
      setEditTarget(null);
    } else {
      setStaff((prev) => [...prev, { id: nextId++, ...data }]);
      setShowAdd(false);
    }
  };

  const handleToggle = (id: number) => {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === "Aktif" ? "Nonaktif" : "Aktif" } : s
      )
    );
  };

  return (
    <div className="mentor-root">
      <Sidebar />

      <div className="main-area">
      
       

        {/* Content */}
        <main className="content">
          {/* Section header */}
          <div className="section-header">
            <div>
              <div className="section-title">Manajemen Staf Ekstrakurikuler</div>
              <div className="section-desc">Kelola mentor dan coach kegiatan ekstrakurikuler sekolah</div>
            </div>
            <button className="btn-add" onClick={() => setShowAdd(true)}>
              <Plus size={15} />
              Tambah Staff
            </button>
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            <div className="filter-input" style={{ maxWidth: 260 }}>
              <Search size={13} style={{ flexShrink: 0, color: "rgba(148,163,184,0.5)" }} />
              <input
                placeholder="Cari nama atau email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-input" style={{ maxWidth: 150 }}>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="">Semua Role</option>
                <option value="Mentor">Mentor</option>
                <option value="Coach">Coach</option>
              </select>
            </div>
            <div className="filter-input" style={{ maxWidth: 180 }}>
              <select value={filterEskul} onChange={(e) => setFilterEskul(e.target.value)}>
                <option value="">Semua Eskul</option>
                {ESKUL_LIST.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="filter-input" style={{ maxWidth: 150 }}>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Stats chips */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Staff", value: staff.length, color: "#06b6d4" },
              { label: "Aktif", value: staff.filter((s) => s.status === "Aktif").length, color: "#10b981" },
              { label: "Nonaktif", value: staff.filter((s) => s.status === "Nonaktif").length, color: "#f87171" },
              { label: "Mentor", value: staff.filter((s) => s.role === "Mentor").length, color: "#06b6d4" },
              { label: "Coach", value: staff.filter((s) => s.role === "Coach").length, color: "#10b981" },
            ].map((chip) => (
              <div key={chip.label} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "7px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "rgba(148,163,184,0.8)",
              }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: chip.color }}>{chip.value}</span>
                {chip.label}
              </div>
            ))}
          </div>

          {/* Staff grid */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <UserX size={56} />
              <p>Belum ada staff terdaftar</p>
              <span>Klik &quot;Tambah Staff&quot; untuk mendaftarkan mentor atau coach baru</span>
              <button className="btn-add" style={{ marginTop: 8 }} onClick={() => setShowAdd(true)}>
                <Plus size={14} /> Tambah Staff
              </button>
            </div>
          ) : (
            <div className="staff-grid">
              {filtered.map((s) => (
                <StaffCard
                  key={s.id}
                  staff={s}
                  onDetail={setDetailTarget}
                  onEdit={(s) => setEditTarget(s)}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {(showAdd || editTarget) && (
        <StaffModal
          initial={editTarget}
          onClose={() => { setShowAdd(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
      {detailTarget && (
        <DetailModal staff={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
    </div>
  );
}
