"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugPage() {
  const [result, setResult] = useState("Loading...");
  const supabase = createClient();

  useEffect(() => {
    async function test() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        const lines: string[] = [];
        lines.push("URL: " + (url || "MISSING"));
        lines.push("KEY: " + (key ? key.substring(0, 20) + "..." : "MISSING"));

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          lines.push("ERROR: " + error.message);
        } else {
          lines.push("Session: " + JSON.stringify(data.session?.user?.email || "none"));
        }

        setResult(lines.join("\n"));
      } catch (err: unknown) {
        setResult("CATCH: " + (err instanceof Error ? err.message : String(err)));
      }
    }
    test();
  }, [supabase]);

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4">Debug Supabase Connection</h1>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">{result}</pre>
    </main>
  );
}
