import "./dashboard.css";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Topbar } from "@/components/Dashboard/Topbar";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-page-bg">
      <Topbar />
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
