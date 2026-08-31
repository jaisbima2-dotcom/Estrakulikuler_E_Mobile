export default function EskulProfile({ data }: any) {
  return (
    <div>
      <h1>{data.nama}</h1>
      <p>{data.deskripsi}</p>
      <p>Ketua: {data.ketua}</p>
    </div>
  );
}