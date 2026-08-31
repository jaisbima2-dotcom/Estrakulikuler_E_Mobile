interface notifikasi {
    id_notifikasi: number;
    id_user: number;
    id_admin: number;
    id_pendaftar: number;
    pesan: string;
    tanggal_kirim: string;
    status_pendaftaran: boolean;
}

export type { notifikasi };