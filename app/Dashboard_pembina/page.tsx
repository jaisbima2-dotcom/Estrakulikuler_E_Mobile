"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/Login/logout";
import "./style.css";

// Type Definitions


interface StatCardProps {
  title: string;
  value: number;
  color: "yellow" | "red" | "green";
  icon: string;
  change: string;
  desc: string;
}

interface ProgressItemProps {
  label: string;
  value: number;
  color: string;
}

export default function Dashboardpembina() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    console.log("[Dashboard_pembina] 🔐 Initiating logout...");
    try {
      localStorage.clear();
      sessionStorage.clear();
      await logoutAction();
      console.log("[Dashboard_pembina] ✅ Logout successful");
      await new Promise(resolve => setTimeout(resolve, 300));
      window.location.href = "/Login?logout=success";
    } catch (err) {
      console.error("[Dashboard_pembina] ❌ Logout error:", err);
      window.location.href = "/Login?logout=failed";
    }
  };

  
  useEffect(() => {
    // Load Chart.js dynamically
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js";
    script.async = true;

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Chart = (window as any).Chart;
      if (!Chart) return;

      Chart.defaults.font.family =
        "Plus Jakarta Sans, Inter, system-ui, sans-serif";
      Chart.defaults.color = "#374151";
      Chart.defaults.elements.line.tension = 0.4;
      Chart.defaults.elements.point.radius = 4;
      Chart.defaults.elements.point.hoverRadius = 6;

      // Line Chart
      if (lineChartRef.current) {
        new Chart(lineChartRef.current.getContext("2d"), {
          type: "line",
          data: {
            labels: [
              "Senin",
              "Selasa",
              "Rabu",
              "Kamis",
              "Jumat",
              "Sabtu",
              "Minggu",
            ],
            datasets: [
              {
                label: "Absensi",
                data: [280, 295, 310, 285, 298, 288, 305],
                borderColor: "#3D5AF1",
                backgroundColor: "rgba(61, 90, 241, 0.1)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#3D5AF1",
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 2.5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 350,
                grid: { color: "#f0f0f0" },
              },
              x: {
                grid: { display: false },
              },
            },
          },
        });
      }

      // Pie Chart
      if (pieChartRef.current) {
        new Chart(pieChartRef.current.getContext("2d"), {
          type: "doughnut",
          data: {
            labels: ["Pengguna Aktif", "Sudah Absen", "Belum Absen"],
            datasets: [
              {
                data: [70, 15, 15],
                backgroundColor: ["#3D5AF1", "#EF4444", "#10B981"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: {
              legend: {
                position: "bottom" as const,
                labels: {
                  padding: 15,
                  font: { size: 12 },
                },
              },
            },
          },
        });
      }
    };

    document.head.appendChild(script);

    // Close dropdown when clicking outside
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".avatar-wrapper")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [setDropdownOpen]);

  const statCards: StatCardProps[] = [
    {
      title: "Total Pengguna",
      value: 120,
      color: "yellow",
      icon: "",
      change: "+12%",
      desc: "Jumlah akun terdaftar",
    },
    {
      title: "Siswa Sudah Absen",
      value: 310,
      color: "red",
      icon: "",
      change: "+85%",
      desc: "Absensi yang tercatat hari ini",
    },
    {
      title: "Siswa Belum Absen",
      value: 55,
      color: "green",
      icon: "",
      change: "-15%",
      desc: "Belum melakukan scan barcode",
    },
  ];

  const progressItems: ProgressItemProps[] = [
    { label: "Siswa Sudah Absen", value: 85, color: "#EF4444" },
    { label: "Siswa Belum Absen", value: 15, color: "#10B981" },
    { label: "Pengguna Aktif", value: 70, color: "#3D5AF1" },
    { label: "Pengguna Tidak Aktif", value: 30, color: "#6B7280" },
    { label: "Tingkat Verifikasi", value: 92, color: "#F59E0B" },
  ];

  return (
    <div
      className="layout"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {/* ---- TOPBAR ---- */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="brand-logo">
            <a href=""></a>
          </div>
          <h2>Dashboard Admin</h2>
        </div>

        <div className="topbar-right">
          <button className="notif-btn"> 🔔 </button>

          <div className="avatar-wrapper">
            <div
              className="avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              AD
            </div>

            {dropdownOpen && (
              <div className="dropdown">
                <p> View Profile</p>
                <p> Messages</p>
                <p
                  className="logout"
                  onClick={handleLogout}
                  style={{ cursor: isLoggingOut ? "not-allowed" : "pointer", opacity: isLoggingOut ? 0.6 : 1 }}
                >
                  ↩ {isLoggingOut ? "Logging out..." : "Logout"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- SIDEBAR ---- */}
      <aside className="sidebar">
       <div className="sidebar-section">
          <p className="sidebar-section-title">MENU UTAMA</p>
          <nav className="sidebar-menu">
            <Link href="/Dashboard_pembina" className="active">
              Dashboard
            </Link>
            <Link href="/Crud_profile"> Profile</Link>
            <Link href="/Laporan_absensi"> Laporan</Link>
            <Link href="/Generate_qr"> Generator QR Code</Link>
            <Link href="/Verifikasi" > Verifikasi Data Pendaftar</Link>
            <Link href="/Generate_kartu"> Kartu Identitas</Link>
          </nav>
          </div>
      </aside>

      

      {/* Main wrapper */}
      <main className="main">
        {/* Stats Row */}
        <div className="stats">
          {statCards.map((stat, idx) => (
            <div key={idx} className={`stat-card ${stat.color}`}>
              <div className="stat-top">
                <span className="stat-label">{stat.title}</span>
                <span className="stat-icon">{stat.icon}</span>
              </div>
              <h2 className="stat-value">{stat.value}</h2>
              <div className="stat-footer">
                <span className={`stat-change ${stat.color}`}>
                  {stat.change}
                </span>
                <span className="stat-desc">{stat.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="charts">
          <div className="card">
            <div className="card-header">
              <h3>Statistik Absensi Per Hari</h3>
              <span className="badge-filter"> 7 Hari Terakhir</span>
            </div>
            <div className="chart-container">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Distribusi Data</h3>
            </div>
            <div className="pie-container">
              <canvas ref={pieChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="progress-card">
          <h3>Statistik Keaktifan</h3>

          {progressItems.map((item, idx) => (
            <div key={idx} className="progress-item">
              <div className="progress-header">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}