"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  LayoutGrid,
  Activity,
  Users,
  FileText,
  QrCode,
  CheckCircle,
  BarChart3,
  User,
} from "lucide-react";

const SIDEBAR_MENU_ADMIN = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/Dashboard_pengawas" },
  { icon: User, label: "Profile", path: "/Crud_profile" },
  { icon: BarChart3, label: "Laporan", path: "/Laporan_absensi" },
  { icon: QrCode, label: "Generator QR", path: "/Generate_qr" },
  { icon: CheckCircle, label: "Verifikasi", path: "/Verifikasi" },
  { icon: LayoutGrid, label: "Kartu Identitas", path: "/Generate_kartu" },
];

const SIDEBAR_MENU_COACH = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/Dashboard_pembina" },
  { icon: User, label: "Profile", path: "/Crud_profile" },
  { icon: BarChart3, label: "Laporan", path: "/Laporan_absensi" },
  { icon: QrCode, label: "Generator QR", path: "/Generate_qr" },
  { icon: CheckCircle, label: "Verifikasi", path: "/Verifikasi" },
  { icon: LayoutGrid, label: "Kartu Identitas", path: "/Generate_kartu" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("user_role") || 
                 new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("role");
    setUserRole(role);
  }, []);

  // Different menu for admin vs coach
  let sidebarMenu: typeof SIDEBAR_MENU_ADMIN = [];
  if (userRole === "admin") {
    sidebarMenu = SIDEBAR_MENU_ADMIN;
  } else if (userRole === "pembina") {
    // Accept normalized 'pembina'
    sidebarMenu = SIDEBAR_MENU_COACH;
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-section">
        <p className="sidebar-section-title">MENU UTAMA</p>
        <nav className="sidebar-menu">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-menu-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
