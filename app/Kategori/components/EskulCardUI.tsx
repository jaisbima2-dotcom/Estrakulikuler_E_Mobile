"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Calendar } from "lucide-react";
import { getEskulThumbnailPath, getDefaultImagePath } from "@/lib/imageUtils";

// Helper: Map Eskul Name to Profile Path
const getEskulProfilePath = (eskulName: string): string => {
  const nameMap: Record<string, string> = {
    "Basket": "/Profile_Basket",
    "Badminton": "/Profile_badminton",
    "Voli": "/Profile_voli",
    "Futsal": "/Profile_futsal",
    "English Club": "/Profile_inggris",
    "English": "/Profile_inggris",
    "Inggris": "/Profile_inggris",
    "Japanese Club": "/Profile_jepang",
    "Japanese": "/Profile_jepang",
    "Jepang": "/Profile_jepang",
    "Paskibra": "/Profile_paskibra",
    "PMR": "/Profile_pmr",
    "Pramuka": "/Profile_pramuka",
    "ROHIS": "/Profile_rohis",
    "Rohani Islam": "/Profile_rohis",
    "ROKRIS": "/Profile_rokris",
    "Rokris": "/Profile_rokris",
    "Tari": "/Profile_tari",
    "Dance": "/Profile_tari",
  };

  return nameMap[eskulName] || `/Profile_${eskulName.toLowerCase().replace(/\s+/g, "_")}`;
};

export default function EskulCardUI({
  eskul,
  index,
  userRole,
  userId,
}: {
  eskul: any;
  index: number;
  userRole: string | null;
  userId: number | null;
}) {
  const [imageError, setImageError] = useState(false);

  const imgSrc = eskul.image_url || getEskulThumbnailPath(eskul.nama_eskul);

  // DIUBAH: Menggunakan id_pembina menyesuaikan database kamu
  const canManage = userRole === "admin" || (userRole === "pembina" && userId === eskul.id_pembina);
  const profilePath = getEskulProfilePath(eskul.nama_eskul);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="eskul-card-wrapper"
    >
      <Link href={profilePath}>
        <article className="eskul-ui-card glass">
          <div className="card-media">
            {!imageError ? (
              <Image
                src={imgSrc}
                alt={eskul.nama_eskul}
                width={640}
                height={360}
                className="card-image"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <Image
                src={getDefaultImagePath()}
                alt={eskul.nama_eskul}
                width={640}
                height={360}
                className="card-image"
                loading="lazy"
              />
            )}
            <span className="badge kategori">{eskul.kategori}</span>
          </div>

          <div className="card-body">
            <h3 className="card-title text-white">{eskul.nama_eskul}</h3>

            <div className="card-meta">
              <div className="meta-item">
                <Users size={14} />
                {/* DIUBAH: Cek id_pembina */}
                <span className="text-white/90">{eskul.id_pembina ? "Pembina" : "Terbuka"}</span>
              </div>
              <div className="meta-item">
                <Calendar size={14} />
                <span className="text-white/90">
                  {eskul.hari_latihan || "-"} · {eskul.jam_latihan || "-"} WIB
                </span>
              </div>
            </div>

            <p className="card-desc text-white/80">{(eskul.deskripsi || "").slice(0, 140)}</p>

            <div className="card-actions">
              <span className="btn btn-primary">
                Lihat Detail
              </span>

              {canManage && (
                <div className="manage-group" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/Crud_profile?edit=${eskul.id_eskul}`} className="btn btn-ghost" onClick={(e) => e.stopPropagation()}>
                    Edit
                  </Link>
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}