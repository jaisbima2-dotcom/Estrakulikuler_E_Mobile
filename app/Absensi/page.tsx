"use client";

import { Html5Qrcode } from "html5-qrcode";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import "./style.css";

type Result = { kind: "idle" | "loading" | "success" | "error"; message: string };

function tokenFromValue(value: string) {
  try {
    const url = new URL(value);
    return url.searchParams.get("token") || value;
  } catch {
    return value.trim();
  }
}

export default function AbsensiPage() {
  const params = useSearchParams();
  const scanner = useRef<Html5Qrcode | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle", message: "Aktifkan kamera atau masukkan kode QR." });

  const submitToken = useCallback(async (rawValue: string) => {
    const token = tokenFromValue(rawValue);
    if (!token) return setResult({ kind: "error", message: "Kode QR tidak ditemukan." });
    setResult({ kind: "loading", message: "Memvalidasi absensi…" });
    try {
      const response = await fetch("/API/Backend/scan-validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await response.json();
      setResult(response.ok && data.success ? { kind: "success", message: data.message || "Absensi berhasil dicatat." } : { kind: "error", message: data.error || "Absensi gagal diproses." });
    } catch {
      setResult({ kind: "error", message: "Koneksi bermasalah. Coba kembali." });
    }
  }, []);

  const stopCamera = useCallback(async () => {
    if (!scanner.current) return;
    try { await scanner.current.stop(); } catch { /* already stopped */ }
    try { await scanner.current.clear(); } catch { /* already cleared */ }
    scanner.current = null;
    setCameraActive(false);
  }, []);

  const startCamera = async () => {
    setResult({ kind: "loading", message: "Menyiapkan kamera…" });
    // Reader must be visible before html5-qrcode initializes the video stream.
    setCameraActive(true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const instance = new Html5Qrcode("attendance-reader");
    scanner.current = instance;
    try {
      await instance.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 240, height: 240 } }, async (decodedText) => {
        await stopCamera();
        await submitToken(decodedText);
      }, () => undefined);
      setResult({ kind: "idle", message: "Arahkan kamera ke QR dari pembina." });
    } catch {
      scanner.current = null;
      setCameraActive(false);
      setResult({ kind: "error", message: "Kamera tidak dapat diakses. Periksa izin kamera atau gunakan kode manual." });
    }
  };

  useEffect(() => {
    const token = params.get("token");
    const timer = token ? window.setTimeout(() => { void submitToken(token); }, 0) : undefined;
    return () => { if (timer) window.clearTimeout(timer); void stopCamera(); };
  }, [params, stopCamera, submitToken]);

  return (
    <main className="page-root">
      <section className="mobile-container" aria-live="polite">
        <header className="header"><div className="header-title">Absensi Ekstrakurikuler</div><p className="header-subtitle">Scan QR dari pembina untuk mencatat kehadiran.</p></header>
        <section className={`camera-preview ${cameraActive ? "is-visible" : ""}`} aria-label="Pratinjau kamera QR">
          <div id="attendance-reader" />
          {cameraActive && <p className="camera-caption">Arahkan QR ke dalam area kamera</p>}
        </section>
        <div className={`scanner-card ${result.kind}`}>
          <p>{result.message}</p>
          {!cameraActive ? <button type="button" className="reg-btn" onClick={() => void startCamera()} disabled={result.kind === "loading"}>Aktifkan Kamera QR</button> : <button type="button" className="reg-btn" onClick={() => void stopCamera()}>Tutup Kamera</button>}
        </div>
        <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void submitToken(manualCode); }} className="scanner-card">
          <label htmlFor="manual-code">Tidak bisa memakai kamera?</label>
          <input id="manual-code" value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Tempel token atau URL QR" />
          <button type="submit" className="reg-btn" disabled={result.kind === "loading"}>Kirim Kode</button>
        </form>
      </section>
    </main>
  );
}
