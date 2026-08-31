"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Trash2,
  Edit,
  Plus,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";
import { getEskulPrimaryImage, getDefaultImagePath } from "@/lib/imageUtils";
import { getEskulListAction,
  getEskulCategoriesAction,
  deleteEskulAction,
  getUserInfoAction,
  checkPengurusHasEskulAction,
  type EskulProfile,
} from "./action";
import "./style.css";

// ─────────────────────────────────────────────────────────────
// COMPONENT: Empty State
// ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="empty-state"
    >
      <div className="empty-state-content">
        <div className="empty-state-icon">📚</div>
        <h3 className="empty-state-title">Tidak Ada Ekstrakurikuler</h3>
        <p className="empty-state-desc">
          Saat ini belum ada program ekstrakurikuler yang tersedia. Silakan coba
          lagi nanti.
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT: Loading Skeleton
// ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT: Extracurricular Card
// ─────────────────────────────────────────────────────────────
interface EskulCardProps {
  eskul: EskulProfile;
  index: number;
  userRole: string | null;
  userId: number | null;
  isLoggedIn: boolean;
  onDelete: (id: number) => Promise<void>;
}

function EskulCard({ eskul, index, userRole, userId, isLoggedIn, onDelete }: EskulCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isGuest = !userRole;
  const isSiswa = userRole === "siswa";
  const isPembina = userRole === "pembina";
  const isAdmin = userRole === "admin";

  const canManage =
    !isGuest &&
    !isSiswa &&
    (isAdmin || (isPembina && userId === eskul.id_pengurus));

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${eskul.nama_eskul}"?`)) {
      return;
    }
    try {
      setIsDeleting(true);
      await onDelete(eskul.id_eskul);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Gagal menghapus ekstrakurikuler");
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryColors: Record<string, string> = {
    Sports: "badge-sports",
    Arts: "badge-arts",
    Technology: "badge-tech",
    Language: "badge-language",
    Organization: "badge-org",
  };

  const categoryClass = categoryColors[eskul.kategori] || "badge-default";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="eskul-card"
    >
      {/* Card Image */}
      <div className="card-image-wrapper">
        {!imageError ? (
          <img
            src={getEskulPrimaryImage(eskul.nama_eskul)}
            alt={eskul.nama_eskul}
            className="card-image"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <img
            src={getDefaultImagePath()}
            alt={eskul.nama_eskul}
            className="card-image"
            loading="lazy"
          />
        )}
        <div className={`category-badge ${categoryClass}`}>
          {eskul.kategori}
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <h3 className="card-title">{eskul.nama_eskul}</h3>

        {/* Info Grid */}
        <div className="card-info-grid">
          {/* Pengurus */}
          {eskul.coach_nama && (
            <div className="info-item">
              <Users size={14} className="info-icon" />
              <span className="info-text">Pengurus: {eskul.coach_nama}</span>
            </div>
          )}

          {/* Schedule */}
          {(eskul.hari_latihan || eskul.jam_latihan) && (
            <div className="info-item">
              <Calendar size={14} className="info-icon" />
              <span className="info-text">
                {eskul.hari_latihan}
                {eskul.jam_latihan && ` (${eskul.jam_latihan})`}
              </span>
            </div>
          )}

        </div>

        {/* Description */}
        <p className="card-description">
          {eskul.deskripsi || "Kegiatan rutin siswa SMKN 1 Cibinong."}
        </p>
      </div>

      {/* Card Footer - Buttons */}
      <div className="card-footer">
        {/* Register Button - Available to siswa/guest, NOT to admin/pembina who manage it */}
        {(isGuest || isSiswa || !isPembina) && (
          <Link href={`/Daftar?eskul=${eskul.id_eskul}`} className="btn-small btn-primary">
            Daftar
          </Link>
        )}

        {/* Edit/Delete Actions - Only for Admin/Pembina (if they own it) */}
        {canManage && (
          <div className="db-actions">
            <Link
              href={`/Crud_profile?edit=${eskul.id_eskul}`}
              className="btn-small btn-secondary"
            >
              <Edit size={14} />
              Edit
            </Link>
            <button
              className="btn-small btn-danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={14} />
              {isDeleting ? "Deleting..." : "Hapus"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ProfileEskulPage() {
  const [eskuls, setEskuls] = useState<EskulProfile[]>([]);
  const [filteredEskuls, setFilteredEskuls] = useState<EskulProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [canAdd, setCanAdd] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isAdmin = userRole === "admin";
  const isPengurus = userRole === "pembina";
  const isSiswa = userRole === "siswa";
  const isGuest = !userRole;
  const userHasEskul = isPengurus && !canAdd;
  const isAuthorized = Boolean(userId !== null && userRole);
  const isRestrictedViewer = isGuest || isSiswa;
  const showAddButton = isAdmin || (isPengurus && !userHasEskul);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log("[Profile_eskul] Loading data...");

        // Fetch categories
        const catResult = await getEskulCategoriesAction();
        if (catResult.data) {
          setCategories(["All", ...catResult.data]);
          console.log("[Profile_eskul] ✅ Categories loaded:", catResult.data);
        }

        // Fetch user info (role and ID)
        const userInfoResult = await getUserInfoAction();
        
        // Check if user is logged in (has both userId and role)
        const userIsLoggedIn = !!(userInfoResult.userId && userInfoResult.role);
        setIsLoggedIn(userIsLoggedIn);
        console.log("[Profile_eskul] 🔐 User logged in:", userIsLoggedIn);
        
        if (userInfoResult.userId) {
          setUserId(userInfoResult.userId);
          console.log("[Profile_eskul] ✅ User ID:", userInfoResult.userId);
        }
        if (userInfoResult.role) {
          setUserRole(userInfoResult.role);
          console.log("[Profile_eskul] ✅ User role:", userInfoResult.role);

          // If pembina, check if they already have an eskul
          if (userInfoResult.role === "pembina") {
            const checkResult = await checkPengurusHasEskulAction();
            setCanAdd(!checkResult.hasEskul);
            console.log("[Profile_eskul] ✅ Pembina can add:", !checkResult.hasEskul);
          } else if (userInfoResult.role === "admin") {
            setCanAdd(true);
            console.log("[Profile_eskul] ✅ Admin can add");
          }
        }

        // Fetch eskuls
        const result = await getEskulListAction();
        if (result.error) {
          setError(result.error);
          console.error("[Profile_eskul] ❌ Error:", result.error);
        } else {
          console.log(
            `[Profile_eskul] ✅ Loaded ${result.data?.length || 0} eskul`
          );
          setEskuls(result.data || []);
          setFilteredEskuls(result.data || []);
        }
      } catch (err) {
        console.error("[Profile_eskul] ❌ Exception:", err);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = eskuls;

    // Apply category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((e) => e.kategori === selectedCategory);
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((e) =>
        e.nama_eskul.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log(
      `[Profile_eskul] Filtered: category=${selectedCategory}, search="${searchTerm}" → ${filtered.length} items`
    );
    setFilteredEskuls(filtered);
  }, [eskuls, selectedCategory, searchTerm]);

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      const result = await deleteEskulAction(id);
      if (result.success) {
        setEskuls((prev) => prev.filter((e) => e.id_eskul !== id));
        console.log("[Profile_eskul] ✅ Deleted eskul:", id);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="profile-eskul-page">
      {/* ──────────── MAIN CONTENT ──────────── */}
      <main className="profile-eskul-main">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-hero"
        >
          <div className="hero-content">
            <h2 className="hero-title">Kategori Ekstrakurikuler</h2>
            <p className="hero-desc">
              Jelajahi berbagai program ekstrakurikuler dan daftarkan diri Anda
              untuk mengembangkan potensi.
            </p>
          </div>

          {/* Add Button - Only for Admin or eligible Pengurus */}
          {showAddButton && (
            <Link href="/Crud_profile?new=true" className="btn-add-eskul">
              <Plus size={18} />
              Tambah Ekstrakurikuler
            </Link>
          )}
        </motion.div>

        {/* Controls Section */}
        <div className="controls-section">
          {/* Search Bar */}
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Cari ekstrakurikuler..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="filter-wrapper">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`filter-btn ${
                  selectedCategory === cat ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <p className="results-count">
            Menampilkan{" "}
            <strong>{filteredEskuls.length}</strong>
            {filteredEskuls.length === 1
              ? " program"
              : " program"}
          </p>
        </div>

        {/* Grid or Empty State */}
        {loading ? (
          <div className="eskul-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredEskuls.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="eskul-grid"
          >
            {filteredEskuls.map((eskul, idx) => (
              <EskulCard
                key={eskul.id_eskul}
                eskul={eskul}
                index={idx}
                userRole={userRole}
                userId={userId}
                isLoggedIn={isLoggedIn}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}