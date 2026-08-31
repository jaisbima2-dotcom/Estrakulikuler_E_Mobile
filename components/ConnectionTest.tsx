// components/ConnectionTest.tsx
/**
 * Connection Test Component
 * Shows the status of database, backend, and environment connections
 * 
 * Add this to any page to verify connectivity:
 * import ConnectionTest from "@/components/ConnectionTest";
 * export default function Page() {
 *   return (
 *     <div>
 *       <ConnectionTest />
 *       {/* Your page content */}
 *     </div>
 *   );
 * }
 */

"use client";

import { useEffect, useState } from "react";
import { checkAllConnections, ConnectionStatus } from "@/lib/connectionVerifier";

export default function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runCheck() {
      setLoading(true);
      const result = await checkAllConnections();
      setStatus(result);
      setLoading(false);
    }

    runCheck();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-blue-900">🔍 Checking connections...</p>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const bgColor = status.database && status.backend && status.environment
    ? "bg-green-50"
    : "bg-red-50";

  const borderColor = status.database && status.backend && status.environment
    ? "border-green-200"
    : "border-red-200";

  const textColor = status.database && status.backend && status.environment
    ? "text-green-900"
    : "text-red-900";

  return (
    <div className={`p-4 ${bgColor} border ${borderColor} rounded-lg mb-4`}>
      <div className={`${textColor} font-semibold mb-2`}>
        {status.message}
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <span>{status.environment ? "✅" : "❌"}</span>
          <span>Environment: {status.environment ? "Configured" : "Missing variables"}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>{status.database ? "✅" : "❌"}</span>
          <span>Database: {status.database ? "Connected" : "Failed"}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>{status.backend ? "✅" : "❌"}</span>
          <span>Backend: {status.backend ? "Running" : "Failed"}</span>
        </div>
      </div>
    </div>
  );
}
