"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./action";
import { logoutAction } from "./logout";
import "./style.css";

function setCookie(name: string, value: string, days: number = 7): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Strict`;
  console.log(`✓ Cookie set: ${name}`);
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  console.log(`✓ Cookie deleted: ${name}`);
}

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLocation = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.72.33 1.43.63 2.11a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.68.3 1.39.51 2.11.63A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v16H4z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const NAV_LINKS = ["Home"];

export default function LoginClient() {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("logout") === "true") {
      logoutAction();
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("password", form.password);

      console.log("[HANDLESUBMIT] Calling loginAction with username:", form.username);

      const res = await loginAction(formData);

      console.log("[HANDLESUBMIT] Login response:", {
        hasError: !!res?.error,
        hasData: !!res?.data,
        role: res?.data?.role,
      });

      if (res?.error) {
        console.log("[HANDLESUBMIT] Error:", res.error);
        setError(res.error);
        return;
      }

      if (res?.data) {
        console.log("[HANDLESUBMIT] Login successful, role:", res.data.role);
        setCookie("user_id", String(res.data.id_user || res.data.id || ""), 7);
        setCookie("user_role", String(res.data.role || ""), 7);
        setCookie("username", String(res.data.username || ""), 7);

        console.log("[HANDLESUBMIT] Client cookies set");

        let redirectUrl = "/Beranda_user";
        if (res.data.role === "admin") {
          redirectUrl = "/Dashboard_pengawas";
          console.log("[HANDLESUBMIT] Admin user (pengawas), redirecting to /Dashboard_pengawas");
        } else if (res.data.role === "pembina") {
          // Pembina user redirected to coach dashboard
          redirectUrl = "/Dashboard_pembina";
          console.log("[HANDLESUBMIT] Pembina user, redirecting to /Dashboard_pembina");
        } else if (res.data.role === "siswa") {
          redirectUrl = "/Beranda_user";
          console.log("[HANDLESUBMIT] Siswa user, redirecting to /Beranda_user");
        }

        console.log("[HANDLESUBMIT] Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
      }
    } catch (err) {
      console.log("[HANDLESUBMIT] Error:", err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12 },
    );

    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="page-root">
      <div className="login-outer">
        <div className="login-card">
          <div className="login-image-col">
            <img
              src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&q=80"
              alt="Student sitting"
            />
          </div>

          <div className="login-panel">
            <h1 className="login-title">LOGIN</h1>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="login-input"
                  placeholder="Enter your username"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="login-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <p style={{ color: "#ff6b6b", marginBottom: "10px", fontSize: "14px" }}>
                  {error}
                </p>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Loading..." : "Login Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
