"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { submitAbsensiAction } from "./action";
import Link from "next/link";

function ScanPageContent() {
  const params = useSearchParams();
  const eskul = params.get("eskul");
  const userId = params.get("user_id");

  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    console.log("[DEBUG][Scan] QR Scan page initialized");
    async function handleAbsensi() {
      try {
        console.log("[DEBUG][Scan] Processing QR code - userId:", userId, "eskul:", eskul);

        // Validate params
        if (!userId || !eskul) {
          console.log("[ScanPage] ❌ ERROR: Missing parameters");
          setErrorMessage("Parameter user_id atau eskul tidak ditemukan");
          setStatus("error");
          return;
        }

        const id_user_number = parseInt(userId, 10);
        const id_eskul_number = parseInt(eskul, 10);

        if (isNaN(id_user_number) || isNaN(id_eskul_number)) {
          console.log("[ScanPage] ❌ ERROR: Invalid parameter format");
          setErrorMessage("Format parameter tidak valid");
          setStatus("error");
          return;
        }

        // Call server action to submit attendance
        console.log("[ScanPage] Calling submitAbsensiAction...");
        const result = await submitAbsensiAction(id_user_number, id_eskul_number);

        if (result.error) {
          console.log("[ScanPage] ❌ ERROR:", result.error);
          setErrorMessage(result.error);
          setStatus("error");
          return;
        }

        console.log("[ScanPage] ✅ SUCCESS - Attendance recorded");
        setStatus("success");

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = "/scan";
        }, 3000);
      } catch (err) {
        console.error("[ScanPage] Exception:", err);
        setErrorMessage("Terjadi kesalahan tidak terduga");
        setStatus("error");
      }
    }

    handleAbsensi();
  }, [userId, eskul]);

  if (status === "processing") {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>⏳ Memproses Absensi...</h1>
        <p>Mohon tunggu sebentar</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "green" }}>
        <h1>✅ Absensi Berhasil Dicatat</h1>
        <p>Anda akan diarahkan kembali dalam beberapa detik...</p>
        <p style={{ fontSize: "14px", marginTop: "20px" }}>
          <Link href="/scan" style={{ color: "blue", textDecoration: "underline" }}>
            Kembali ke halaman scan
          </Link>
        </p>
      </div>
    );
  }

  // status === "error"
  return (
    <div style={{ textAlign: "center", padding: "40px", color: "red" }}>
      <h1>❌ Gagal Mencatat Absensi</h1>
      <p>{errorMessage}</p>
      <p style={{ fontSize: "14px", marginTop: "20px" }}>
        <Link href="/scan" style={{ color: "blue", textDecoration: "underline" }}>
          Kembali ke halaman scan
        </Link>
      </p>
    </div>
  );
}

export default ScanPageContent;
