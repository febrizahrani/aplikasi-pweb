"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function SignupPage() {
  const [form, setForm] = useState({ nama: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          data: { nama: form.nama },
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const msg = data.error?.msg || data.error || "Gagal membuat akun";
        if (typeof msg === "string" && msg.includes("already")) {
          setError("Email sudah terdaftar");
        } else {
          setError(typeof msg === "string" ? msg : "Gagal membuat akun");
        }
        setLoading(false);
        return;
      }

      // Insert profile ke public.users
      if (data.user) {
        await fetch(`${supabaseUrl}/rest/v1/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            id: data.user.id,
            email: form.email,
            role: "karyawan",
          }),
        });
      }

      setSuccess("Akun berhasil dibuat! Mengalihkan ke login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : String(err)));
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">HRIS Lite</h1>
          <p className="text-gray-500 mt-2">Buat Akun Baru</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="email@perusahaan.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Minimal 6 karakter"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg border border-green-200">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Membuat akun..." : "Daftar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Sudah punya akun?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
