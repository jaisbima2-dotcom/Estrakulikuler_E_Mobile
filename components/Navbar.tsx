"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/Login/logout";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  // Load user session from cookies
  useEffect(() => {
    const getUserSession = () => {
      // Parse cookies from document.cookie
      const cookies = document.cookie.split(";").reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          acc[key] = decodeURIComponent(value);
          return acc;
        },
        {} as Record<string, string>,
      );

      setUsername(cookies.username || null);
      setUserId(cookies.user_id || null);
      setUserRole(cookies.user_role || null);
    };

    getUserSession();
  }, [pathname]);

  // Sticky navbar shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check if link is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Handle logout with atomic cleanup
  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoggingOut) return; // Prevent double-click

    setIsLoggingOut(true);
    setMenuOpen(false); // Close mobile menu immediately
    console.log("[Navbar] 🔐 Initiating logout...");

    try {
      // 1. Clear client-side storage atomically
      console.log("[Navbar] 🗑️ Clearing localStorage and sessionStorage...");
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log("[Navbar] ✅ Client storage cleared");
      } catch (storageErr) {
        console.warn(
          "[Navbar] ⚠️ Storage clear error (non-fatal):",
          storageErr,
        );
      }

      // 2. Call server action to clear Supabase session and cookies
      console.log("[Navbar] 📡 Calling logout server action...");
      const result = await logoutAction();

      if (result.success) {
        console.log("[Navbar] ✅ Server logout successful");
      } else {
        console.error(
          "[Navbar] ⚠️ Server logout returned error:",
          result.error,
        );
      }

      // 3. Small delay to ensure cookies are deleted on server
      console.log(
        "[Navbar] ⏳ Waiting 300ms for server to process cookie deletion...",
      );
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 4. Redirect using hard window.location.href (most reliable for logout)
      console.log("[Navbar] 🔄 Performing hard redirect to /Login");
      window.location.href = "/Login?logout=success";
    } catch (err) {
      console.error("[Navbar] ❌ Logout error:", err);
      console.log("[Navbar] 🔄 Fallback: Hard redirect to /Login");
      // Immediate hard redirect on error
      window.location.href = "/Login?logout=failed";
    }
  };

  const isLoggedIn = Boolean(userId && userRole);

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo with School Icon */}
        <Link href="/" className="nav-logo">
          <Image
            src="/image/cropped-logo-SMKN-1-CBN.png"
            alt="SMKN 1 Cibinong"
            className="nav-logo-icon"
            width={40}
            height={40}
          />
          <div className="nav-logo-text">
            <div className="nav-logo-brand">Ekstrakurikuler E-Mobile</div>
            <div className="nav-logo-school">SMKN 1 Cibinong</div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <ul className={`nav-links${menuOpen ? " open" : ""}`}>
          <li>
            <Link
              href="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/Profile_eskul"
              className={`nav-link ${isActive("/Profile_eskul") ? "active" : ""}`}
            >
              Kategori
            </Link>
          </li>
          <li>
            <Link href="#kontak" className="nav-link">
              Kontak
            </Link>
          </li>

          {/* User Session Links */}
          {isLoggedIn ? (
            <>
              <li>
                <Link
                  href="/Profile_eskul"
                  className={`nav-link ${isActive("/Profile_eskul") ? "active" : ""}`}
                >
                  Profil
                </Link>
              </li>

              {/* Dashboard based on role */}
              <li>
                <Link
                  href={
                    userRole === "admin"
                      ? "/Dashboard_pengawas"
                      : userRole === "pembina"
                        ? "/Dashboard_pembina"
                        : "/Beranda_user"
                  }
                  className={`nav-link ${
                    isActive("/Dashboard") || isActive("/Beranda_user")
                      ? "active"
                      : ""
                  }`}
                >
                  Dashboard
                </Link>
              </li>

              {/* User Info Badge */}
              <li className="nav-user-badge">
                <span className="nav-user-avatar">
                  {(username?.charAt(0) || "U").toUpperCase()}
                </span>
                <span className="nav-user-name">{username || "User"}</span>
              </li>

              {/* Logout Button */}
              <li>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="btn-logout"
                  aria-label="Logout"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/Login" className="btn-login">
                Login
              </Link>
            </li>
          )}
        </ul>

        {/* Hamburger Menu */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
