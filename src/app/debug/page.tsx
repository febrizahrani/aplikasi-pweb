"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("Siap untuk test.");
  const supabase = createClient();

  async function testConnection() {
    setResult("Testing koneksi...");
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      setResult("Koneksi GAGAL: " + error.message);
    } else {
      setResult("Koneksi OK. Session: " + (data.session?.user?.email || "tidak ada session"));
    }
  }

  async function testLogin() {
    if (!email || !password) {
      setResult("Isi email dan password dulu!");
      return;
    }
    setResult("Logging in...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setResult("LOGIN GAGAL!\n\nError: " + error.message + "\nStatus: " + error.status);
    } else {
      setResult("LOGIN BERHASIL!\n\nUser: " + data.user?.email + "\nID: " + data.user?.id);
    }
  }

  return (
    <main className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Supabase</h1>

      <div className="space-y-4 mb-6">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg"
        >
          Test Koneksi
        </button>

        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Test Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <button
            onClick={testLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Test Login
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Hasil:</h3>
        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
      </div>
    </main>
  );
}
