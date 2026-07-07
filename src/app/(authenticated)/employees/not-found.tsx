import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
      <p className="text-gray-600 mb-6">Pegawai tidak ditemukan</p>
      <Link
        href="/employees"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Kembali ke Daftar Pegawai
      </Link>
    </div>
  );
}
