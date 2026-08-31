"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export function Topbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="dashboard-topbar">
      <div className="topbar-left">
        <h2>Dashboard Admin</h2>
      </div>

      <div className="topbar-right">
        <button className="notif-btn" title="Notifications">
          <Bell size={18} />
        </button>

        <div className="avatar-wrapper">
          <div
            className="avatar"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            AD
          </div>

          {dropdownOpen && (
            <div className="dropdown">
              <p>👤 View Profile</p>
              <p>✉️ Messages</p>
              <p
                className="logout"
                onClick={async () => {
                  console.log("[Topbar] Logout clicked");
                  try {
                    const { logoutAction } = await import("@/app/Login/logout");
                    await logoutAction();
                  } catch (err) {
                    console.error("[Topbar] Logout error:", err);
                    window.location.href = "/";
                  }
                }}
              >
                ↩️ Logout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
