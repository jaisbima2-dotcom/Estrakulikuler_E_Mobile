"use client";

/**
 * EXAMPLE: Refactored Dashboard Page
 * 
 * This shows how pages should be structured after the dashboard layout refactor.
 * 
 * BEFORE (OLD):
 * - Every page had its own <div className="page-bg">
 * - Every page had its own <div className="topbar">...</div>
 * - Every page had its own <aside className="sidebar">...</aside>
 * - Every page had its own style.css import
 * - One bug in sidebar code = fix in 14+ files
 * 
 * AFTER (NEW):
 * - Page only contains content
 * - Topbar and Sidebar come from app/dashboard/layout.tsx
 * - CSS is unified in app/dashboard/dashboard.css
 * - One change = applied everywhere automatically
 */

import "../dashboard.css";

export default function ExampleDashboardPage() {
  return (
    <div className="example-page-content">
      <div className="page-header">
        <h1>Example Page</h1>
        <p>This page is automatically wrapped with topbar and sidebar</p>
      </div>

      <div className="content-section">
        <h2>No More Duplicate Sidebar</h2>
        <p>
          This page doesn't contain the sidebar or topbar JSX. They're managed globally by the dashboard layout.
        </p>
        <ul>
          <li>✅ Sidebar is in layout.tsx</li>
          <li>✅ Topbar is in layout.tsx</li>
          <li>✅ CSS is unified in dashboard.css</li>
          <li>✅ All pages inherit the same structure</li>
          <li>✅ One bug fix applies to all pages</li>
        </ul>
      </div>
    </div>
  );
}
