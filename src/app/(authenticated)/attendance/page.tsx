"use client";

import { useState, useEffect } from "react";
import { getAttendance, createAttendance, deleteAttendance } from "@/actions/attendance";
import { getEmployees } from "@/actions/employees";
import type { AttendanceWithEmployee, Employee } from "@/types";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee_id: "",
    tanggal: new Date().toISOString().split("T")[0],
    check_in: "09:00",
    check_out: "",
    status: "Hadir" as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [attData, empData] = await Promise.all([
      getAttendance(),
      getEmployees(),
    ]);
    setRecords(attData);
    setEmployees(empData);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAttendance({
        employee_id: form.employee_id,
        tanggal: form.tanggal,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
        status: form.status as "Hadir" | "Izin" | "Sakit" | "Alpha",
      });
      setShowForm(false);
      setForm({
        employee_id: "",
        tanggal: new Date().toISOString().split("T")[0],
        check_in: "09:00",
        check_out: "",
        status: "Hadir",
      });
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus?")) return;
    try {
      await deleteAttendance(id);
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  const statusColors: Record<string, string> = {
    Hadir: "bg-green-100 text-green-800",
    Izin: "bg-yellow-100 text-yellow-800",
    Sakit: "bg-blue-100 text-blue-800",
    Alpha: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Absensi</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Tutup" : "+ Tambah Absensi"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pegawai</label>
              <select
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Pilih Pegawai</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
              <input
                type="time"
                value={form.check_in}
                onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Keluar</label>
              <input
                type="time"
                value={form.check_out}
                onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpha">Alpha</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Simpan
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada data absensi</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Masuk</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Keluar</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{row.employee?.nik}</td>
                    <td className="px-4 py-3 text-sm">{row.employee?.nama}</td>
                    <td className="px-4 py-3 text-sm">{row.tanggal}</td>
                    <td className="px-4 py-3 text-sm">{row.check_in || "-"}</td>
                    <td className="px-4 py-3 text-sm">{row.check_out || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
