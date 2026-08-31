"use client";

import { Suspense } from "react";
import ScanPageContent from "./content";

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h1>⏳ Loading...</h1>
        </div>
      }
    >
      <ScanPageContent />
    </Suspense>
  );
}