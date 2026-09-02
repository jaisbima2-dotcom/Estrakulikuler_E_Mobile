"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";
import { usePathname } from "next/navigation";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

const DASHBOARD_ROUTE_PREFIXES = [
  "/Beranda_user",
  "/Dashboard_pengawas",
  "/Dashboard_pembina",
  "/Generate_kartu",
  "/Generate_qr",
  "/Verifikasi",
  "/Laporan_absensi",
  "/Crud_profile",
  "/Crud_pembina",
];

function isDashboardRoute(pathname: string) {
  return DASHBOARD_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function hasProfileFooter(pathname: string) {
  return (
    pathname !== "/Profile_eskul" &&
    pathname !== "/Profile_Basket" &&
    pathname.startsWith("/Profile_")
  );
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const pathname = usePathname();
  const hidePublicChrome = isDashboardRoute(pathname);
  const showGlobalFooter = !hidePublicChrome && !hasProfileFooter(pathname);

  return (
    <>
      {!hidePublicChrome && <Navbar />}
      {children}
      {showGlobalFooter && <Footer />}
    </>
  );
}
