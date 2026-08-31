import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="page-root">
          <div className="login-outer">
            <div className="login-card">
              <p style={{ padding: "40px", textAlign: "center" }}>
                Memuat halaman login...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
