"use client";

interface EskulCardProps {
  data: {
    slug: string;
    nama: string;
    deskripsi: string;
    ketua: string;
  };
}

export default function EskulCard({ data }: EskulCardProps) {
  return (
    <div className="eskul-card">
      <h3>{data.nama}</h3>
      <p className="deskripsi">{data.deskripsi}</p>
      <p className="ketua"><strong>Ketua:</strong> {data.ketua}</p>
      <a href={`/Profile/${data.slug}`} className="view-btn">
        Lihat Detail
      </a>
    </div>
  );
}
