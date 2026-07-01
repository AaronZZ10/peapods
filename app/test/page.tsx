"use client";

import { testSupabaseConnection } from "@/lib/actions/test";
import { useState, useEffect } from "react";

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function runTest() {
      const response = await testSupabaseConnection();
      setResult(response);
      setLoading(false);
    }
    runTest();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Test</h1>

      {loading && <p>Testing database connection...</p>}

      {result && (
        <div
          className={`p-6 rounded-lg ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${result.success ? "text-green-800" : "text-red-800"}`}
          >
            {result.message}
          </h2>

          {result.error && <p className="text-red-600 mb-4">{result.error}</p>}

          {result.data && (
            <pre className="bg-white p-4 rounded border">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
