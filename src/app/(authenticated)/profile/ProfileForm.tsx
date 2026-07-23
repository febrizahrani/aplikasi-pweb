"use client";

import { useState } from "react";
import { updateMyProfile } from "@/actions/employees";

export default function ProfileForm({ phone }: { phone: string }) {
  const [phoneValue, setPhoneValue] = useState(phone);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await updateMyProfile({ phone: phoneValue || null });
      setSuccess("Profil berhasil diperbarui!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui profil");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Perbarui Profil</h3>
      <p className="text-sm text-gray-500 mb-4">
        Anda dapat memperbarui nomor HP. Untuk perubahan data lainnya, hubungi Admin HRD.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
          <input
            type="tel"
            value={phoneValue}
            onChange={(e) => setPhoneValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        {success && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">{success}</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
