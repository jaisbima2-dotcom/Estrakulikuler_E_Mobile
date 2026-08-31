import Link from "next/link";

export default function EskulCard({ data }: any) {
  return (
    <div style={{ border: "1px solid black", margin: 10, padding: 10 }}>
      <h2>{data.nama}</h2>
      <p>{data.deskripsi}</p>

      <Link href={`/eskul/${data.slug}`}>
        Lihat Profile
      </Link>
    </div>
  );
}